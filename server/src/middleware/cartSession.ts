// server/src/middleware/cartSession.ts

import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

export const cartSessionMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // اگر کاربر کوکی sessionId نداشت، یکی براش می‌سازیم
  if (!req.cookies.sessionId) {
    const sessionId = uuidv4();

    // تنظیمات کوکی
    res.cookie("sessionId", sessionId, {
      httpOnly: true, // امنیت: جاوااسکریپت کلاینت بهش دسترسی نداره
      secure: process.env.NODE_ENV === "production", // در پروداکشن فقط https
      maxAge: 365 * 24 * 60 * 60 * 1000, // انقضا: ۱ سال
      sameSite: "lax",
      path: "/", // در تمام صفحات سایت معتبر است
    });

    // اضافه کردن به req برای استفاده در کنترلرها
    req.cookies.sessionId = sessionId;
  }

  next();
};
