import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { NextFunction, Response } from "express";
import { prisma } from "../server";
// Import PaymentMethod along with other types
import {
  OrderStatus,
  PaymentStatus,
  Prisma,
  PaymentMethod,
} from "@prisma/client";
import axios from "axios";

// Zarinpal Configuration (no changes)
const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID!;
const ZARINPAL_API_REQUEST = process.env.ZARINPAL_API_REQUEST!;
const ZARINPAL_GATEWAY_URL = process.env.ZARINPAL_GATEWAY_URL!;
const CLIENT_URL = process.env.CLIENT_URL!;

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
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      res.status(400).json({ success: false, message: "Cart is empty" });
      return;
    }

    let total = cart.items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );

    let couponDiscount = 0;
    if (couponId) {
      const coupon = await prisma.coupon.findUnique({
        where: { id: couponId },
      });

      if (
        coupon &&
        coupon.isActive &&
        new Date(coupon.expireDate) >= new Date()
      ) {
        if (coupon.discountType === "FIXED") {
          couponDiscount = coupon.discountValue;
        } else {
          // PERCENTAGE
          couponDiscount = (total * coupon.discountValue) / 100;
        }
        total -= couponDiscount;
      }
    }

    const newOrder = await prisma.$transaction(async (tx) => {
      const orderCounter = await tx.orderCounter.update({
        where: { id: "order_counter" },
        data: {
          lastOrderNumber: {
            increment: 1,
          },
        },
      });
      const newOrderNumber = orderCounter.lastOrderNumber;

      const orderData = {
        orderNumber: newOrderNumber,
        userId,
        addressId,
        couponId,
        total,
        // --- START OF THE FIX ---
        // Explicitly use the PaymentMethod enum
        paymentMethod: PaymentMethod.CREDIT_CARD,
        // --- END OF THE FIX ---
        paymentStatus: PaymentStatus.PENDING,
        status: OrderStatus.PENDING,
      };

      const order = await tx.order.create({
        data: {
          ...orderData,
          items: {
            create: cart.items.map((item) => ({
              product: {
                connect: { id: item.productId },
              },
              productName: item.product.name,
              productCategory: item.product.categoryId || "N/A",
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
      });

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });

    const paymentData = {
      merchant_id: ZARINPAL_MERCHANT_ID,
      amount: Math.round(total),
      currency: "IRT",
      callback_url: `${CLIENT_URL}/payment-result?orderId=${newOrder.id}`,
      description: `سفارش شماره #${newOrder.orderNumber}`,
      metadata: {
        email: req.user?.email,
      },
    };

    const { data: paymentRes } = await axios.post(
      ZARINPAL_API_REQUEST,
      paymentData
    );

    if (paymentRes.data.code === 100 && paymentRes.data.authority) {
      await prisma.order.update({
        where: { id: newOrder.id },
        data: { paymentId: paymentRes.data.authority },
      });
      const paymentUrl = `${ZARINPAL_GATEWAY_URL}/${paymentRes.data.authority}`;
      res.status(200).json({ success: true, paymentUrl, order: newOrder });
    } else {
      throw new Error("Failed to get payment authority from Zarinpal");
    }
  } catch (error) {
    console.error("Error in createFinalOrder:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ... (Rest of the controller functions remain unchanged)
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
