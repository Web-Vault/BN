import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createEvent,
  deleteEvent,
  bookEvent,
  getChapterEvents,
  getEventDetails,
  updateEvent
} from "../controllers/eventController.js";

const router = express.Router();

// Create event
router.post("/chapters/:chapterId/events", protect, createEvent);

// Delete event
router.delete("/chapters/:chapterId/events/:eventId", protect, deleteEvent);

// Book event
router.post("/chapters/:chapterId/events/:eventId/book", protect, bookEvent);

// Get chapter events
router.get("/chapters/:chapterId/events", protect, getChapterEvents);

// Get event details
router.get("/events/:eventId", protect, getEventDetails);

// Update event
router.put("/chapters/:chapterId/events/:eventId", protect, updateEvent);

export default router; 