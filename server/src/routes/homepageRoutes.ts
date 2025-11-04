import express from "express";
import { authenticateUser, authorizeAdmin } from "../middleware/authMiddleware";
import { uploadImage, uploadVideo } from "../middleware/uploadMiddleware";
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
  getVideoShowcaseItems,
  addVideoShowcaseItem,
  deleteVideoShowcaseItem,
  fetchCollectionByType,
} from "../controllers/homepageController";

const router = express.Router();

// --- Admin Routes (for management panel) ---
router.get(
  "/banners/admin",
  authenticateUser,
  authorizeAdmin,
  fetchBannersForAdmin
);
router.post(
  "/banners/add",
  authenticateUser,
  authorizeAdmin,
  uploadImage.array("images", 10),
  addFeatureBanner
);
router.put(
  "/banners/update/:id",
  authenticateUser,
  authorizeAdmin,
  uploadImage.fields([
    { name: "images[desktop]", maxCount: 1 },
    { name: "images[mobile]", maxCount: 1 },
  ]),
  updateFeatureBanner
);
router.delete(
  "/banners/delete/:id",
  authenticateUser,
  authorizeAdmin,
  deleteFeatureBanner
);
router.post(
  "/banners/reorder",
  authenticateUser,
  authorizeAdmin,
  reorderBanners
);
router.delete(
  "/banners/group/:groupName",
  authenticateUser,
  authorizeAdmin,
  deleteBannerGroup
);

// --- Client Routes (for public website) ---
router.get("/banners", fetchBannersForClient);
router.post("/banners/track-click/:id", trackBannerClick);

// --- Product Collection Routes ---
router.get("/collections", getProductCollections);
router.get("/collections/by-type", fetchCollectionByType);
router.post(
  "/collections/create",
  authenticateUser,
  authorizeAdmin,
  uploadImage.single("image"),
  createProductCollection
);
router.put(
  "/collections/update/:id",
  authenticateUser,
  authorizeAdmin,
  uploadImage.single("image"),
  updateProductCollection
);
router.delete(
  "/collections/delete/:id",
  authenticateUser,
  authorizeAdmin,
  deleteProductCollection
);
router.post(
  "/collections/reorder",
  authenticateUser,
  authorizeAdmin,
  reorderProductCollections
);

// --- Video Showcase Routes ---
router.get("/showcase", getVideoShowcaseItems);
router.post(
  "/showcase/add",
  authenticateUser,
  authorizeAdmin,
  uploadVideo.single("video"),
  addVideoShowcaseItem
);
router.delete(
  "/showcase/delete/:id",
  authenticateUser,
  authorizeAdmin,
  deleteVideoShowcaseItem
);

export default router;
