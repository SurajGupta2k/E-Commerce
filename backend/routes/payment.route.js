import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createCheckoutSession, handleWebhook, getPaymentStatus } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-checkout-session", protectRoute, createCheckoutSession);
router.post("/webhook", handleWebhook);
router.get("/status/:orderId", protectRoute, getPaymentStatus);

export default router;