// server/src/controllers/paymentController.ts

import { Response, Request } from "express";
import axios from "axios";
import { prisma } from "../server";

const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID;
const ZARINPAL_REQUEST_URL =
  "https://sandbox.zarinpal.com/pg/rest/WebGate/PaymentRequest.json";
const ZARINPAL_VERIFY_URL =
  "https://sandbox.zarinpal.com/pg/rest/WebGate/PaymentVerification.json";
const ZARINPAL_STARTPAY_URL = "https://sandbox.zarinpal.com/pg/StartPay/";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

export const createPaymentRequest = async (req: Request, res: Response) => {
  const { orderId, amount } = req.query;

  if (!orderId || !amount) {
    return res.status(400).send("اطلاعات سفارش ناقص است.");
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId as string },
      include: { user: true },
    });

    if (!order || !order.user) {
      return res.status(404).send("سفارش یا کاربر یافت نشد.");
    }

    const callbackUrl = `http://localhost:3001/api/payment/callback?orderId=${orderId}`;

    const response = await axios.post(ZARINPAL_REQUEST_URL, {
      MerchantID: ZARINPAL_MERCHANT_ID,
      Amount: Number(amount),
      CallbackURL: callbackUrl,
      Description: `سفارش شماره ${order.orderNumber}`,
      Email: order.user.email,
      Mobile: order.user.phone,
    });

    if (response.data.Status === 100 && response.data.Authority) {
      await prisma.order.update({
        where: { id: orderId as string },
        data: { paymentId: response.data.Authority },
      });
      return res.redirect(`${ZARINPAL_STARTPAY_URL}${response.data.Authority}`);
    } else {
      // FIX: Redirect to the client URL
      return res.redirect(
        `${CLIENT_URL}/payment-result?status=failed&message=Zarinpal_Error_${response.data.Status}`
      );
    }
  } catch (error) {
    console.error("Zarinpal request error:", error);
    // FIX: Redirect to the client URL
    return res.redirect(
      `${CLIENT_URL}/payment-result?status=failed&message=Server_Connection_Error`
    );
  }
};

export const handlePaymentCallback = async (req: Request, res: Response) => {
  const { orderId, Authority, Status } = req.query;

  if (!orderId || !Authority || !Status) {
    return res.redirect(
      `${CLIENT_URL}/payment-result?status=failed&message=Invalid_Callback`
    );
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId as string },
      include: { items: true },
    });

    if (!order || order.paymentId !== Authority) {
      return res.redirect(
        `${CLIENT_URL}/payment-result?status=failed&message=Order_Mismatch`
      );
    }

    if (order.paymentStatus !== "PENDING") {
      return res.redirect(
        `${CLIENT_URL}/payment-result?status=${order.paymentStatus.toLowerCase()}&orderId=${
          order.orderNumber
        }`
      );
    }

    if (Status !== "OK") {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "CANCELLED" },
      });
      return res.redirect(
        `${CLIENT_URL}/payment-result?status=cancelled&orderId=${order.orderNumber}`
      );
    }

    const verificationResponse = await axios.post(ZARINPAL_VERIFY_URL, {
      MerchantID: ZARINPAL_MERCHANT_ID,
      Authority,
      Amount: order.total,
    });

    if (
      verificationResponse.data.Status === 100 ||
      verificationResponse.data.Status === 101
    ) {
      if (order.paymentStatus === "PENDING") {
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: "COMPLETED",
              status: "PROCESSING",
              paymentId: verificationResponse.data.RefID.toString(),
            },
          });

          const cart = await tx.cart.findUnique({
            where: { userId: order.userId },
          });
          if (cart) {
            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
          }

          for (const item of order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            });
          }
        });
      }

      return res.redirect(
        `${CLIENT_URL}/payment-result?status=success&orderId=${order.orderNumber}&refId=${verificationResponse.data.RefID}`
      );
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED" },
      });
      return res.redirect(
        `${CLIENT_URL}/payment-result?status=failed&orderId=${order.orderNumber}&message=Verification_failed`
      );
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.redirect(
      `${CLIENT_URL}/payment-result?status=failed&message=Server_Verification_Error`
    );
  }
};
