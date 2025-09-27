// server/src/controllers/cartController.ts

import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../server";
import { Cart, CartItem, Product } from "@prisma/client";

// Define a more detailed type for cart items with product info
type CartItemWithProduct = CartItem & {
  product: Product & {
    images: { url: string }[];
  };
};

/**
 * A helper function to format cart items for a consistent client-side response.
 */
const formatCartItemResponse = (cartItem: CartItemWithProduct) => {
  const { product } = cartItem;
  return {
    id: cartItem.id,
    productId: cartItem.productId,
    name: product?.name ?? "محصول نامشخص",
    slug: product?.slug ?? "",
    price: product?.discount_price ?? product?.price ?? 0,
    image: product?.images?.[0]?.url ?? "/images/placeholder.png",
    quantity: cartItem.quantity,
    stock: product?.stock ?? 0,
  };
};

/**
 * Finds an existing cart or creates a new one for a user or a guest.
 * This is the core logic for cart management.
 */
const findOrCreateCart = async (
  userId?: string,
  guestCartId?: string
): Promise<Cart> => {
  // اگر کاربر لاگین کرده باشد، سبد خرید او در اولویت است
  if (userId) {
    const userCart = await prisma.cart.findUnique({ where: { userId } });
    if (userCart) return userCart;
    return prisma.cart.create({ data: { userId } });
  }

  // اگر کاربر مهمان با یک شناسه سبد خرید باشد، آن را پیدا می‌کنیم
  if (guestCartId) {
    const guestCart = await prisma.cart.findFirst({
      where: { id: guestCartId, userId: null }, // اطمینان از اینکه سبد خرید مهمان است
    });
    if (guestCart) return guestCart;
  }

  // اگر هیچ سبد خریدی یافت نشد، یک سبد جدید برای مهمان می‌سازیم
  return prisma.cart.create({ data: {} });
};

/**
 * Adds an item to the cart or increments its quantity if it already exists.
 */
export const addToCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { productId, quantity, guestCartId } = req.body;

    if (!productId || !quantity) {
      res
        .status(400)
        .json({ success: false, message: "شناسه محصول و تعداد الزامی است." });
      return;
    }

    const cart = await findOrCreateCart(userId, guestCartId);
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.stock < quantity) {
      res
        .status(400)
        .json({ success: false, message: "موجودی محصول کافی نیست." });
      return;
    }

    const cartItem = await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, productId, quantity },
      include: { product: { include: { images: { take: 1 } } } },
    });

    res.status(201).json({
      success: true,
      data: formatCartItemResponse(cartItem as CartItemWithProduct),
      cartId: cart.id, // شناسه سبد خرید را برای کاربران مهمان برمی‌گردانیم
    });
  } catch (e) {
    console.error("Error in addToCart:", e);
    res
      .status(500)
      .json({ success: false, message: "خطا در افزودن به سبد خرید." });
  }
};

/**
 * Fetches the complete cart details for the current user or guest.
 */
export const getCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { guestCartId } = req.query;

    // --- START OF THE FIX ---

    let cart;
    // If the user is logged in, ALWAYS use their user ID to find/create the cart.
    // Ignore any guestCartId that might be present in the query.
    if (userId) {
      cart = await findOrCreateCart(userId);
    } else {
      // Only use guestCartId if the user is NOT logged in.
      cart = await findOrCreateCart(
        undefined,
        guestCartId as string | undefined
      );
    }

    // --- END OF THE FIX ---

    const cartWithDetails = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
          include: { product: { include: { images: { take: 1 } } } },
        },
      },
    });

    const formattedItems =
      cartWithDetails?.items.map((item) =>
        formatCartItemResponse(item as CartItemWithProduct)
      ) ?? [];

    res.json({ success: true, data: formattedItems, cartId: cart.id });
  } catch (e) {
    console.error("Error in getCart:", e);
    res
      .status(500)
      .json({ success: false, message: "خطا در دریافت سبد خرید." });
  }
};

