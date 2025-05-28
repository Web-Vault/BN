import Activity from "../models/activity.js";
import userActivity from "../models/userActivity.js";
import users from "../models/users.js";
import { createActivityNotification } from "./notificationController.js";
import Notification from "../models/notification.js";

// auto generated activity controller function

export const createActivity = async (req, res) => {
        try {
                const { activityType, action, metadata } = req.body;

                const userId = req.user._id;

                if (!activityType || !action) {
                        return res.status(400).json({ message: "activityType and action are required" });
                }

                const activity = await Activity.create({
                        user: userId,
                        activityType,
                        action,
                        metadata: metadata || {},
                });

                res.status(201).json({ message: "Activity logged", activity });
        } catch (err) {
                console.error("❌ Error logging activity:", err);
                res.status(500).json({ message: "Server Error", error: err.message });
        }
};


export const getUserActivities = async (req, res) => {
        try {
                const userId = req.user._id;

                const activities = await Activity.find({ user: userId })
                        .sort({ createdAt: -1 })
                        .limit(100);

                res.status(200).json(activities);
        } catch (error) {
                console.error("❌ Error fetching user activities:", error);
                res.status(500).json({ message: "Server Error", error: error.message });
        }
};

// user generated activity controller functions

// ➕ Add new user activity
export const addUserActivity = async (req, res) => {
        try {
                const {
                        content,
                        type,
                        typeContent,
                        date,
                        rating,
                        visitorCount,
                        businessAmount,
                        referenceDetails,
                        relatedUser,
                        meetingLocation,
                        meetingDuration,
                        businessCategory,
                        referralStatus,
                        businessStatus,
                        visitorType,
                        eventType
                } = req.body;

                if (!relatedUser) {
                        return res.status(400).json({ message: "Related user is required" });
                }

                // Create new activity
                const newActivity = new userActivity({
                        userId: req.user.id,
                        content,
                        type,
                        typeContent,
                        date,
                        rating,
                        visitorCount,
                        businessAmount,
                        referenceDetails,
                        relatedUser,
                        meetingLocation,
                        meetingDuration,
                        businessCategory,
                        referralStatus,
                        businessStatus,
                        visitorType,
                        eventType,
                        status: "pending",
                        isVerified: false,
                        visibility: "public"
                });

                await newActivity.save();

                // Create notification for activity verification
                const notification = new Notification({
                        user: relatedUser,
                        sender: req.user.id,
                        type: "activity_pending_verification",
                        message: `New ${type} activity pending verification`,
                        metadata: {
                                activityId: newActivity._id,
                                activityType: type,
                                content: content
                        }
                });

                await notification.save();

                res.status(201).json(newActivity);
        } catch (err) {
                console.error("❌ Error adding user activity:", err);
                res.status(500).json({ msg: "Server Error" });
        }
};

// Get user's manual activities with time period filter
export const getManualActivities = async (req, res) => {
    try {
        const { timePeriod = 'overall' } = req.query;
        const userId = req.user.id;

        // Calculate date range based on time period
        let startDate, endDate = new Date();
        
        switch (timePeriod) {
            case 'today':
                startDate = new Date();
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'thisWeek':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - startDate.getDay());
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'lastWeek':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - startDate.getDay() - 7);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 6);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'lastMonth':
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 1);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'overall':
            default:
                startDate = new Date(0); // Beginning of time
                break;
        }

        // Build query to find activities where:
        // 1. User is the creator AND activity is verified, OR
        // 2. User is the related user AND activity is verified
        const query = {
            $or: [
                {
                    userId: userId,
                    status: "verified"
                },
                {
                    relatedUser: userId,
                    status: "verified"
                }
            ]
        };

        // Add date filter if not 'overall'
        if (timePeriod !== 'overall') {
            query.createdAt = {
                $gte: startDate,
                $lte: endDate
            };
        }

        const activities = await userActivity.find(query)
            .populate('userId', 'userName userImage')
            .populate('relatedUser', 'userName userImage')
            .sort({ createdAt: -1 });

        res.json(activities);
    } catch (error) {
        console.error('Error in getManualActivities:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching activities',
            error: error.message
        });
    }
};

// Get pending activities for verification
export const getPendingVerifications = async (req, res) => {
    try {
        const activities = await userActivity.find({
            relatedUser: req.user.id,
            status: "pending"
        })
        .sort({ createdAt: -1 })
        .populate('userId', 'userName userImage')
        .populate('relatedUser', 'userName userImage');

        res.json(activities);
    } catch (error) {
        console.error("❌ Error fetching pending verifications:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch pending verifications",
            error: error.message 
        });
    }
};

// Get rejected activities
export const getRejectedActivities = async (req, res) => {
    try {
        const activities = await userActivity.find({
            $or: [
                { userId: req.user.id },
                { relatedUser: req.user.id }
            ],
            status: "rejected"
        })
        .sort({ createdAt: -1 })
        .populate('userId', 'userName userImage')
        .populate('relatedUser', 'userName userImage')
        .populate('verifiedBy', 'userName userImage');

        res.json(activities);
    } catch (error) {
        console.error("❌ Error fetching rejected activities:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch rejected activities",
            error: error.message 
        });
    }
};

// Verify an activity
export const verifyActivity = async (req, res) => {
        try {
                const { activityId } = req.params;
                const { isVerified, verificationNotes } = req.body;

                // Find activity where current user is the related user (not the creator)
                const activity = await userActivity.findOne({
                        _id: activityId,
                        relatedUser: req.user._id, // Only the related user can verify
                        status: "pending"
                });

                if (!activity) {
                        return res.status(404).json({ 
                                message: "Activity not found or you are not authorized to verify this activity" 
                        });
                }

                // Prevent creator from verifying their own activity
                if (activity.userId.toString() === req.user._id.toString()) {
                        return res.status(403).json({ 
                                message: "Activity creator cannot verify their own activity" 
                        });
                }

                activity.status = isVerified ? "verified" : "rejected";
                activity.isVerified = isVerified;
                activity.verifiedBy = req.user._id;
                activity.verificationDate = new Date();
                activity.verificationNotes = verificationNotes;
                activity.visibility = isVerified ? "public" : "private";

                await activity.save();

                // Create notification for activity owner
                await createActivityNotification(
                        activity,
                        activity.userId,
                        isVerified ? "activity_verified" : "activity_rejected"
                );

                res.status(200).json(activity);
        } catch (error) {
                console.error("❌ Error verifying activity:", error);
                res.status(500).json({ message: "Failed to verify activity" });
        }
};

// Get activity statistics
export const getActivityStats = async (req, res) => {
        try {
                const userId = req.user._id;
                const stats = await userActivity.aggregate([
                        {
                                $match: {
                                        userId: userId,
                                        status: "verified"
                                }
                        },
                        {
                                $group: {
                                        _id: "$type",
                                        count: { $sum: 1 },
                                        totalBusinessAmount: {
                                                $sum: {
                                                        $cond: [
                                                                { $in: ["$type", ["Business Received", "Business Given"]] },
                                                                "$businessAmount",
                                                                0
                                                        ]
                                                }
                                        },
                                        totalVisitors: {
                                                $sum: {
                                                        $cond: [
                                                                { $eq: ["$type", "Visitors"] },
                                                                "$visitorCount",
                                                                0
                                                        ]
                                                }
                                        }
                                }
                        }
                ]);

                res.status(200).json(stats);
        } catch (error) {
                console.error("❌ Error fetching activity stats:", error);
                res.status(500).json({ message: "Failed to fetch activity statistics" });
        }
};