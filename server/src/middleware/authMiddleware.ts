// server/src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "../server";

// اینترفیس را گسترش می‌دهیم تا اطلاعات کاربر را شامل شود
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    phone: string;
    role: "USER" | "SUPER_ADMIN";
  };
}

const JWT_SECRET = process.env.JWT_SECRET!;

/**
 * Middleware برای احراز هویت کاربر بر اساس توکن JWT.
 */
export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "توکن ارائه نشده است." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, phone: true, role: true },
    });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "کاربر یافت نشد." });
    }

    req.user = {
      userId: user.id,
      // ✅ این خط اصلاح شد. اگر ایمیل null بود، رشته خالی جایگزین می‌شود.
      email: user.email ?? "",
      phone: user.phone || "",
      role: user.role as "USER" | "SUPER_ADMIN",
    };

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "توکن نامعتبر است." });
  }
};

/**
 * Middleware برای بررسی دسترسی ادمین.
 */
export const authorizeAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "SUPER_ADMIN") {
    return res
      .status(403)
      .json({ success: false, message: "شما دسترسی ادمین ندارید." });
  }
  next();
};
