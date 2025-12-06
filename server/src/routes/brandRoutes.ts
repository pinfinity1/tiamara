// server/src/routes/brandRoutes.ts

import express from "express";
import { authenticateUser, authorizeAdmin } from "../middleware/authMiddleware";
import {
  createBrand,
  deleteBrand,
  getAllBrands,
  updateBrand,
  getBrandBySlug,
  bulkCreateBrandsFromExcel,
} from "../controllers/brandController";
import { uploadExcel, uploadImage } from "../middleware/uploadMiddleware";

const router = express.Router();

// Public route to get all brands (for filtering on client-side)
router.get("/", getAllBrands);

// Public route to get a single brand by slug
router.get("/slug/:slug", getBrandBySlug);

// Admin routes - protected
router.post(
  "/create",
  authenticateUser,
  authorizeAdmin,
  // ✅ تغییر: پشتیبانی از آپلود لوگو و عکس کاور
  uploadImage.fields([
    { name: "logo", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  createBrand
);

router.put(
  "/update/:id",
  authenticateUser,
  authorizeAdmin,
  // ✅ تغییر: پشتیبانی از آپلود لوگو و عکس کاور
  uploadImage.fields([
    { name: "logo", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateBrand
);

router.delete("/delete/:id", authenticateUser, authorizeAdmin, deleteBrand);

router.post(
  "/upload/excel",
  authenticateUser,
  authorizeAdmin,
  uploadExcel.single("file"),
  bulkCreateBrandsFromExcel
);

export default router;
