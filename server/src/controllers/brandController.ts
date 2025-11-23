// server/src/controllers/brandController.ts

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

// Create a new Brand with logo upload
export const createBrand = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, englishName, metaTitle, metaDescription } = req.body;
    const file = req.file;

    if (!name || !englishName) {
      res.status(400).json({
        success: false,
        message: "Brand name and English name are required.",
      });
      return;
    }

    let logoUrl: string | undefined = undefined;

    if (file) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "tiamara_logos",
      });
      logoUrl = result.secure_url;
      fs.unlinkSync(file.path);
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        englishName,
        slug: generateSlug(englishName),
        logoUrl,
        metaTitle,
        metaDescription,
      },
    });

    res.status(201).json({ success: true, brand });
  } catch (error) {
    console.error("Error creating brand:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create brand." });
  }
};

// Get all Brands (Filter out archived ones)
export const getAllBrands = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const brands = await prisma.brand.findMany({
      where: { isArchived: false }, // ✅ فقط برندهای فعال
      orderBy: { name: "asc" },
    });
    res.status(200).json({ success: true, brands });
  } catch (error) {
    console.error("Error fetching brands:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch brands." });
  }
};

// Get a single brand by slug
export const getBrandBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;
    const brand = await prisma.brand.findUnique({
      where: { slug },
    });

    if (!brand || brand.isArchived) {
      // اگر آرشیو شده بود هم نشون نده
      res.status(404).json({ success: false, message: "Brand not found" });
      return;
    }

    res.status(200).json({ success: true, brand });
  } catch (error) {
    console.error("Error fetching brand by slug:", error);
    res.status(500).json({ success: false, message: "Failed to fetch brand." });
  }
};

// Update a Brand with logo upload
export const updateBrand = async (
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
      logoUrl: existingLogoUrl,
    } = req.body;
    const file = req.file;

    if (!name || !englishName) {
      res.status(400).json({
        success: false,
        message: "Brand name and English name are required.",
      });
      return;
    }

    let newLogoUrl: string | undefined = existingLogoUrl;

    if (file) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "tiamara_logos",
      });
      newLogoUrl = result.secure_url;
      fs.unlinkSync(file.path);
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name,
        englishName,
        slug: generateSlug(englishName),
        logoUrl: newLogoUrl,
        metaTitle,
        metaDescription,
      },
    });

    res.status(200).json({ success: true, brand });
  } catch (error) {
    console.error("Error updating brand:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update brand." });
  }
};

// Delete (Archive) a Brand
export const deleteBrand = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    // ✅ به جای حذف فیزیکی، آرشیو می‌کنیم
    await prisma.brand.update({
      where: { id },
      data: { isArchived: true },
    });

    res
      .status(200)
      .json({ success: true, message: "Brand archived successfully." });
  } catch (error) {
    console.error("Error deleting brand:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete brand." });
  }
};

// Bulk create brands from Excel
export const bulkCreateBrandsFromExcel = async (
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
    const brandsData: any[] = xlsx.utils.sheet_to_json(sheet);

    const report = {
      createdCount: 0,
      updatedCount: 0,
      failedCount: 0,
      errors: [] as any[],
    };

    for (const row of brandsData) {
      try {
        if (!row.name || !row.englishName) {
          throw new Error(
            "Both 'name' and 'englishName' are required for each brand."
          );
        }

        const generatedSlug = generateSlug(row.englishName);

        // بررسی وجود برند (حتی اگر آرشیو شده باشد)
        const existingBrand = await prisma.brand.findFirst({
          where: {
            OR: [
              { name: row.name },
              { englishName: row.englishName },
              { slug: generatedSlug },
            ],
          },
        });

        const brandData = {
          name: row.name,
          englishName: row.englishName,
          slug: generatedSlug,
          metaTitle: row.metaTitle || row.name,
          metaDescription: row.metaDescription || null,
          // ✅ نکته کلیدی: بازگرداندن برندهای حذف شده به حالت فعال
          isArchived: false,
        };

        if (existingBrand) {
          // اگر برند بود (حتی آرشیو)، آپدیت و فعالش کن
          await prisma.brand.update({
            where: { id: existingBrand.id },
            data: brandData,
          });
          report.updatedCount++;
        } else {
          // اگر نبود، بساز
          await prisma.brand.create({
            data: brandData,
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
      .json({ success: true, message: "Brand import finished.", data: report });
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
