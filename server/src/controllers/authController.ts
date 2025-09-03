import { prisma } from "../server";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { v4 as uuidv4 } from "uuid";

async function generateToken(userId: string, email: string, role: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const accessToken = await new SignJWT({ userId, email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("60m")
    .sign(secret);

  const refreshToken = uuidv4();
  return { accessToken, refreshToken };
}

async function setTokens(
  res: Response,
  accessToken: string,
  refreshToken: string
) {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: "User with this email exists!",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      success: true,
      userId: user.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const extractCurrentUser = await prisma.user.findUnique({
      where: { email },
    });

    if (
      !extractCurrentUser ||
      !(await bcrypt.compare(password, extractCurrentUser.password))
    ) {
      res.status(401).json({
        success: false,
        error: "Invalied credentials",
      });

      return;
    }
    //create our access and refreshtoken
    const { accessToken, refreshToken } = await generateToken(
      extractCurrentUser.id,
      extractCurrentUser.email,
      extractCurrentUser.role
    );

    await prisma.user.update({
      where: { id: extractCurrentUser.id },
      data: { refreshToken: refreshToken },
    });

    //set out tokens
    await setTokens(res, accessToken, refreshToken);
    res.status(200).json({
      success: true,
      message: "Login successfully",
      user: {
        id: extractCurrentUser.id,
        name: extractCurrentUser.name,
        email: extractCurrentUser.email,
        role: extractCurrentUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(401).json({
      success: false,
      error: "Refresh token not provided",
    });
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        refreshToken: refreshToken,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: "Invalid refresh token or user not found",
      });
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateToken(
      user.id,
      user.email,
      user.role
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    //set out tokens
    await setTokens(res, accessToken, newRefreshToken);
    res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Refresh token error" });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    await prisma.user.updateMany({
      where: { refreshToken: refreshToken },
      data: { refreshToken: null },
    });
  }
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({
    success: true,
    message: "User logged out successfully",
  });
};
