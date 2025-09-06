import { Request, Response } from "express";
import { prisma } from "../server";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import cloudinary from "../config/cloudinary";
import fs from "fs";

// Utility function to generate a slug
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "");
};

// Create a new Brand with logo upload
export const createBrand = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, metaTitle, metaDescription } = req.body;
    const file = req.file;

    if (!name) {
      res
        .status(400)
        .json({ success: false, message: "Brand name is required." });
      return;
    }

    let logoUrl: string | undefined = undefined;

    if (file) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "tiamara_logos",
      });
      logoUrl = result.secure_url;
      fs.unlinkSync(file.path); // Clean up the temporary file
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        slug: generateSlug(name),
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

// Get all Brands
export const getAllBrands = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const brands = await prisma.brand.findMany({
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

// Update a Brand with logo upload
export const updateBrand = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      metaTitle,
      metaDescription,
      logoUrl: existingLogoUrl,
    } = req.body;
    const file = req.file;

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
        slug: generateSlug(name),
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

// Delete a Brand
export const deleteBrand = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.brand.delete({
      where: { id },
    });
    res
      .status(200)
      .json({ success: true, message: "Brand deleted successfully." });
  } catch (error) {
    console.error("Error deleting brand:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete brand." });
  }
};
