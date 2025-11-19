import express from "express";
import {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeItemFromCart,
  clearCart,
} from "../controllers/cartController";
import { extractUser } from "../middleware/extractUser";
import { cartSessionMiddleware } from "../middleware/cartSession";

const router = express.Router();

// ترتیب مهم است:
// ۱. اول مطمئن می‌شویم کاربر (مهمان یا عضو) یک Session ID دارد.
// ۲. سپس چک می‌کنیم آیا کاربر لاگین کرده است یا خیر (req.user را پر می‌کنیم).
router.use(cartSessionMiddleware);
router.use(extractUser);

// حالا تمام روت‌ها به req.cookies.sessionId و req.user دسترسی دارند
router.get("/", getCart);
router.post("/add", addItemToCart);
router.put("/item/:itemId", updateCartItemQuantity);
router.delete("/item/:itemId", removeItemFromCart);
router.delete("/clear", clearCart);

export default router;
