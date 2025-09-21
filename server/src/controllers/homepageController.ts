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

export const fetchBannersForAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const banners = await prisma.featureBanner.findMany({
      orderBy: [{ group: "asc" }, { order: "asc" }],
    });
    res.status(200).json({ success: true, banners });
  } catch (e) {
    console.error("Error fetching admin banners:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch banners" });
  }
};

export const fetchBannersForClient = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { group } = req.query;
    if (!group) {
      res
        .status(400)
        .json({
          success: false,
          message: "Group query parameter is required.",
        });
      return;
    }

    const now = new Date();
    const banners = await prisma.featureBanner.findMany({
      where: {
        group: group as string,
        isActive: true,
        // Add other conditions like date scheduling if needed
      },
      orderBy: { order: "asc" },
    });

    res.status(200).json({ success: true, banners });
  } catch (e) {
    console.error("Error fetching client banners:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch banners" });
  }
};

export const trackBannerClick = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.featureBanner.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });
    res.status(200).json({ success: true });
  } catch (e) {
    console.error("Error tracking banner click:", e);
    res.status(500).json({ success: false, message: "Could not track click" });
  }
};

export const addFeatureBanner = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  // This function needs to be adapted for the new features if we continue with it.
  // For now, let's focus on updating existing banners. A similar logic will apply.
  res.status(501).json({
    message: "Add banner functionality needs to be updated for new features.",
  });
};

export const updateFeatureBanner = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      linkUrl,
      altText,
      isActive,
      group,
      startDate,
      endDate,
      imageUrl,
      imageUrlMobile,
    } = req.body;

    // CORRECTED: req.files is now an object, not an array
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const desktopFile = files?.["images[desktop]"]?.[0];
    const mobileFile = files?.["images[mobile]"]?.[0];

    let newImageUrl = imageUrl;
    if (desktopFile) {
      const result = await cloudinary.uploader.upload(desktopFile.path, {
        folder: "tiamara-banners",
      });
      newImageUrl = result.secure_url;
      fs.unlinkSync(desktopFile.path);
    }

    let newImageUrlMobile = imageUrlMobile;
    if (mobileFile) {
      const result = await cloudinary.uploader.upload(mobileFile.path, {
        folder: "tiamara-banners",
      });
      newImageUrlMobile = result.secure_url;
      fs.unlinkSync(mobileFile.path);
    }

    const updatedBanner = await prisma.featureBanner.update({
      where: { id },
      data: {
        linkUrl,
        altText,
        isActive: isActive === "true",
        group,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        imageUrl: newImageUrl,
        imageUrlMobile: newImageUrlMobile,
      },
    });

    res.status(200).json({ success: true, banner: updatedBanner });
  } catch (e) {
    console.error("Error updating feature banner:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to update banner." });
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

export const deleteBannerGroup = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { groupName } = req.params;

    const bannersToDelete = await prisma.featureBanner.findMany({
      where: { group: groupName },
    });

    if (bannersToDelete.length > 0) {
      const publicIds = bannersToDelete
        .map((banner) => {
          if (banner.imageUrl) {
            return `tiamara-banners/${
              banner.imageUrl.split("/").pop()?.split(".")[0]
            }`;
          }
          return null;
        })
        .filter(Boolean) as string[];

      if (publicIds.length > 0) {
        await cloudinary.api.delete_resources(publicIds);
      }
    }

    await prisma.featureBanner.deleteMany({
      where: { group: groupName },
    });

    res.status(200).json({
      success: true,
      message: `Banner group '${groupName}' deleted successfully.`,
    });
  } catch (e) {
    console.error("Error deleting banner group:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete banner group." });
  }
};

// --- Homepage Section Management (remains unchanged) ---
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

    const brandSectionIds = sections
      .filter((s) => s.type === "BRAND" && s.brandId)
      .map((s) => s.brandId!);

    const brandProducts = await prisma.product.findMany({
      where: { brandId: { in: brandSectionIds } },
      orderBy: { createdAt: "desc" },
      include: { images: { take: 1 }, brand: true, category: true },
    });

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
