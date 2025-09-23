import { Request, Response } from "express";
import axios from "axios";
import { prisma } from "../server";
import { PaymentStatus, OrderStatus } from "@prisma/client";

// خواندن متغیرهای محیطی
const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID!;
const ZARINPAL_API_REQUEST = process.env.ZARINPAL_API_REQUEST!;
const ZARINPAL_API_VERIFY = process.env.ZARINPAL_API_VERIFY!;
const ZARINPAL_GATEWAY_URL = process.env.ZARINPAL_GATEWAY_URL!;
const CLIENT_URL = process.env.CLIENT_URL!;

/**
 * ایجاد درخواست پرداخت و هدایت کاربر به درگاه
 */
export const requestPaymentController = async (req: Request, res: Response) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res
      .status(400)
      .json({ success: false, message: "شناسه سفارش الزامی است." });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "سفارش یافت نشد." });
    }

    // زرین‌پال مبلغ را به صورت عدد صحیح و به ریال دریافت می‌کند
    const amount = Math.round(order.total);
    const callback_url = `http://localhost:${
      process.env.PORT || 3001
    }/api/payment/verify`;

    console.log(`درخواست پرداخت برای سفارش ${orderId} با مبلغ ${amount}`);

    const zarinpalRequestData = {
      merchant_id: ZARINPAL_MERCHANT_ID,
      amount,
      callback_url,
      description: `پرداخت برای سفارش شماره: ${order.id}`,
      metadata: {
        mobile: order.user.phone,
      },
    };

    const { data } = await axios.post(
      ZARINPAL_API_REQUEST,
      zarinpalRequestData
    );

    // اگر درخواست موفقیت‌آمیز بود و کد 100 دریافت شد
    if (data.data.code === 100 && data.data.authority) {
      // ذخیره شناسه تراکنش (authority) در سفارش
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentId: data.data.authority },
      });

      // ارسال لینک پرداخت به کلاینت
      const paymentUrl = `${ZARINPAL_GATEWAY_URL}/${data.data.authority}`;
      return res.status(200).json({ success: true, paymentUrl });
    } else {
      console.error("خطا در درخواست از زرین‌پال:", data.errors);
      return res.status(500).json({
        success: false,
        message: "ایجاد درخواست پرداخت ناموفق بود.",
        details: data.errors,
      });
    }
  } catch (error) {
    console.error("خطا در requestPaymentController:", error);
    res.status(500).json({ success: false, message: "خطای داخلی سرور." });
  }
};

/**
 * تایید نهایی پرداخت پس از بازگشت کاربر از درگاه
 */
export const verifyPaymentController = async (req: Request, res: Response) => {
  const { Authority: authority, Status: status } = req.query;

  if (!authority || !status) {
    return res.redirect(
      `${CLIENT_URL}/payment/result?status=failed&message=Invalid_callback`
    );
  }

  try {
    // پیدا کردن سفارش بر اساس شناسه تراکنش
    const order = await prisma.order.findUnique({
      where: { paymentId: authority as string },
    });

    if (!order) {
      return res.redirect(
        `${CLIENT_URL}/payment/result?status=failed&message=Order_not_found`
      );
    }

    // اگر پرداخت توسط کاربر با موفقیت انجام شده بود
    if (status === "OK") {
      const amount = Math.round(order.total);
      const zarinpalVerifyData = {
        merchant_id: ZARINPAL_MERCHANT_ID,
        authority: authority as string,
        amount,
      };

      const { data } = await axios.post(
        ZARINPAL_API_VERIFY,
        zarinpalVerifyData
      );

      // اگر تراکنش موفقیت‌آمیز و تایید شده بود (کد 100 یا 101)
      if (data.data.code === 100 || data.data.code === 101) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: PaymentStatus.COMPLETED,
            status: OrderStatus.PROCESSING,
          },
        });
        return res.redirect(
          `${CLIENT_URL}/payment/result?status=success&orderId=${order.id}&refId=${data.data.ref_id}`
        );
      } else {
        // اگر تایید تراکنش ناموفق بود
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: PaymentStatus.FAILED,
          },
        });
        return res.redirect(
          `${CLIENT_URL}/payment/result?status=failed&message=Verification_failed&code=${data.data.code}`
        );
      }
    } else {
      // اگر کاربر پرداخت را لغو کرده بود
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.CANCELLED,
        },
      });
      return res.redirect(
        `${CLIENT_URL}/payment/result?status=cancelled&orderId=${order.id}`
      );
    }
  } catch (error) {
    console.error("خطا در verifyPaymentController:", error);
    return res.redirect(
      `${CLIENT_URL}/payment/result?status=failed&message=Internal_server_error`
    );
  }
};
