import express from "express";
import { authenticateJwt, isSuperAdmin } from "../middleware/authMiddleware";
import { uploadImage } from "../middleware/uploadMiddleware";
import {
  addFeatureBanner,
  updateFeatureBanner,
  deleteFeatureBanner,
  reorderBanners,
  deleteBannerGroup,
  fetchBannersForAdmin,
  fetchBannersForClient,
  trackBannerClick,
  getProductCollections,
  createProductCollection,
  updateProductCollection,
  deleteProductCollection,
  reorderProductCollections,
} from "../controllers/homepageController";

const router = express.Router();

// --- Admin Routes (for management panel) ---
router.get(
  "/banners/admin",
  authenticateJwt,
  isSuperAdmin,
  fetchBannersForAdmin
);
router.post(
  "/banners/add",
  authenticateJwt,
  isSuperAdmin,
  uploadImage.array("images", 10),
  addFeatureBanner
);
router.put(
  "/banners/update/:id",
  authenticateJwt,
  isSuperAdmin,
  uploadImage.fields([
    { name: "images[desktop]", maxCount: 1 },
    { name: "images[mobile]", maxCount: 1 },
  ]),
  updateFeatureBanner
);
router.delete(
  "/banners/delete/:id",
  authenticateJwt,
  isSuperAdmin,
  deleteFeatureBanner
);
router.post("/banners/reorder", authenticateJwt, isSuperAdmin, reorderBanners);
router.delete(
  "/banners/group/:groupName",
  authenticateJwt,
  isSuperAdmin,
  deleteBannerGroup
);

// --- Client Routes (for public website) ---
router.get("/banners", fetchBannersForClient);
router.post("/banners/track-click/:id", trackBannerClick);

// --- Product Collection Routes ---
router.get("/collections", getProductCollections);
router.post(
  "/collections/create",
  authenticateJwt,
  isSuperAdmin,
  uploadImage.single("image"),
  createProductCollection
);
router.put(
  "/collections/update/:id",
  authenticateJwt,
  isSuperAdmin,
  uploadImage.single("image"),
  updateProductCollection
);
router.delete(
  "/collections/delete/:id",
  authenticateJwt,
  isSuperAdmin,
  deleteProductCollection
);
router.post(
  "/collections/reorder",
  authenticateJwt,
  isSuperAdmin,
  reorderProductCollections
);

export default router;
