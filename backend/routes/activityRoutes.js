// routes/activityRoutes.js
import express from "express";
import { 
    createActivity, 
    getUserActivities, 
    addUserActivity, 
    getManualActivities,
    getPendingVerifications,
    getRejectedActivities,
    verifyActivity,
    getActivityStats
} from "../controllers/activityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
// auto generated activity routes
router.post("/", protect, createActivity); // POST /api/activity
router.get("/user", protect, getUserActivities); // GET /api/activity/user

// user entered activity routes
// Add these:
router.post("/userActivity", protect, addUserActivity);
router.get("/userActivity", protect, getManualActivities);
router.get("/pending-verifications", protect, getPendingVerifications);
router.get("/rejected", protect, getRejectedActivities);
router.put("/verify/:activityId", protect, verifyActivity);
router.get("/stats", protect, getActivityStats);

export default router;
