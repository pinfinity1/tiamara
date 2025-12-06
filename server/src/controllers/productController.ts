import { Response, Request } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import {
  uploadToCloudinary,
  deleteManyFromCloudinary,
} from "../config/cloudinaryService";
import { prisma } from "../server";
import { Prisma } from "@prisma/client";
import * as xlsx from "xlsx";
import fs from "fs";
import { cleanText, generateVariations } from "../utils/searchUtils";
import { scrapeDataFromUrl } from "../utils/crawlerService";

// --- Helper Functions ---

const logStockChange = async (
  productId: string,
  change: number,
  newStock: number,
  type: "INITIAL" | "SALE" | "RETURN" | "PURCHASE" | "ADJUSTMENT" | "DAMAGE",
  userId: string | null,
  notes?: string
) => {
  if (change !== 0) {
    await prisma.stockHistory.create({
      data: {
        productId,
        change,
        newStock,
        type,
        notes: notes || `${type} action`,
        userId: userId || undefined,
      },
    });
  }
};

const generateSlug = (name: string) => {
  return name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

const parseQueryParamToArray = (param: any): string[] => {
  if (!param) return [];
  if (Array.isArray(param)) {
    return param.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof param === "string") {
    return param
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

// --- Controllers ---

export const getProductFilters = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const [
      brands,
      categories,
      priceAggregation,
      skinTypesRaw,
      concernsRaw,
      productFormsRaw,
    ] = await prisma.$transaction([
      prisma.brand.findMany({
        where: { isArchived: false },
        orderBy: { name: "asc" },
      }),
      prisma.category.findMany({
        where: { isArchived: false },
        orderBy: { name: "asc" },
      }),
      prisma.product.aggregate({
        _max: { price: true },
        _min: { price: true },
        where: { isArchived: false, stock: { gt: 0 } },
      }),
      prisma.$queryRaw`SELECT DISTINCT unnest(skin_type) as value FROM "Product" WHERE cardinality(skin_type) > 0`,
      prisma.$queryRaw`SELECT DISTINCT unnest(concern) as value FROM "Product" WHERE cardinality(concern) > 0`,
      prisma.product.findMany({
        select: { product_form: true },
        where: { product_form: { not: null }, isArchived: false },
        distinct: ["product_form"],
      }),
    ]);

    const dbMinPrice = priceAggregation._min.price;
    const dbMaxPrice = priceAggregation._max.price;

    res.status(200).json({
      success: true,
      filters: {
        brands,
        categories,
        priceRange: {
          min: dbMinPrice !== null ? dbMinPrice : 0,
          max: dbMaxPrice !== null ? dbMaxPrice : 0,
        },
        skinTypes: (skinTypesRaw as any[])
          .map((i) => i.value)
          .filter(Boolean)
          .sort(),
        concerns: (concernsRaw as any[])
          .map((i) => i.value)
          .filter(Boolean)
          .sort(),
        productForms: productFormsRaw
          .map((i) => i.product_form)
          .filter(Boolean)
          .sort(),
      },
    });
  } catch (error) {
    console.error("Error fetching product filters:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch filters." });
  }
};

