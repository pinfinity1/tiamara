import express from "express";
import { authenticateJwt, isSuperAdmin } from "../middleware/authMiddleware";
import {
  createCoupon,
  deleteCoupon,
  fetchAllCoupons,
  validateCoupon,
} from "../controllers/couponController";

const router = express.Router();

router.use(authenticateJwt);

router.get("/fetch-all-coupons", isSuperAdmin, fetchAllCoupons);
router.post("/create-coupon", isSuperAdmin, createCoupon);
router.delete("/:id", isSuperAdmin, deleteCoupon);

router.post("/validate", validateCoupon);

export default router;
