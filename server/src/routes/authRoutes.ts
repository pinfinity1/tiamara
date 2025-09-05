import express from "express";
import {
  checkPhoneAndSendOtpController,
  loginWithOtpController,
  loginWithPasswordController,
  logoutController,
} from "../controllers/authController";

const router = express.Router();

// Step 1: Check phone number and send OTP
router.post("/check-phone", checkPhoneAndSendOtpController);

// Step 2 (Option A): Login or register with OTP
router.post("/login-otp", loginWithOtpController);

// Step 2 (Option B): Login with password
router.post("/login-password", loginWithPasswordController);

// Logout
router.post("/logout", logoutController);

export default router;
