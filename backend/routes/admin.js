import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import users from '../models/users.js';
import bcrypt from 'bcryptjs';
import { backupDatabase } from '../controllers/adminController.js';

const router = express.Router();

// Get current admin
router.get('/current', protect, admin, async (req, res) => {
  try {
    const admin = await users.findById(req.user._id).select('-userPassword');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all admins
router.get('/all', protect, admin, async (req, res) => {
  try {
    const admins = await users.find({ isAdmin: true })
      .select('-userPassword')
      .sort({ createdAt: -1 });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update admin profile
router.put('/profile', protect, admin, async (req, res) => {
  try {
    const { userName, currentPassword, newPassword } = req.body;
    const admin = await users.findById(req.user._id);

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set new password' });
      }

      // Get the stored password (check both field names)
      const storedPassword = admin.password || admin.userPassword;
      if (!storedPassword) {
        return res.status(400).json({ message: 'Password not found for this account' });
      }

      try {
        const isMatch = await bcrypt.compare(currentPassword, storedPassword);
        if (!isMatch) {
          return res.status(400).json({ message: 'Current password is incorrect' });
        }
      } catch (error) {
        console.error('Password comparison error:', error);
        return res.status(400).json({ message: 'Error verifying current password' });
      }

      try {
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        // Update both password fields to ensure consistency
        admin.password = hashedPassword;
        admin.userPassword = hashedPassword;
      } catch (error) {
        console.error('Password hashing error:', error);
        return res.status(400).json({ message: 'Error hashing new password' });
      }
    }

    // Update username if provided
    if (userName) {
      admin.userName = userName;
    }

    try {
      // Save the updated admin
      const updatedAdmin = await admin.save();

      // Return the updated admin data (excluding password)
      res.json({
        _id: updatedAdmin._id,
        userName: updatedAdmin.userName,
        userEmail: updatedAdmin.userEmail,
        isAdmin: updatedAdmin.isAdmin,
        createdAt: updatedAdmin.createdAt,
        updatedAt: updatedAdmin.updatedAt
      });
    } catch (error) {
      console.error('Save error:', error);
      return res.status(500).json({ message: 'Error saving profile updates' });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile. Please try again.' });
  }
});

// Backup database (admin only)
router.get('/backup', protect, admin, backupDatabase);

export default router; 