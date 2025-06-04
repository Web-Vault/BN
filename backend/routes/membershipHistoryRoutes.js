import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getMembershipHistory,
  createMembershipHistory,
  updateMembershipStatus,
  getMembershipStats
} from '../controllers/membershipHistoryController.js';

const router = express.Router();

// Get user's membership history
router.get('/history', protect, getMembershipHistory);

// Create new membership history entry
router.post('/history', protect, createMembershipHistory);

// Update membership status
router.patch('/history/:membershipId/status', protect, updateMembershipStatus);

// Get membership statistics
router.get('/stats', protect, getMembershipStats);

export default router; 