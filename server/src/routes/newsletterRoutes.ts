import { Router } from "express";
import { subscribeToNewsletter } from "../controllers/newsletterController";

const router = Router();

router.post("/subscribe", subscribeToNewsletter);

export default router;
