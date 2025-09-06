import express from "express";
import { authenticateJwt, isSuperAdmin } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "../controllers/categoryController";

const router = express.Router();

// Public route to get all categories
router.get("/", getAllCategories);

// Protected admin routes
router.post(
  "/create",
  authenticateJwt,
  isSuperAdmin,
  upload.single("image"),
  createCategory
);

router.put(
  "/update/:id",
  authenticateJwt,
  isSuperAdmin,
  upload.single("image"),
  updateCategory
);

router.delete("/delete/:id", authenticateJwt, isSuperAdmin, deleteCategory);

export default router;
