// server/src/controllers/authController.ts

import { prisma } from "../server";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { generateAndSaveOtp, verifyOtp } from "../utils/otpUtils";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

// --- تابع کمکی تولید توکن ---
async function generateTokens(
  userId: string,
  phone: string,
  role: string,
  requiresPasswordSetup: boolean
) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const accessToken = await new SignJWT({
    userId,
    phone,
    role,
    requiresPasswordSetup,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);

  const refreshToken = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  await prisma.refreshToken.create({
    data: {
      userId: userId,
      token: refreshToken,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken };
}

// --- تابع کمکی ادغام سبد خرید ---
async function mergeGuestCartWithUserCart(
  userId: string,
  guestSessionId: string
) {
  if (!guestSessionId) return;

  // 1. پیدا کردن/ساخت سبد کاربر
  let userCart = await prisma.cart.findUnique({ where: { userId } });
  if (!userCart) {
    userCart = await prisma.cart.create({ data: { userId } });
  }

  // 2. پیدا کردن سبد مهمان (با sessionId)
  const guestCart = await prisma.cart.findUnique({
    where: { sessionId: guestSessionId },
    include: { items: true },
  });

  if (!guestCart || guestCart.items.length === 0) {
    // اگر سبد مهمان خالی بود یا وجود نداشت، فقط اگر وجود داشت پاکش کن تا تمیز شود
    if (guestCart) {
      try {
        await prisma.cart.delete({ where: { id: guestCart.id } });
      } catch (e) {}
    }
    return;
  }

  console.log(
    `🔄 Merging Guest Cart (Session: ${guestSessionId}) to User Cart (User: ${userId})`
  );

  await prisma.$transaction(async (tx) => {
    for (const guestItem of guestCart.items) {
      const userItem = await tx.cartItem.findFirst({
        where: { cartId: userCart!.id, productId: guestItem.productId },
      });

      if (userItem) {
        // A. آیتم تکراری: تعداد را اضافه کن
        await tx.cartItem.update({
          where: { id: userItem.id },
          data: { quantity: { increment: guestItem.quantity } },
        });
        // آیتم مهمان را پاک کن
        await tx.cartItem.delete({ where: { id: guestItem.id } });
      } else {
        // B. آیتم جدید: مالکیت را به سبد کاربر منتقل کن
        await tx.cartItem.update({
          where: { id: guestItem.id },
          data: { cartId: userCart!.id },
        });
      }
    }

    // 3. حذف کامل سبد مهمان
    await tx.cart.delete({ where: { id: guestCart.id } });

    // 4. پاکسازی sessionId از سبد کاربر (چون دیگر مهمان نیست)
    if (userCart!.sessionId) {
      await tx.cart.update({
        where: { id: userCart!.id },
        data: { sessionId: null },
      });
    }

    console.log("✅ Guest cart merged and deleted.");
  });
}

// ==========================================
//               CONTROLLERS
// ==========================================

export const checkPhoneAndSendOtpController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phone, forceOtp } = req.body;
    if (!phone) {
      res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { phone } });

    if (forceOtp || !user || !user.password) {
      const otp = await generateAndSaveOtp(phone);
      console.log(`✅ OTP for ${phone}: ${otp}`);
      res.status(200).json({
        success: true,
        message: "OTP sent.",
        userExists: !!user,
        hasPassword: !!user?.password,
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Password required.",
        userExists: true,
        hasPassword: true,
      });
    }
  } catch (error) {
    console.error("Check Phone Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const loginWithOtpController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phone, otp } = req.body;
    const { sessionId } = req.cookies;

    if (!phone || !otp) {
      res
        .status(400)
        .json({ success: false, error: "Required fields missing" });
      return;
    }

    const isOtpValid = await verifyOtp(phone, otp);
    if (!isOtpValid) {
      res.status(401).json({ success: false, error: "Invalid OTP" });
      return;
    }

    let user = await prisma.user.findUnique({ where: { phone } });
    let isNewUser = false;

    if (!user) {
      user = await prisma.user.create({ data: { phone, role: "USER" } });
      isNewUser = true;
    }

    // انجام عملیات ادغام سبد خرید
    if (sessionId) {
      await mergeGuestCartWithUserCart(user.id, sessionId);
    }

    const { accessToken, refreshToken } = await generateTokens(
      user.id,
      user.phone!,
      user.role,
      !user.password
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isNewUser,
        requiresPasswordSetup: !user.password,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login OTP Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const loginWithPasswordController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phone, password } = req.body;
    const { sessionId } = req.cookies;

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user || !user.password) {
      res.status(401).json({ success: false, error: "Invalid credentials" });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ success: false, error: "Invalid credentials" });
      return;
    }

    // انجام عملیات ادغام سبد خرید
    if (sessionId) {
      await mergeGuestCartWithUserCart(user.id, sessionId);
    }

    const { accessToken, refreshToken } = await generateTokens(
      user.id,
      user.phone!,
      user.role,
      false
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        requiresPasswordSetup: false,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login Password Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const logoutController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (userId) {
      await prisma.refreshToken.updateMany({
        where: { userId, revoked: false },
        data: { revoked: true },
      });
    }
    // نکته مهم: کوکی sessionId را پاک نمی‌کنیم تا کاربر بتواند به عنوان مهمان ادامه دهد
    res.json({ success: true, message: "Logged out" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};

export const refreshTokenController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token } = req.body;
  if (!token) {
    res.status(401).json({ success: false, message: "Token required" });
    return;
  }

  try {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token, revoked: false },
    });
    if (!storedToken || storedToken.expires < new Date()) {
      res.status(401).json({ success: false, message: "Invalid token" });
      return;
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
    });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      user.id,
      user.phone!,
      user.role,
      !user.password
    );
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    res
      .status(200)
      .json({ success: true, accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export const setPasswordController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { password } = req.body;
    const userId = req.user?.userId;
    if (!userId || !password) {
      res.status(400).json({ success: false, error: "Invalid data" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    // Optional: Clear sessions/tokens if needed
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });

    res.status(200).json({ success: true, message: "Password set" });
  } catch (error) {
    res.status(500).json({ error: "Failed" });
  }
};

export const requestPasswordResetController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phone } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const otp = await generateAndSaveOtp(phone);
    console.log(`RESET OTP: ${otp}`);
    res.status(200).json({ success: true, message: "OTP sent" });
  } catch (e) {
    res.status(500).json({ success: false });
  }
};

export const resetPasswordController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phone, otp, password } = req.body;
    if (!(await verifyOtp(phone, otp))) {
      res.status(401).json({ success: false, message: "Invalid OTP" });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { phone }, data: { password: hashed } });

    // Revoke tokens for security
    const user = await prisma.user.findUnique({ where: { phone } });
    if (user) {
      await prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { revoked: true },
      });
    }

    res.status(200).json({ success: true, message: "Password reset" });
  } catch (e) {
    res.status(500).json({ success: false });
  }
};
