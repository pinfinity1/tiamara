// server/src/controllers/orderController.ts

import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { NextFunction, Response } from "express";
import { prisma } from "../server";
import {
  OrderStatus,
  PaymentStatus,
  Prisma,
  PaymentMethod,
} from "@prisma/client";
import axios from "axios";

// Environment variables for Zarinpal
const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID!;
const ZARINPAL_API_REQUEST =
  "https://sandbox.zarinpal.com/pg/v4/payment/request.json";
const ZARINPAL_GATEWAY_URL = "https://sandbox.zarinpal.com/pg/StartPay";

// Define Server URL for callback
const SERVER_URL = process.env.SERVER_URL || "http://localhost:3001";

/**
 * Creates the final order, calculates the total price, and generates a payment link.
 */
export const createFinalOrder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ success: false, message: "User not authenticated" });
    return;
  }

  const { addressId, couponId } = req.body;
  if (!addressId) {
    res.status(400).json({ success: false, message: "Address ID is required" });
    return;
  }

  try {
    const newOrder = await prisma.$transaction(async (tx) => {
      // START OF CHANGE
      let cart = await tx.cart.findFirst({
        where: { userId },
        include: { items: { include: { product: true } } },
      });

      // If user cart is empty, try to find a guest cart from cookies (if sent from client)
      // and merge it. This is a fallback and the main merge logic should be on login.
      if (!cart || cart.items.length === 0) {
        throw new Error("سبد خرید شما خالی است.");
      }
      // END OF CHANGE

      let total = cart.items.reduce((acc, item) => {
        const price = item.product.discount_price ?? item.product.price;
        return acc + price * item.quantity;
      }, 0);

      if (couponId) {
        const coupon = await tx.coupon.findUnique({ where: { id: couponId } });
        if (
          coupon &&
          coupon.isActive &&
          new Date(coupon.expireDate) > new Date() &&
          coupon.usageCount < coupon.usageLimit
        ) {
          if (coupon.discountType === "FIXED") {
            total = Math.max(0, total - coupon.discountValue);
          } else {
            total -= (total * coupon.discountValue) / 100;
          }
        }
      }
      total = Math.round(total);

      if (total < 1000) {
        throw new Error("مبلغ سفارش کمتر از حد مجاز درگاه پرداخت است.");
      }

      const orderCounter = await tx.orderCounter.upsert({
        where: { id: "order_counter" },
        update: { lastOrderNumber: { increment: 1 } },
        create: { id: "order_counter", lastOrderNumber: 1001 },
      });

      const order = await tx.order.create({
        data: {
          orderNumber: orderCounter.lastOrderNumber,
          userId,
          addressId,
          couponId,
          total,
          paymentMethod: PaymentMethod.CREDIT_CARD,
          paymentStatus: PaymentStatus.PENDING,
          status: OrderStatus.PENDING,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              productCategory: item.product.categoryId || "N/A",
              quantity: item.quantity,
              price: item.product.discount_price ?? item.product.price,
            })),
          },
        },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order;
    });

    const paymentData = {
      merchant_id: ZARINPAL_MERCHANT_ID,
      amount: newOrder.total,
      callback_url: `${SERVER_URL}/api/payment/verify`,
      description: `سفارش شماره #${newOrder.orderNumber}`,
      metadata: { email: req.user?.email, mobile: req.user?.phone },
    };

    const { data: paymentRes } = await axios.post(
      ZARINPAL_API_REQUEST,
      paymentData
    );

    if (paymentRes.data?.code === 100) {
      await prisma.order.update({
        where: { id: newOrder.id },
        data: { paymentId: paymentRes.data.authority },
      });
      const paymentUrl = `${ZARINPAL_GATEWAY_URL}/${paymentRes.data.authority}`;
      res.status(200).json({ success: true, paymentUrl });
    } else {
      throw new Error("خطا در ارتباط با درگاه پرداخت زرین‌پال.");
    }
  } catch (error: any) {
    console.error("Error in createFinalOrder:", error.message);
    res
      .status(500)
      .json({ success: false, message: error.message || "خطای داخلی سرور" });
  }
};

/**
 * ✅ [NEW] Fetches a single order for the currently authenticated user.
 */
export const getSingleOrderForUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        address: true,
      },
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "سفارش یافت نشد." });
    }

    // Security check: ensure the user is requesting their own order
    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "شما مجاز به دیدن این سفارش نیستید.",
      });
    }

    res.status(200).json({ success: true, order });
  } catch (e) {
    console.error("Error fetching single order for user:", e);
    res.status(500).json({ success: false, message: "خطای داخلی سرور." });
  }
};

// ... (سایر توابع کنترلر سفارشات بدون تغییر باقی می‌مانند)
export const getAllOrdersForAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, paymentStatus, search } = req.query;
    const where: Prisma.OrderWhereInput = {};

    if (status && status !== "ALL") {
      where.status = status as OrderStatus;
    }
    if (paymentStatus && paymentStatus !== "ALL") {
      where.paymentStatus = paymentStatus as PaymentStatus;
    }
    if (search && typeof search === "string") {
      where.OR = [
        { orderNumber: { equals: parseInt(search) || -1 } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { phone: { contains: search, mode: "insensitive" } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
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

export const getSingleOrderForAdmin = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                images: {
                  take: 1,
                  select: { url: true },
                },
              },
            },
          },
        },
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        coupon: true,
      },
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    res.status(200).json({ success: true, order });
  } catch (e) {
    console.error("Error fetching single order for admin:", e);
    res
      .status(500)
      .json({ success: false, message: "Unexpected error occurred!" });
  }
};

export const getOrdersByUserId = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.userId;
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json(orders);
  } catch (e) {
    next(e);
  }
};

export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { orderId } = req.params;
  const { status } = req.body;
  try {
    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: status,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                images: {
                  take: 1,
                  select: { url: true },
                },
              },
            },
          },
        },
        address: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        coupon: true,
      },
    });
    res.status(200).json({
      success: true,
      order: updatedOrder,
    });
  } catch (e) {
    next(e);
  }
};
