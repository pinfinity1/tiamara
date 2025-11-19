// server/src/middleware/cartSession.ts

import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

export const cartSessionMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let sessionId = req.cookies.sessionId;

  if (!sessionId) {
    sessionId = uuidv4();

    // تعیین دامنه کوکی
    // در پروداکشن باید .tiamara.ir باشد تا بین api و سایت اصلی شیر شود
    const domain =
      process.env.NODE_ENV === "production" ? ".tiamara.ir" : undefined;

    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      // نکته مهم: اگر هنوز SSL ندارید (آدرس با http است)، secure باید false باشد
      // فعلاً false می‌گذاریم تا مشکل حل شود، بعداً که SSL گرفتید true کنید.
      secure: true,
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 سال
      sameSite: "lax",
      path: "/",
      domain: domain, // <--- این خط کلید حل مشکل است
    });

    // اضافه کردن به req
    req.cookies.sessionId = sessionId;
  }

  next();
};
