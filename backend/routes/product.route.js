import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { getAllProducts, getFeaturedProducts, createProduct, getProductsByCategory, getRecommendationProducts, toggleFeaturedProduct, deleteProduct } from "../controllers/product.controller.js";
const router = express.Router();

router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendation", getRecommendationProducts);
router.post("/", protectRoute, adminRoute, createProduct);
router.put("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;