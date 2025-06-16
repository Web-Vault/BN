// routes/chapterRoutes.js
import express from 'express';
import { getAllChapters, joinChapter, getChapterById, addChapterPost, acceptJoinRequest, rejectJoinRequest, removeMemberFromChapter, createChapter, checkChapterExists, deleteChapter, updateChapter, deleteChapterPost } from '../controllers/chapterController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllChapters);
router.get('/check-exists', protect, checkChapterExists);
router.post('/create', protect, createChapter);
router.post("/join/:chapterId", protect, joinChapter);
router.get("/:id", protect, getChapterById);

router.post("/:id/posts", protect, addChapterPost);
router.delete("/:id/posts/:postId", protect, deleteChapterPost);

router.post("/accept/:chapterId/:userId", protect, acceptJoinRequest);
router.post("/reject/:chapterId/:userId", protect, rejectJoinRequest);
router.post("/remove-member", protect, removeMemberFromChapter);

router.delete("/:id", protect, deleteChapter);

router.put("/:id", protect, updateChapter);

export default router;
