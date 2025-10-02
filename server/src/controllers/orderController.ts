// server/src/controllers/orderController.ts

import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../server";
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";

// تابع کمکی برای گرفتن شماره سفارش بعدی
async function getNextOrderNumber() {
  // از upsert استفاده می‌کنیم تا اگر شمارنده وجود نداشت، ایجاد شود
  const counter = await prisma.orderCounter.upsert({
    where: { id: "order_counter" },
    update: { lastOrderNumber: { increment: 1 } },
    create: { id: "order_counter", lastOrderNumber: 1001 }, // اولین شماره سفارش 1001 خواهد بود
  });
  return counter.lastOrderNumber;
}

/**
 * ایجاد یک سفارش اولیه (pending) قبل از ارسال به درگاه پرداخت
 */
export const createFinalOrder = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.userId;
  const { addressId, couponId, shippingMethodId } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthenticated" });
  }

  if (!addressId || !shippingMethodId) {
    return res
      .status(400)
      .json({ success: false, message: "آدرس و روش ارسال الزامی است." });
  }

  try {
    // شروع تراکنش با استفاده از $transaction
    const result = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
      });

      if (!cart || cart.items.length === 0) {
        throw new Error("سبد خرید شما خالی است.");
      }

      let total = cart.items.reduce(
        (sum, item) =>
          sum +
          (item.product.discount_price || item.product.price) * item.quantity,
        0
      );

      if (couponId) {
        const coupon = await tx.coupon.findUnique({ where: { id: couponId } });
        if (coupon && coupon.isActive && coupon.expireDate > new Date()) {
          if (coupon.discountType === "FIXED") {
            total = Math.max(0, total - coupon.discountValue);
          } else {
            total -= total * (coupon.discountValue / 100);
          }
        }
      }

      const shippingMethod = await tx.shippingMethod.findUnique({
        where: { code: shippingMethodId },
      });

      if (!shippingMethod || !shippingMethod.isActive) {
        throw new Error("روش ارسال انتخاب شده نامعتبر است.");
      }

      total += shippingMethod.cost;
      total = Math.round(total);

      const orderNumber = await getNextOrderNumber(); // این تابع خارج از تراکنش است که مشکلی ندارد

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId,
          couponId,
          total,
          shippingMethod: shippingMethod.name,
          shippingCost: shippingMethod.cost,
          paymentMethod: "CREDIT_CARD",
          paymentStatus: "PENDING",
          status: "PENDING",
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              productCategory: item.product.categoryId || "N/A",
              quantity: item.quantity,
              price: item.product.discount_price || item.product.price,
            })),
          },
        },
      });

      const paymentUrl = `http://localhost:3001/api/payment/create?orderId=${newOrder.id}&amount=${newOrder.total}`;

      // برگرداندن مقادیر مورد نیاز از تراکنش
      return { orderId: newOrder.id, paymentUrl };
    });

    // ارسال پاسخ موفقیت‌آمیز پس از اتمام تراکنش
    res.status(201).json({
      success: true,
      message: "سفارش با موفقیت ایجاد شد. در حال انتقال به درگاه پرداخت...",
      orderId: result.orderId,
      paymentUrl: result.paymentUrl,
    });
  } catch (error: any) {
    console.error("Error creating order:", error);
    // اگر خطا از داخل تراکنش باشد (مثل سبد خالی)، پیام آن را نمایش بده
    res
      .status(500)
      .json({ success: false, message: error.message || "خطا در سرور" });
  }
};

/**
 * دریافت لیست سفارشات برای کاربر لاگین کرده
 */
export const getOrdersByUserId = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthenticated" });
  }
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * دریافت یک سفارش خاص برای کاربر
 */
export const getSingleOrderForUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.userId;
  const { orderId } = req.params;
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true, address: true, coupon: true },
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================================
// ================ ADMIN ACTIONS ================
// ===============================================

/**
 * دریافت تمام سفارشات برای پنل ادمین با قابلیت فیلتر و جستجو
 */
export const getAllOrdersForAdmin = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { status, paymentStatus, search } = req.query;

    const where: Prisma.OrderWhereInput = {};

    if (status && status !== "ALL") where.status = status as OrderStatus;
    if (paymentStatus && paymentStatus !== "ALL")
      where.paymentStatus = paymentStatus as PaymentStatus;

    if (search) {
      where.OR = [
        { user: { name: { contains: search as string, mode: "insensitive" } } },
        {
          user: { email: { contains: search as string, mode: "insensitive" } },
        },
        { orderNumber: { equals: parseInt(search as string) || -1 } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * دریافت جزئیات یک سفارش برای ادمین
 */
export const getSingleOrderForAdmin = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { orderId } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        address: true,
        items: { include: { product: { include: { images: true } } } },
        coupon: true,
      },
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * آپدیت وضعیت سفارش توسط ادمین
 */
export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: status as OrderStatus },
    });
    // TODO: در آینده اینجا می‌توان برای کاربر ایمیل یا پیامک اطلاع‌رسانی ارسال کرد
    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
