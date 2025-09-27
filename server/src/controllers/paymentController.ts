// server/src/controllers/paymentController.ts

import { Request, Response } from "express";
import axios from "axios";
import { prisma } from "../server";
import { PaymentStatus, OrderStatus } from "@prisma/client";

const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID!;
const ZARINPAL_API_VERIFY =
  "https://sandbox.zarinpal.com/pg/v4/payment/verify.json";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

/**
 * A helper function to log stock changes.
 */
const logStockChange = async (
  tx: any, // Prisma transaction client
  productId: string,
  change: number,
  newStock: number,
  type: "SALE",
  userId: string | null,
  notes?: string
) => {
  if (change !== 0) {
    await tx.stockHistory.create({
      data: {
        productId,
        change,
        newStock,
        type,
        notes: notes || `${type} action`,
        userId: userId || undefined,
      },
    });
  }
};

/**
 * Verifies the payment with Zarinpal after the user returns from the gateway.
 */
export const verifyPaymentController = async (req: Request, res: Response) => {
  const { Authority: authority, Status: status } = req.query;

  // Redirect to a generic failure page if callback parameters are missing
  if (!authority || !status) {
    return res.redirect(
      `${CLIENT_URL}/payment-result?status=failed&message=Invalid_callback`
    );
  }

  try {
    const order = await prisma.order.findFirst({
      where: { paymentId: authority as string },
      include: { items: true },
    });

    if (!order) {
      return res.redirect(
        `${CLIENT_URL}/payment-result?status=failed&message=Order_not_found`
      );
    }

    // If order is already completed, just redirect to success page
    if (order.paymentStatus === "COMPLETED") {
      return res.redirect(
        `${CLIENT_URL}/payment-result?status=success&orderId=${order.id}&message=Already_verified`
      );
    }

    if (status === "OK") {
      const amount = Math.round(order.total); // ✅ Correct amount in Toman for sandbox
      const verificationData = {
        merchant_id: ZARINPAL_MERCHANT_ID,
        authority: authority as string,
        amount,
      };

      const { data: verifyResponse } = await axios.post(
        ZARINPAL_API_VERIFY,
        verificationData
      );

      const verificationDataResult = verifyResponse.data;

      // Zarinpal codes 100 (success) and 101 (already verified) are considered success
      if (
        verificationDataResult?.code === 100 ||
        verificationDataResult?.code === 101
      ) {
        // Use a transaction to update stock and order status atomically
        await prisma.$transaction(async (tx) => {
          // 1. Decrease stock for each item in the order
          for (const item of order.items) {
            const updatedProduct = await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: { decrement: item.quantity },
                soldCount: { increment: item.quantity },
              },
            });

            // 2. Log the stock change
            await logStockChange(
              tx,
              item.productId,
              -item.quantity,
              updatedProduct.stock,
              "SALE",
              order.userId,
              `Sale from order #${order.orderNumber}`
            );
          }

          // 3. Update the order status to COMPLETED and PROCESSING
          await tx.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: PaymentStatus.COMPLETED,
              status: OrderStatus.PROCESSING,
            },
          });
          const cart = await tx.cart.findFirst({
            where: { userId: order.userId },
          });
          if (cart) {
            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
          }
        });

        return res.redirect(
          `${CLIENT_URL}/payment-result?status=success&orderId=${order.id}&refId=${verificationDataResult.ref_id}`
        );
      } else {
        // If verification fails
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: PaymentStatus.FAILED },
        });
        return res.redirect(
          `${CLIENT_URL}/payment-result?status=failed&message=Verification_failed&code=${verificationDataResult.code}`
        );
      }
    } else {
      // If user cancelled the payment
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: PaymentStatus.CANCELLED },
      });
      return res.redirect(
        `${CLIENT_URL}/payment-result?status=cancelled&orderId=${order.id}`
      );
    }
  } catch (error) {
    console.error("Error in verifyPaymentController:", error);
    return res.redirect(
      `${CLIENT_URL}/payment-result?status=failed&message=Internal_server_error`
    );
  }
};
