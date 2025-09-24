import { Response, Request } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import cloudinary from "../config/cloudinary";
import { prisma } from "../server";
import fs from "fs";
import { Prisma } from "@prisma/client";
import * as xlsx from "xlsx";

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
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

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
      prisma.brand.findMany({ orderBy: { name: "asc" } }),

      prisma.category.findMany({ orderBy: { name: "asc" } }),

      prisma.product.aggregate({
        _max: { price: true },
        _min: { price: true },
      }),

      prisma.$queryRaw`SELECT DISTINCT unnest(skin_type) as value FROM "Product" WHERE cardinality(skin_type) > 0`,

      prisma.$queryRaw`SELECT DISTINCT unnest(concern) as value FROM "Product" WHERE cardinality(concern) > 0`,

      prisma.product.findMany({
        select: { product_form: true },
        where: { product_form: { not: null } },
        distinct: ["product_form"],
      }),
    ]);

    const skinTypes = (skinTypesRaw as any[])
      .map((item) => item.value)
      .filter(Boolean)
      .sort();
    const concerns = (concernsRaw as any[])
      .map((item) => item.value)
      .filter(Boolean)
      .sort();
    const productForms = productFormsRaw
      .map((item) => item.product_form)
      .filter(Boolean)
      .sort() as string[];

    res.status(200).json({
      success: true,
      filters: {
        brands,
        categories,
        priceRange: {
          min: priceAggregation._min.price || 0,
          max: priceAggregation._max.price || 1000000,
        },
        skinTypes,
        concerns,
        productForms,
      },
    });
  } catch (error) {
    console.error("Error fetching product filters:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch filters." });
  }
};

