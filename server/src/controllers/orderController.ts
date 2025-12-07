import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../server";
// ✅ تغییر ۱: اضافه کردن PaymentMethod به ایمپورت‌ها
import {
  OrderStatus,
  PaymentStatus,
  Prisma,
  PaymentMethod,
} from "@prisma/client";

// تابع کمکی برای گرفتن شماره سفارش بعدی
async function getNextOrderNumber() {
  const counter = await prisma.orderCounter.upsert({
    where: { id: "order_counter" },
    update: { lastOrderNumber: { increment: 1 } },
    create: { id: "order_counter", lastOrderNumber: 1001 },
  });
  return counter.lastOrderNumber;
}

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3001";

/**
 * ایجاد یک سفارش اولیه (pending) قبل از ارسال به درگاه پرداخت یا ثبت فیش
 */
export const createFinalOrder = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.userId;
  // ✅ تغییر ۲: دریافت paymentMethod از ورودی
  const { addressId, couponId, shippingMethodId, paymentMethod } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthenticated" });
  }

  if (!addressId || !shippingMethodId) {
    return res
      .status(400)
      .json({ success: false, message: "آدرس و روش ارسال الزامی است." });
  }

  try {
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

      const orderNumber = await getNextOrderNumber();

      // ✅ تغییر ۳: تعیین نوع پرداخت برای دیتابیس
      const dbPaymentMethod =
        paymentMethod === "CARD_TO_CARD"
          ? PaymentMethod.CARD_TO_CARD
          : PaymentMethod.CREDIT_CARD;

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId,
          couponId,
          total,
          shippingCost: shippingMethod.cost,
          shippingMethodCode: shippingMethod.code,
          paymentMethod: dbPaymentMethod, // ✅ استفاده از متغیر جدید
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

      // ✅ تغییر ۴: انشعاب منطق بر اساس روش پرداخت
      if (dbPaymentMethod === PaymentMethod.CARD_TO_CARD) {
        // اگر کارت‌به‌کارت بود:
        // ۱. لینک پرداخت نمی‌سازیم
        // ۲. سبد خرید را همینجا خالی می‌کنیم (چون سفارش ثبت نهایی شده و منتظر آپلود فیش است)
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        return {
          orderId: newOrder.id,
          isManual: true,
          paymentUrl: null,
        };
      } else {
        // اگر درگاه بود:
        const paymentUrl = `${SERVER_URL}/api/payment/create?orderId=${newOrder.id}`;
        return {
          orderId: newOrder.id,
          isManual: false,
          paymentUrl,
        };
      }
    });

    res.status(201).json({
      success: true,
      message: result.isManual
        ? "سفارش ثبت شد. لطفاً فیش واریزی را آپلود کنید."
        : "در حال انتقال به درگاه پرداخت...",
      orderId: result.orderId,
      paymentUrl: result.paymentUrl,
      isManual: result.isManual, // فرانت‌اند با این فلگ می‌فهمد کجا ریدایرکت کند
    });
  } catch (error: any) {
    console.error("Error creating order:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "خطا در سرور" });
  }
};

// ... (بقیه توابع این فایل مثل getOrdersByUserId و غیره بدون تغییر می‌مانند)
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
        items: { include: { product: { include: { images: true } } } }, // عکس محصول برای نمایش لازم است
        address: true,
        shippingMethod: true,
        paymentReceipt: true, // ✅ این خط اضافه شد (مهم)
      },
    });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

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
      const searchStr = search as string;
      const searchInt = parseInt(searchStr);

      const orConditions: Prisma.OrderWhereInput[] = [
        { user: { name: { contains: searchStr, mode: "insensitive" } } },
        { user: { email: { contains: searchStr, mode: "insensitive" } } },
        { user: { phone: { contains: searchStr, mode: "insensitive" } } },
        { paymentRefId: { contains: searchStr, mode: "insensitive" } },
        { paymentAuthority: { contains: searchStr, mode: "insensitive" } },
      ];

      if (!isNaN(searchInt)) {
        orConditions.push({ orderNumber: { equals: searchInt } });
      }

      where.OR = orConditions;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
    });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error searching orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

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
    res.status(200).json({ success: true, order: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
