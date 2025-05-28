import Notification from "../models/notification.js";
import userActivity from "../models/userActivity.js";
import users from "../models/users.js";

// Create notification for activity
export const createActivityNotification = async (activity, recipientId, type) => {
  try {
    // Get sender and recipient details
    const sender = await users.findById(activity.user);
    const recipient = await users.findById(recipientId);

    if (!sender || !recipient) {
      console.error("Sender or recipient not found:", {
        senderId: activity.user,
        recipientId,
        activityId: activity._id
      });
      throw new Error("Sender or recipient not found");
    }

    let message = "";
    let link = null;
    let priority = "medium";

    switch (type) {
      case "one_to_one":
        message = `${sender.userName} had a one-to-one meeting with you`;
        link = `/activity/${activity._id}`;
        break;
      case "reference_received":
        message = `${sender.userName} received a reference from you`;
        link = `/activity/${activity._id}`;
        break;
      case "reference_given":
        message = `${sender.userName} gave you a reference`;
        link = `/activity/${activity._id}`;
        break;
      case "business_received":
        message = `${sender.userName} received business from you`;
        link = `/activity/${activity._id}`;
        priority = "high";
        break;
      case "business_given":
        message = `${sender.userName} gave you business`;
        link = `/activity/${activity._id}`;
        priority = "high";
        break;
      case "visitor":
        message = `${sender.userName} recorded ${activity.visitorCount} visitors`;
        link = `/activity/${activity._id}`;
        break;
      case "activity_pending_verification":
        message = `${sender.userName} created a new activity that needs your verification`;
        link = `/activity/pending-verifications`;
        priority = "high";
        break;
      case "activity_verified":
        message = `Your activity has been verified by ${sender.userName}`;
        link = `/activity/${activity._id}`;
        break;
      case "activity_rejected":
        message = `Your activity has been rejected by ${sender.userName}`;
        link = `/activity/${activity._id}`;
        priority = "high";
        break;
      case "investment_created":
        message = `${sender.userName} created a new investment`;
        link = `/investments/${activity._id}`;
        break;
      case "investment_funded":
        message = `${sender.userName} funded an investment`;
        link = `/investments/${activity._id}`;
        break;
      case "investment_completed":
        message = `Investment has been completed`;
        link = `/investments/${activity._id}`;
        break;
      case "withdrawal_requested":
        message = `${sender.userName} requested a withdrawal`;
        link = `/withdrawals/${activity._id}`;
        priority = "high";
        break;
      case "withdrawal_approved":
        message = `Your withdrawal request has been approved`;
        link = `/withdrawals/${activity._id}`;
        break;
      case "withdrawal_rejected":
        message = `Your withdrawal request has been rejected`;
        link = `/withdrawals/${activity._id}`;
        priority = "high";
        break;
      case "referral_completed":
        message = `New referral completed by ${activity.metadata.userName || sender.userName}`;
        link = `/referrals/${activity.metadata.referralId}`;
        break;
      case "thank_you_slip":
        message = activity.metadata.message;
        link = `/referrals/${activity.metadata.referralId}`;
        priority = "high";
        break;
      default:
        message = `${sender.userName} created a new activity`;
        link = `/activity/${activity._id}`;
    }

    const notification = new Notification({
      user: recipientId,
      sender: activity.user,
      type,
      message,
      link,
      priority,
      metadata: {
        activityId: activity._id,
        activityType: activity.activityType,
        content: activity.metadata.message || activity.metadata.content
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days expiry
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Get user's notifications
export const getUserNotifications = async (req, res) => {
  try {
    const { limit = 50, skip = 0, type } = req.query;
    const query = { user: req.user._id };

    if (type) {
      query.type = type;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate('sender', 'userName userImage');

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(req.user._id);

    res.status(200).json({
      notifications,
      total,
      unreadCount,
      hasMore: total > (parseInt(skip) + parseInt(limit))
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('sender', 'userName userImage');

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notification.markAsRead();
    res.status(200).json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Error marking notification as read" });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await Notification.markAllAsRead(req.user._id);
    res.status(200).json({ 
      message: "All notifications marked as read",
      updatedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Error marking all notifications as read" });
  }
};

// Get unread notifications count
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user._id);
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ message: "Error getting unread count" });
  }
}; 