// Create a new product
export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const {
      name,
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

    // Upload all images to cloudinary
    const uploadPromises = files.map((file) =>
      cloudinary.uploader.upload(file.path, {
        folder: "tiamara", // Your Cloudinary folder
      })
    );

    const uploadResults = await Promise.all(uploadPromises);

    // Prepare image data for Prisma, including altText derived from product name
    const imageCreateData = uploadResults.map((result, index) => ({
      url: result.secure_url,
      altText: `${name} image ${index + 1}`,
    }));

    const stockAmount = parseInt(stock);
    const newlyCreatedProduct = await prisma.product.create({
      data: {
        name,
        slug: generateSlug(name),
        brandId,
        categoryId,
        description,
        how_to_use,
        caution,
        price: parseFloat(price),
        discount_price: discount_price ? parseFloat(discount_price) : null,
        stock: stockAmount,
        sku,
        barcode,
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
        soldCount: 0,
        average_rating: 0,
        review_count: 0,
        metaTitle: metaTitle || name,
        metaDescription: metaDescription,

        images: {
          create: imageCreateData,
        },
      },
    });

    // Log the initial stock
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

    // Clean up uploaded files from the server's temporary storage
    files.forEach((file) => fs.unlinkSync(file.path));
    res.status(201).json(newlyCreatedProduct);
  } catch (e) {
    console.error("Error creating product:", e);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

// Fetch all products (for admin panel)
export const fetchAllProductsForAdmin = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const fetchAllProducts = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        images: true,
        brand: true,
        category: true,
      },
    });
    res.status(200).json(fetchAllProducts);
  } catch (e) {
    console.error("Error fetching admin products:", e);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

// Get a single product by SLUG
export const getProductBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: true,
        brand: true,
        category: true,
      },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json(product);
  } catch (e) {
    console.error("Error fetching product by slug:", e);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

// Get a single product by ID
export const getProductByID = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        brand: true,
        category: true,
      },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json(product);
  } catch (e) {
    console.error("Error fetching product by ID:", e);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

// Get a multiple product by IDs
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
      where: {
        id: { in: ids },
      },
      include: {
        images: { take: 1 },
        brand: true,
      },
    });

    const sortedProducts = ids
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean);

    res.status(200).json({ success: true, products: sortedProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update a product
export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const {
      name,
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
    } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!existingProduct) {
      res.status(404).json({ success: false, message: "Product not found!" });
      return;
    }

    // A container for all image update operations (delete, create)
    const imageUpdateOperations: any = {};

    // Handle image deletion
    if (imagesToDelete) {
      const idsToDelete = (imagesToDelete as string).split(",").filter(Boolean);
      if (idsToDelete.length > 0) {
        imageUpdateOperations.deleteMany = {
          id: { in: idsToDelete },
        };

        // Optionally, delete from Cloudinary as well
        const imagesToDeleteFromCloud = existingProduct.images.filter((img) =>
          idsToDelete.includes(img.id)
        );
        if (imagesToDeleteFromCloud.length > 0) {
          const publicIdsForCloudinary = imagesToDeleteFromCloud.map(
            (img) => `tiamara/${img.url.split("/").pop()?.split(".")[0]}`
          );
          await cloudinary.api.delete_resources(publicIdsForCloudinary);
        }
      }
    }

    // Handle new image uploads
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        cloudinary.uploader.upload(file.path, { folder: "tiamara" })
      );
      const uploadResults = await Promise.all(uploadPromises);
      const newImagesData = uploadResults.map((result, index) => ({
        url: result.secure_url,
        altText: `${name} image ${existingProduct.images.length + index + 1}`,
      }));

      imageUpdateOperations.create = newImagesData;

      files.forEach((file) => fs.unlinkSync(file.path));
    }

    const newStockAmount = parseInt(stock);
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug: slug || generateSlug(name),
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
        images: imageUpdateOperations, // Apply all create/delete operations
      },
    });

    // Log stock adjustment if stock was changed
    const stockChange = newStockAmount - existingProduct.stock;
    if (stockChange !== 0) {
      await logStockChange(
        id,
        stockChange,
        newStockAmount,
        "ADJUSTMENT",
        userId || null,
        "Stock manually adjusted in admin panel"
      );
    }

    res.status(200).json(product);
  } catch (e) {
    console.error("Error updating product:", e);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

// Delete a product
export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // First, delete related images from the Image table to maintain data integrity
    await prisma.image.deleteMany({ where: { productId: id } });

    // Then, delete the product itself
    await prisma.product.delete({ where: { id } });

    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (e) {
    console.error("Error deleting product:", e);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

// Fetch products with filters (for client side)
export const getProductsForClient = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const categories = ((req.query.categories as string) || "")
      .split(",")
      .filter(Boolean);
    const brands = ((req.query.brands as string) || "")
      .split(",")
      .filter(Boolean);
    const skin_types = ((req.query.skin_types as string) || "")
      .split(",")
      .filter(Boolean);
    const concerns = ((req.query.concerns as string) || "")
      .split(",")
      .filter(Boolean);
    const product_forms = ((req.query.product_forms as string) || "")
      .split(",")
      .filter(Boolean);
    const tags = ((req.query.tags as string) || "").split(",").filter(Boolean);

    const minPrice = parseFloat(req.query.minPrice as string) || 0;
    const maxPrice =
      parseFloat(req.query.maxPrice as string) || Number.MAX_SAFE_INTEGER;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      AND: [
        categories.length > 0
          ? {
              category: {
                name: {
                  in: categories,
                  mode: "insensitive",
                },
              },
            }
          : {},
        brands.length > 0
          ? {
              brand: {
                name: {
                  in: brands,
                  mode: "insensitive",
                },
              },
            }
          : {},
        skin_types.length > 0
          ? {
              skin_type: {
                hasSome: skin_types,
              },
            }
          : {},
        concerns.length > 0
          ? {
              concern: {
                hasSome: concerns,
              },
            }
          : {},
        product_forms.length > 0
          ? {
              product_form: {
                in: product_forms,
                mode: "insensitive",
              },
            }
          : {},
        tags.length > 0
          ? {
              tags: {
                hasSome: tags,
              },
            }
          : {},
        {
          price: { gte: minPrice, lte: maxPrice },
        },
      ],
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          images: {
            take: 1,
          },
          brand: true,
          category: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (error) {
    console.error("Error fetching client products:", error);
    res.status(500).json({ success: false, message: "Some error occurred!" });
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
          sku,
          price,
          stock,
          brandName,
          categoryName,
          description,
        } = row;

        if (
          !name ||
          !sku ||
          !price ||
          stock === undefined ||
          !brandName ||
          !categoryName
        ) {
          throw new Error(
            "Missing required fields (name, sku, price, stock, brandName, categoryName)."
          );
        }

        // Find Brand ID by its Persian name
        const brand = await prisma.brand.findUnique({
          where: { name: brandName },
        });
        if (!brand) {
          throw new Error(`Brand '${brandName}' not found.`);
        }

        // Find Category ID by its Persian name
        const category = await prisma.category.findUnique({
          where: { name: categoryName },
        });
        if (!category) {
          throw new Error(`Category '${categoryName}' not found.`);
        }

        const productData = {
          name,
          slug:
            name.toLowerCase().replace(/\s+/g, "-") + "-" + sku.toLowerCase(),
          description: description || null,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
          sku,
          brandId: brand.id,
          categoryId: category.id,
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
          await prisma.product.create({
            data: productData,
          });
          report.createdCount++;
        }
      } catch (e: any) {
        report.failedCount++;
        report.errors.push({
          sku: row.sku || "N/A",
          name: row.name || "N/A",
          error: e.message,
        });
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
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
  }
};
