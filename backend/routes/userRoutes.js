import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
        registerUser,
        loginUser,
        onboarding,
        getAllUser,
        getProfile,
        getUserProfile,
        addBusinessInfo,
        removeBusinessInfo,
        updateProfile,
        updateBusinessInfo,
        verifyOTP,
        resendOTP,
        verifyMobileOTP,
        resendMobileOTP,
        searchUsers,
        deleteUser
} from "../controllers/userController.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

// Protected routes
router.post("/onboarding", protect, onboarding);
router.get("/all", protect, getAllUser);
router.get("/profile", protect, getProfile);
router.get("/search", protect, searchUsers);
router.get("/:id", protect, getUserProfile);
router.post("/business/add", protect, addBusinessInfo);
router.delete("/business", protect, removeBusinessInfo);
router.put("/profile", protect, updateProfile);
router.put("/business", protect, updateBusinessInfo);
router.post("/verify-mobile", protect, verifyMobileOTP);
router.post("/resend-mobile-otp", protect, resendMobileOTP);
router.delete("/:id", protect, deleteUser);

export default router;
