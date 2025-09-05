import { prisma } from "../server";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { generateAndSaveOtp, verifyOtp } from "../utils/otpUtils";

async function generateToken(userId: string, phone: string, role: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const accessToken = await new SignJWT({ userId, phone, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("60m")
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

    if (!user) {
      user = await prisma.user.create({
        data: { phone, role: "USER" },
      });
    }

    const { accessToken } = await generateToken(
      user.id,
      user.phone!,
      user.role
    );
    await setTokens(res, accessToken);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login with OTP failed" });
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
    await setTokens(res, accessToken);

    res.status(200).json({
      success: true,
      message: "Login successfully",
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
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
