import { Request, Response } from "express";
import { prisma } from "../server";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import cloudinary from "../config/cloudinary";
import fs from "fs";

// Utility function to generate a slug from a string
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "");
};

// Create a new Category with an optional image upload
export const createCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, metaTitle, metaDescription } = req.body;
    const file = req.file;

    if (!name) {
      res
        .status(400)
        .json({ success: false, message: "Category name is required." });
      return;
    }

    let imageUrl: string | undefined = undefined;

    if (file) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "tiamara_categories",
      });
      imageUrl = result.secure_url;
      fs.unlinkSync(file.path); // Clean up the temporary file
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: generateSlug(name),
        imageUrl,
        metaTitle: metaTitle || name,
        metaDescription,
      },
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error("Error creating category:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create category." });
  }
};

// Get all Categories
export const getAllCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories." });
  }
};

// Update a Category with an optional image upload
export const updateCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      metaTitle,
      metaDescription,
      imageUrl: existingImageUrl,
    } = req.body;
    const file = req.file;

    let newImageUrl: string | undefined | null = existingImageUrl;

    if (file) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "tiamara_categories",
      });
      newImageUrl = result.secure_url;
      fs.unlinkSync(file.path);
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug: generateSlug(name),
        imageUrl: newImageUrl,
        metaTitle: metaTitle || name,
        metaDescription,
      },
    });

    res.status(200).json({ success: true, category });
  } catch (error) {
    console.error("Error updating category:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update category." });
  }
};

// Delete a Category
export const deleteCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.category.delete({
      where: { id },
    });
    res
      .status(200)
      .json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    console.error("Error deleting category:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete category." });
  }
};
