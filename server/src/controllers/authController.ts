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

  // تولید اکسس توکن
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

  // تولید رفرش توکن
  const refreshToken = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  // ذخیره رفرش توکن در دیتابیس با مدیریت خطا
  try {
    await prisma.refreshToken.create({
      data: {
        userId: userId,
        token: refreshToken,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  } catch (error: any) {
    // کد خطای P2002 مربوط به یونیک بودن فیلد در پریزما است
    if (error.code === "P2002") {
      console.log(
        "⚠️ Token already exists (Race condition handled implicitly)."
      );
      // ارور را نادیده می‌گیریم چون توکن قبلاً توسط ترد دیگر ذخیره شده است
    } else {
      // اگر ارور دیگری بود، آن را پرتاب کن
      throw error;
    }
  }

  return { accessToken, refreshToken };
}

// --- تابع کمکی برای ساخت فقط اکسس توکن (برای استفاده در شرایط مسابقه) ---
async function generateAccessTokenOnly(user: any) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  return await new SignJWT({
    userId: user.id,
    phone: user.phone,
    role: user.role,
    requiresPasswordSetup: !user.password,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(secret);
}

// --- تابع کمکی ادغام سبد خرید ---
async function mergeGuestCartWithUserCart(
  userId: string,
  guestSessionId: string
) {
  if (!guestSessionId) return;

  let userCart = await prisma.cart.findUnique({ where: { userId } });
  if (!userCart) {
    userCart = await prisma.cart.create({ data: { userId } });
  }

  const guestCart = await prisma.cart.findUnique({
    where: { sessionId: guestSessionId },
    include: { items: true },
  });

  if (!guestCart || guestCart.items.length === 0) {
    if (guestCart) {
      try {
        await prisma.cart.delete({ where: { id: guestCart.id } });
      } catch (e) {}
    }
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const guestItem of guestCart.items) {
      const userItem = await tx.cartItem.findFirst({
        where: { cartId: userCart!.id, productId: guestItem.productId },
      });

      if (userItem) {
        await tx.cartItem.update({
          where: { id: userItem.id },
          data: { quantity: { increment: guestItem.quantity } },
        });
        await tx.cartItem.delete({ where: { id: guestItem.id } });
      } else {
        await tx.cartItem.update({
          where: { id: guestItem.id },
          data: { cartId: userCart!.id },
        });
      }
    }

    await tx.cart.delete({ where: { id: guestCart.id } });

    if (userCart!.sessionId) {
      await tx.cart.update({
        where: { id: userCart!.id },
        data: { sessionId: null },
      });
    }
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
    res.json({ success: true, message: "Logged out" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};

// --- !!! بخش اصلاح شده و حیاتی !!! ---
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
    // 1. پیدا کردن توکن در دیتابیس (حتی اگر باطل شده باشد)
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    // اگر توکن اصلا وجود نداشت
    if (!storedToken) {
      res.status(401).json({ success: false, message: "Invalid token" });
      return;
    }

    const user = storedToken.user;
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // 2. مدیریت Race Condition (تداخل درخواست‌ها)
    if (storedToken.revoked) {
      // بررسی می‌کنیم آیا یک توکن معتبر (Revoke نشده) در ۳۰ ثانیه اخیر برای این کاربر ساخته شده؟
      // این یعنی احتمالا درخواست قبلی موفق بوده و این درخواست "تکراری/تاخیری" است.
      const recentValidToken = await prisma.refreshToken.findFirst({
        where: {
          userId: user.id,
          revoked: false, // توکن معتبر
          createdAt: {
            gt: new Date(Date.now() - 30 * 1000), // ساخته شده در ۳۰ ثانیه اخیر
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (recentValidToken) {
        console.log(
          "🔄 Race Condition Detected: Returning existing valid token."
        );
        // به جای ارور، توکن جدیدی که در درخواست قبلی ساخته شده بود را برمی‌گردانیم
        const accessToken = await generateAccessTokenOnly(user);

        res.status(200).json({
          success: true,
          accessToken,
          refreshToken: recentValidToken.token,
        });
        return;
      }

      // اگر توکن جدیدی نبود، یعنی دزدی توکن یا استفاده از توکن خیلی قدیمی
      // تمام توکن‌ها را برای امنیت پاک می‌کنیم
      await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
      res
        .status(401)
        .json({ success: false, message: "Invalid token (Reuse detected)" });
      return;
    }

    // 3. بررسی انقضا
    if (storedToken.expires < new Date()) {
      // حذف توکن منقضی
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      res.status(401).json({ success: false, message: "Token expired" });
      return;
    }

    // 4. بررسی امضای JWT (جهت اطمینان)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    try {
      await jwtVerify(token, secret);
    } catch (err) {
      res
        .status(401)
        .json({ success: false, message: "Invalid JWT signature" });
      return;
    }

    // 5. چرخش توکن (ساخت توکن جدید و باطل کردن قبلی)
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      user.id,
      user.phone!,
      user.role,
      !user.password
    );

    // این عملیات باید اتمیک باشد تا حد امکان
    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revoked: true },
      }),
      // پاکسازی دوره‌ای توکن‌های قدیمی (مثلاً قدیمی‌تر از ۲ روز)
      prisma.refreshToken.deleteMany({
        where: {
          userId: user.id,
          revoked: true,
          createdAt: { lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    res
      .status(200)
      .json({ success: true, accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error("Refresh Token Error:", error);
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