export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const {
      name,
      englishName,
      brandId,
      categoryId,
      description,
      how_to_use,
      caution,
      price,
      discount_price,
      stock,
      sku,
      barcode,
      volume,
      unit,
      expiry_date,
      manufacture_date,
      country_of_origin,
      skin_type,
      concern,
      product_form,
      ingredients,
      tags,
      metaTitle,
      metaDescription,
    } = req.body;

    const files = req.files as Express.Multer.File[];
    const imageCreateData = [];

    // آپلود تصاویر با استفاده از سرویس مرکزی
    if (files && files.length > 0) {
      for (const file of files) {
        const upload = await uploadToCloudinary(file.path, "tiamara_products");
        imageCreateData.push({
          url: upload.url,
          publicId: upload.publicId, // ذخیره شناسه برای مدیریت بعدی
          altText: name,
        });
      }
    }

    let slugBase = englishName || name;
    let generatedSlug = generateSlug(slugBase);

    const existingSlug = await prisma.product.findUnique({
      where: { slug: generatedSlug },
    });
    if (existingSlug) {
      generatedSlug = `${generatedSlug}-${Math.floor(Math.random() * 1000)}`;
    }

    const stockAmount = parseInt(stock);

    const newlyCreatedProduct = await prisma.product.create({
      data: {
        name,
        englishName,
        slug: generatedSlug,
        brandId,
        categoryId,
        description,
        how_to_use,
        caution,
        price: parseFloat(price),
        discount_price: discount_price ? parseFloat(discount_price) : null,
        stock: stockAmount,
        sku: sku || null,
        barcode: barcode || null,
        volume: volume ? parseFloat(volume) : null,
        unit,
        expiry_date: expiry_date ? new Date(expiry_date) : null,
        manufacture_date: manufacture_date ? new Date(manufacture_date) : null,
        country_of_origin,
        skin_type: typeof skin_type === "string" ? skin_type.split(",") : [],
        concern: typeof concern === "string" ? concern.split(",") : [],
        product_form,
        ingredients:
          typeof ingredients === "string" ? ingredients.split(",") : [],
        tags: typeof tags === "string" ? tags.split(",") : [],
        metaTitle: metaTitle || name,
        metaDescription,
        isArchived: false,
        images: {
          create: imageCreateData,
        },
      },
      include: { images: true },
    });

    if (stockAmount > 0) {
      await logStockChange(
        newlyCreatedProduct.id,
        stockAmount,
        stockAmount,
        "INITIAL",
        userId || null,
        "Initial stock set on product creation"
      );
    }

    res.status(201).json(newlyCreatedProduct);
  } catch (e) {
    console.error("Error creating product:", e);
    // پاکسازی فایل‌های موقت در صورت بروز خطا
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      files.forEach((f) => {
        if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
      });
    }
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const {
      name,
      englishName,
      slug,
      brandId,
      categoryId,
      description,
      how_to_use,
      caution,
      price,
      discount_price,
      stock,
      sku,
      barcode,
      volume,
      unit,
      expiry_date,
      manufacture_date,
      country_of_origin,
      skin_type,
      concern,
      product_form,
      ingredients,
      tags,
      metaTitle,
      metaDescription,
      imagesToDelete,
      isArchived,
    } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existingProduct) {
      res.status(404).json({ success: false, message: "Product not found!" });
      return;
    }

    // 1. مدیریت حذف تصاویر
    if (imagesToDelete) {
      const idsToDelete = (imagesToDelete as string).split(",").filter(Boolean);

      if (idsToDelete.length > 0) {
        const imagesToDeleteInfo = await prisma.image.findMany({
          where: { id: { in: idsToDelete }, productId: id },
        });

        const publicIds = imagesToDeleteInfo
          .map((img) => img.publicId)
          .filter(Boolean);

        if (publicIds.length > 0) {
          await deleteManyFromCloudinary(publicIds);
        }

        await prisma.image.deleteMany({
          where: { id: { in: idsToDelete } },
        });
      }
    }

    // 2. آپلود تصاویر جدید
    const files = req.files as Express.Multer.File[];
    const newImagesCreateData = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const upload = await uploadToCloudinary(file.path, "tiamara_products");
        newImagesCreateData.push({
          url: upload.url,
          publicId: upload.publicId,
          altText: name,
        });
      }
    }

    let finalSlug = slug;
    if (!finalSlug || finalSlug === existingProduct.slug) {
      if (englishName && englishName !== existingProduct.englishName) {
        finalSlug = generateSlug(englishName);
      } else if (
        !existingProduct.englishName &&
        name !== existingProduct.name
      ) {
        finalSlug = generateSlug(name);
      }
    }

    const newStockAmount = parseInt(stock);

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        englishName,
        slug: finalSlug || generateSlug(englishName || name),
        brandId,
        categoryId,
        description,
        how_to_use,
        caution,
        price: parseFloat(price),
        discount_price: discount_price ? parseFloat(discount_price) : null,
        stock: newStockAmount,
        sku: sku || null,
        barcode: barcode || null,
        volume: volume ? parseFloat(volume) : null,
        unit,
        expiry_date: expiry_date ? new Date(expiry_date) : null,
        manufacture_date: manufacture_date ? new Date(manufacture_date) : null,
        country_of_origin,
        skin_type: typeof skin_type === "string" ? skin_type.split(",") : [],
        concern: typeof concern === "string" ? concern.split(",") : [],
        product_form,
        ingredients:
          typeof ingredients === "string" ? ingredients.split(",") : [],
        tags: typeof tags === "string" ? tags.split(",") : [],
        metaTitle: metaTitle || name,
        metaDescription,

        images:
          newImagesCreateData.length > 0
            ? { create: newImagesCreateData }
            : undefined,
        isArchived:
          isArchived === "false"
            ? false
            : isArchived === "true"
            ? true
            : existingProduct.isArchived,
      },
      include: { images: true },
    });

    const stockChange = newStockAmount - existingProduct.stock;
    if (stockChange !== 0) {
      await logStockChange(
        id,
        stockChange,
        newStockAmount,
        "ADJUSTMENT",
        userId || null,
        "Stock updated by admin"
      );
    }

    res.status(200).json(product);
  } catch (e) {
    console.error("Error updating product:", e);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    // آبجکت تغییرات را می‌سازیم
    const updateData: any = {
      isArchived: true,
      stock: 0,
    };

    // فقط اگر SKU وجود داشت (نال نبود) آن را تغییر بده
    if (product.sku) {
      updateData.sku = `${product.sku}-DELETED-${Date.now()}`;
    }

    // فقط اگر Slug وجود داشت آن را تغییر بده
    if (product.slug) {
      updateData.slug = `${product.slug}-deleted-${Date.now()}`;
    }

    await prisma.product.update({
      where: { id },
      data: updateData,
    });

    await prisma.cartItem.deleteMany({ where: { productId: id } });
    await prisma.wishlistItem.deleteMany({ where: { productId: id } });

    res
      .status(200)
      .json({ success: true, message: "Product archived successfully" });
  } catch (e) {
    console.error("Error archiving product:", e);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

// بازیابی محصول آرشیو شده (Undo Delete)
export const restoreProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product || !product.isArchived) {
      res.status(400).json({
        success: false,
        message: "Product is not archived or not found.",
      });
      return;
    }

    // ✅ اصلاح باگ: اطمینان از اینکه sku و slug وجود دارند
    if (!product.sku || !product.slug) {
      res.status(500).json({
        success: false,
        message: "Product data is corrupted (Missing SKU/Slug).",
      });
      return;
    }

    // بازگرداندن SKU و Slug به حالت اصلی
    const originalSku = product.sku.split("-DELETED-")[0];
    const originalSlug = product.slug.split("-deleted-")[0];

    // چک تداخل (آیا در این مدت محصولی با نام قبلی ساخته شده؟)
    const conflictCheck = await prisma.product.findUnique({
      where: { sku: originalSku },
    });

    if (conflictCheck) {
      res.status(409).json({
        success: false,
        message:
          "Cannot restore: A new product with this SKU already exists. Please rename one of them.",
      });
      return;
    }

    await prisma.product.update({
      where: { id },
      data: {
        isArchived: false,
        sku: originalSku, // الان مطمئنیم که string است
        slug: originalSlug, // الان مطمئنیم که string است
      },
    });

    res
      .status(200)
      .json({ success: true, message: "Product restored successfully." });
  } catch (e) {
    console.error("Error restoring product:", e);
    res
      .status(500)
      .json({ success: false, message: "Failed to restore product." });
  }
};

