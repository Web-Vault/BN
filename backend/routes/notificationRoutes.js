import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount
} from "../controllers/notificationController.js";

const router = express.Router();

// Get user's notifications with pagination and filtering
router.get("/", protect, getUserNotifications);

// Get unread notifications count
router.get("/unread-count", protect, getUnreadCount);

// Mark a notification as read
router.put("/:id/read", protect, markNotificationAsRead);

// Mark all notifications as read
router.put("/read-all", protect, markAllNotificationsAsRead);

export default router; 