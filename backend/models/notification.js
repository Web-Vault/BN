import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "investment_created",
        "investment_funded",
        "investment_completed",
        "withdrawal_requested",
        "withdrawal_approved",
        "withdrawal_rejected",
        "referral_completed",
        "referral_received",
        "activity_pending_verification",
        "activity_verified",
        "activity_rejected",
        "one_to_one",
        "reference_received",
        "reference_given",
        "business_received",
        "business_given",
        "visitor",
        "thank_you_slip",
        "membership_purchased"
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    link: {
      type: String,
      default: null
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium"
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && new Date() > this.expiresAt;
});

// Method to mark notification as read
notificationSchema.methods.markAsRead = async function() {
  this.read = true;
  return this.save();
};

// Static method to mark all notifications as read for a user
notificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    { user: userId, read: false },
    { $set: { read: true } }
  );
};

// Static method to get unread count for a user
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ user: userId, read: false });
};

export default mongoose.model("Notification", notificationSchema);

