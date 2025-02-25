import express from "express";
import {
  createCheckoutSession,
  getCourseDetailWithPurchaseStatus,
  getAllPurchasedCourses,
  verifyPayment,
  getDashboardStats
} from "../controllers/coursePurchase.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import checkPurchaseAccess from "../middlewares/checkPurchaseAccess.js";
import isInstructor from "../middlewares/isInstructor.js";

const router = express.Router();

// Public routes (still need authentication)
router.get("/course/:courseId/detail-with-status", isAuthenticated, getCourseDetailWithPurchaseStatus);

// Purchase-related routes
router.post("/checkout/create-checkout-session", isAuthenticated, createCheckoutSession);
router.get("/verify/:tx_ref", isAuthenticated, verifyPayment);

// Protected routes requiring purchase
router.get("/", isAuthenticated, getAllPurchasedCourses);
router.get("/course/:courseId/content", isAuthenticated, checkPurchaseAccess, (req, res) => {
  // This route will only be accessible if the user has purchased the course
  res.json({ success: true, purchase: req.purchase });
});

// Admin routes
router.get("/admin/stats", isAuthenticated, isInstructor, getDashboardStats);

export default router;