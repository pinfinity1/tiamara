// server/src/routes/paymentRoutes.ts

import express from "express";
import {
  createPaymentRequest,
  handlePaymentCallback,
} from "../controllers/paymentController";

const router = express.Router();

router.get("/create", createPaymentRequest);
router.get("/callback", handlePaymentCallback);

// این خط بسیار مهم است و فایل را به یک ماژول تبدیل می‌کند
export default router;
