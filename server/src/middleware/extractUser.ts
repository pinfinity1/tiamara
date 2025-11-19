// server/src/middleware/extractUser.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../server";

interface JwtPayload {
  userId: string;
}

// تایپ اختصاصی که اجازه میده user خالی باشه
export interface OptionalAuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

export const extractUser = async (
  req: OptionalAuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    // توکن نیست؟ اوکی، کاربر مهمانه. برو بعدی.
    req.user = undefined;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // چک کن کاربر واقعا تو دیتابیس هست
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true },
    });

    if (user) {
      req.user = { userId: user.id };
    } else {
      req.user = undefined;
    }

    next();
  } catch (error) {
    // توکن منقضی یا خراب؟ اوکی، کاربر مهمان حساب میشه.
    req.user = undefined;
    next();
  }
};
