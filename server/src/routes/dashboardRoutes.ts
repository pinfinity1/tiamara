import express from "express";
import { authenticateUser, authorizeAdmin } from "../middleware/authMiddleware";
import { getDashboardStats } from "../controllers/dashboardController";

const router = express.Router();

router.use(authenticateUser, authorizeAdmin);

router.get("/stats", getDashboardStats);

export default router;
