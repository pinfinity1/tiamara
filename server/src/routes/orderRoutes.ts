// server/src/routes/orderRoutes.ts

import express from "express";
import {
  createFinalOrder,
  getOrdersByUserId,
  updateOrderStatus,
  getAllOrdersForAdmin,
  getSingleOrderForAdmin,
  getSingleOrderForUser, // ✅ تابع صحیح وارد شده است
} from "../controllers/orderController";
import { authenticateUser, authorizeAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// === User Routes ===
router.post("/create-final-order", authenticateUser, createFinalOrder);
router.get("/my-orders", authenticateUser, getOrdersByUserId);
// ✅ مسیر از تابع صحیح استفاده می‌کند
router.get("/:orderId", authenticateUser, getSingleOrderForUser);

// === Admin Routes ===
router.get(
  "/get-all-orders-for-admin",
  authenticateUser,
  authorizeAdmin,
  getAllOrdersForAdmin
);
router.get(
  "/get-single-order-for-admin/:orderId",
  authenticateUser,
  authorizeAdmin,
  getSingleOrderForAdmin
);
router.put(
  "/update-order-status/:orderId",
  authenticateUser,
  authorizeAdmin,
  updateOrderStatus
);

export default router;
