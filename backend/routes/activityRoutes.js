// routes/activityRoutes.js
import express from "express";
import { getManualActivities, createActivity, getUserActivities, addUserActivity } from "../controllers/activityController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
// auto generated activity routes
router.post("/", protect, createActivity); // POST /api/activity
router.get("/my", protect, getUserActivities); // GET /api/activity/my

// user entered activity routes
// Add these:
router.post("/userActivity", protect, addUserActivity);
router.get("/userActivity", protect, getManualActivities); 

export default router;
