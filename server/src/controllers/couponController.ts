import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { Response, NextFunction } from "express";
import { prisma } from "../server";

export const createCoupon = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      code,
      discountType,
      discountValue,
      expireDate,
      usageLimit,
      isActive,
    } = req.body;

    const newCoupon = await prisma.coupon.create({
      data: {
        code,
        discountType,
        discountValue: parseFloat(discountValue),
        expireDate: new Date(expireDate),
        usageLimit: parseInt(usageLimit),
        isActive,
      },
    });

    res.status(201).json({ success: true, coupon: newCoupon });
  } catch (error) {
    next(error);
  }
};

export const getAllCoupons = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const coupons = await prisma.coupon.findMany();
    res.status(200).json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

export const getCouponById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      res.status(404).json({ success: false, message: "Coupon not found" });
      return;
    }
    res.status(200).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      code,
      discountType,
      discountValue,
      expireDate,
      usageLimit,
      isActive,
    } = req.body;

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: {
        code,
        discountType,
        discountValue: parseFloat(discountValue),
        expireDate: new Date(expireDate),
        usageLimit: parseInt(usageLimit),
        isActive,
      },
    });

    res.status(200).json({ success: true, coupon: updatedCoupon });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id } });
    res
      .status(200)
      .json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const validateCoupon = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { code } = req.body;
  const now = new Date();

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      res
        .status(404)
        .json({ isValid: false, message: "کد تخفیف نامعتبر است." });
      return;
    }

    if (!coupon.isActive) {
      res.status(400).json({ isValid: false, message: "کد تخفیف فعال نیست." });
      return;
    }

    // Use the correct 'expireDate' field
    if (now > coupon.expireDate) {
      res
        .status(400)
        .json({ isValid: false, message: "کد تخفیف منقضی شده است." });
      return;
    }

    if (coupon.usageCount >= coupon.usageLimit) {
      res.status(400).json({
        isValid: false,
        message: "ظرفیت استفاده از این کد تخفیف به اتمام رسیده است.",
      });
      return;
    }

    res.status(200).json({
      isValid: true,
      message: "کد تخفیف با موفقیت اعمال شد.",
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (error) {
    next(error);
  }
};
