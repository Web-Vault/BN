import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import SettingsModel from '../models/settings.js';

const router = express.Router();

// Public endpoint to check maintenance mode
router.get('/maintenance', async (req, res) => {
  try {
    const settings = await SettingsModel.getSettings();
    res.json({ maintenanceMode: settings.maintenanceMode });
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    res.status(500).json({ message: error.message });
  }
});

// Public endpoint to check registration status
router.get('/registration', async (req, res) => {
  try {
    const settings = await SettingsModel.getSettings();
    res.json({ allowUserRegistration: settings.allowUserRegistration });
  } catch (error) {
    console.error('Error checking registration status:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all settings
router.get('/', protect, admin, async (req, res) => {
  try {
    const settingsData = await SettingsModel.getSettings();
    res.json(settingsData);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update all settings
router.put('/', protect, admin, async (req, res) => {
  try {
    const settings = await SettingsModel.getSettings();
    
    // Only update fields that are provided in the request
    Object.keys(req.body).forEach(key => {
      if (settings[key] !== undefined) {
        settings[key] = req.body[key];
      }
    });

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update a specific setting
router.patch('/:setting', protect, admin, async (req, res) => {
  try {
    const { setting } = req.params;
    const { value } = req.body;

    // Validate that the setting exists
    const settings = await SettingsModel.getSettings();
    if (settings[setting] === undefined) {
      return res.status(400).json({ message: 'Invalid setting' });
    }

    // Update the specific setting
    settings[setting] = value;
    await settings.save();

    res.json(settings);
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;

