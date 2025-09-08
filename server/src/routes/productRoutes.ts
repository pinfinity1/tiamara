import expess from "express";
import { authenticateJwt, isSuperAdmin } from "../middleware/authMiddleware";
import { uploadImage, uploadExcel } from "../middleware/uploadMiddleware";
import {
  createProduct,
  deleteProduct,
  fetchAllProductsForAdmin,
  getProductByID,
  updateProduct,
  getProductsForClient,
  bulkCreateProductsFromExcel,
} from "../controllers/productController";

const router = expess.Router();

router.post(
  "/create-new-product",
  authenticateJwt,
  isSuperAdmin,
  uploadImage.array("images", 5),
  createProduct
);

router.post(
  "/upload/excel",
  authenticateJwt,
  isSuperAdmin,
  uploadExcel.single("file"),
  bulkCreateProductsFromExcel
);

router.get(
  "/fetch-admin-products",
  authenticateJwt,
  isSuperAdmin,
  fetchAllProductsForAdmin
);

router.get("/fetch-client-products", getProductsForClient);
router.get("/:id", getProductByID);

router.put(
  "/:id",
  authenticateJwt,
  isSuperAdmin,
  uploadImage.array("images", 5),
  updateProduct
);
router.delete("/:id", authenticateJwt, isSuperAdmin, deleteProduct);

export default router;
