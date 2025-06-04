import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createMeeting,
  getChapterMeetings,
  deleteMeeting,
  updateMeeting,
  updateAllMeetingStatuses,
  updateMeetingStatus,
  joinMeeting,
  leaveMeeting,
  getMeetingAttendance
} from "../controllers/meetingController.js";

const router = express.Router();

// Create a new meeting
router.post("/chapters/:chapterId/meetings", protect, createMeeting);

// Get all meetings for a chapter
router.get("/chapters/:chapterId/meetings", protect, getChapterMeetings);

// Delete a meeting
router.delete("/chapters/:chapterId/meetings/:meetingId", protect, deleteMeeting);

// Update a meeting
router.patch("/chapters/:chapterId/meetings/:meetingId", protect, updateMeeting);

// Update all meeting statuses
router.post("/meetings/update-statuses", protect, updateAllMeetingStatuses);

// Update meeting status
router.patch("/chapters/:chapterId/meetings/:meetingId/status", protect, updateMeetingStatus);

// Join a meeting
router.post("/chapters/:chapterId/meetings/:meetingId/join", protect, joinMeeting);

// Leave a meeting
router.post("/chapters/:chapterId/meetings/:meetingId/leave", protect, leaveMeeting);

// Get meeting attendance
router.get("/chapters/:chapterId/meetings/:meetingId/attendance", protect, getMeetingAttendance);

export default router; 