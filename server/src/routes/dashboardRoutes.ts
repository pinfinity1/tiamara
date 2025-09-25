import express from "express";
import { authenticateJwt, isSuperAdmin } from "../middleware/authMiddleware";
import { getDashboardStats } from "../controllers/dashboardController";

const router = express.Router();

router.use(authenticateJwt, isSuperAdmin);

router.get("/stats", getDashboardStats);

export default router;
