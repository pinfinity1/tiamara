import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../server";
import { Cart, CartItem, product } from "@prisma/client";

type CartItemWithProduct = CartItem & {
  product: product & {
    images: { url: string }[];
  };
};

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

const findOrCreateCart = async (
  userId?: string,
  guestCartId?: string
): Promise<Cart> => {
  if (userId) {
    const userCart = await prisma.cart.findFirst({ where: { userId } });
    if (userCart) return userCart;
    return prisma.cart.create({ data: { userId } });
  }
  if (guestCartId) {
    const guestCart = await prisma.cart.findFirst({
      where: { id: guestCartId, userId: null },
    });
    if (guestCart) return guestCart;
  }
  return prisma.cart.create({ data: {} });
};

export const addToCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { productId, quantity, guestCartId, slug } = req.body;

    if (!productId || !quantity) {
      res
        .status(400)
        .json({ success: false, message: "شناسه محصول و تعداد الزامی است." });
      return;
    }

    const cart = await findOrCreateCart(userId, guestCartId);

    const cartItem = await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      update: { quantity: { increment: quantity } },
      create: { cartId: cart.id, productId, quantity },
      include: { product: { include: { images: { take: 1 } } } },
    });

    res.status(201).json({
      success: true,
      data: formatCartItemResponse(cartItem as CartItemWithProduct),
      cartId: cart.id,
    });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ success: false, message: "خطا در افزودن به سبد خرید." });
  }
};

export const getCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { guestCartId } = req.query;

    let cart;
    if (userId) {
      cart = await prisma.cart.findFirst({ where: { userId } });
      if (!cart) {
        cart = await prisma.cart.create({ data: { userId } });
      }
    } else if (
      guestCartId &&
      typeof guestCartId === "string" &&
      guestCartId.length > 0
    ) {
      cart = await prisma.cart.findFirst({
        where: { id: guestCartId, userId: null },
      });
    }

    if (!cart) {
      const newCart = await prisma.cart.create({ data: {} });
      res.json({ success: true, data: [], cartId: newCart.id });
      return;
    }

    const cartWithDetails = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
          include: {
            product: {
              include: { images: { take: 1 } },
            },
          },
        },
      },
    });

    const formattedItems =
      cartWithDetails?.items.map((item) =>
        formatCartItemResponse(item as CartItemWithProduct)
      ) ?? [];
    res.json({ success: true, data: formattedItems, cartId: cart.id });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ success: false, message: "خطا در دریافت سبد خرید." });
  }
};

export const mergeCarts = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { guestCartId } = req.body;

    if (!userId || !guestCartId) {
      res
        .status(400)
        .json({ success: false, message: "شناسه کاربر و مهمان الزامی است." });
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
      await prisma.cart.delete({ where: { id: guestCartId } });
    }
    res
      .status(200)
      .json({ success: true, message: "سبد خرید با موفقیت ادغام شد." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "خطا در ادغام سبد خرید." });
  }
};

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

    const cartItem = await prisma.cartItem.findFirst({
      where: { id, cartId: cart.id },
      include: { product: true },
    });

    if (!cartItem) {
      res
        .status(404)
        .json({ success: false, message: "محصول در سبد خرید یافت نشد." });
      return;
    }

    // *** Check stock availability ***
    if (quantity > cartItem.product.stock) {
      res.status(400).json({
        success: false,
        message: `موجودی انبار کافی نیست. تنها ${cartItem.product.stock} عدد موجود است.`,
        stock: cartItem.product.stock,
      });
      return;
    }

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id } });
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

export const removeFromCart = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { guestCartId } = req.query;
    const userId = req.user?.userId;

    const cart = await findOrCreateCart(
      userId,
      guestCartId as string | undefined
    );

    await prisma.cartItem.delete({
      where: { id, cartId: cart.id },
    });

    res
      .status(200)
      .json({ success: true, message: "محصول از سبد خرید حذف شد." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "خطا در حذف محصول." });
  }
};

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
    console.error(e);
    res
      .status(500)
      .json({ success: false, message: "خطا در خالی کردن سبد خرید." });
  }
};
