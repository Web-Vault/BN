import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  purchaseMembership,
  verifyMembership,
  getMembershipDetails,
  verifyMembershipById,
  getMembershipHistory,
  cancelMembership,
  downgradeMembership,
  adminCancelMembership
} from '../controllers/membershipController.js';
import Membership from '../models/membership.js';

const router = express.Router();

// Purchase membership
router.post('/purchase', protect, purchaseMembership);

// Verify current user's membership status
router.get('/verify', protect, verifyMembership);

// Verify membership by ID
router.post('/verify-id', verifyMembershipById);

// Get user's membership history
router.get('/history', protect, getMembershipHistory);

// Get membership details
router.get('/details', protect, getMembershipDetails);

// Cancel membership
router.post('/cancel', protect, cancelMembership);

// Admin cancel user membership
router.post('/admin/cancel/:userId', protect, adminCancelMembership);

// Downgrade membership
router.post('/downgrade', protect, downgradeMembership);

export default router; 