// حذف کامل و دائمی محصول (Hard Delete)
export const hardDeleteProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    // ۱. حذف عکس‌ها از Cloudinary (برای اینکه فضای ابری آزاد شود)
    const publicIds = product.images.map((img) => img.publicId).filter(Boolean);
    if (publicIds.length > 0) {
      await deleteManyFromCloudinary(publicIds);
    }

    // ۲. حذف از دیتابیس
    // به خاطر Cascade Delete در اسکیما، عکس‌ها و ردیف‌های وابسته خودکار پاک می‌شوند
    // اما برای اطمینان بیشتر، وابستگی‌های حساس را دستی پاک می‌کنیم
    await prisma.cartItem.deleteMany({ where: { productId: id } });
    await prisma.wishlistItem.deleteMany({ where: { productId: id } });

    // نکته: اگر محصول در سفارشات (OrderItems) باشد، این دستور ممکن است ارور بدهد.
    // در سیستم‌های واقعی، معمولاً اجازه حذف محصولی که فروخته شده را نمی‌دهند.
    // اما چون این یک درخواست "اجباری" است، فرض می‌کنیم ادمین می‌داند چه می‌کند.

    await prisma.product.delete({ where: { id } });

    res
      .status(200)
      .json({ success: true, message: "Product permanently deleted." });
  } catch (e) {
    console.error("Error hard deleting product:", e);
    // ارور معمولاً مربوط به Foreign Key Constraint (سفارشات) است
    res.status(500).json({
      success: false,
      message: "Failed to delete. Product might be in user orders.",
    });
  }
};

