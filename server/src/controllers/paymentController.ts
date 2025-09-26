import { Request, Response } from "express";
import axios from "axios";
import { prisma } from "../server";
import { PaymentStatus, OrderStatus } from "@prisma/client";

const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID!;
const ZARINPAL_API_VERIFY =
  "https://sandbox.zarinpal.com/pg/v4/payment/verify.json";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const logStockChange = async (
  productId: string,
  change: number,
  newStock: number,
  type: "SALE",
  userId: string | null,
  notes?: string
) => {
  if (change !== 0) {
    await prisma.stockHistory.create({
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

export const verifyPaymentController = async (req: Request, res: Response) => {
  const { Authority: authority, Status: status } = req.query;

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

    if (order.paymentStatus === "COMPLETED") {
      return res.redirect(
        `${CLIENT_URL}/payment-result?status=success&orderId=${order.id}&message=Already_verified`
      );
    }

    if (status === "OK") {
      const amount = Math.round(order.total * 10); // Convert to Rials
      const zarinpalVerifyData = {
        merchant_id: ZARINPAL_MERCHANT_ID,
        authority: authority as string,
        amount,
      };

      const { data } = await axios.post(
        ZARINPAL_API_VERIFY,
        zarinpalVerifyData
      );

      if (data.data.code === 100 || data.data.code === 101) {
        await prisma.$transaction(async (tx) => {
          for (const item of order.items) {
            const updatedProduct = await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: { decrement: item.quantity },
                soldCount: { increment: item.quantity },
              },
            });

            await logStockChange(
              item.productId,
              -item.quantity,
              updatedProduct.stock,
              "SALE",
              order.userId,
              `Sale from order ${order.id}`
            );
          }

          // ++ این بلوک کد اضافه شده است ++
          const cart = await tx.cart.findFirst({
            where: { userId: order.userId },
          });

          if (cart) {
            await tx.cartItem.deleteMany({
              where: { cartId: cart.id },
            });
          }
          // ++ پایان بلوک اضافه شده ++

          await tx.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: PaymentStatus.COMPLETED,
              status: OrderStatus.PROCESSING,
            },
          });
        });

        return res.redirect(
          `${CLIENT_URL}/payment-result?status=success&orderId=${order.id}&refId=${data.data.ref_id}`
        );
      } else {
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: PaymentStatus.FAILED },
        });
        return res.redirect(
          `${CLIENT_URL}/payment-result?status=failed&message=Verification_failed&code=${data.data.code}`
        );
      }
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: PaymentStatus.CANCELLED },
      });
      return res.redirect(
        `${CLIENT_URL}/payment-result?status=cancelled&orderId=${order.id}`
      );
    }
  } catch (error) {
    console.error("خطا در verifyPaymentController:", error);
    return res.redirect(
      `${CLIENT_URL}/payment-result?status=failed&message=Internal_server_error`
    );
  }
};
