import express from "express";
import { authenticateUser, authorizeAdmin } from "../middleware/authMiddleware";
import {
  getActiveShippingMethods,
  getAllShippingMethods,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
} from "../controllers/shippingController";

const router = express.Router();

// --- روت عمومی (سمت کاربر) ---
// دریافت روش‌های فعال برای چک‌اوت
router.get("/", getActiveShippingMethods);

// --- روت‌های مدیریت (فقط ادمین) ---

// دریافت تمام روش‌ها (شامل غیرفعال‌ها)
router.get(
  "/admin/all",
  authenticateUser,
  authorizeAdmin,
  getAllShippingMethods
);

// ایجاد روش ارسال جدید
router.post("/", authenticateUser, authorizeAdmin, createShippingMethod);

// ویرایش روش ارسال
router.put("/:id", authenticateUser, authorizeAdmin, updateShippingMethod);

// حذف روش ارسال
router.delete("/:id", authenticateUser, authorizeAdmin, deleteShippingMethod);

export default router;
