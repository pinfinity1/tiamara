import { Router } from "express";
import { getActiveShippingMethods } from "../controllers/shippingController";

const router = Router();

router.get("/", getActiveShippingMethods);

export default router;
