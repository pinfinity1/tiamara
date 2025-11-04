import express from "express";
import { authenticateUser } from "../middleware/authMiddleware";
import {
  getUserProfile,
  updateUserProfile,
  deleteSkinProfile,
} from "../controllers/userController";

const router = express.Router();

router.use(authenticateUser);

router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.delete("/profile/skin", deleteSkinProfile);

export default router;
