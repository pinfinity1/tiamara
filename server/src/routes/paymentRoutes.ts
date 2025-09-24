import express from "express";
import { verifyPaymentController } from "../controllers/paymentController";

const router = express.Router();

router.get("/verify", verifyPaymentController);

export default router;
