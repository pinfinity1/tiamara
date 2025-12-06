// server/src/controllers/categoryController.ts

import { Request, Response } from "express";
import { prisma } from "../server";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinaryService";
import fs from "fs";
import * as xlsx from "xlsx";
import { GridSize } from "@prisma/client"; // ایمپورت Enum جدید

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
    // دریافت gridSize از بادی
    const { name, englishName, metaTitle, metaDescription, gridSize } =
      req.body;
    const file = req.file;

    if (!name || !englishName) {
      res.status(400).json({
        success: false,
        message: "Category name and English name are required.",
      });
      return;
    }

    let imageUrl = undefined;
    let imagePublicId = undefined;

    if (file) {
      const upload = await uploadToCloudinary(file.path, "tiamara_categories");
      imageUrl = upload.url;
      imagePublicId = upload.publicId;
    }

    const category = await prisma.category.create({
      data: {
        name,
        englishName,
        slug: generateSlug(englishName),
        imageUrl,
        imagePublicId,
        metaTitle,
        metaDescription,
        // اگر کاربر سایزی نفرستاد، پیش‌فرض SMALL باشد
        gridSize: (gridSize as GridSize) || "SMALL",
      },
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error("Error creating category:", error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
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
      where: { isArchived: false },
      // اول بر اساس سایز (بزرگ‌ها اول) و بعد نام مرتب شود تا گرید زیباتر پر شود
      orderBy: [{ gridSize: "desc" }, { name: "asc" }],
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
      gridSize, // دریافت سایز جدید
      imageUrl: existingImageUrl,
    } = req.body;
    const file = req.file;

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });
    if (!existingCategory) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }

    let imageUrl = existingCategory.imageUrl;
    let imagePublicId = existingCategory.imagePublicId;

    if (file) {
      if (existingCategory.imagePublicId) {
        await deleteFromCloudinary(existingCategory.imagePublicId);
      }
      const upload = await uploadToCloudinary(file.path, "tiamara_categories");
      imageUrl = upload.url;
      imagePublicId = upload.publicId;
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        englishName,
        slug: generateSlug(englishName),
        imageUrl,
        imagePublicId,
        metaTitle,
        metaDescription,
        gridSize: (gridSize as GridSize) || existingCategory.gridSize, // آپدیت سایز
      },
    });

    res.status(200).json({ success: true, category });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to update category." });
  }
};

// ... (بقیه توابع: deleteCategory, getCategoryBySlug, bulkCreate... بدون تغییر باقی می‌مانند)
// فقط مطمئن شوید که import های بالا و export های پایین درست هستند.

export const deleteCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.category.update({
      where: { id },
      data: { isArchived: true },
    });
    res
      .status(200)
      .json({ success: true, message: "Category archived successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete category." });
  }
};

export const getCategoryBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;
    const category = await prisma.category.findUnique({
      where: { slug },
    });
    if (!category || category.isArchived) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }
    res.status(200).json({ success: true, category });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch category." });
  }
};

export const bulkCreateCategoriesFromExcel = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  // ... (کد قبلی بدون تغییر)
  // فقط اگر خواستید در اکسل هم ستون gridSize اضافه کنید، اینجا باید هندل شود
  if (!req.file) {
    res
      .status(400)
      .json({ success: false, message: "No Excel file provided." });
    return;
  }
  // ... (بقیه کد اکسل)
  // فعلاً برای جلوگیری از پیچیدگی، کد اکسل را تغییر نمی‌دهم مگر اینکه بخواهید.
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const categoriesData: any[] = xlsx.utils.sheet_to_json(sheet);

    const report = {
      createdCount: 0,
      updatedCount: 0,
      failedCount: 0,
      errors: [] as any[],
    };

    for (const row of categoriesData) {
      try {
        if (!row.name || !row.englishName) {
          throw new Error("Both 'name' and 'englishName' are required.");
        }
        const generatedSlug = generateSlug(row.englishName);
        const existingCategory = await prisma.category.findFirst({
          where: {
            OR: [
              { name: row.name },
              { englishName: row.englishName },
              { slug: generatedSlug },
            ],
          },
        });

        const categoryData = {
          name: row.name,
          englishName: row.englishName,
          slug: generatedSlug,
          metaTitle: row.metaTitle || row.name,
          metaDescription: row.metaDescription || null,
          isArchived: false,
          // پیش‌فرض SMALL برای اکسل
          gridSize: "SMALL" as GridSize,
        };

        if (existingCategory) {
          await prisma.category.update({
            where: { id: existingCategory.id },
            data: categoryData,
          });
          report.updatedCount++;
        } else {
          await prisma.category.create({ data: categoryData });
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
    if (req.file) fs.unlinkSync(req.file.path);
  }
};
