import express from "express";
import { authenticateJwt, isSuperAdmin } from "../middleware/authMiddleware";
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
  authenticateJwt,
  isSuperAdmin,
  uploadImage.single("logo"),
  createBrand
);
router.put(
  "/update/:id",
  authenticateJwt,
  isSuperAdmin,
  uploadImage.single("logo"),
  updateBrand
);
router.delete("/delete/:id", authenticateJwt, isSuperAdmin, deleteBrand);

router.post(
  "/upload/excel",
  authenticateJwt,
  isSuperAdmin,
  uploadExcel.single("file"),
  bulkCreateBrandsFromExcel
);

export default router;
