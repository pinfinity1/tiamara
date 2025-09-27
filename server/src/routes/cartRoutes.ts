// server/src/routes/cartRoutes.ts

import express from "express";
import {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeItemFromCart,
  clearCart,
} from "../controllers/cartController";
// middleware جدید را import کن
import { optionalAuthenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

// از middleware اختیاری برای تمام روت‌های سبد خرید استفاده کن
router.get("/", optionalAuthenticateUser, getCart);
router.post("/add", optionalAuthenticateUser, addItemToCart);
router.put("/item/:itemId", optionalAuthenticateUser, updateCartItemQuantity);
router.delete("/item/:itemId", optionalAuthenticateUser, removeItemFromCart);
router.delete("/clear", optionalAuthenticateUser, clearCart);

export default router;
