import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getCoupons, validateCoupon, createCoupon } from "../controllers/coupon.controller.js";
const router = express.Router();

router.get("/", protectRoute, getCoupons);
router.post("/validate", protectRoute, validateCoupon);
router.post("/create", protectRoute, createCoupon);

export default router;