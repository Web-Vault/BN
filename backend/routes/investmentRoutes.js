// routes/investmentRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Investment from "../models/investment.js";
import users from "../models/users.js";
import Withdrawal from "../models/Withdrawal.js";
import Referral from "../models/referral.js";

const router = express.Router();

// Create investment request (Seeker only)
router.post("/", protect, async (req, res) => {
  try {
    const user = await users.findById(req.user.id);
    if (!user.isSeeker) {
      return res.status(403).json({ msg: "Only seekers can create investments" });
    }

    const newInvestment = new Investment({
      ...req.body,
      seeker: req.user.id,
    });

    await newInvestment.save();
    res.status(201).json(newInvestment);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// Get all active investments (Investors only)
router.get("/", protect, async (req, res) => {
  try {
    const user = await users.findById(req.user.id);
    
    if (user.isSeeker) {
      // If user is seeker, get their funding requests with investor details
      const requests = await Investment.find({ seeker: req.user.id })
        .populate({
          path: 'investors.user',
          select: 'userName userEmail'
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

    const investmentAmount = req.body.amount;
    
    // Check if total funding would exceed the goal
    const currentTotalFunding = investment.currentFunding;
    if (currentTotalFunding + investmentAmount > investment.amount) {
      return res.status(400).json({ 
        msg: "Exceeds funding goal",
        details: {
          currentFunding: currentTotalFunding,
          requestedAmount: investmentAmount,
          remainingAmount: investment.amount - currentTotalFunding
        }
      });
    }

    // Check if user already has an investment
    const existingInvestment = investment.investors.find(
      inv => inv.user.toString() === req.user.id
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

    // Handle referral completion
    try {
      console.log("🔍 Looking for pending referrals for user:", req.user.id);
      // Find any pending referrals for this user
      const pendingReferrals = await Referral.find({
        referredUser: req.user.id,
        status: 'pending'
      });
      console.log("📊 Found pending referrals:", pendingReferrals.length);

      // Complete each pending referral
      for (const referral of pendingReferrals) {
        try {
          console.log("🔄 Processing referral:", {
            referralId: referral._id,
            referrer: referral.referrer,
            referredUser: referral.referredUser,
            investmentAmount: investmentAmount
          });
          await referral.complete(investmentAmount);
          console.log(`✅ Referral ${referral._id} completed successfully with reward amount: ${referral.rewardAmount}`);
        } catch (error) {
          console.error(`❌ Error completing referral ${referral._id}:`, error.message);
          // Continue with other referrals even if one fails
        }
      }
    } catch (referralError) {
      console.error("❌ Error handling referrals:", referralError.message);
      // Don't fail the investment if referral handling fails
    }

    res.json(investment);
  } catch (err) {
    console.error("❌ Investment error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// Get my funding requests (Seeker) with detailed investor information
router.get("/my-requests", protect, async (req, res) => {
  try {
    const user = await users.findById(req.user.id);
    if (!user.isSeeker) {
      return res.status(403).json({ msg: "Only seekers can view their funding requests" });
    }

    const requests = await Investment.find({ seeker: req.user.id })
      .populate({
        path: 'investors.user',
        select: 'userName userEmail'
      });

    // Calculate returns for each investor based on investment type
    const requestsWithReturns = requests.map(request => {
      const requestObj = request.toObject();
      requestObj.investors = request.investors.map(investor => {
        const investorObj = investor.toObject();
        // Calculate expected returns based on investment type and returns field
        if (request.type === 'equity') {
          const equityPercentage = parseFloat(request.returns);
          investorObj.expectedReturn = (investor.amount / request.amount) * equityPercentage;
        } else if (request.type === 'loan') {
          const interestRate = parseFloat(request.returns);
          investorObj.expectedReturn = investor.amount * (1 + interestRate/100);
        }
        return investorObj;
      });
      return requestObj;
    });

    res.json(requestsWithReturns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// Get my investments (Investor)
router.get("/my-investments", protect, async (req, res) => {
  try {
    const investments = await Investment.find({
      "investors.user": req.user.id,
    }).populate("seeker", "userName");

    // Calculate returns for each investment
    const investmentsWithReturns = investments.map(investment => {
      const investmentObj = investment.toObject();
      const userInvestment = investment.investors.find(
        inv => inv.user.toString() === req.user.id
      );
      
      // Calculate returns based on investment type
      if (investment.type === 'equity') {
        const equityPercentage = parseFloat(investment.returns);
        investmentObj.returns = (userInvestment.amount / investment.amount) * equityPercentage;
      } else if (investment.type === 'loan') {
        const interestRate = parseFloat(investment.returns);
        investmentObj.returns = userInvestment.amount * (1 + interestRate/100);
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
      return res.status(400).json({ msg: 'All bank details are required' });
    }

    const investment = await Investment.findById(investmentId);
    if (!investment) {
      return res.status(404).json({ msg: 'Investment not found' });
    }

    // Find the user's investment
    const userInvestment = investment.investors.find(
      inv => inv.user.toString() === req.user.id
    );

    if (!userInvestment) {
      return res.status(403).json({ msg: 'Not authorized to withdraw from this investment' });
    }

    // Calculate available returns
    let availableReturns = 0;
    if (investment.type === 'equity') {
      const equityPercentage = parseFloat(investment.returns);
      availableReturns = (userInvestment.amount / investment.amount) * equityPercentage;
    } else if (investment.type === 'loan') {
      const interestRate = parseFloat(investment.returns);
      availableReturns = userInvestment.amount * (1 + interestRate/100);
    }

    // Check if the withdrawal amount is valid
    if (amount > availableReturns) {
      return res.status(400).json({ msg: 'Withdrawal amount cannot exceed available returns' });
    }

    // Create withdrawal record
    const withdrawal = new Withdrawal({
      investment: investmentId,
      investor: req.user.id,
      amount,
      bankDetails: {
        bankName,
        accountNumber,
        accountHolderName,
        ifscCode
      },
      status: 'pending'
    });

    await withdrawal.save();

    // Update investment returns
    userInvestment.returns = availableReturns - amount;
    await investment.save();

    res.json({
      msg: 'Withdrawal request submitted successfully',
      withdrawal
    });
  } catch (err) {
    console.error('Withdrawal error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all withdrawal requests (Admin only)
// router.get("/withdrawals", protect, admin, async (req, res) => {
//   try {
//     const withdrawals = await Withdrawal.find()
//       .populate('investment', 'title type')
//       .populate('investor', 'userName userEmail')
//       .sort({ createdAt: -1 });

//     res.json(withdrawals);
//   } catch (err) {
//     console.error('Error fetching withdrawals:', err);
//     res.status(500).json({ msg: 'Server error' });
//   }
// });

// // Approve withdrawal request (Admin only)
// router.put("/withdrawals/:id/approve", protect, admin, async (req, res) => {
//   try {
//     const withdrawal = await Withdrawal.findById(req.params.id);
//     if (!withdrawal) {
//       return res.status(404).json({ msg: 'Withdrawal request not found' });
//     }

//     if (withdrawal.status !== 'pending') {
//       return res.status(400).json({ msg: 'Withdrawal request is not in pending status' });
//     }

//     // Update withdrawal status to processing
//     withdrawal.status = 'processing';
//     await withdrawal.save();

//     // Here you would typically integrate with a payment gateway to process the actual transfer
//     // For now, we'll just mark it as completed after a delay
//     setTimeout(async () => {
//       withdrawal.status = 'completed';
//       await withdrawal.save();
//     }, 5000); // Simulate processing time

//     res.json({ msg: 'Withdrawal request approved and processing', withdrawal });
//   } catch (err) {
//     console.error('Error approving withdrawal:', err);
//     res.status(500).json({ msg: 'Server error' });
//   }
// });

// // Reject withdrawal request (Admin only)
// router.put("/withdrawals/:id/reject", protect, admin, async (req, res) => {
//   try {
//     const withdrawal = await Withdrawal.findById(req.params.id);
//     if (!withdrawal) {
//       return res.status(404).json({ msg: 'Withdrawal request not found' });
//     }

//     if (withdrawal.status !== 'pending') {
//       return res.status(400).json({ msg: 'Withdrawal request is not in pending status' });
//     }

//     // Update withdrawal status to failed
//     withdrawal.status = 'failed';
//     await withdrawal.save();

//     // Return the amount back to the investment returns
//     const investment = await Investment.findById(withdrawal.investment);
//     if (investment) {
//       const userInvestment = investment.investors.find(
//         inv => inv.user.toString() === withdrawal.investor.toString()
//       );
//       if (userInvestment) {
//         userInvestment.returns += withdrawal.amount;
//         await investment.save();
//       }
//     }

//     res.json({ msg: 'Withdrawal request rejected', withdrawal });
//   } catch (err) {
//     console.error('Error rejecting withdrawal:', err);
//     res.status(500).json({ msg: 'Server error' });
//   }
// });

export default router;
