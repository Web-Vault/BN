// routes/investmentRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Investment from "../models/investment.js";
import users from "../models/users.js";
import Withdrawal from "../models/Withdrawal.js";
import Referral from "../models/Referral.js";
import Activity from "../models/activity.js";
import { createActivityNotification } from "../controllers/notificationController.js";
import User from "../models/users.js";
// import InvestmentRequest from "../models/investmentRequest.js";

const router = express.Router();

// Create investment request (Seeker or Enterprise member)
router.post("/", protect, async (req, res) => {
  try {
    const user = await users.findById(req.user.id);
    
    // Check if user is either a seeker or has Enterprise membership
    const isEnterpriseMember = user.membership && user.membership.tier === "Enterprise";
    if (!user.isSeeker && !isEnterpriseMember) {
      return res
        .status(403)
        .json({ msg: "Only seekers or Enterprise members can create investments" });
    }

    // console.log("🔍 Investment details:", req.body);
    const newInvestment = new Investment({
      ...req.body,
      seeker: req.user.id,
    });

    await newInvestment.save();

    // Create activity for new investment request
    await new Activity({
      user: req.user.id,
      activityType: "investment",
      action: "Investment created",
      metadata: {
        investmentId: newInvestment._id,
        title: newInvestment.title,
        amount: newInvestment.amount,
        type: newInvestment.type,
        returns: newInvestment.returns,
        deadline: newInvestment.deadline
      }
    }).save();

    res.status(201).json(newInvestment);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// Get all investments (Admin only)
router.get("/admin/all", protect, async (req, res) => {
  try {
    const user = await users.findById(req.user.id);
    
    // Check if user is admin
    // if (!user.isAdmin) {
    //   return res.status(403).json({ 
    //     msg: "Access denied. Only administrators can view all investments." 
    //   });
    // }

    // Fetch all investments with populated fields
    const investments = await Investment.find()
      .populate({
        path: "seeker",
        select: "userName userEmail industry"
      })
      .populate({
        path: "investors.user",
        select: "userName userEmail"
      })
      .sort({ createdAt: -1 });

    // console.log('Admin fetched investments:', investments.length);
    res.json(investments);
  } catch (err) {
    console.error("Error fetching all investments:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// Get all active investments (Investors only)
router.get("/", protect, async (req, res) => {
  try {
    const user = await users.findById(req.user.id);

    if (user.isSeeker) {
      // If user is seeker, get their funding requests with investor details
      const requests = await Investment.find({ seeker: req.user.id }).populate({
        path: "investors.user",
        select: "userName userEmail",
      });
      return res.json(requests);
    }

    // For investors, show available investment opportunities
    const investments = await Investment.find({ status: "open" }).populate(
      "seeker",
      "userName userEmail industry"
    );
    res.json(investments);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// Invest in an opportunity
router.post("/:id/invest", protect, async (req, res) => {
  try {
    const user = await users.findById(req.user.id);
    if (user.isSeeker) {
      return res.status(403).json({ msg: "Seekers cannot invest" });
    }

    const investment = await Investment.findById(req.params.id);
    if (!investment || investment.status !== "open") {
      return res.status(400).json({ msg: "Invalid investment" });
    }

    // Check if deadline has passed
    if (new Date(investment.deadline) < new Date()) {
      return res.status(400).json({ msg: "Investment deadline has passed" });
    }

    const investmentAmount = req.body.amount;

    // Check if total funding would exceed the goal
    const currentTotalFunding = investment.currentFunding;
    if (currentTotalFunding + investmentAmount > investment.amount) {
      return res.status(400).json({
        msg: "Exceeds funding goal",
        details: {
          currentFunding: currentTotalFunding,
          requestedAmount: investmentAmount,
          remainingAmount: investment.amount - currentTotalFunding,
        },
      });
    }

    // Check if user already has an investment
    const existingInvestment = investment.investors.find(
      (inv) => inv.user.toString() === req.user.id
    );

    if (existingInvestment) {
      // Update existing investment amount
      existingInvestment.amount += investmentAmount;
    } else {
      // Add new investment
      investment.investors.push({
        user: req.user.id,
        amount: investmentAmount,
      });
    }

    // Update total funding
    investment.currentFunding += investmentAmount;

    // Check if investment is fully funded
    if (investment.currentFunding >= investment.amount) {
      investment.status = "funded";
    }

    await investment.save();

    // Create activity for investment
    await new Activity({
      user: req.user.id,
      activityType: "investment",
      action: "invested",
      metadata: {
        investmentId: investment._id,
        investmentTitle: investment.title,
        amount: investmentAmount,
        type: investment.type
      }
    }).save();

    // Handle referral completion
    try {
      const pendingReferrals = await Referral.find({
        referredUser: req.user.id,
        status: "pending",
      });

      // Complete each pending referral
      for (const referral of pendingReferrals) {
        try {
          await referral.complete(investmentAmount);
          
          // Get referrer user details
          const referrerUser = await users.findById(referral.referrer);
          const referredUser = await users.findById(req.user.id);
          
          if (!referrerUser || !referredUser) {
            throw new Error("Referrer or referred user not found");
          }

          // Create activity for referral completion
          const referralActivity = await new Activity({
            user: referral.referrer,
            activityType: "referral",
            action: "completed",
            metadata: {
              referralId: referral._id,
              referredUser: req.user.id,
              rewardAmount: referral.rewardAmount,
              investmentAmount: investmentAmount,
              userName: referredUser.userName // Add user name for notification
            }
          }).save();

          // Create notification for referral completion
          await createActivityNotification(referralActivity, referral.referrer, "referral_completed");

          // Create thank you slip activity
          const thankYouActivity = await new Activity({
            user: referral.referrer,
            activityType: "referral",
            action: "thank_you_slip",
            metadata: {
              referralId: referral._id,
              referredUser: req.user.id,
              rewardAmount: referral.rewardAmount,
              investmentAmount: investmentAmount,
              message: `Thank you for referring ${referredUser.userName}! Your referral reward of ${referral.rewardAmount} has been credited to your account.`
            }
          }).save();

          // Create notification for thank you slip
          await createActivityNotification(thankYouActivity, referral.referrer, "thank_you_slip");
        } catch (error) {
          console.error(
            `❌ Error completing referral ${referral._id}:`,
            error.message
          );
        }
      }
    } catch (referralError) {
      console.error("❌ Error handling referrals:", referralError.message);
    }

    res.json(investment);
  } catch (err) {
    console.error("❌ Investment error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   GET /api/investments/my-requests
// @desc    Get funding requests created by the user (for seekers and Enterprise members)
// @access  Private
router.get("/my-requests", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('membership');
    
    // Check if user is either seeker or Enterprise member
    const canAccessSeekerFeatures = user.isSeeker || (user.membership && user.membership.tier === "Enterprise");
    
    if (!canAccessSeekerFeatures) {
      return res.status(403).json({ 
        msg: "Access denied. Only seekers or Enterprise members can view their funding requests." 
      });
    }

    // Find all funding requests created by this user using the Investment model
    const requests = await Investment.find({ seeker: req.user.id })
      .populate({
        path: 'seeker',
        select: 'name email membership',
        populate: {
          path: 'membership',
          select: 'tier'
        }
      })
      .populate({
        path: 'investors.user',
        select: 'name email'
      })
      .sort({ createdAt: -1 });

    // Calculate expected returns for each request
    const requestsWithReturns = requests.map(request => {
      const requestObj = request.toObject();
      
      // Calculate total invested amount
      requestObj.totalInvested = request.currentFunding;
      
      // Calculate expected returns based on investment type
      if (request.type === "equity") {
        const equityPercentage = parseFloat(request.returns);
        requestObj.expectedReturns = (request.currentFunding * equityPercentage) / 100;
      } else if (request.type === "loan") {
        const interestRate = parseFloat(request.returns);
        requestObj.expectedReturns = request.currentFunding * (1 + interestRate / 100);
      } else {
        requestObj.expectedReturns = 0; // For donations
      }

      return requestObj;
    });

    res.json(requestsWithReturns);
  } catch (err) {
    console.error("Error fetching funding requests:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get my investments (Investor)
router.get("/my-investments", protect, async (req, res) => {
  try {
    const investments = await Investment.find({
      "investors.user": req.user.id,
    }).populate("seeker", "userName");

    // Calculate returns for each investment
    const investmentsWithReturns = investments.map((investment) => {
      const investmentObj = investment.toObject();
      const userInvestment = investment.investors.find(
        (inv) => inv.user.toString() === req.user.id
      );

      // Calculate returns based on investment type
      if (investment.type === "equity") {
        const equityPercentage = parseFloat(investment.returns);
        // Calculate the investor's share of equity based on their investment amount
        const investorShare =
          (userInvestment.amount / investment.amount) * equityPercentage;
        // Calculate returns as a percentage of their investment
        investmentObj.returns = (userInvestment.amount * investorShare) / 100;
      } else if (investment.type === "loan") {
        const interestRate = parseFloat(investment.returns);
        investmentObj.returns =
          userInvestment.amount * (1 + interestRate / 100);
      } else {
        investmentObj.returns = 0; // For donations
      }

      return investmentObj;
    });

    res.json(investmentsWithReturns);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// Withdraw returns from investment
router.post("/:id/withdraw", protect, async (req, res) => {
  try {
    const investmentId = req.params.id;
    const { bankName, accountNumber, accountHolderName, ifscCode, amount } = req.body;

    // Validate bank details
    if (!bankName || !accountNumber || !accountHolderName || !ifscCode || !amount) {
      return res.status(400).json({ msg: "All bank details are required" });
    }

    // Validate amount is a positive number
    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      return res.status(400).json({ msg: "Please enter a valid amount" });
    }

    const investment = await Investment.findById(investmentId);
    if (!investment) {
      return res.status(404).json({ msg: "Investment not found" });
    }

    // Find the user's investment
    const userInvestment = investment.investors.find(
      (inv) => inv.user.toString() === req.user.id
    );

    if (!userInvestment) {
      return res.status(403).json({ msg: "Not authorized to withdraw from this investment" });
    }

    // Calculate available returns
    let availableReturns = 0;
    if (investment.type === "equity") {
      const equityPercentage = parseFloat(investment.returns);
      const investorShare = (userInvestment.amount / investment.amount) * equityPercentage;
      availableReturns = (userInvestment.amount * investorShare) / 100;
    } else if (investment.type === "loan") {
      const interestRate = parseFloat(investment.returns);
      availableReturns = userInvestment.amount * (1 + interestRate / 100);
    }

    // Check if there are any pending or completed withdrawals
    const existingWithdrawals = await Withdrawal.find({
      investment: investmentId,
      investor: req.user.id,
      status: { $in: ['pending', 'processing', 'completed'] }
    });

    // Calculate total withdrawn amount
    const totalWithdrawn = existingWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const remainingReturns = Math.max(0, availableReturns - totalWithdrawn);

    // Check if the withdrawal amount is valid
    if (withdrawalAmount > remainingReturns) {
      return res.status(400).json({ 
        msg: "Withdrawal amount cannot exceed available returns",
        details: {
          requestedAmount: withdrawalAmount,
          availableAmount: remainingReturns,
          totalReturns: availableReturns,
          alreadyWithdrawn: totalWithdrawn
        }
      });
    }

    // Create withdrawal record
    const withdrawal = new Withdrawal({
      investment: investmentId,
      investor: req.user.id,
      amount: withdrawalAmount,
      bankDetails: {
        bankName,
        accountNumber,
        accountHolderName,
        ifscCode,
      },
      status: "pending",
    });

    await withdrawal.save();

    // Create activity for withdrawal request
    await new Activity({
      user: req.user.id,
      activityType: "investment",
      action: "withdrawal_requested",
      metadata: {
        investmentId: investment._id,
        investmentTitle: investment.title,
        withdrawalId: withdrawal._id,
        amount: withdrawalAmount,
        type: investment.type
      }
    }).save();

    res.json({
      msg: "Withdrawal request submitted successfully",
      withdrawal,
      remainingReturns: remainingReturns - withdrawalAmount
    });
  } catch (err) {
    console.error("Withdrawal error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get all withdrawal requests
router.get("/withdrawals", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('membership');
    
    let withdrawals;
    if (user.isSeeker) {
      // Seekers can view all withdrawal requests
      withdrawals = await Withdrawal.find()
        .populate("investment", "title type")
        .populate("investor", "userName userEmail")
        .sort({ createdAt: -1 });
    } else {
      // Non-seekers can only view their own withdrawal requests
      withdrawals = await Withdrawal.find({ investor: req.user.id })
        .populate("investment", "title type")
        .populate("investor", "userName userEmail")
        .sort({ createdAt: -1 });
    }
    
    res.json(withdrawals);
  } catch (err) {
    console.error("Error fetching withdrawals:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Approve withdrawal request (Admin only)
router.put("/withdrawals/:id/approve", protect, async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ msg: "Withdrawal request not found" });
    }

    if (withdrawal.status !== "pending") {
      return res
        .status(400)
        .json({ msg: "Withdrawal request is not in pending status" });
    }

    // Update withdrawal status to processing
    withdrawal.status = "processing";
    await withdrawal.save();

    // Create activity for withdrawal approval
    await new Activity({
      user: withdrawal.investor,
      activityType: "investment",
      action: "withdrawal_approved",
      metadata: {
        withdrawalId: withdrawal._id,
        amount: withdrawal.amount,
        investmentId: withdrawal.investment
      }
    }).save();

    // Here you would typically integrate with a payment gateway to process the actual transfer
    // For now, we'll just mark it as completed after a delay
    setTimeout(async () => {
      withdrawal.status = "completed";
      await withdrawal.save();

      // Create activity for withdrawal completion
      await new Activity({
        user: withdrawal.investor,
        activityType: "investment",
        action: "withdrawal_completed",
        metadata: {
          withdrawalId: withdrawal._id,
          amount: withdrawal.amount,
          investmentId: withdrawal.investment
        }
      }).save();
    }, 5000); // Simulate processing time

    res.json({ msg: "Withdrawal request approved and processing", withdrawal });
  } catch (err) {
    console.error("Error approving withdrawal:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Reject withdrawal request (Admin only)
router.put("/withdrawals/:id/reject", protect, async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ msg: "Withdrawal request not found" });
    }

    if (withdrawal.status !== "pending") {
      return res
        .status(400)
        .json({ msg: "Withdrawal request is not in pending status" });
    }

    // Update withdrawal status to failed
    withdrawal.status = "failed";
    await withdrawal.save();

    // Return the amount back to the investment returns
    const investment = await Investment.findById(withdrawal.investment);
    if (investment) {
      const userInvestment = investment.investors.find(
        (inv) => inv.user.toString() === withdrawal.investor.toString()
      );
      if (userInvestment) {
        userInvestment.returns += withdrawal.amount;
        await investment.save();
      }
    }

    res.json({ msg: "Withdrawal request rejected", withdrawal });
  } catch (err) {
    console.error("Error rejecting withdrawal:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get investments for a specific user
router.get("/my-investments/:userId", protect, async (req, res) => {
  try {
    // console.log('Fetching investments for user:', req.params.userId);

    // Find investments where the user is an investor
    const investments = await Investment.find({
      "investors.user": req.params.userId
    }).populate({
      path: "seeker",
      select: "userName userEmail"
    });

    // console.log('Found investments:', investments.length);

    // Calculate returns for each investment
    const investmentsWithReturns = investments.map((investment) => {
      const investmentObj = investment.toObject();
      const userInvestment = investment.investors.find(
        (inv) => inv.user.toString() === req.params.userId
      );

      if (!userInvestment) {
        return null;
      }

      // Calculate returns based on investment type
      if (investment.type === "equity") {
        const equityPercentage = parseFloat(investment.returns);
        const investorShare = (userInvestment.amount / investment.amount) * equityPercentage;
        investmentObj.returns = (userInvestment.amount * investorShare) / 100;
      } else if (investment.type === "loan") {
        const interestRate = parseFloat(investment.returns);
        investmentObj.returns = userInvestment.amount * (1 + interestRate / 100);
      } else {
        investmentObj.returns = 0; // For donations
      }

      return investmentObj;
    }).filter(Boolean);

    // console.log('Processed investments:', investmentsWithReturns.length);
    res.json(investmentsWithReturns);
  } catch (err) {
    console.error("Error fetching user investments:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// Get funding requests for a specific user
router.get("/my-requests/:userId", protect, async (req, res) => {
  try {
    // console.log('Fetching requests for user:', req.params.userId);

    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Find all funding requests created by this user
    const requests = await Investment.find({ 
      seeker: req.params.userId 
    }).populate({
      path: 'seeker',
      select: 'userName userEmail membership',
      populate: {
        path: 'membership',
        select: 'tier'
      }
    }).populate({
      path: 'investors.user',
      select: 'userName userEmail'
    }).sort({ createdAt: -1 });

    // console.log('Found requests:', requests.length);

    // Calculate expected returns for each request
    const requestsWithReturns = requests.map(request => {
      const requestObj = request.toObject();
      requestObj.totalInvested = request.currentFunding;
      
      if (request.type === "equity") {
        const equityPercentage = parseFloat(request.returns);
        requestObj.expectedReturns = (request.currentFunding * equityPercentage) / 100;
      } else if (request.type === "loan") {
        const interestRate = parseFloat(request.returns);
        requestObj.expectedReturns = request.currentFunding * (1 + interestRate / 100);
      } else {
        requestObj.expectedReturns = 0; // For donations
      }

      return requestObj;
    });

    // console.log('Processed requests:', requestsWithReturns.length);
    res.json(requestsWithReturns);
  } catch (err) {
    console.error("Error fetching user funding requests:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
