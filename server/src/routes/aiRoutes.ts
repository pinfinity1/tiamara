// server/src/routes/aiRoutes.ts

import express from "express";
import { authenticateJwt } from "../middleware/authMiddleware";
import { handleChat } from "../controllers/aiController";

const router = express.Router();

// این مسیر هم می‌تواند عمومی باشد و هم برای کاربران لاگین کرده کار کند
// authenticateJwt به صورت اختیاری اطلاعات کاربر را در صورت وجود به ما می‌دهد
router.post("/chat", authenticateJwt, handleChat);

export default router;
