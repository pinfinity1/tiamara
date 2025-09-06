import express from "express";
import {
  checkPhoneAndSendOtpController,
  loginWithOtpController,
  setPasswordController,
  loginWithPasswordController,
  logoutController,
} from "../controllers/authController";
import { authenticateJwt } from "../middleware/authMiddleware";

const router = express.Router();

// Step 1: Check phone number and send OTP
router.post("/check-phone", checkPhoneAndSendOtpController);

// Step 2 (Option A): Login or register with OTP
router.post("/login-otp", loginWithOtpController);

// After first login user should set password
router.post("/set-password", authenticateJwt, setPasswordController);

// Step 2 (Option B): Login with password
router.post("/login-password", loginWithPasswordController);

// Logout
router.post("/logout", logoutController);

export default router;
