import { Response, Request } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  deleteManyFromCloudinary,
} from "../config/cloudinaryService";
import { prisma } from "../server";
import fs from "fs";
import { Prisma, SectionType } from "@prisma/client";

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
      res.status(400).json({
        success: false,
        message: "Group query parameter is required.",
      });
      return;
    }

    const banners = await prisma.featureBanner.findMany({
      where: {
        group: group as string,
        isActive: true,
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
  try {
    const { group, bannersData } = req.body;
    const files = req.files as Express.Multer.File[];
    const parsedBannersData = JSON.parse(bannersData);

    if (
      !group ||
      !files ||
      files.length === 0 ||
      files.length !== parsedBannersData.length * 2
    ) {
      res.status(400).json({
        success: false,
        message: "Number of files does not match number of banners.",
      });
      return;
    }

    const lastBannerInGroup = await prisma.featureBanner.findFirst({
      where: { group },
      orderBy: { order: "desc" },
    });

    let currentOrder = lastBannerInGroup ? lastBannerInGroup.order : 0;

    // آپلود موازی تمام فایل‌ها
    const uploadPromises = files.map((file) =>
      uploadToCloudinary(file.path, "tiamara-banners")
    );
    const uploadResults = await Promise.all(uploadPromises);

    const bannerCreateOperations = parsedBannersData.map(
      (metadata: any, index: number) => {
        currentOrder++;

        // فایل‌ها به ترتیب جفتی هستند: دسکتاپ، موبایل
        const desktopImage = uploadResults[index * 2];
        const mobileImage = uploadResults[index * 2 + 1];

        return prisma.featureBanner.create({
          data: {
            group,
            imageUrl: desktopImage.url,
            imagePublicId: desktopImage.publicId,
            imageUrlMobile: mobileImage.url,
            imageMobilePublicId: mobileImage.publicId,
            linkUrl: metadata.linkUrl,
            altText: metadata.altText,
            title: metadata.title || null,
            description: metadata.description || null,
            buttonText: metadata.buttonText || null,
            textColor: metadata.textColor || "#000000",
            isActive: metadata.isActive,
            order: currentOrder,
          },
        });
      }
    );

    await prisma.$transaction(bannerCreateOperations);

    res
      .status(201)
      .json({ success: true, message: "Banners added successfully." });
  } catch (e) {
    console.error("Error adding feature banners:", e);
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      files.forEach((f) => {
        if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
      });
    }
    res.status(500).json({ success: false, message: "Failed to add banners." });
  }
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
      title,
      description,
      buttonText,
      textColor,
      isActive,
      group,
      startDate,
      endDate,
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const existingBanner = await prisma.featureBanner.findUnique({
      where: { id },
    });
    if (!existingBanner) {
      res.status(404).json({ success: false, message: "Banner not found" });
      return;
    }

    const desktopFile = files?.["images[desktop]"]?.[0];
    const mobileFile = files?.["images[mobile]"]?.[0];

    let newImageUrl = existingBanner.imageUrl;
    let newImagePublicId = existingBanner.imagePublicId;

    if (desktopFile) {
      if (existingBanner.imagePublicId) {
        await deleteFromCloudinary(existingBanner.imagePublicId);
      }
      const result = await uploadToCloudinary(
        desktopFile.path,
        "tiamara-banners"
      );
      newImageUrl = result.url;
      newImagePublicId = result.publicId;
    }

    let newImageUrlMobile = existingBanner.imageUrlMobile;
    let newImageMobilePublicId = existingBanner.imageMobilePublicId;

    if (mobileFile) {
      if (existingBanner.imageMobilePublicId) {
        await deleteFromCloudinary(existingBanner.imageMobilePublicId);
      }
      const result = await uploadToCloudinary(
        mobileFile.path,
        "tiamara-banners"
      );
      newImageUrlMobile = result.url;
      newImageMobilePublicId = result.publicId;
    }

    const updatedBanner = await prisma.featureBanner.update({
      where: { id },
      data: {
        linkUrl,
        altText,
        title,
        description,
        buttonText,
        textColor,
        isActive: isActive === "true",
        group,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        imageUrl: newImageUrl,
        imagePublicId: newImagePublicId,
        imageUrlMobile: newImageUrlMobile,
        imageMobilePublicId: newImageMobilePublicId,
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

    if (bannerToDelete.imagePublicId) {
      await deleteFromCloudinary(bannerToDelete.imagePublicId);
    }
    if (bannerToDelete.imageMobilePublicId) {
      await deleteFromCloudinary(bannerToDelete.imageMobilePublicId);
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
    await prisma.$transaction(updatePromises);

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

    const publicIdsToDelete: string[] = [];
    bannersToDelete.forEach((banner) => {
      if (banner.imagePublicId) publicIdsToDelete.push(banner.imagePublicId);
      if (banner.imageMobilePublicId)
        publicIdsToDelete.push(banner.imageMobilePublicId);
    });

    if (publicIdsToDelete.length > 0) {
      await deleteManyFromCloudinary(publicIdsToDelete);
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

// --- Product Collection Management ---

export const getProductCollections = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { location } = req.query;
    const whereClause = location ? { location: location as string } : {};

    const collections = await prisma.productCollection.findMany({
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
        where: { discount_price: { not: null }, isArchived: false },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { images: { take: 1 }, brand: true, category: true },
      }),
      prisma.product.findMany({
        where: { isArchived: false },
        orderBy: { soldCount: "desc" },
        take: 10,
        include: { images: { take: 1 }, brand: true, category: true },
      }),
    ]);

    const brandCollectionIds = collections
      .filter((s) => s.type === "BRAND" && s.brandId)
      .map((s) => s.brandId!);

    let brandProducts: any[] = [];
    if (brandCollectionIds.length > 0) {
      brandProducts = await prisma.product.findMany({
        where: { brandId: { in: brandCollectionIds }, isArchived: false },
        orderBy: { createdAt: "desc" },
        include: { images: { take: 1 }, brand: true, category: true },
      });
    }

    const finalCollections = collections.map((collection) => {
      if (collection.type === SectionType.DISCOUNTED) {
        return { ...collection, products: discountedProducts };
      }
      if (collection.type === SectionType.BEST_SELLING) {
        return { ...collection, products: bestSellingProducts };
      }
      if (collection.type === SectionType.BRAND && collection.brandId) {
        return {
          ...collection,
          products: brandProducts
            .filter((p) => p.brandId === collection.brandId)
            .slice(0, 10),
        };
      }
      return collection;
    });

    res.status(200).json({ success: true, collections: finalCollections });
  } catch (error) {
    console.error("Error fetching product collections:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch product collections.",
      });
  }
};

export const fetchCollectionByType = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { type } = req.query;

    if (!type || typeof type !== "string") {
      res.status(400).json({
        success: false,
        message: "Type query parameter is required and must be a string.",
      });
      return;
    }

    const collectionType = type as SectionType;

    const collection = await prisma.productCollection.findFirst({
      where: {
        type: collectionType,
      },
      include: {
        brand: true,
        products: {
          include: {
            images: { take: 1 },
            brand: true,
            category: true,
          },
        },
      },
    });

    if (!collection) {
      res.status(200).json({ success: true, collection: null });
      return;
    }

    if (collection.type === SectionType.DISCOUNTED) {
      const discountedProducts = await prisma.product.findMany({
        where: { discount_price: { not: null }, isArchived: false },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { images: { take: 1 }, brand: true, category: true },
      });
      res.status(200).json({
        success: true,
        collection: { ...collection, products: discountedProducts },
      });
    } else if (collection.type === SectionType.BEST_SELLING) {
      const bestSellingProducts = await prisma.product.findMany({
        where: { isArchived: false },
        orderBy: { soldCount: "desc" },
        take: 10,
        include: { images: { take: 1 }, brand: true, category: true },
      });
      res.status(200).json({
        success: true,
        collection: { ...collection, products: bestSellingProducts },
      });
    } else if (collection.type === SectionType.BRAND && collection.brandId) {
      const brandProducts = await prisma.product.findMany({
        where: { brandId: collection.brandId, isArchived: false },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { images: { take: 1 }, brand: true, category: true },
      });
      res.status(200).json({
        success: true,
        collection: { ...collection, products: brandProducts },
      });
    } else {
      res.status(200).json({ success: true, collection: collection });
    }
  } catch (error) {
    console.error("Error fetching product collection by type:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch product collection." });
  }
};