export const fetchAllProductsForAdmin = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const fetchAllProducts = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: { images: true, brand: true, category: true },
    });
    res.status(200).json(fetchAllProducts);
  } catch (e) {
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

export const getAdminProductsPaginated = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const brandId = req.query.brandId as string;
    const categoryId = req.query.categoryId as string;
    const sort = (req.query.sort as string) || "createdAt";
    const order = (req.query.order as "asc" | "desc") || "desc";
    const stockStatus = req.query.stockStatus as string;

    const isArchived = req.query.isArchived === "true";

    const where: Prisma.ProductWhereInput = {
      isArchived: isArchived,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { englishName: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { barcode: { contains: search, mode: "insensitive" } },
      ];
    }

    if (brandId && brandId !== "all") where.brandId = brandId;
    if (categoryId && categoryId !== "all") where.categoryId = categoryId;

    if (stockStatus) {
      if (stockStatus === "out") where.stock = 0;
      else if (stockStatus === "low") where.stock = { gt: 0, lte: 10 };
      else if (stockStatus === "in") where.stock = { gt: 10 };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: order },
        include: { images: { take: 1 }, brand: true, category: true },
      }),
      prisma.product.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      products,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (e) {
    console.error("Error fetching admin products:", e);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getProductBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { images: true, brand: true, category: true },
    });

    if (!product || product.isArchived) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.status(200).json(product);
  } catch (e) {
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

export const getProductByID = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true, brand: true, category: true },
    });

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.status(200).json(product);
  } catch (e) {
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

export const getProductsByIds = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      res.status(400).json({ success: false, message: "No IDs provided" });
      return;
    }
    const products = await prisma.product.findMany({
      where: { id: { in: ids }, isArchived: false },
      include: { images: { take: 1 }, brand: true },
    });
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getProductsForClient = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const rawSearch = req.query.search as string;

    const categories = parseQueryParamToArray(req.query.categories);
    const brands = parseQueryParamToArray(req.query.brands);
    const skin_types = parseQueryParamToArray(req.query.skin_types);
    const concerns = parseQueryParamToArray(req.query.concerns);

    const minPrice = parseFloat(req.query.minPrice as string) || 0;
    const maxPrice =
      parseFloat(req.query.maxPrice as string) || Number.MAX_SAFE_INTEGER;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";
    const hasDiscount = req.query.hasDiscount === "true";
    const profileBasedFilter = req.query.profileBasedFilter === "true";
    const onlyInStock = req.query.inStock === "true";

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isArchived: false,
      price: { gte: minPrice, lte: maxPrice },
    };

    if (onlyInStock) {
      where.stock = { gt: 0 };
    }

    if (hasDiscount) {
      where.discount_price = { not: null };
    }

    if (rawSearch && rawSearch.trim().length > 0) {
      const cleanedQuery = cleanText(rawSearch);
      const words = cleanedQuery.split(/\s+/).filter((w) => w.length > 0);

      if (words.length > 0) {
        const searchConditions = words.map((word) => {
          const variations = generateVariations(word);
          return {
            OR: variations.flatMap((v) => [
              { name: { contains: v, mode: "insensitive" } },
              { englishName: { contains: v, mode: "insensitive" } },
              { description: { contains: v, mode: "insensitive" } },
              { brand: { name: { contains: v, mode: "insensitive" } } },
              { category: { name: { contains: v, mode: "insensitive" } } },
            ]),
          };
        }) as Prisma.ProductWhereInput[];
        where.AND = searchConditions;
      }
    }

    const additionalAndFilters: Prisma.ProductWhereInput[] = [];

    if (categories.length > 0) {
      additionalAndFilters.push({
        category: { name: { in: categories, mode: "insensitive" } },
      });
    }
    if (brands.length > 0) {
      additionalAndFilters.push({
        brand: { name: { in: brands, mode: "insensitive" } },
      });
    }

    if (profileBasedFilter) {
      const user = (req as AuthenticatedRequest).user;
      if (user) {
        const userProfile = await prisma.user.findUnique({
          where: { id: user.userId },
          select: { skinType: true, skinConcerns: true, knownAllergies: true },
        });

        if (userProfile?.skinType) {
          additionalAndFilters.push({
            skin_type: { has: userProfile.skinType },
          });
          if (userProfile.knownAllergies.length > 0) {
            additionalAndFilters.push({
              NOT: { ingredients: { hasSome: userProfile.knownAllergies } },
            });
          }
        }
      }
    } else {
      if (skin_types.length > 0)
        additionalAndFilters.push({ skin_type: { hasSome: skin_types } });
      if (concerns.length > 0)
        additionalAndFilters.push({ concern: { hasSome: concerns } });
    }

    if (additionalAndFilters.length > 0) {
      if (where.AND && Array.isArray(where.AND)) {
        (where.AND as Prisma.ProductWhereInput[]).push(...additionalAndFilters);
      } else {
        where.AND = additionalAndFilters;
      }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ [sortBy]: sortOrder }],
        select: {
          id: true,
          name: true,
          englishName: true,
          slug: true,
          price: true,
          discount_price: true,
          stock: true,
          images: { take: 1, select: { url: true, altText: true } },
          brand: { select: { name: true } },
          average_rating: true,
          review_count: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    const sortedProducts = products.sort((a, b) => {
      const aStock = a.stock > 0 ? 1 : 0;
      const bStock = b.stock > 0 ? 1 : 0;
      if (aStock !== bStock) return bStock - aStock;
      return 0;
    });

    res.status(200).json({
      success: true,
      products: sortedProducts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (error) {
    console.error("Error fetching client products:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const bulkCreateProductsFromExcel = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.file) {
    res
      .status(400)
      .json({ success: false, message: "No Excel file provided." });
    return;
  }
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const productsData: any[] = xlsx.utils.sheet_to_json(sheet);

    const report = {
      createdCount: 0,
      updatedCount: 0,
      failedCount: 0,
      errors: [] as any[],
    };

    for (const row of productsData) {
      try {
        const {
          name,
          englishName,
          sku,
          price,
          stock,
          brandName,
          categoryName,
          description,
          how_to_use,
          caution,
          ingredients,
          discount_price,
          volume,
          unit,
          country_of_origin,
          product_form,
          metaTitle,
          metaDescription,
        } = row;

        if (
          !name ||
          !sku ||
          !price ||
          stock === undefined ||
          !brandName ||
          !categoryName
        ) {
          throw new Error("Missing required fields.");
        }

        const brand = await prisma.brand.findFirst({
          where: { OR: [{ name: brandName }, { englishName: brandName }] },
        });
        if (!brand) throw new Error(`Brand '${brandName}' not found.`);

        const category = await prisma.category.findFirst({
          where: {
            OR: [{ name: categoryName }, { englishName: categoryName }],
          },
        });
        if (!category) throw new Error(`Category '${categoryName}' not found.`);

        let ingredientsArray: string[] = [];
        if (typeof ingredients === "string") {
          ingredientsArray = ingredients
            .split(/,|،/)
            .map((s: string) => s.trim())
            .filter(Boolean);
        }

        const productData = {
          name,
          englishName,
          slug:
            (englishName || name).toLowerCase().replace(/\s+/g, "-") +
            "-" +
            sku.toLowerCase(),
          description: description || null,
          how_to_use: how_to_use || null,
          caution: caution || null,
          ingredients: ingredientsArray,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
          sku,
          brandId: brand.id,
          categoryId: category.id,
          discount_price: discount_price ? parseFloat(discount_price) : null,
          volume: volume ? parseFloat(volume) : null,
          unit: unit || null,
          country_of_origin: country_of_origin || null,
          product_form: product_form || null,
          metaTitle: metaTitle || name,
          metaDescription: metaDescription || null,
          isArchived: false,
        };

        const existingProduct = await prisma.product.findUnique({
          where: { sku },
        });

        if (existingProduct) {
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: productData,
          });
          report.updatedCount++;
        } else {
          await prisma.product.create({ data: productData });
          report.createdCount++;
        }
      } catch (e: any) {
        report.failedCount++;
        report.errors.push({ sku: row.sku, name: row.name, error: e.message });
      }
    }
    res.status(201).json({
      success: true,
      message: "Product import finished.",
      data: report,
    });
  } catch (e) {
    res
      .status(500)
      .json({ success: false, message: "Failed to process Excel file." });
  } finally {
    if (req.file) fs.unlinkSync(req.file.path);
  }
};

