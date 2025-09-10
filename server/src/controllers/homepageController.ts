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
    const { linkUrl, altText, isActive } = req.body;
    const file = req.file as Express.Multer.File;

    if (!file) {
      res.status(400).json({ success: false, message: "No file provided" });
      return;
    }

    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: "tiamara-banners",
    });

    const lastBanner = await prisma.featureBanner.findFirst({
      orderBy: { order: "desc" },
    });
    const newOrder = lastBanner ? lastBanner.order + 1 : 1;

    const banner = await prisma.featureBanner.create({
      data: {
        imageUrl: uploadResult.secure_url,
        linkUrl,
        altText: altText,
        order: newOrder,
        isActive: isActive ? isActive === "true" : true,
      },
    });

    fs.unlinkSync(file.path);
    res.status(201).json({ success: true, banner });
  } catch (e) {
    console.error("Error adding feature banner:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to add feature banner" });
  }
};

export const fetchFeatureBanners = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Fetches all banners for admin, ordered correctly
    const banners = await prisma.featureBanner.findMany({
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
    const { linkUrl, altText, order, isActive, imageUrl } = req.body;
    const file = req.file as Express.Multer.File;

    const bannerToUpdate = await prisma.featureBanner.findUnique({
      where: { id },
    });

    if (!bannerToUpdate) {
      res.status(404).json({ success: false, message: "Banner not found" });
      return;
    }

    const originalOrder = bannerToUpdate.order;
    const newOrder = parseInt(order);

    // --- Smart Reordering Logic within a transaction ---
    await prisma.$transaction(async (prisma) => {
      // If order has changed, re-sequence other banners
      if (originalOrder !== newOrder) {
        // Get all banners to re-calculate order
        const allBanners = await prisma.featureBanner.findMany({
          orderBy: { order: "asc" },
        });
        const bannerIds = allBanners.map((b) => b.id);

        // Remove the banner from its original position
        const itemIndex = bannerIds.indexOf(id);
        if (itemIndex > -1) {
          bannerIds.splice(itemIndex, 1);
        }

        // Insert the banner at the new position
        // Clamp the newOrder to be within valid bounds (1 to banner count)
        const effectiveNewOrder = Math.max(
          1,
          Math.min(newOrder, bannerIds.length + 1)
        );
        bannerIds.splice(effectiveNewOrder - 1, 0, id);

        // Update the order for all banners based on their new index
        for (let i = 0; i < bannerIds.length; i++) {
          await prisma.featureBanner.update({
            where: { id: bannerIds[i] },
            data: { order: i + 1 },
          });
        }
      }

      // Handle file upload
      let newImageUrl = imageUrl;
      if (file) {
        // ... (cloudinary logic remains the same)
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "tiamara-banners",
        });
        newImageUrl = uploadResult.secure_url;
        fs.unlinkSync(file.path);
      }

      // Update the banner's other details
      const updatedBanner = await prisma.featureBanner.update({
        where: { id },
        data: {
          imageUrl: newImageUrl,
          linkUrl,
          altText: altText,
          isActive: isActive === "true",
        },
      });

      // Send response after transaction is complete
      const finalBanners = await prisma.featureBanner.findMany({
        orderBy: { order: "asc" },
      });
      res.status(200).json({ success: true, banners: finalBanners });
    });
  } catch (e) {
    console.error("Error updating feature banner:", e);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ success: false, message: "Failed to update feature banner" });
    }
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

    await prisma.$transaction(async (prisma) => {
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

      // Reorder remaining banners
      const bannersToUpdate = await prisma.featureBanner.findMany({
        where: { order: { gt: bannerToDelete.order } },
        orderBy: { order: "asc" },
      });

      for (const banner of bannersToUpdate) {
        await prisma.featureBanner.update({
          where: { id: banner.id },
          data: { order: banner.order - 1 },
        });
      }
    });

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

// New function to handle drag-and-drop reordering
export const reorderBanners = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { bannerIds } = req.body;

    if (!bannerIds || !Array.isArray(bannerIds)) {
      res
        .status(400)
        .json({ success: false, message: "Invalid data provided." });
      return;
    }

    await prisma.$transaction(async (prisma) => {
      for (let i = 0; i < bannerIds.length; i++) {
        await prisma.featureBanner.update({
          where: { id: bannerIds[i] },
          data: { order: i + 1 },
        });
      }
    });

    res
      .status(200)
      .json({ success: true, message: "Banners reordered successfully." });
  } catch (e) {
    console.error("Error reordering banners:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to reorder banners." });
  }
};

// --- Homepage Section Management --- (بقیه توابع بدون تغییر باقی می‌مانند)

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
            images: { take: 1 },
            brand: true,
            category: true,
          },
        },
      },
    });

    // New logic to fetch dynamic products
    for (const section of sections) {
      if (section.type === "DISCOUNTED") {
        section.products = await prisma.product.findMany({
          where: { discount_price: { not: null } },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { images: { take: 1 }, brand: true, category: true },
        });
      } else if (section.type === "BEST_SELLING") {
        section.products = await prisma.product.findMany({
          orderBy: { soldCount: "desc" },
          take: 10,
          include: { images: { take: 1 }, brand: true, category: true },
        });
      }
    }

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
          set: productIds.map((id: string) => ({ id })),
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
