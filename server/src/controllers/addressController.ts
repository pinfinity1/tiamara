// server/src/controllers/addressController.ts

import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { prisma } from "../server";
import { Prisma } from "@prisma/client";

export const createAddress = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthenticated user" });
    return;
  }

  const {
    recipientName,
    fullAddress,
    city,
    province,
    postalCode,
    phone,
    isDefault,
  } = req.body;

  try {
    const newAddress = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId, isDeleted: false }, // فقط آدرس‌های زنده را آپدیت کن
          data: { isDefault: false },
        });
      }

      const newlyCreatedAddress = await tx.address.create({
        data: {
          userId,
          recipientName,
          fullAddress,
          city,
          province,
          postalCode,
          phone,
          isDefault: isDefault || false,
          isDeleted: false, // به صورت پیش‌فرض زنده است
        },
      });

      return newlyCreatedAddress;
    });

    res.status(201).json({ success: true, address: newAddress });
  } catch (e) {
    console.error("Error creating address:", e);

    if (e instanceof Prisma.PrismaClientValidationError) {
      res.status(400).json({
        success: false,
        message: "Invalid data provided.",
        details: e.message,
      });
    } else {
      res.status(500).json({ success: false, message: "Some error occured" });
    }
  }
};

export const updateAddress = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;
  const { id } = req.params;
  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthenticated user" });
    return;
  }

  const {
    recipientName,
    fullAddress,
    city,
    province,
    postalCode,
    phone,
    isDefault,
  } = req.body;

  try {
    const updatedAddress = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId, NOT: { id }, isDeleted: false }, // فقط آدرس‌های زنده
          data: { isDefault: false },
        });
      }

      const addressToUpdate = await tx.address.update({
        where: { id },
        data: {
          recipientName,
          fullAddress,
          city,
          province,
          postalCode,
          phone,
          isDefault,
        },
      });

      return addressToUpdate;
    });

    res.status(200).json({ success: true, address: updatedAddress });
  } catch (e) {
    console.error("Error updating address:", e);
    res.status(500).json({ success: false, message: "Some error occured" });
  }
};

export const getAddresses = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthenticated user",
      });
      return;
    }

    const fetchAllAddresses = await prisma.address.findMany({
      where: {
        userId,
        isDeleted: false, // <--- مهم: فقط آدرس‌های حذف نشده
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    res.status(200).json({
      success: true,
      address: fetchAllAddresses,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

// --- تغییر اصلی اینجاست (Soft Delete) ---
export const deleteAddress = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthenticated user" });
      return;
    }

    const addressToDelete = await prisma.address.findFirst({
      where: { id, userId, isDeleted: false },
    });

    if (!addressToDelete) {
      res.status(404).json({ success: false, message: "Address not found!" });
      return;
    }

    await prisma.$transaction(async (tx) => {
      // به جای delete، آن را آپدیت می‌کنیم
      await tx.address.update({
        where: { id },
        data: {
          isDeleted: true, // علامت‌گذاری به عنوان حذف شده
          isDefault: false, // از حالت پیش‌فرض خارج می‌شود
        },
      });

      // اگر آدرس حذف شده پیش‌فرض بود، بعدی را پیش‌فرض کن
      if (addressToDelete.isDefault) {
        const nextAddress = await tx.address.findFirst({
          where: { userId, isDeleted: false }, // فقط بین زنده‌ها بگرد
          orderBy: { createdAt: "desc" }, // معمولاً آخرین آدرس ساخته شده منطقی‌تر است
        });

        if (nextAddress) {
          await tx.address.update({
            where: { id: nextAddress.id },
            data: { isDefault: true },
          });
        }
      }
    });

    res
      .status(200)
      .json({ success: true, message: "Address deleted successfully!" });
  } catch (e) {
    console.error("Delete error:", e);
    res.status(500).json({ success: false, message: "Some error occured" });
  }
};
