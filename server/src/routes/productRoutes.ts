import expess from "express";
import {
  authenticateUser,
  authorizeAdmin,
  optionalAuthenticateUser,
} from "../middleware/authMiddleware";
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
  getAdminProductsPaginated,
  prepareProductFromUrl,
  createProductFromExternalJson,
  restoreProduct,
  hardDeleteProduct,
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

router.get(
  "/admin/list",
  authenticateUser,
  authorizeAdmin,
  getAdminProductsPaginated
);

router.put(
  "/:id",
  authenticateUser,
  authorizeAdmin,
  uploadImage.array("images", 10),
  updateProduct
);

router.delete("/:id", authenticateUser, authorizeAdmin, deleteProduct);

router.patch("/:id/restore", authenticateUser, authorizeAdmin, restoreProduct);

router.delete(
  "/:id/force",
  authenticateUser,
  authorizeAdmin,
  hardDeleteProduct
);

router.get("/filters", getProductFilters);

router.get(
  "/fetch-client-products",
  optionalAuthenticateUser,
  getProductsForClient
);
router.get("/slug/:slug", optionalAuthenticateUser, getProductBySlug);

router.post("/by-ids", getProductsByIds);
router.get("/:id", getProductByID);

router.post(
  "/prepare-from-url",
  authenticateUser,
  authorizeAdmin,
  prepareProductFromUrl
);
router.post(
  "/import-json",
  authenticateUser,
  authorizeAdmin,
  createProductFromExternalJson
);

export default router;
