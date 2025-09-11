import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../server";

/**
 * @description Get the current user's wishlist.
 * Returns an array of product IDs.
 */
export const getWishlist = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthenticated" });
      return;
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          select: { productId: true },
        },
      },
    });

    // اگر کاربر لیست علاقه‌مندی نداشت، یک آرایه خالی برگردان
    res.status(200).json({
      success: true,
      wishlist: wishlist?.items.map((item) => item.productId) || [],
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching wishlist.",
    });
  }
};

/**
 * @description Add or remove a product from the user's wishlist.
 * If the item exists, it's removed. If not, it's added.
 */
export const toggleWishlistItem = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { productId } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthenticated" });
      return;
    }
    if (!productId) {
      res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
      return;
    }

    // ابتدا لیست علاقه‌مندی کاربر را پیدا یا ایجاد کن
    let wishlist = await prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({ data: { userId } });
    }

    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (existingItem) {
      // اگر محصول در لیست بود، آن را حذف کن
      await prisma.wishlistItem.delete({ where: { id: existingItem.id } });
      res.status(200).json({
        success: true,
        message: "Removed from wishlist",
        action: "removed",
      });
    } else {
      // در غیر این صورت، آن را اضافه کن
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
        },
      });
      res
        .status(200)
        .json({ success: true, message: "Added to wishlist", action: "added" });
    }
  } catch (error) {
    console.error("Error toggling wishlist item:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while toggling item." });
  }
};
