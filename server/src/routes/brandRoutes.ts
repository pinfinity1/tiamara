// server/src/routes/brandRoutes.ts
import express from "express";
import { authenticateJwt, isSuperAdmin } from "../middleware/authMiddleware";
import {
  createBrand,
  deleteBrand,
  getAllBrands,
  updateBrand,
} from "../controllers/brandController";
import { upload } from "../middleware/uploadMiddleware";

const router = express.Router();

// Public route to get all brands (for filtering on client-side)
router.get("/", getAllBrands);

// Admin routes - protected
router.post(
  "/create",
  authenticateJwt,
  isSuperAdmin,
  upload.single("logo"),
  createBrand
);
router.put(
  "/update/:id",
  authenticateJwt,
  isSuperAdmin,
  upload.single("logo"),
  updateBrand
);
router.delete("/delete/:id", authenticateJwt, isSuperAdmin, deleteBrand);

export default router;
