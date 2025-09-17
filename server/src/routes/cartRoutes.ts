// server/src/routes/cartRoutes.ts

import express from "express";
import { authenticateJwt } from "../middleware/authMiddleware";
import {
  addToCart,
  clearEntireCart,
  getCart,
  removeFromCart,
  updateCartItemQuantity,
  mergeCarts, // 1. mergeCarts را import کنید
} from "../controllers/cartController";

const router = express.Router();

router.get("/fetch-cart", getCart);
router.post("/add", addToCart); // 2. آدرس به 'add' تغییر کرد
router.delete("/remove/:id", removeFromCart);
router.put("/update/:id", updateCartItemQuantity);
router.post("/clear", clearEntireCart); // 3. آدرس به 'clear' تغییر کرد
router.post("/merge", authenticateJwt, mergeCarts); // 4. روت merge اضافه شد

export default router;
