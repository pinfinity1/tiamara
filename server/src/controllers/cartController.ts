// server/src/controllers/cartController.ts

import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../server";

// یک اینترفیس برای آیتم‌های ورودی از سمت کلاینت
interface CartItemInput {
  productId: string;
  quantity: number;
}

// تابع کمکی برای پیدا کردن یا ایجاد سبد خرید
const findOrCreateCart = async (userId?: string, cartId?: string) => {
  if (userId) {
    let userCart = await prisma.cart.findUnique({ where: { userId } });
    if (!userCart) {
      // اگر کاربر لاگین کرده سبد خرید نداشت، یکی برایش می‌سازیم
      userCart = await prisma.cart.create({ data: { userId } });
    }
    return userCart;
  }
  if (cartId) {
    // اگر کاربر مهمان بود و از قبل سبد خرید داشت، آن را برمی‌گردانیم
    const guestCart = await prisma.cart.findUnique({ where: { id: cartId } });
    if (guestCart) return guestCart;
  }
  // اگر کاربر مهمان بود و سبد خرید نداشت، یکی برایش می‌سازیم
  return prisma.cart.create({ data: {} });
};

// دریافت محتویات سبد خرید
export const getCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { cartId } = req.cookies; // cartId از کوکی‌ها خوانده می‌شود

    if (userId && cartId) {
      res.clearCookie("cartId", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    const cart = await findOrCreateCart(userId, cartId);

    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: {
        product: {
          select: {
            name: true,
            slug: true,
            price: true,
            discount_price: true,
            stock: true,
            images: { take: 1, select: { url: true } },
          },
        },
      },
    });

    res.status(200).json({ success: true, cart: cartItems });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// افزودن آیتم به سبد خرید
export const addItemToCart = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { productId, quantity }: CartItemInput = req.body;
  const userId = req.user?.userId;
  const { cartId } = req.cookies;

  try {
    const cart = await findOrCreateCart(userId, cartId);
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      // اگر محصول از قبل در سبد بود، تعداد آن را افزایش می‌دهیم
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: quantity } },
      });
    } else {
      // در غیر این صورت، محصول جدید را اضافه می‌کنیم
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    // اگر کاربر مهمان بود، کوکی را مجددا تنظیم می‌کنیم تا منقضی نشود
    if (!userId) {
      res.cookie("cartId", cart.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    }

    res.status(200).json({ success: true, message: "Item added to cart." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// آپدیت تعداد یک آیتم
export const updateCartItemQuantity = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (quantity < 1) {
    return res
      .status(400)
      .json({ success: false, message: "Quantity cannot be less than 1." });
  }

  try {
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
    res.status(200).json({ success: true, message: "Quantity updated." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// حذف یک آیتم از سبد خرید
export const removeItemFromCart = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { itemId } = req.params;
  try {
    await prisma.cartItem.delete({ where: { id: itemId } });
    res.status(200).json({ success: true, message: "Item removed from cart." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// خالی کردن سبد خرید
export const clearCart = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const { cartId } = req.cookies;

  try {
    const cart = await findOrCreateCart(userId, cartId);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.status(200).json({ success: true, message: "Cart cleared." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
