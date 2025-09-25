import express from "express";
import {
  createCoupon,
  getAllCoupons, // Corrected from fetchAllCoupons
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "../controllers/couponController";
import { authenticateJwt, isSuperAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// Route to validate a coupon (for users)
router.post("/validate", authenticateJwt, validateCoupon);

// All routes below are for super admin only
router.use(authenticateJwt, isSuperAdmin);

router.post("/", createCoupon);
router.get("/", getAllCoupons);
router.get("/:id", getCouponById);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

export default router;
