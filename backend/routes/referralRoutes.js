import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import users from "../models/users.js";
import Referral from "../models/Referral.js";
import Activity from "../models/activity.js";
import { createActivityNotification } from "../controllers/notificationController.js";

const router = express.Router();

// Get user's referral code and stats
router.get("/my-referrals", protect, async (req, res) => {
  try {
    // console.log("🔹 Fetching referrals for user:", req.user.id);
    const user = await users.findById(req.user.id)
      .select('referralCode');

    if (!user) {
      // console.log("❌ User not found");
      return res.status(404).json({ msg: "User not found" });
    }

    // console.log("✅ Found user with referral code:", user.referralCode);

    const referrals = await Referral.find({ referrer: req.user.id })
      .populate('referredUser', 'userName userEmail')
      .sort({ createdAt: -1 });

    // console.log("✅ Found referrals:", referrals.length);

    const stats = {
      totalReferrals: referrals.length,
      completedReferrals: referrals.filter(r => r.status === 'completed').length,
      pendingReferrals: referrals.filter(r => r.status === 'pending').length,
      totalEarnings: referrals.reduce((sum, r) => sum + r.rewardAmount, 0),
      referralCode: user.referralCode
    };

    // console.log("✅ Sending response with stats:", stats);
    res.json({ stats, referrals });
  } catch (err) {
    console.error("❌ Error in my-referrals:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// Get referral earnings
router.get("/earnings", protect, async (req, res) => {
  try {
    const referrals = await Referral.find({ 
      referrer: req.user.id,
      status: "completed"
    })
    .populate('referredUser', 'userName userEmail')
    .sort({ completedAt: -1 });

    // Transform the data to match the expected format in the frontend
    const earnings = referrals.map(referral => ({
      _id: referral._id,
      amount: referral.rewardAmount,
      status: referral.status,
      completedAt: referral.completedAt,
      referredUser: referral.referredUser
    }));

    res.json(earnings);
  } catch (err) {
    console.error("❌ Error fetching referral earnings:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// Apply referral code during registration
router.post("/apply-code", async (req, res) => {
  try {
    const { referralCode, userId } = req.body;

    // Find referrer
    const referrer = await users.findOne({ referralCode });
    if (!referrer) {
      return res.status(404).json({ msg: "Invalid referral code" });
    }

    // Find user to be referred
    const user = await users.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if user already has a referral
    const existingReferral = await Referral.findOne({ referredUser: userId });
    if (existingReferral) {
      return res.status(400).json({ msg: "User already has a referral" });
    }

    // Create new referral
    const referral = new Referral({
      referrer: referrer._id,
      referredUser: user._id,
      referralCode: referralCode
    });

    await referral.save();

    // Create activity for the referred user
    const referralActivity = await new Activity({
      user: user._id,
      activityType: "referral",
      action: "referral_received",
      metadata: {
        referralId: referral._id,
        referrerId: referrer._id,
        referrerName: referrer.userName,
        referralCode: referralCode,
        status: "pending",
        task: "Complete your first investment to earn rewards for your referrer"
      }
    }).save();

    // Create notification for the referred user
    await createActivityNotification(referralActivity, user._id, "referral_received");

    res.json({ 
      msg: "Referral code applied successfully", 
      referral,
      activity: referralActivity 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// Get top referrers (admin only)
router.get("/top-referrers", protect, async (req, res) => {
  try {
    const user = await users.findById(req.user.id);
    if (!user.isAdmin) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    const topReferrers = await Referral.aggregate([
      {
        $group: {
          _id: "$referrer",
          totalReferrals: { $sum: 1 },
          completedReferrals: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          },
          totalEarnings: { $sum: "$rewardAmount" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          _id: 1,
          userName: "$user.userName",
          userEmail: "$user.userEmail",
          totalReferrals: 1,
          completedReferrals: 1,
          totalEarnings: 1
        }
      },
      {
        $sort: { totalEarnings: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json(topReferrers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// Update referral reward settings (admin only)
router.put("/reward-settings", protect, async (req, res) => {
  try {
    const user = await users.findById(req.user.id);
    if (!user.isAdmin) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    const { rewardType, rewardValue } = req.body;

    // Update all pending referrals
    await Referral.updateMany(
      { status: 'pending' },
      { 
        rewardType,
        rewardValue
      }
    );

    res.json({ msg: "Reward settings updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

export default router; 