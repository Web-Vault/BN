import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
        registerUser,
        loginUser,
        onboarding,
        getProfile,
        getAllUser,
        getUserProfile
} from "../controllers/userController.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/onboarding", protect, onboarding);
router.get("/profile", protect, getProfile);
router.get('/all', protect, getAllUser);
router.get("/:id", protect, getUserProfile);


export default router;
