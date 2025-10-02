import { Request, Response } from "express";
import { prisma } from "../server";

export const getActiveShippingMethods = async (req: Request, res: Response) => {
  try {
    const methods = await prisma.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { cost: "asc" },
    });
    res.json(methods);
  } catch (error) {
    console.error("Failed to get shipping methods:", error);
    res.status(500).json({ message: "خطا در دریافت روش‌های ارسال" });
  }
};
