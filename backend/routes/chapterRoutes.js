// routes/chapterRoutes.js
import express from 'express';
import { getAllChapters, joinChapter, getChapterById, addChapterPost, acceptJoinRequest, rejectJoinRequest, removeMemberFromChapter, createChapter } from '../controllers/chapterController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllChapters);
router.post('/create', protect, createChapter);
router.post("/join/:chapterId", protect, joinChapter);
router.get("/:id", protect, getChapterById);

router.post("/:id/posts", protect, addChapterPost);

router.post("/accept/:chapterId/:userId", protect, acceptJoinRequest);
router.post("/reject/:chapterId/:userId", protect, rejectJoinRequest);
router.post("/remove-member", protect, removeMemberFromChapter);

export default router;