export const prepareProductFromUrl = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { url } = req.body;

  if (!url) {
    res.status(400).json({ success: false, message: "URL is required." });
    return;
  }

  try {
    const scrapedData = await scrapeDataFromUrl(url);

    const [existingBrands, existingCategories] = await prisma.$transaction([
      prisma.brand.findMany({ select: { name: true, englishName: true } }),
      prisma.category.findMany({ select: { name: true, englishName: true } }),
    ]);

    const brandList = existingBrands
      .map((b) => b.englishName || b.name)
      .filter(Boolean)
      .join(", ");

    const categoryList = existingCategories
      .map((c) => c.name)
      .filter(Boolean)
      .join(", ");

    const aiPrompt = `
You are the Senior Content Strategist for "Tiamara", a premier beauty e-commerce platform.
Your task is to transform raw product data into a **Masterpiece Product Entry** in Persian (Farsi).

**PRODUCT TITLE:** "${scrapedData.title}"

**SOURCE DATA:**
"""
${scrapedData.rawText}
"""

**🚨 STRICT GUIDELINES:**
1.  **Persona:** Write like a beauty expert—knowledgeable, empathetic, and trustworthy. Avoid robotic translations.
2.  **Accuracy:** NO HALLUCINATIONS. If specific details (like volume) are missing in the text, leave them as null or 0. Do not guess.
3.  **Description Formatting (HTML):** - Start with a **Hook** (emotional benefit).
    - Use **<p>** tags for paragraphs.
    - MUST include a **<ul>** list with **<li>** items for "Key Benefits" (ویژگی‌های کلیدی).
    - Use **<strong>** to highlight ingredients or key claims.
    - Mention **Texture** (بافت) and **Scent** (رایحه) if available in the source.
4.  **SKU Generation:** Create a meaningful SKU based on Brand + Product Name (e.g., BRAND-PRODUCT-VOL).
5.  **Tags:** Generate 5-8 high-traffic Persian search tags.

**REQUIRED JSON OUTPUT (Flat Object):**
{
  "name": "Persian Name + English Brand (e.g., اسنس حلزون 96 کوزارکس COSRX)",
  "englishName": "Exact English Name",
  "brandName": "Select from the provided list (e.g. ${
    existingBrands[0]?.englishName || "Brand"
  })",
  "categoryName": "Select from the provided list (e.g. ${
    existingCategories[0]?.name || "Category"
  })",
  "description": "HTML string: Intro paragraph + <ul><li>Benefit 1</li><li>Benefit 2</li></ul> + Conclusion/Texture description.",
  "how_to_use": "Clear, step-by-step instructions in Persian.",
  "caution": "Safety warnings (e.g., patch test recommended).",
  "ingredients": ["Ingredient 1", "Ingredient 2", "Key Active Ingredient"],
  "skin_type": ["Select from: چرب, خشک, مختلط, نرمال, حساس"],
  "concern": ["Select from: آکنه و جوش, لک و تیرگی, چروک و پیری, منافذ باز, خشکی, التهاب"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "price": 0,
  "stock": 10,
  "sku": "SUGGESTED-SMART-SKU (e.g. CSX-SNAIL-100)",
  "volume": 0,
  "unit": "ml",
  "country_of_origin": "Manufacturing Country (e.g. South Korea)",
  "product_form": "Type (e.g. سرم, کرم, تونر, فوم)",
  "metaTitle": "Click-worthy SEO Title (max 60 chars)",
  "metaDescription": "Compelling SEO Description (max 160 chars)"
}
`;

    res.status(200).json({
      success: true,
      data: {
        images: scrapedData.images,
        prompt: aiPrompt,
      },
    });
  } catch (error) {
    console.error("Preparation Error:", error);
    res
      .status(500)
      .json({ success: false, message: "خطا در آماده‌سازی اطلاعات." });
  }
};

