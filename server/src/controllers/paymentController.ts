// server/src/controllers/paymentController.ts
import { Response, Request } from "express";
import axios from "axios";
import { prisma } from "../server";

const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID!;
const ZARINPAL_REQUEST_URL = process.env.ZARINPAL_API_REQUEST!;
const ZARINPAL_VERIFY_URL = process.env.ZARINPAL_API_VERIFY!;
const ZARINPAL_STARTPAY_URL = process.env.ZARINPAL_GATEWAY_URL!;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const SERVER_URL = process.env.SERVER_URL || "http://localhost:3001";

/**
 * ایجاد درخواست پرداخت
 */
export const createPaymentRequest = async (req: Request, res: Response) => {
  const { orderId } = req.query;

  if (!orderId) {
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

    const callbackUrl = `${SERVER_URL}/api/payment/callback?orderId=${orderId}`;

    const response = await axios.post(ZARINPAL_REQUEST_URL, {
      merchant_id: ZARINPAL_MERCHANT_ID,
      amount: order.total,
      callback_url: callbackUrl,
      description: `سفارش شماره ${order.orderNumber}`,
      metadata: {
        email: order.user.email,
        mobile: order.user.phone,
      },
    });

    const result = response.data;

    if (result.data && result.data.code === 100) {
      await prisma.order.update({
        where: { id: orderId as string },
        data: {
          paymentAuthority: result.data.authority,
          paymentStatus: "PENDING",
        },
      });

      return res.redirect(`${ZARINPAL_STARTPAY_URL}${result.data.authority}`);
    } else {
      console.error("Zarinpal Request Failed:", result.errors);
      return res.redirect(
        `${CLIENT_URL}/payment-result?status=failed&message=Zarinpal_Error_${
          result.errors?.[0]?.message || "Unknown"
        }`
      );
    }
  } catch (error: any) {
    console.error(
      "Zarinpal request error:",
      JSON.stringify(error.response?.data || error.message)
    );
    return res.redirect(
      `${CLIENT_URL}/payment-result?status=failed&message=Server_Connection_Error`
    );
  }
};

/**
 * هندل کردن کال‌بک پرداخت
 */
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

    if (!order || order.paymentAuthority !== Authority) {
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

    // Verify Request
    const verificationResponse = await axios.post(ZARINPAL_VERIFY_URL, {
      merchant_id: ZARINPAL_MERCHANT_ID,
      authority: Authority,
      amount: order.total,
    });

    const result = verificationResponse.data;

    if (result.data && (result.data.code === 100 || result.data.code === 101)) {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "COMPLETED",
            status: "PROCESSING",
            paymentRefId: result.data.ref_id.toString(),
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

      return res.redirect(
        `${CLIENT_URL}/payment-result?status=success&orderId=${order.orderNumber}&refId=${result.data.ref_id}`
      );
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED" },
      });
      return res.redirect(
        `${CLIENT_URL}/payment-result?status=failed&orderId=${
          order.orderNumber
        }&message=Verification_failed_${
          result.errors?.[0]?.message || "Unknown"
        }`
      );
    }
  } catch (error: any) {
    console.error(
      "Payment verification error:",
      JSON.stringify(error.response?.data || error.message)
    );
    return res.redirect(
      `${CLIENT_URL}/payment-result?status=failed&message=Server_Verification_Error`
    );
  }
};
