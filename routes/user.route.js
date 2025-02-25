import express from "express";
import { 
  getUserProfile, 
  login, 
  logout, 
  register, 
  updateProfile, 
  requestPasswordReset, 
  resetPassword 
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/profile/update").put(isAuthenticated, upload.single("profilePhoto"), updateProfile);
router.route("/password-reset/request").post(requestPasswordReset);
router.route("/password-reset/reset").post(resetPassword);

export default router;