// server/src/controllers/settingsController.ts

import { Response, Request } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import cloudinary from "../config/cloudinary";
import { prisma } from "../server";
import fs from "fs";

// --- Banner Management ---

export const addFeatureBanner = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, subtitle, linkUrl, buttonText, altText, order, isActive } =
      req.body;
    const file = req.file as Express.Multer.File;

    if (!file) {
      res.status(400).json({ success: false, message: "No file provided" });
      return;
    }

    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: "tiamara-banners",
    });

    const banner = await prisma.featureBanner.create({
      data: {
        imageUrl: uploadResult.secure_url,
        title,
        subtitle,
        linkUrl,
        buttonText,
        altText: altText || title, // Use title as fallback for alt text
        order: order ? parseInt(order) : 0,
        isActive: isActive ? isActive === "true" : true,
      },
    });

    fs.unlinkSync(file.path); // Clean up the uploaded file
    res.status(201).json({ success: true, banner });
  } catch (e) {
    console.error("Error adding feature banner:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to add feature banner" });
  }
};

export const fetchFeatureBanners = async (
  req: Request, // This can be a public route, so no need for AuthenticatedRequest
  res: Response
): Promise<void> => {
  try {
    const banners = await prisma.featureBanner.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    res.status(200).json({ success: true, banners });
  } catch (e) {
    console.error("Error fetching feature banners:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch feature banners" });
  }
};

// --- Homepage Section Management ---

export const getHomepageSections = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sections = await prisma.homepageSection.findMany({
      orderBy: { order: "asc" },
      include: {
        products: {
          include: {
            images: { take: 1 }, // get only the first image for each product
            brand: true,
            category: true,
          },
        },
      },
    });
    res.status(200).json({ success: true, sections });
  } catch (error) {
    console.error("Error fetching homepage sections:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch homepage sections." });
  }
};

export const createHomepageSection = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, order, productIds } = req.body;

    if (!title || !productIds || !Array.isArray(productIds)) {
      res
        .status(400)
        .json({
          success: false,
          message: "Title and productIds array are required.",
        });
      return;
    }

    const section = await prisma.homepageSection.create({
      data: {
        title,
        order: order ? parseInt(order) : 0,
        products: {
          connect: productIds.map((id: string) => ({ id })),
        },
      },
    });

    res.status(201).json({ success: true, section });
  } catch (error) {
    console.error("Error creating homepage section:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create homepage section." });
  }
};

export const updateHomepageSection = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, order, productIds } = req.body;

    if (
      title === undefined ||
      productIds === undefined ||
      !Array.isArray(productIds)
    ) {
      res
        .status(400)
        .json({
          success: false,
          message: "Title and productIds array are required.",
        });
      return;
    }

    const section = await prisma.homepageSection.update({
      where: { id },
      data: {
        title,
        order: order ? parseInt(order) : 0,
        products: {
          set: productIds.map((id: string) => ({ id })), // Replaces all products with the new list
        },
      },
    });

    res.status(200).json({ success: true, section });
  } catch (error) {
    console.error("Error updating homepage section:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update homepage section." });
  }
};

export const deleteHomepageSection = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.homepageSection.delete({ where: { id } });
    res
      .status(200)
      .json({ success: true, message: "Section deleted successfully." });
  } catch (error) {
    console.error("Error deleting homepage section:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete homepage section." });
  }
};
