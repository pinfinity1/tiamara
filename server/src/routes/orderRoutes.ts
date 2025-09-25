import express from "express";
import { authenticateJwt, isSuperAdmin } from "../middleware/authMiddleware";
import {
  createFinalOrder,
  getOrder,
  getOrdersByUserId,
  getAllOrdersForAdmin,
  updateOrderStatus,
  getSingleOrderForAdmin,
} from "../controllers/orderController";

const router = express.Router();

router.use(authenticateJwt);

router.post("/create-final-order", createFinalOrder);
router.get("/get-single-order/:orderId", getOrder);
router.get("/get-order-by-user-id", getOrdersByUserId);
router.get("/get-all-orders-for-admin", isSuperAdmin, getAllOrdersForAdmin);
router.get(
  "/admin/get-single-order/:orderId",
  isSuperAdmin,
  getSingleOrderForAdmin
);
router.put("/:orderId/status", isSuperAdmin, updateOrderStatus);

// ما در آینده یک مسیر جدید برای تایید پرداخت (callback) از درگاه به اینجا اضافه خواهیم کرد

export default router;
