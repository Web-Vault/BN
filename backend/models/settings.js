import mongoose from 'mongoose';

const settingsSchema = mongoose.Schema(
  {
    // Notification Settings
    notifications: {
      type: Boolean,
      default: true,
    },
    emailAlerts: {
      type: Boolean,
      default: false,
    },
    darkMode: {
      type: Boolean,
      default: false,
    },
    language: {
      type: String,
      enum: ['en', 'es', 'fr', 'de'],
      default: 'en',
    },
    
    // Website Settings
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    allowUserRegistration: {
      type: Boolean,
      default: true,
    },
    enableComments: {
      type: Boolean,
      default: true,
    },
    maxUploadSize: {
      type: String,
      enum: ['5', '10', '20', '50'],
      default: '5',
    },
    
    // Admin Settings
    twoFactorAuth: {
      type: Boolean,
      default: false,
    },
    showAnalytics: {
      type: Boolean,
      default: true,
    },
    autoBackup: {
      type: Boolean,
      default: true,
    },
    
    // Security Settings
    loginAttempts: {
      type: String,
      enum: ['3', '5', '10'],
      default: '5',
    },
    ipRestriction: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create a single settings document
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const SettingsModel = mongoose.model('Settings', settingsSchema);

export default SettingsModel;

