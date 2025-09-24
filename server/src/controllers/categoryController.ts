// server/src/controllers/categoryController.ts

import { Request, Response } from "express";
import { prisma } from "../server";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import cloudinary from "../config/cloudinary";
import fs from "fs";
import * as xlsx from "xlsx";

// Utility function to generate a slug from an English string
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "");
};

// Create a new Category
export const createCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, englishName, metaTitle, metaDescription } = req.body;
    const file = req.file;

    if (!name || !englishName) {
      res.status(400).json({
        success: false,
        message: "Category name and English name are required.",
      });
      return;
    }

    let imageUrl: string | undefined = undefined;

    if (file) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "tiamara_categories",
      });
      imageUrl = result.secure_url;
      fs.unlinkSync(file.path);
    }

    const category = await prisma.category.create({
      data: {
        name,
        englishName,
        slug: generateSlug(englishName), // Slug from englishName
        imageUrl,
        metaTitle,
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
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories." });
  }
};

// Update a Category
export const updateCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      englishName,
      metaTitle,
      metaDescription,
      imageUrl: existingImageUrl,
    } = req.body;
    const file = req.file;

    if (!name || !englishName) {
      res.status(400).json({
        success: false,
        message: "Category name and English name are required.",
      });
      return;
    }

    let newImageUrl: string | undefined = existingImageUrl;

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
        englishName,
        slug: generateSlug(englishName), // Slug from englishName
        imageUrl: newImageUrl,
        metaTitle,
        metaDescription,
      },
    });

    res.status(200).json({ success: true, category });
  } catch (error) {
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
    await prisma.category.delete({ where: { id } });
    res
      .status(200)
      .json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete category." });
  }
};

// Get a single category by slug
export const getCategoryBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }

    res.status(200).json({ success: true, category });
  } catch (error) {
    console.error("Error fetching category by slug:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch category." });
  }
};

// Bulk create categories from Excel
export const bulkCreateCategoriesFromExcel = async (
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
    const categoriesData: any[] = xlsx.utils.sheet_to_json(sheet);

    const report = { createdCount: 0, failedCount: 0, errors: [] as any[] };

    for (const row of categoriesData) {
      try {
        if (!row.name || !row.englishName) {
          throw new Error("Both 'name' and 'englishName' are required.");
        }

        const existingCategory = await prisma.category.findFirst({
          where: {
            OR: [{ name: row.name }, { englishName: row.englishName }],
          },
        });

        if (!existingCategory) {
          await prisma.category.create({
            data: {
              name: row.name,
              englishName: row.englishName,
              slug: generateSlug(row.englishName),
              metaTitle: row.metaTitle || row.name,
              metaDescription: row.metaDescription || null,
            },
          });
          report.createdCount++;
        }
      } catch (e: any) {
        report.failedCount++;
        report.errors.push({ name: row.name, error: e.message });
      }
    }
    res
      .status(201)
      .json({
        success: true,
        message: "Category import finished.",
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
