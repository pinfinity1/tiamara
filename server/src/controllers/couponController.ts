import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../server";

export const createCoupon = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { code, discountPercent, startDate, endDate, usageLimit } = req.body;

    const newlyCreatedCoupon = await prisma.coupon.create({
      data: {
        code,
        discountPercent: parseInt(discountPercent),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        usageLimit: parseInt(usageLimit),
        usageCount: 0,
      },
    });

    res.status(201).json({
      success: true,
      message: "Coupon created successfully!",
      coupon: newlyCreatedCoupon,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Failed to created coupon",
    });
  }
};

export const fetchAllCoupons = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const fetchAllCouponsList = await prisma.coupon.findMany({
      orderBy: { createdAt: "asc" },
    });
    res.status(201).json({
      success: true,
      message: "Coupon created successfully!",
      couponList: fetchAllCouponsList,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupon list",
    });
  }
};

export const deleteCoupon = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.coupon.delete({
      where: { id },
    });

    res.status(201).json({
      success: true,
      message: "Coupon deleted successfully!",
      id: id,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
    });
  }
};

export const validateCoupon = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { code } = req.body;
    if (!code) {
      res.status(400).json({ success: false, message: "کد تخفیف الزامی است." });
      return;
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      res.status(404).json({ success: false, message: "کد تخفیف یافت نشد." });
      return;
    }

    const now = new Date();
    if (now < coupon.startDate) {
      res
        .status(400)
        .json({ success: false, message: "این کد تخفیف هنوز فعال نشده است." });
      return;
    }

    if (now > coupon.endDate) {
      res
        .status(400)
        .json({ success: false, message: "این کد تخفیف منقضی شده است." });
      return;
    }

    if (coupon.usageCount >= coupon.usageLimit) {
      res
        .status(400)
        .json({
          success: false,
          message: "ظرفیت استفاده از این کد تخفیف به اتمام رسیده است.",
        });
      return;
    }

    res.status(200).json({
      success: true,
      message: "کد تخفیف معتبر است.",
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountPercent: coupon.discountPercent,
      },
    });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ success: false, message: "خطا در اعتبارسنجی کد تخفیف." });
  }
};
