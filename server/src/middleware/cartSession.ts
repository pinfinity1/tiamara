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

    // در محیط پروداکشن، دامنه را ست می‌کنیم تا بین api و سایت اصلی شیر شود
    const isProduction = process.env.NODE_ENV === "production";
    const domain = isProduction ? ".tiamara.ir" : undefined;

    res.cookie("sessionId", sessionId, {
      httpOnly: true,
      // چون آدرس‌های شما در .env با https شروع می‌شوند، این را true کنید
      secure: isProduction,
      maxAge: 365 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
      path: "/",
      domain: domain, // <--- این خط حیاتی است
    });

    req.cookies.sessionId = sessionId;
  }

  next();
};
