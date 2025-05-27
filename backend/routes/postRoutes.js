import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createPost,
  getPosts,
  getPostById,
  toggleLike,
  deletePost,
  addComment,
  deleteComment,
  addReply,
  deleteReply
} from '../controllers/postController.js';

const router = express.Router();

// All routes are protected with authentication
router.use(protect);

// Create a new post/announcement
router.post('/', createPost);

// Get all posts/announcements (with optional filters)
router.get('/', getPosts);

// Get a single post by ID
router.get('/:id', getPostById);

// Like/Unlike a post
router.post('/:id/like', toggleLike);

// Delete a post
router.delete('/:id', deletePost);

// Comment routes
router.post('/:id/comments', addComment);
router.delete('/:id/comments/:commentId', deleteComment);

// Reply routes
router.post('/:id/comments/:commentId/replies', addReply);
router.delete('/:id/comments/:commentId/replies/:replyId', deleteReply);

export default router; 