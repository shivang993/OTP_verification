import express from "express";
import register from "../controllers/userController.js";
import { verifyOTP } from "../controllers/userController.js";
import login from "../controllers/userController.js";
const router = express.Router();

// Register user
router.post("/register", register);

// Verify OTP
router.post("/verify-otp", verifyOTP);

// Login
router.post("/login", login);

export default router;