/**
 * Merges a guest cart with a user's cart upon login.
 */
export const mergeCarts = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { guestCartId } = req.body;

    if (!userId || !guestCartId) {
      res.status(400).json({
        success: false,
        message: "شناسه کاربر و سبد مهمان الزامی است.",
      });
      return;
    }

    const userCart = await findOrCreateCart(userId);
    const guestCart = await prisma.cart.findFirst({
      where: { id: guestCartId, userId: null },
      include: { items: true },
    });

    if (
      guestCart &&
      guestCart.id !== userCart.id &&
      guestCart.items.length > 0
    ) {
      // آیتم‌های سبد مهمان را به سبد کاربر منتقل کن
      for (const guestItem of guestCart.items) {
        await prisma.cartItem.upsert({
          where: {
            cartId_productId: {
              cartId: userCart.id,
              productId: guestItem.productId,
            },
          },
          update: { quantity: { increment: guestItem.quantity } },
          create: {
            cartId: userCart.id,
            productId: guestItem.productId,
            quantity: guestItem.quantity,
          },
        });
      }

      // آیتم‌های سبد مهمان را حذف کن
      await prisma.cartItem.deleteMany({ where: { cartId: guestCartId } });
      // سبد مهمان را حذف کن
      await prisma.cart.delete({ where: { id: guestCartId } });
    }
    res
      .status(200)
      .json({ success: true, message: "سبد خرید با موفقیت ادغام شد." });
  } catch (e) {
    console.error("Error in mergeCarts:", e);
    res.status(500).json({ success: false, message: "خطا در ادغام سبد خرید." });
  }
};

/**
 * Updates the quantity of a specific item in the cart.
 */
export const updateCartItemQuantity = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params; // ID of the CartItem
    const { quantity } = req.body;
    const userId = req.user?.userId;
    const guestCartId = req.body.guestCartId || req.query.guestCartId;

    if (!quantity || quantity < 0) {
      res.status(400).json({ success: false, message: "تعداد نامعتبر است." });
      return;
    }

    const cart = await findOrCreateCart(userId, guestCartId as string);
    if (!cart) {
      res.status(404).json({ success: false, message: "سبد خرید یافت نشد." });
      return;
    }

    // If quantity is 0, remove the item
    if (quantity === 0) {
      await prisma.cartItem.deleteMany({ where: { id, cartId: cart.id } });
      res.status(200).json({ success: true, removed: true, id });
      return;
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: { product: { include: { images: { take: 1 } } } },
    });

    res.json({
      success: true,
      data: formatCartItemResponse(updatedItem as CartItemWithProduct),
    });
  } catch (e) {
    console.error("Error updating cart item quantity:", e);
    res
      .status(500)
      .json({ success: false, message: "خطا در به‌روزرسانی تعداد محصول." });
  }
};

/**
 * Removes an item completely from the cart.
 */
export const removeFromCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params; // This is CartItem ID
    const { guestCartId } = req.query;
    const userId = req.user?.userId;

    const cart = await findOrCreateCart(
      userId,
      guestCartId as string | undefined
    );

    await prisma.cartItem.deleteMany({
      where: { id, cartId: cart.id },
    });

    res
      .status(200)
      .json({ success: true, message: "محصول از سبد خرید حذف شد." });
  } catch (e) {
    console.error("Error in removeFromCart:", e);
    res.status(500).json({ success: false, message: "خطا در حذف محصول." });
  }
};

/**
 * Clears all items from the user's or guest's cart.
 */
export const clearEntireCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { guestCartId } = req.body;
    const userId = req.user?.userId;

    const cart = await findOrCreateCart(userId, guestCartId);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    res
      .status(200)
      .json({ success: true, message: "سبد خرید با موفقیت خالی شد." });
  } catch (e) {
    console.error("Error in clearEntireCart:", e);
    res
      .status(500)
      .json({ success: false, message: "خطا در خالی کردن سبد خرید." });
  }
};
