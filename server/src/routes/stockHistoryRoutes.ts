import express from "express";
import { authenticateJwt, isSuperAdmin } from "../middleware/authMiddleware";
import { getStockHistory } from "../controllers/stockHistoryController";

const router = express.Router();

// All stock history routes require admin access
router.use(authenticateJwt, isSuperAdmin);

// Route to get all history
router.get("/", getStockHistory);

// Route to get history for a specific product
router.get("/:productId", getStockHistory);

export default router;
