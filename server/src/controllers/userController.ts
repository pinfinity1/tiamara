// server/src/controllers/userController.ts

import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../server";

export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthenticated" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        phone: true,
        skinType: true,
        skinConcerns: true,
        skincareGoals: true,
        productPreferences: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { name, skinType, skinConcerns, skincareGoals, productPreferences } =
      req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthenticated" });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        skinType,
        skinConcerns,
        skincareGoals,
        productPreferences,
      },
      select: {
        name: true,
        email: true,
        phone: true,
        skinType: true,
        skinConcerns: true,
        skincareGoals: true,
        productPreferences: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
