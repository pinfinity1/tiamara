import express from "express";
import { authenticateJwt, isSuperAdmin } from "../middleware/authMiddleware";
import {
  createPurchaseOrder,
  getAllPurchaseOrders,
  updatePurchaseOrderStatus,
} from "../controllers/purchaseOrderController";

const router = express.Router();

router.use(authenticateJwt, isSuperAdmin);

router.get("/", getAllPurchaseOrders);
router.post("/create", createPurchaseOrder);
router.put("/update-status/:id", updatePurchaseOrderStatus);

export default router;
