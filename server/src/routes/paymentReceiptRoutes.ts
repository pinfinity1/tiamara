import express from "express";
import { authenticateUser, authorizeAdmin } from "../middleware/authMiddleware";
import { uploadImage } from "../middleware/uploadMiddleware";
import {
  uploadReceipt,
  verifyReceipt,
} from "../controllers/paymentReceiptController";

const router = express.Router();

// روت کاربر برای آپلود عکس فیش
router.post(
  "/upload",
  authenticateUser,
  uploadImage.single("receipt"),
  uploadReceipt
);

// روت ادمین برای تایید/رد
router.post("/verify", authenticateUser, authorizeAdmin, verifyReceipt);

export default router;