export const createProductCollection = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, type, productIds, brandId, location, expiresAt } = req.body;
    const file = req.file;

    let imageUrl = undefined;
    let imagePublicId = undefined;

    if (file) {
      const upload = await uploadToCloudinary(file.path, "tiamara-collections");
      imageUrl = upload.url;
      imagePublicId = upload.publicId;
    }

    const collection = await prisma.productCollection.create({
      data: {
        title,
        type: type as SectionType,
        location: location || "homepage",
        brandId: type === "BRAND" ? brandId : null,
        imageUrl,
        imagePublicId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        products:
          type === "MANUAL" && productIds
            ? {
                connect: (Array.isArray(productIds)
                  ? productIds
                  : [productIds]
                ).map((id: string) => ({ id })),
              }
            : {},
      },
    });

    res.status(201).json({ success: true, collection });
  } catch (error) {
    console.error("Error creating product collection:", error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create product collection.",
      });
  }
};

export const updateProductCollection = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, type, productIds, brandId, location, expiresAt } = req.body;
    const file = req.file;

    const existingCollection = await prisma.productCollection.findUnique({
      where: { id },
    });

    if (!existingCollection) {
      res.status(404).json({ success: false, message: "Collection not found" });
      return;
    }

    let imageUrl = existingCollection.imageUrl;
    let imagePublicId = existingCollection.imagePublicId;

    if (file) {
      if (existingCollection.imagePublicId) {
        await deleteFromCloudinary(existingCollection.imagePublicId);
      }
      const upload = await uploadToCloudinary(file.path, "tiamara-collections");
      imageUrl = upload.url;
      imagePublicId = upload.publicId;
    }

    const collection = await prisma.productCollection.update({
      where: { id },
      data: {
        title,
        type,
        location,
        imageUrl,
        imagePublicId,
        brandId: type === "BRAND" ? brandId : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        products:
          type === "MANUAL"
            ? {
                set: (Array.isArray(productIds)
                  ? productIds
                  : productIds
                  ? [productIds]
                  : []
                ).map((id: string) => ({ id })),
              }
            : { set: [] },
      },
    });

    res.status(200).json({ success: true, collection });
  } catch (error) {
    console.error("Error updating product collection:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to update product collection.",
      });
  }
};

