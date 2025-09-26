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

const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID!;
const ZARINPAL_API_REQUEST =
  "https://sandbox.zarinpal.com/pg/v4/payment/request.json";
const ZARINPAL_GATEWAY_URL = "https://sandbox.zarinpal.com/pg/StartPay";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

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
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      res
        .status(400)
        .json({ success: false, message: "سبد خرید شما خالی است." });
      return;
    }

    let total = cart.items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );

    if (couponId) {
      const coupon = await prisma.coupon.findUnique({
        where: { id: couponId },
      });
      if (
        coupon &&
        coupon.isActive &&
        new Date(coupon.expireDate) > new Date()
      ) {
        if (coupon.discountType === "FIXED") {
          total = Math.max(0, total - coupon.discountValue);
        } else {
          const discount = (total * coupon.discountValue) / 100;
          total -= discount;
        }
      }
    }

    const newOrder = await prisma.$transaction(async (tx) => {
      const orderCounter = await tx.orderCounter.update({
        where: { id: "order_counter" },
        data: { lastOrderNumber: { increment: 1 } },
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
              price: item.product.price,
            })),
          },
        },
      });

      return order;
    });

    const paymentData = {
      merchant_id: ZARINPAL_MERCHANT_ID,
      amount: Math.round(total),
      callback_url: `${CLIENT_URL}/payment-result`,
      description: `سفارش شماره #${newOrder.orderNumber}`,
      metadata: {
        email: req.user?.email,
        mobile: req.user?.phone,
      },
    };

    const { data: paymentRes } = await axios.post(
      ZARINPAL_API_REQUEST,
      paymentData
    );

    if (paymentRes.data && paymentRes.data.code === 100) {
      await prisma.order.update({
        where: { id: newOrder.id },
        data: { paymentId: paymentRes.data.authority },
      });
      const paymentUrl = `${ZARINPAL_GATEWAY_URL}/${paymentRes.data.authority}`;
      res.status(200).json({ success: true, paymentUrl });
    } else {
      throw new Error("خطا در ارتباط با درگاه پرداخت");
    }
  } catch (error) {
    console.error("Error in createFinalOrder:", error);
    res.status(500).json({ success: false, message: "خطای داخلی سرور" });
  }
};

export const getOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { orderId } = req.params;
  const userId = req.user?.userId;
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: userId,
      },
      include: {
        items: true,
        address: true,
        user: true,
      },
    });
    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }
    res.status(200).json(order);
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
    });
    res.status(200).json({
      success: true,
      order: updatedOrder,
    });
  } catch (e) {
    next(e);
  }
};

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
