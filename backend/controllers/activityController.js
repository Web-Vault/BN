import Activity from "../models/activity.js";
import userActivity from "../models/userActivity.js";

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
                const { content, type, typeContent, date, rating } = req.body;

                const activity = new userActivity({
                        userId: req.user._id,
                        content,
                        type,
                        typeContent,
                        date,
                        rating,
                });

                const savedActivity = await activity.save();
                res.status(201).json(savedActivity);
        } catch (error) {
                console.error("❌ Error adding user activity:", error);
                res.status(500).json({ message: "Failed to add user activity" });
        }
};

// 📄 Get all user-created activities (for logged-in user)
export const getManualActivities = async (req, res) => {
        try {
                const activities = await userActivity.find({ userId: req.user._id }).sort({ createdAt: -1 });
                // console.log("manual activities: ", activities);
                res.status(200).json(activities);
        } catch (error) {
                console.error("❌ Error fetching user activities:", error);
                res.status(500).json({ message: "Server Error", error: error.message });
        }
};