export const createProductFromExternalJson = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const data = req.body;

    if (!data.name || data.price === undefined || data.price === null) {
      res
        .status(400)
        .json({ success: false, message: "اطلاعات محصول ناقص است." });
      return;
    }

    // ۱. مدیریت SKU (اگر نبود بسازیم)
    let finalSku = data.sku;
    if (!finalSku) {
      finalSku = `GEN-SKU-${Math.floor(Math.random() * 100000)}`;
    }

    // ۲. چک کردن محصول تکراری (بر اساس SKU)
    const existingProduct = await prisma.product.findUnique({
      where: { sku: finalSku },
      include: { images: true }, // عکس‌های قبلی را می‌گیریم که اگر خواستیم اضافه کنیم
    });

    // ۳. مدیریت تصاویر (مشترک برای آپدیت و ساخت)
    const imageCreateData = [];
    if (data.selectedImages && Array.isArray(data.selectedImages)) {
      for (const imgUrl of data.selectedImages) {
        try {
          const upload = await uploadToCloudinary(imgUrl, "tiamara_products");
          imageCreateData.push({
            url: upload.url,
            publicId: upload.publicId,
            altText: data.name,
          });
        } catch (err) {
          console.error(err);
        }
      }
    }

    // ۴. یافتن برند و دسته (مشترک)
    let brandId = null;
    if (data.brandName) {
      const brandNameClean = data.brandName.trim();
      const brand = await prisma.brand.findFirst({
        where: {
          OR: [
            { name: { equals: brandNameClean, mode: "insensitive" } },
            { englishName: { equals: brandNameClean, mode: "insensitive" } },
          ],
        },
      });
      if (brand) brandId = brand.id;
    }

    let categoryId = null;
    if (data.categoryName) {
      const catNameClean = data.categoryName.trim();
      const category = await prisma.category.findFirst({
        where: {
          OR: [
            { name: { equals: catNameClean, mode: "insensitive" } },
            { englishName: { equals: catNameClean, mode: "insensitive" } },
          ],
        },
      });
      if (category) categoryId = category.id;
    }

    // ۵. انشعاب منطق: آپدیت یا ساخت
    let resultProduct;
    const newStock = parseInt(data.stock) || 0;

    if (existingProduct) {
      // --- سناریو آپدیت (موجود کردن مجدد) ---

      // محاسبه موجودی جدید (موجودی قبلی + موجودی جدید)
      // اگر می‌خواهید فقط جایگزین شود، خط زیر را عوض کنید به: const finalStock = newStock;
      const finalStock = existingProduct.stock + newStock;

      resultProduct = await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          // اطلاعات متنی را آپدیت می‌کنیم (شاید توضیحات بهتر شده باشد)
          name: data.name,
          englishName: data.englishName,
          description: data.description,
          price: parseFloat(data.price),
          discount_price: data.discount_price
            ? parseFloat(data.discount_price)
            : null,
          stock: finalStock, // موجودی جمع شده
          isArchived: false, // اگر آرشیو بود، فعالش کن

          // سایر فیلدها
          brandId: brandId || existingProduct.brandId,
          categoryId: categoryId || existingProduct.categoryId,
          how_to_use: data.how_to_use,
          caution: data.caution,
          volume: data.volume
            ? parseFloat(data.volume)
            : existingProduct.volume,
          skin_type: data.skin_type || existingProduct.skin_type,
          concern: data.concern || existingProduct.concern,
          ingredients: data.ingredients || existingProduct.ingredients,

          // عکس‌های جدید را به لیست عکس‌های قبلی اضافه کن
          images: {
            create: imageCreateData,
          },
        },
      });

      // ثبت تاریخچه تغییر موجودی
      if (newStock > 0) {
        await logStockChange(
          existingProduct.id,
          newStock,
          finalStock,
          "PURCHASE",
          userId || null,
          "Restock via AI Import"
        );
      }

      res.status(200).json({
        success: true,
        message: "محصول موجود بروزرسانی و موجودی افزایش یافت.",
        product: resultProduct,
      });
    } else {
      // --- سناریو ساخت جدید ---

      // اسلاگ فقط برای محصول جدید مهم است
      let slugBase = data.englishName || data.name;
      let generatedSlug = generateSlug(slugBase);
      const slugCheck = await prisma.product.findUnique({
        where: { slug: generatedSlug },
      });
      if (slugCheck)
        generatedSlug = `${generatedSlug}-${Math.floor(Math.random() * 1000)}`;

      resultProduct = await prisma.product.create({
        data: {
          name: data.name,
          englishName: data.englishName,
          slug: generatedSlug,
          sku: finalSku, // SKU تضمین شده
          brandId,
          categoryId,
          description: data.description,
          how_to_use: data.how_to_use,
          caution: data.caution,
          price: parseFloat(data.price),
          discount_price: data.discount_price
            ? parseFloat(data.discount_price)
            : null,
          stock: newStock,
          volume: data.volume ? parseFloat(data.volume) : null,
          unit: data.unit,
          country_of_origin: data.country_of_origin,
          skin_type: data.skin_type || [],
          concern: data.concern || [],
          product_form: data.product_form,
          ingredients: data.ingredients || [],
          tags: data.tags || [],
          metaTitle: data.metaTitle || data.name,
          metaDescription: data.metaDescription,
          isArchived: false,
          images: {
            create: imageCreateData,
          },
        },
      });

      if (newStock > 0) {
        await logStockChange(
          resultProduct.id,
          newStock,
          newStock,
          "INITIAL",
          userId || null,
          "AI Import"
        );
      }

      res.status(201).json({
        success: true,
        message: "محصول جدید با موفقیت ساخته شد.",
        product: resultProduct,
      });
    }
  } catch (error) {
    console.error("JSON Import Error:", error);
    res.status(500).json({ success: false, message: "خطا در پردازش محصول." });
  }
};
