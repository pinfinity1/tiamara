// server/src/controllers/aiController.ts

import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../server";

export const handleChat = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { message } = req.body;
    const userId = req.user?.userId; // در آینده برای شخصی‌سازی استفاده می‌شود

    if (!message) {
      res
        .status(400)
        .json({ success: false, message: "پیام کاربر نمی‌تواند خالی باشد." });
      return;
    }

    // TODO: Phase 1 Logic
    // 1. جستجوی محصولات مرتبط با پیام کاربر در دیتابیس
    // 2. ساخت یک پرامپت (دستور) هوشمندانه با اطلاعات محصولات
    // 3. ارسال پرامپت به یک سرویس LLM (مانند Google AI)
    // 4. دریافت پاسخ از LLM و ارسال آن به کاربر

    // پاسخ موقت برای تست اولیه
    res.status(200).json({
      success: true,
      reply: `پیام شما دریافت شد: "${message}". منطق هوش مصنوعی به زودی در اینجا پیاده‌سازی می‌شود.`,
    });
  } catch (error) {
    console.error("Error in AI chat handler:", error);
    res.status(500).json({ success: false, message: "خطایی در سرور رخ داد." });
  }
};
