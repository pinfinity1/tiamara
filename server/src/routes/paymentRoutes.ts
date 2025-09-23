import express from "express";
import {
  requestPaymentController,
  verifyPaymentController,
} from "../controllers/paymentController";
import { authenticateJwt } from "../middleware/authMiddleware";

const router = express.Router();

// Route to initiate a payment request
router.post("/request", authenticateJwt, requestPaymentController);

// Route for Zarinpal to call back to after payment attempt
// This should NOT be protected by JWT, as Zarinpal's server is calling it.
router.get("/verify", verifyPaymentController);

export default router;
