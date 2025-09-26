import express from "express";
import { authenticateUser, authorizeAdmin } from "../middleware/authMiddleware";
import {
  createSupplier,
  deleteSupplier,
  getAllSuppliers,
  updateSupplier,
} from "../controllers/supplierController";

const router = express.Router();

// All supplier routes require admin access
router.use(authenticateUser, authorizeAdmin);

router.get("/", getAllSuppliers);
router.post("/create", createSupplier);
router.put("/update/:id", updateSupplier);
router.delete("/delete/:id", deleteSupplier);

export default router;
