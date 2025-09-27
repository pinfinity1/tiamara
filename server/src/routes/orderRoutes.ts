// server/src/routes/orderRoutes.ts

import express from "express";
import {
  createFinalOrder,
  getAllOrdersForAdmin,
  getOrdersByUserId,
  getSingleOrderForAdmin,
  getSingleOrderForUser,
  updateOrderStatus,
} from "../controllers/orderController";
import { authenticateUser, authorizeAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// ===============================================
// ================ USER ROUTES ==================
// ===============================================
router.use(authenticateUser); // تمام روت‌های زیر نیاز به لاگین دارند

router.post("/create-final-order", createFinalOrder); // <-- این خط اضافه شد
router.get("/my-orders", getOrdersByUserId);
router.get("/:orderId", getSingleOrderForUser);

// ===============================================
// ================ ADMIN ROUTES =================
// ===============================================
router.get("/admin/all", authorizeAdmin, getAllOrdersForAdmin);
router.get("/admin/single/:orderId", authorizeAdmin, getSingleOrderForAdmin);
router.put("/admin/status/:orderId", authorizeAdmin, updateOrderStatus);

export default router;