export const deleteProductCollection = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const collectionToDelete = await prisma.productCollection.findUnique({
      where: { id },
    });

    if (collectionToDelete?.imagePublicId) {
      await deleteFromCloudinary(collectionToDelete.imagePublicId);
    }

    await prisma.productCollection.delete({ where: { id } });
    res
      .status(200)
      .json({ success: true, message: "Collection deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to delete product collection.",
      });
  }
};

export const reorderProductCollections = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { collectionIds } = req.body;

    if (!collectionIds || !Array.isArray(collectionIds)) {
      res
        .status(400)
        .json({ success: false, message: "Invalid data provided." });
      return;
    }

    const updatePromises = collectionIds.map((id, index) =>
      prisma.productCollection.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updatePromises);

    res
      .status(200)
      .json({ success: true, message: "Collections reordered successfully." });
  } catch (e) {
    console.error("Error reordering collections:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to reorder collections." });
  }
};

// --- Video Showcase ---

export const addVideoShowcaseItem = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { productId, order } = req.body;
    const file = req.file;

    if (!productId || !file) {
      res
        .status(400)
        .json({
          success: false,
          message: "Product ID and video file required.",
        });
      return;
    }

    // آپلود ویدیو با تایپ صحیح
    const upload = await uploadToCloudinary(
      file.path,
      "tiamara-videos",
      "video"
    );

    const newItemData = await prisma.videoShowcaseItem.create({
      data: {
        productId,
        videoUrl: upload.url,
        videoPublicId: upload.publicId,
        order: Number(order) || 0,
      },
    });

    const newItem = await prisma.videoShowcaseItem.findUnique({
      where: { id: newItemData.id },
      include: { product: { include: { images: { take: 1 } } } },
    });

    res.status(201).json({ success: true, item: newItem });
  } catch (error) {
    console.error("Error adding video showcase item:", error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res
      .status(500)
      .json({ success: false, message: "Failed to add showcase item." });
  }
};

export const deleteVideoShowcaseItem = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const itemToDelete = await prisma.videoShowcaseItem.findUnique({
      where: { id },
    });

    if (itemToDelete?.videoPublicId) {
      // حذف ویدیو از کلاودینری
      await deleteFromCloudinary(itemToDelete.videoPublicId, "video");
    }

    await prisma.videoShowcaseItem.delete({ where: { id } });
    res
      .status(200)
      .json({ success: true, message: "Showcase item deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete showcase item." });
  }
};

export const getVideoShowcaseItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const items = await prisma.videoShowcaseItem.findMany({
      orderBy: { order: "asc" },
      include: {
        product: {
          include: {
            images: true,
            brand: true,
          },
        },
      },
    });
    res.status(200).json({ success: true, items });
  } catch (error) {
    console.error("Error fetching video showcase items:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch showcase items." });
  }
};
