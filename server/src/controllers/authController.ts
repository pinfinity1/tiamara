import { prisma } from "../server";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { generateAndSaveOtp, verifyOtp } from "../utils/otpUtils";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

async function generateTokens(userId: string, phone: string, role: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const accessToken = await new SignJWT({ userId, phone, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m") // Lifespan set to 15 minutes
    .sign(secret);

  const refreshToken = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Lifespan set to 7 days
    .sign(secret);

  await prisma.refreshToken.create({
    data: {
      userId: userId,
      token: refreshToken,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  return { accessToken, refreshToken };
}

export const checkPhoneAndSendOtpController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // *** تغییر کلیدی ۱: دریافت forceOtp از body ***
    const { phone, forceOtp } = req.body;
    if (!phone) {
      res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { phone } });

    // *** تغییر کلیدی ۲: شرط جدید برای ارسال OTP ***
    // OTP ارسال می‌شود اگر: ۱. درخواست اجباری باشد ۲. کاربر جدید باشد ۳. کاربر رمز عبور نداشته باشد
    if (forceOtp || !user || !user.password) {
      const otp = await generateAndSaveOtp(phone);
      console.log(
        `\n\n✅ OTP for ${phone}: ${otp} (Forced or New/No-Pass User)\n\n`
      );
      res.status(200).json({
        success: true,
        message: "OTP sent successfully.",
        userExists: !!user,
        hasPassword: !!user?.password,
      });
    } else {
      // جریان استاندارد برای کاربری که رمز عبور دارد
      console.log(`\n\n▶️ Password login flow for ${phone}\n\n`);
      res.status(200).json({
        success: true,
        message: "User has a password. Proceed to password entry.",
        userExists: true,
        hasPassword: true,
      });
    }
  } catch (error) {
    console.error("Error in checkPhoneAndSendOtpController:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to process request" });
  }
};

// ... (بقیه توابع کنترلر بدون تغییر باقی می‌مانند)
// loginWithOtpController, setPasswordController, loginWithPasswordController, etc.

export const loginWithOtpController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phone, otp } = req.body;
    const { cartId } = req.cookies;

    if (!phone || !otp) {
      res
        .status(400)
        .json({ success: false, error: "Phone and OTP are required" });
      return;
    }

    const isOtpValid = await verifyOtp(phone, otp);
    if (!isOtpValid) {
      res.status(401).json({ success: false, error: "Invalid or expired OTP" });
      return;
    }

    let user = await prisma.user.findUnique({ where: { phone } });
    let isNewUser = false;

    if (!user) {
      user = await prisma.user.create({
        data: { phone, role: "USER" },
      });
      isNewUser = true;
      await prisma.cart.create({ data: { userId: user.id } });
    }

    await mergeGuestCartWithUserCart(user.id, cartId);

    const { accessToken, refreshToken } = await generateTokens(
      user.id,
      user.phone!,
      user.role
    );

    res.clearCookie("cartId", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isNewUser: isNewUser,
        requiresPasswordSetup: !user.password,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login with OTP failed" });
  }
};

export const setPasswordController = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { password } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }
    if (!password) {
      res.status(400).json({ success: false, error: "Password is required" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      }),
      prisma.session.deleteMany({
        where: { userId: userId },
      }),
      // Also revoke refresh tokens when password is set
      prisma.refreshToken.updateMany({
        where: { userId: userId },
        data: { revoked: true },
      }),
    ]);

    res
      .status(200)
      .json({ success: true, message: "Password set successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to set password" });
  }
};

