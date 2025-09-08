import express from "express";
import { authenticateJwt, isSuperAdmin } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";
import {
  addFeatureBanner,
  createHomepageSection,
  deleteHomepageSection,
  fetchFeatureBanners,
  getHomepageSections,
  updateHomepageSection,
  updateFeatureBanner,
  deleteFeatureBanner,
} from "../controllers/settingsController";

const router = express.Router();

// This is a public route for clients to fetch active banners
router.get("/banners", fetchFeatureBanners);
// This is a protected admin route to add a new banner
router.post(
  "/banners/add",
  authenticateJwt,
  isSuperAdmin,
  upload.single("image"),
  addFeatureBanner
);
router.post(
  "/banners/update/:id",
  authenticateJwt,
  isSuperAdmin,
  upload.single("image"),
  updateFeatureBanner
);
router.post(
  "/banners/delete/:id",
  authenticateJwt,
  isSuperAdmin,
  deleteFeatureBanner
);

// Public route for clients to fetch all homepage sections
router.get("/homepage-sections", getHomepageSections);
// Protected admin route to create a new section
router.post(
  "/homepage-sections/create",
  authenticateJwt,
  isSuperAdmin,
  createHomepageSection
);
// Protected admin route to update an existing section
router.put(
  "/homepage-sections/update/:id",
  authenticateJwt,
  isSuperAdmin,
  updateHomepageSection
);
// Protected admin route to delete a section
router.delete(
  "/homepage-sections/delete/:id",
  authenticateJwt,
  isSuperAdmin,
  deleteHomepageSection
);

export default router;
