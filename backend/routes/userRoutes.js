import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
        registerUser,
        loginUser,
        onboarding,
        getProfile,
        getAllUser,
        getUserProfile,
        addBusinessInfo,
        removeBusinessInfo,
        updateProfile,
        updateBusinessInfo
} from "../controllers/userController.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/onboarding", protect, onboarding);
router.get("/profile", protect, getProfile);
router.get('/all', protect, getAllUser);
router.get("/:id", protect, getUserProfile);
router.post("/business/add", protect, addBusinessInfo);
router.delete("/business/remove", protect, removeBusinessInfo);
router.put("/profile/update", protect, updateProfile);
router.put("/business/update", protect, updateBusinessInfo);

export default router;