export const loginWithPasswordController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phone, password } = req.body;
    const { cartId } = req.cookies;

    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user || !user.password) {
      res.status(401).json({ success: false, error: "Invalid credentials" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, error: "Invalid credentials" });
      return;
    }

    await mergeGuestCartWithUserCart(user.id, cartId);

    const { accessToken, refreshToken } = await generateTokens(
      user.id,
      user.phone!,
      user.role
    );

    res.clearCookie("cartId", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Login successfully",
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error(error);
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

    res.clearCookie("cartId", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};

export const refreshTokenController = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log("📥 Refresh request body:", req.body);

  const { token } = req.body;
  if (!token) {
    res.clearCookie("next-auth.session-token");
    res.clearCookie("next-auth.csrf-token");
    res.clearCookie("next-auth.callback-url");
    res
      .status(401)
      .json({ success: false, message: "Refresh token is required." });
    return;
  }

  try {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token, revoked: false },
    });

    console.log("🔍 Found in DB:", storedToken);

    if (!storedToken || storedToken.expires < new Date()) {
      res.clearCookie("next-auth.session-token");
      res.clearCookie("next-auth.csrf-token");
      res.clearCookie("next-auth.callback-url");
      res
        .status(401)
        .json({ success: false, message: "Invalid or expired refresh token." });
      return;
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
    });
    if (!user) {
      res.clearCookie("next-auth.session-token");
      res.clearCookie("next-auth.csrf-token");
      res.clearCookie("next-auth.callback-url");
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      user.id,
      user.phone!,
      user.role
    );

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    res
      .status(200)
      .json({ success: true, accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.clearCookie("next-auth.session-token");
    res.clearCookie("next-auth.csrf-token");
    res.clearCookie("next-auth.callback-url");
    res.status(401).json({ success: false, message: "Invalid refresh token." });
  }
};

export const requestPasswordResetController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phone } = req.body;
    if (!phone) {
      res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const otp = await generateAndSaveOtp(phone);
    console.log(`\n\n✅ Password Reset OTP for ${phone}: ${otp}\n\n`);

    res
      .status(200)
      .json({ success: true, message: "Password reset OTP sent." });
  } catch (error) {
    console.error("Error in requestPasswordResetController:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to process request" });
  }
};

export const resetPasswordController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phone, otp, password } = req.body;
    if (!phone || !otp || !password) {
      res.status(400).json({
        success: false,
        message: "Phone, OTP, and new password are required.",
      });
      return;
    }

    const isOtpValid = await verifyOtp(phone, otp);
    if (!isOtpValid) {
      res
        .status(401)
        .json({ success: false, message: "Invalid or expired OTP." });
      return;
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { phone },
        data: { password: hashedPassword },
      }),
      prisma.session.deleteMany({
        where: { userId: user.id },
      }),
      // Also revoke refresh tokens when password is reset
      prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { revoked: true },
      }),
    ]);

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully." });
  } catch (error) {
    console.error("Error in resetPasswordController:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to reset password." });
  }
};

async function mergeGuestCartWithUserCart(
  userId: string,
  guestCartId?: string
) {
  if (!guestCartId) return;

  const userCart = await prisma.cart.findUnique({ where: { userId } });
  const guestCart = await prisma.cart.findUnique({
    where: { id: guestCartId },
    include: { items: true },
  });

  if (!guestCart || !userCart) return;

  for (const guestItem of guestCart.items) {
    const userItem = await prisma.cartItem.findFirst({
      where: { cartId: userCart.id, productId: guestItem.productId },
    });

    if (userItem) {
      // اگر محصول در سبد کاربر بود، تعداد را جمع می‌زنیم
      await prisma.cartItem.update({
        where: { id: userItem.id },
        data: { quantity: { increment: guestItem.quantity } },
      });
    } else {
      // در غیر این صورت، آیتم را از سبد مهمان به سبد کاربر منتقل می‌کنیم
      await prisma.cartItem.update({
        where: { id: guestItem.id },
        data: { cartId: userCart.id },
      });
    }
  }

  // پس از انتقال آیتم‌ها، سبد خرید مهمان را حذف می‌کنیم
  try {
    await prisma.cart.delete({ where: { id: guestCartId } });
  } catch (e) {
    // ممکن است آیتمی برای انتقال وجود نداشته باشد و سبد مهمان خود به خود حذف شود
    console.log("Guest cart was likely empty and already cleaned up.");
  }
}
