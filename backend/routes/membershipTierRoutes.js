import express from 'express';
import { getAllTiers, getUsersByTier, getMembershipHistoryByTier, updateTier } from '../controllers/membershipTierController.js';
import { protect, } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all membership tiers
router.get('/', getAllTiers);

// Get users by tier (including 'all' option)
router.get('/:tierId/users', protect, getUsersByTier);

// Get membership history by tier (protected)
router.get('/:tierId/history', protect, getMembershipHistoryByTier);

// Update membership tier (admin only)
router.put('/:tierId', protect, protect, updateTier);

export default router; 