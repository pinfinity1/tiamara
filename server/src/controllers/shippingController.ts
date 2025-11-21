import { Request, Response } from "express";
import { prisma } from "../server";

// --- بخش عمومی (برای کاربران) ---
export const getActiveShippingMethods = async (req: Request, res: Response) => {
  try {
    const methods = await prisma.shippingMethod.findMany({
      where: { isActive: true },
      orderBy: { cost: "asc" },
    });
    res.json(methods);
  } catch (error) {
    console.error("Error fetching active shipping methods:", error);
    res.status(500).json({ message: "خطا در دریافت روش‌های ارسال" });
  }
};

// --- بخش ادمین (مدیریت) ---

// ۱. دریافت تمام روش‌ها (حتی غیرفعال‌ها)
export const getAllShippingMethods = async (req: Request, res: Response) => {
  try {
    const methods = await prisma.shippingMethod.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(methods);
  } catch (error) {
    console.error("Error fetching all shipping methods:", error);
    res.status(500).json({ message: "خطا در دریافت لیست روش‌ها" });
  }
};

// ۲. ایجاد روش جدید
export const createShippingMethod = async (req: Request, res: Response) => {
  try {
    const { name, code, cost, description, isActive } = req.body;

    // بررسی تکراری بودن کد
    const existing = await prisma.shippingMethod.findUnique({
      where: { code },
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "این کد روش ارسال قبلاً ثبت شده است." });
    }

    const newMethod = await prisma.shippingMethod.create({
      data: {
        name,
        code,
        cost: parseFloat(cost), // اطمینان از فرمت عدد
        description,
        isActive: isActive ?? true,
      },
    });
    res.status(201).json(newMethod);
  } catch (error) {
    console.error("Error creating shipping method:", error);
    res.status(500).json({ message: "خطا در ایجاد روش ارسال" });
  }
};

// ۳. ویرایش روش
export const updateShippingMethod = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, cost, description, isActive } = req.body;

    const updatedMethod = await prisma.shippingMethod.update({
      where: { id },
      data: {
        name,
        code,
        cost: parseFloat(cost),
        description,
        isActive,
      },
    });
    res.json(updatedMethod);
  } catch (error) {
    console.error("Error updating shipping method:", error);
    res.status(500).json({ message: "خطا در ویرایش روش ارسال" });
  }
};

// ۴. حذف روش
export const deleteShippingMethod = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.shippingMethod.delete({ where: { id } });
    res.json({ message: "روش ارسال با موفقیت حذف شد" });
  } catch (error) {
    console.error("Error deleting shipping method:", error);
    res.status(500).json({ message: "خطا در حذف روش ارسال" });
  }
};
