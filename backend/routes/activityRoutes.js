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
    getActivityStats,
    getActivitiesByUserId
} from "../controllers/activityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected with authentication
router.use(protect);

// Get activities by user ID (must be before other routes to avoid conflicts)
router.get("/user/:userId", getActivitiesByUserId);

// Create a new activity
router.post("/", createActivity);

// Get user's activities
router.get("/user", getUserActivities);

// User entered activity routes
router.post("/userActivity", addUserActivity);
router.get("/userActivity", getManualActivities);
router.get("/pending-verifications", getPendingVerifications);
router.get("/rejected", getRejectedActivities);
router.put("/verify/:activityId", verifyActivity);
router.get("/stats", getActivityStats);

export default router;
