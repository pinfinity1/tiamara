import express from "express";
import { authenticateUser, authorizeAdmin } from "../middleware/authMiddleware";
import { uploadExcel, uploadImage } from "../middleware/uploadMiddleware";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
  getCategoryBySlug,
  bulkCreateCategoriesFromExcel,
} from "../controllers/categoryController";

const router = express.Router();

// Public route to get all categories
router.get("/", getAllCategories);

// Public route to get a single category by slug
router.get("/slug/:slug", getCategoryBySlug);

// Protected admin routes
router.post(
  "/create",
  authenticateUser,
  authorizeAdmin,
  uploadImage.single("image"),
  createCategory
);

router.put(
  "/update/:id",
  authenticateUser,
  authorizeAdmin,
  uploadImage.single("image"),
  updateCategory
);

router.delete("/delete/:id", authenticateUser, authorizeAdmin, deleteCategory);

router.post(
  "/upload/excel",
  authenticateUser,
  authorizeAdmin,
  uploadExcel.single("file"),
  bulkCreateCategoriesFromExcel
);

export default router;
