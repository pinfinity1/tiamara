import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { NextFunction, Response } from "express";
import { prisma } from "../server";
import axios from "axios";
import { OrderStatus, PaymentStatus } from "@prisma/client";

// --- توابع کمکی ---
const toEnglishDigits = (
  str: string | null | undefined
): string | undefined => {
  if (!str) return undefined;
  const persianNumbers = [
    /۰/g,
    /۱/g,
    /۲/g,
    /۳/g,
    /۴/g,
    /۵/g,
    /۶/g,
    /۷/g,
    /۸/g,
    /۹/g,
  ];
  const arabicNumbers = [
    /٠/g,
    /١/g,
    /٢/g,
    /٣/g,
    /٤/g,
    /٥/g,
    /٦/g,
    /٧/g,
    /٨/g,
    /٩/g,
  ];
  for (let i = 0; i < 10; i++) {
    str = str
      .replace(persianNumbers[i], String(i))
      .replace(arabicNumbers[i], String(i));
  }
  return str;
};

// متغیرهای درگاه پرداخت
const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID!;
const ZARINPAL_API_REQUEST =
  "https://sandbox.zarinpal.com/pg/v4/payment/request.json";
const ZARINPAL_GATEWAY_URL = "https://sandbox.zarinpal.com/pg/StartPay";

export const createFinalOrder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { items, addressId, couponId, total } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthenticated user" });
    return;
  }
  if (!items || items.length === 0 || total <= 0) {
    res
      .status(400)
      .json({ success: false, message: "اطلاعات سفارش نامعتبر است." });
    return;
  }

  let newOrder;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const counter = await tx.orderCounter.upsert({
        where: { id: "order_counter" },
        update: { lastOrderNumber: { increment: 1 } },
        create: { id: "order_counter", lastOrderNumber: 1001 },
      });
      const newOrderNumber = counter.lastOrderNumber;

      const order = await tx.order.create({
        data: {
          orderNumber: newOrderNumber,
          userId,
          addressId,
          couponId,
          total,
          paymentMethod: "CREDIT_CARD",
          paymentStatus: "PENDING",
          status: "PENDING",
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              productName: item.productName,
              productCategory: item.productCategory,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          user: true,
        },
      });
      return order;
    });

    newOrder = result;

    const amount = Math.round(newOrder.total * 10); // تبدیل به ریال
    const callback_url = `http://localhost:${
      process.env.PORT || 3001
    }/api/payment/verify`;

    const zarinpalRequestData = {
      merchant_id: ZARINPAL_MERCHANT_ID,
      amount,
      callback_url,
      description: `پرداخت برای سفارش شماره: ${newOrder.orderNumber}`,
      metadata: {
        mobile: toEnglishDigits(newOrder.user.phone),
        email: newOrder.user.email,
      },
    };

    const { data: zarinpalResponse } = await axios.post(
      ZARINPAL_API_REQUEST,
      zarinpalRequestData
    );

    if (zarinpalResponse.data.code === 100 && zarinpalResponse.data.authority) {
      await prisma.order.update({
        where: { id: newOrder.id },
        data: { paymentId: zarinpalResponse.data.authority },
      });

      const paymentUrl = `${ZARINPAL_GATEWAY_URL}/${zarinpalResponse.data.authority}`;
      res.status(201).json({ success: true, order: newOrder, paymentUrl });
    } else {
      throw new Error(
        JSON.stringify(zarinpalResponse.errors) || "Zarinpal request failed"
      );
    }
  } catch (e: any) {
    console.error("Error in createFinalOrder or Payment Request:", e);

    if (newOrder) {
      await prisma.order.update({
        where: { id: newOrder.id },
        data: {
          paymentStatus: "FAILED",
          status: "PENDING",
        },
      });
    }

    res.status(500).json({
      success: false,
      message: "خطا در ایجاد سفارش یا شروع فرآیند پرداخت.",
      error: e.message,
    });
  }
};

export const getOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { orderId } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });
      return;
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: true,
        address: true,
        coupon: true,
      },
    });

    res.status(200).json(order);
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Unexpected error occured!",
    });
  }
};

export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    await prisma.order.updateMany({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
    });

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Unexpected error occured!",
    });
  }
};

export const getAllOrdersForAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(200).json(orders);
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Unexpected error occured!",
    });
  }
};

export const getOrdersByUserId = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });
      return;
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
      },
      include: {
        items: true,
        address: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(orders);
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Unexpected error occured!",
    });
  }
};
