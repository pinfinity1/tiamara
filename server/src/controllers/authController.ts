import { prisma } from "../server";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { generateAndSaveOtp, verifyOtp } from "../utils/otpUtils";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

async function generateToken(userId: string, phone: string, role: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const accessToken = await new SignJWT({ userId, phone, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
  return { accessToken };
}

async function setTokens(res: Response, accessToken: string) {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000,
  });
}

export const checkPhoneAndSendOtpController = async (
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
    const otp = await generateAndSaveOtp(phone);

    console.log(`\n\n✅ test OTP for ${phone}: ${otp}\n\n`);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
      userExists: !!user,
      hasPassword: !!user?.password,
    });
  } catch (error) {
    console.error("Error in checkPhoneAndSendOtpController:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to process request" });
  }
};

export const loginWithOtpController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { phone, otp } = req.body;
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
    }

    const { accessToken } = await generateToken(
      user.id,
      user.phone!,
      user.role
    );

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

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

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

    const { accessToken } = await generateToken(
      user.id,
      user.phone!,
      user.role
    );

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
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const logoutController = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.clearCookie("accessToken");
  res.json({
    success: true,
    message: "User logged out successfully",
  });
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

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { phone },
      data: { password: hashedPassword },
    });

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
