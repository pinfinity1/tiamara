import express from "express";
import {
  createCoupon,
  getAllCoupons, // Corrected from fetchAllCoupons
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "../controllers/couponController";
import { authenticateUser, authorizeAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// Route to validate a coupon (for users)
router.post("/validate", authenticateUser, validateCoupon);

// All routes below are for super admin only
router.use(authenticateUser, authorizeAdmin);

router.post("/", createCoupon);
router.get("/", getAllCoupons);
router.get("/:id", getCouponById);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

export default router;
