// server/src/routes/orderRoutes.ts

import express from "express";
import {
  createFinalOrder,
  getOrdersByUserId,
  updateOrderStatus,
  getAllOrdersForAdmin,
  getSingleOrderForAdmin,
  getSingleOrderForUser,
} from "../controllers/orderController";
import { authenticateUser, authorizeAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// === Admin Routes (More specific paths to avoid conflicts) ===
router.get(
  "/admin/all", // Corrected path
  authenticateUser,
  authorizeAdmin,
  getAllOrdersForAdmin
);
router.get(
  "/admin/single/:orderId", // Corrected path
  authenticateUser,
  authorizeAdmin,
  getSingleOrderForAdmin
);
router.put(
  "/admin/status/:orderId", // Corrected path
  authenticateUser,
  authorizeAdmin,
  updateOrderStatus
);

// === User Routes ===
router.post("/create-final-order", authenticateUser, createFinalOrder);
router.get("/my-orders", authenticateUser, getOrdersByUserId);
router.get("/:orderId", authenticateUser, getSingleOrderForUser);

export default router;
