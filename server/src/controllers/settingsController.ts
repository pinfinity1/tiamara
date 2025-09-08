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
        altText: altText || title,
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

export const updateFeatureBanner = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, subtitle, linkUrl, altText, order, isActive, imageUrl } =
      req.body;
    const file = req.file as Express.Multer.File;

    let newImageUrl = imageUrl;

    const bannerToUpdate = await prisma.featureBanner.findUnique({
      where: { id },
    });
    if (!bannerToUpdate) {
      res.status(404).json({ success: false, message: "Banner not found" });
      return;
    }

    if (file) {
      if (bannerToUpdate.imageUrl) {
        const publicId = `tiamara-banners/${
          bannerToUpdate.imageUrl.split("/").pop()?.split(".")[0]
        }`;
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.log("Old image not found on cloudinary, proceeding...");
        }
      }

      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: "tiamara-banners",
      });
      newImageUrl = uploadResult.secure_url;
      fs.unlinkSync(file.path);
    }

    const updatedBanner = await prisma.featureBanner.update({
      where: { id },
      data: {
        imageUrl: newImageUrl,
        title,
        subtitle,
        linkUrl,
        altText: altText || title,
        order: order ? parseInt(order) : 0,
        isActive: isActive === "true", // تبدیل رشته به بولین
      },
    });

    res.status(200).json({ success: true, banner: updatedBanner });
  } catch (e) {
    console.error("Error updating feature banner:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to update feature banner" });
  }
};

export const deleteFeatureBanner = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const bannerToDelete = await prisma.featureBanner.findUnique({
      where: { id },
    });
    if (!bannerToDelete) {
      res.status(404).json({ success: false, message: "Banner not found" });
      return;
    }

    if (bannerToDelete.imageUrl) {
      const publicId = `tiamara-banners/${
        bannerToDelete.imageUrl.split("/").pop()?.split(".")[0]
      }`;
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.log("Image not found on cloudinary, proceeding...");
      }
    }

    await prisma.featureBanner.delete({ where: { id } });

    res
      .status(200)
      .json({ success: true, message: "Banner deleted successfully" });
  } catch (e) {
    console.error("Error deleting feature banner:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete feature banner" });
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
      res.status(400).json({
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
      res.status(400).json({
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
