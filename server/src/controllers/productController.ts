import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import cloudinary from "../config/cloudinary";
import { prisma } from "../server";
import fs from "fs";
import { Prisma } from "@prisma/client";

const generateSlug = (name: string) => {
  return name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
};

// Create a new product
export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      brandId, // Changed from 'brand' to 'brandId'
      categoryId, // Changed from 'category' to 'categoryId'
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
      altText: `${name} image ${index + 1}`, // Generate a default alt text
    }));

    const newlyCreatedProduct = await prisma.product.create({
      data: {
        name,
        slug: generateSlug(name), // Generate slug from product name
        brandId,
        categoryId,
        description,
        how_to_use,
        caution,
        price: parseFloat(price),
        discount_price: discount_price ? parseFloat(discount_price) : null,
        stock: parseInt(stock),
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
        metaTitle: metaTitle || name, // Default metaTitle to product name
        metaDescription: metaDescription,
        // CORRECT WAY: Create related images using the new relation
        images: {
          create: imageCreateData,
        },
      },
    });

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
      // CORRECT WAY: Include related data
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

// Get a single product by ID
export const getProductByID = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      // CORRECT WAY: Include related data
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

// Update a product
export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      brandId, // Changed from 'brand'
      categoryId, // Changed from 'category'
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
      imagesToDelete, // Expecting a comma-separated string of image IDs to delete
    } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { images: true }, // We need the existing images to manage them
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
        stock: parseInt(stock),
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
        metaTitle: metaTitle || name,
        metaDescription,
        images: imageUpdateOperations, // Apply all create/delete operations
      },
    });

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

    const where: Prisma.productWhereInput = {
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
