import expess from "express";
import { authenticateUser, authorizeAdmin } from "../middleware/authMiddleware";
import { uploadImage, uploadExcel } from "../middleware/uploadMiddleware";
import {
  createProduct,
  deleteProduct,
  fetchAllProductsForAdmin,
  getProductByID,
  getProductsByIds,
  updateProduct,
  getProductsForClient,
  bulkCreateProductsFromExcel,
  getProductBySlug,
  getProductFilters,
} from "../controllers/productController";

const router = expess.Router();

router.post(
  "/create-new-product",
  authenticateUser,
  authorizeAdmin,
  uploadImage.array("images", 10),
  createProduct
);

router.post(
  "/upload/excel",
  authenticateUser,
  authorizeAdmin,
  uploadExcel.single("file"),
  bulkCreateProductsFromExcel
);

router.get(
  "/fetch-admin-products",
  authenticateUser,
  authorizeAdmin,
  fetchAllProductsForAdmin
);

router.put(
  "/:id",
  authenticateUser,
  authorizeAdmin,
  uploadImage.array("images", 10),
  updateProduct
);

router.delete("/:id", authenticateUser, authorizeAdmin, deleteProduct);

router.get("/filters", getProductFilters);
router.get("/fetch-client-products", getProductsForClient);
router.get("/slug/:slug", getProductBySlug);
router.post("/by-ids", getProductsByIds);
router.get("/:id", getProductByID);

export default router;
