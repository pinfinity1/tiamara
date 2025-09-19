import { Response, Request } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import cloudinary from "../config/cloudinary";
import { prisma } from "../server";
import fs from "fs";
import { Prisma, SectionType } from "@prisma/client";

// --- Type Generation using Prisma GetPayload ---
const homepageSectionWithRelations =
  Prisma.validator<Prisma.HomepageSectionDefaultArgs>()({
    include: {
      products: {
        include: {
          images: { take: 1 },
          brand: true,
          category: true,
        },
      },
      brand: true,
    },
  });

type HomepageSectionWithRelations = Prisma.HomepageSectionGetPayload<
  typeof homepageSectionWithRelations
>;

// --- Banner Management ---

export const addFeatureBanner = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { linkUrl, altText, isActive, group } = req.body;
    const file = req.file as Express.Multer.File;

    if (!file) {
      res.status(400).json({ success: false, message: "No file provided" });
      return;
    }

    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: "tiamara-banners",
    });

    const lastBannerInGroup = await prisma.featureBanner.findFirst({
      where: { group: group || "default" },
      orderBy: { order: "desc" },
    });
    const newOrder = lastBannerInGroup ? lastBannerInGroup.order + 1 : 1;

    const banner = await prisma.featureBanner.create({
      data: {
        imageUrl: uploadResult.secure_url,
        linkUrl,
        altText: altText,
        order: newOrder,
        isActive: isActive ? isActive === "true" : true,
        group: group || "default",
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
    const { group } = req.query;
    const whereClause = group ? { group: group as string } : {};

    const banners = await prisma.featureBanner.findMany({
      where: whereClause,
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
    const { linkUrl, altText, order, isActive, imageUrl, group } = req.body;
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

    await prisma.$transaction(async (tx) => {
      if (originalOrder !== newOrder) {
        const allBannersInGroup = await tx.featureBanner.findMany({
          where: { group: bannerToUpdate.group },
          orderBy: { order: "asc" },
        });
        const bannerIds = allBannersInGroup.map((b) => b.id);
        const itemIndex = bannerIds.indexOf(id);
        if (itemIndex > -1) {
          bannerIds.splice(itemIndex, 1);
        }
        const effectiveNewOrder = Math.max(
          1,
          Math.min(newOrder, bannerIds.length + 1)
        );
        bannerIds.splice(effectiveNewOrder - 1, 0, id);

        // Batch update promises
        const updatePromises = bannerIds.map((bannerId, index) =>
          tx.featureBanner.update({
            where: { id: bannerId },
            data: { order: index + 1 },
          })
        );
        await Promise.all(updatePromises);
      }

      let newImageUrl = imageUrl;
      if (file) {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "tiamara-banners",
        });
        newImageUrl = uploadResult.secure_url;
        fs.unlinkSync(file.path);
      }

      await tx.featureBanner.update({
        where: { id },
        data: {
          imageUrl: newImageUrl,
          linkUrl,
          altText: altText,
          isActive: isActive === "true",
          group: group || bannerToUpdate.group,
        },
      });

      const finalBanners = await tx.featureBanner.findMany({
        where: { group: group || bannerToUpdate.group },
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

      const bannersToUpdate = await prisma.featureBanner.findMany({
        where: {
          group: bannerToDelete.group,
          order: { gt: bannerToDelete.order },
        },
        orderBy: { order: "asc" },
      });

      // Batch update promises
      const updatePromises = bannersToUpdate.map((banner) =>
        prisma.featureBanner.update({
          where: { id: banner.id },
          data: { order: banner.order - 1 },
        })
      );
      await Promise.all(updatePromises);
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

    // Batch update promises
    const updatePromises = bannerIds.map((id, index) =>
      prisma.featureBanner.update({
        where: { id },
        data: { order: index + 1 },
      })
    );

    await prisma.$transaction(updatePromises);

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

// --- Homepage Section Management ---

export const getHomepageSections = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { location } = req.query;
    const whereClause = location
      ? { location: location as string }
      : { location: "homepage" };

    const sections: HomepageSectionWithRelations[] =
      await prisma.homepageSection.findMany({
        where: whereClause,
        orderBy: { order: "asc" },
        include: {
          products: {
            include: {
              images: { take: 1 },
              brand: true,
              category: true,
            },
          },
          brand: true,
        },
      });

    // ** PERFORMANCE OPTIMIZATION **
    // Instead of querying inside a loop, we run necessary queries in parallel.
    const [discountedProducts, bestSellingProducts] = await Promise.all([
      prisma.product.findMany({
        where: { discount_price: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { images: { take: 1 }, brand: true, category: true },
      }),
      prisma.product.findMany({
        orderBy: { soldCount: "desc" },
        take: 10,
        include: { images: { take: 1 }, brand: true, category: true },
      }),
    ]);

    // Fetch products for all BRAND sections in one go
    const brandSectionIds = sections
      .filter((s) => s.type === "BRAND" && s.brandId)
      .map((s) => s.brandId!);

    const brandProducts = await prisma.product.findMany({
      where: { brandId: { in: brandSectionIds } },
      orderBy: { createdAt: "desc" },
      include: { images: { take: 1 }, brand: true, category: true },
    });

    // Map the fetched products back to their sections
    const finalSections = sections.map((section) => {
      if (section.type === "DISCOUNTED") {
        return { ...section, products: discountedProducts };
      }
      if (section.type === "BEST_SELLING") {
        return { ...section, products: bestSellingProducts };
      }
      if (section.type === "BRAND" && section.brandId) {
        return {
          ...section,
          products: brandProducts
            .filter((p) => p.brandId === section.brandId)
            .slice(0, 10),
        };
      }
      return section;
    });

    res.status(200).json({ success: true, sections: finalSections });
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
    const { title, order, type, productIds, brandId, location } = req.body as {
      title: string;
      order: string;
      type: SectionType;
      productIds: string[];
      brandId?: string;
      location?: string;
    };

    if (!title || !type) {
      res
        .status(400)
        .json({ success: false, message: "Title and type are required." });
      return;
    }

    if (type === "MANUAL" && (!productIds || !Array.isArray(productIds))) {
      res.status(400).json({
        success: false,
        message: "Product IDs are required for MANUAL sections.",
      });
      return;
    }

    if (type === "BRAND" && !brandId) {
      res.status(400).json({
        success: false,
        message: "Brand ID is required for BRAND sections.",
      });
      return;
    }

    const section = await prisma.homepageSection.create({
      data: {
        title,
        order: order ? parseInt(order) : 0,
        type,
        location: location || "homepage",
        brandId: type === "BRAND" ? brandId : null,
        products:
          type === "MANUAL"
            ? { connect: productIds.map((id: string) => ({ id })) }
            : {},
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
    const { title, order, type, productIds, brandId, location } = req.body as {
      title: string;
      order: string;
      type: SectionType;
      productIds: string[];
      brandId?: string;
      location?: string;
    };

    if (title === undefined || type === undefined) {
      res
        .status(400)
        .json({ success: false, message: "Title and type are required." });
      return;
    }

    if (type === "MANUAL" && !Array.isArray(productIds)) {
      res.status(400).json({
        success: false,
        message: "Product IDs are required for MANUAL sections.",
      });
      return;
    }

    if (type === "BRAND" && !brandId) {
      res.status(400).json({
        success: false,
        message: "Brand ID is required for BRAND sections.",
      });
      return;
    }

    const section = await prisma.homepageSection.update({
      where: { id },
      data: {
        title,
        order: order ? parseInt(order) : 0,
        type,
        location: location || "homepage",
        brandId: type === "BRAND" ? brandId : null,
        products:
          type === "MANUAL"
            ? { set: productIds.map((id: string) => ({ id })) }
            : { set: [] },
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
