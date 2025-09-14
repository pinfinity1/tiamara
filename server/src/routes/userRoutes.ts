import express from "express";
import { authenticateJwt } from "../middleware/authMiddleware";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController";

const router = express.Router();

router.use(authenticateJwt);

router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);

export default router;
