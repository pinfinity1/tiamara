// server/src/controllers/cartController.ts

import { Response } from "express";
import { OptionalAuthenticatedRequest } from "../middleware/extractUser";
import { prisma } from "../server";

interface CartItemInput {
  productId: string;
  quantity: number;
}

// تابع هوشمند برای پیدا کردن سبد خرید
const findOrCreateCart = async (
  userId: string | undefined,
  sessionId: string
) => {
  // ۱. اگر کاربر لاگین کرده
  if (userId) {
    let userCart = await prisma.cart.findUnique({ where: { userId } });
    if (!userCart) {
      // اگه نداشت براش بساز
      userCart = await prisma.cart.create({ data: { userId } });
    }
    return userCart;
  }

  // ۲. اگر کاربر مهمانه (با sessionId پیداش کن)
  let guestCart = await prisma.cart.findUnique({ where: { sessionId } });
  if (!guestCart) {
    // اگه نداشت براش بساز (فیلد sessionId تو دیتابیست هست، چک کردم)
    guestCart = await prisma.cart.create({ data: { sessionId } });
  }
  return guestCart;
};

export const getCart = async (
  req: OptionalAuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.cookies.sessionId;

    if (!sessionId) {
      // این نباید اتفاق بیفته چون میدل‌ور cartSession اونو ساخته
      return res.status(400).json({ success: false, message: "Session Error" });
    }

    const cart = await findOrCreateCart(userId, sessionId);

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
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, cart: cartItems });
  } catch (error) {
    console.error("Get Cart Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const addItemToCart = async (
  req: OptionalAuthenticatedRequest,
  res: Response
) => {
  const { productId, quantity }: CartItemInput = req.body;
  const userId = req.user?.userId;
  const sessionId = req.cookies.sessionId;

  if (!sessionId)
    return res.status(400).json({ success: false, message: "Session missing" });

  try {
    const cart = await findOrCreateCart(userId, sessionId);

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    // چک کردن موجودی (اختیاری)
    // if (product.stock < quantity) return res.status(400).json(...)

    // آیتم تکراری رو پیدا کن
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: { cartId: cart.id, productId: productId },
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: quantity } },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    res.status(200).json({ success: true, message: "Item added to cart" });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateCartItemQuantity = async (
  req: OptionalAuthenticatedRequest,
  res: Response
) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  const userId = req.user?.userId;
  const sessionId = req.cookies.sessionId;

  if (quantity < 1)
    return res
      .status(400)
      .json({ success: false, message: "Invalid quantity" });

  try {
    const cart = await findOrCreateCart(userId, sessionId!);

    // امنیت: مطمئن شو این آیتم مال همین سبده
    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    res.status(200).json({ success: true, message: "Updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const removeItemFromCart = async (
  req: OptionalAuthenticatedRequest,
  res: Response
) => {
  const { itemId } = req.params;
  const userId = req.user?.userId;
  const sessionId = req.cookies.sessionId;

  try {
    const cart = await findOrCreateCart(userId, sessionId!);

    await prisma.cartItem.deleteMany({
      where: { id: itemId, cartId: cart.id },
    });

    res.status(200).json({ success: true, message: "Removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const clearCart = async (
  req: OptionalAuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.userId;
  const sessionId = req.cookies.sessionId;

  try {
    const cart = await findOrCreateCart(userId, sessionId!);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.status(200).json({ success: true, message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
