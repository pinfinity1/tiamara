import express from "express";
import { authenticateJwt } from "../middleware/authMiddleware";
import {
  getWishlist,
  toggleWishlistItem,
} from "../controllers/wishlistController";

const router = express.Router();

// تمام روت‌های این بخش نیاز به احراز هویت کاربر دارند
router.use(authenticateJwt);

// GET /api/wishlist -> دریافت لیست علاقه‌مندی‌ها
router.get("/", getWishlist);

// POST /api/wishlist/toggle -> افزودن/حذف یک آیتم
router.post("/toggle", toggleWishlistItem);

export default router;
