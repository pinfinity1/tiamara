// pinfinity1/tiamara/tiamara-8e92556f045803ca932111049e478472a72d8f9b/server/src/controllers/addressController.ts

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
          where: { userId },
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
        },
      });

      return newlyCreatedAddress;
    });

    res.status(201).json({ success: true, address: newAddress });
  } catch (e) {
    console.error("Error creating address:", e); // Log the full error to the console

    if (e instanceof Prisma.PrismaClientValidationError) {
      res
        .status(400)
        .json({
          success: false,
          message: "Invalid data provided.",
          details: e.message,
        });
    } else {
      res.status(500).json({ success: false, message: "Some error occured" });
    }
  }
};

// ... (Rest of the controller functions remain the same)
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
          where: { userId, NOT: { id } },
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
      where: { userId },
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
      where: { id, userId },
    });

    if (!addressToDelete) {
      res.status(404).json({ success: false, message: "Address not found!" });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.address.delete({
        where: { id },
      });

      if (addressToDelete.isDefault) {
        const nextAddress = await tx.address.findFirst({
          where: { userId },
          orderBy: { createdAt: "asc" },
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
    res.status(500).json({ success: false, message: "Some error occured" });
  }
};
