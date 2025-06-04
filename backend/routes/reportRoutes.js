import express from 'express';
import { getNetworkStats, getChapterStats, getPlatformStats } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
    // console.log('Reports Route:', req.method, req.url);
    next();
});

// Get network statistics
router.get("/network-stats", protect, getNetworkStats);

// Get chapter statistics (for chapter creators)
router.get("/chapter-stats", protect, getChapterStats);

// Get platform statistics (for individual users)
router.get("/platform-stats", protect, getPlatformStats);

export default router;
