import Membership from '../models/membership.js';
import users from '../models/users.js';
import User from '../models/users.js';
import MembershipHistory from '../models/membershipHistory.js';
import Activity from '../models/activity.js';
import Notification from '../models/notification.js';
import { v4 as uuidv4 } from 'uuid';

// Membership pricing and duration constants
const MEMBERSHIP_PRICES = {
  Basic: 99,
  Professional: 299,
  Enterprise: 999
};

const MEMBERSHIP_DURATIONS = {
  Basic: 30, // 1 month in days
  Professional: 180, // 6 months in days
  Enterprise: 365 // 12 months in days
};

// Generate a unique membership ID using UUID v4
const generateMembershipId = () => {
  const prefix = 'BN';
  const uuid = uuidv4().split('-')[0].toUpperCase(); // Use first part of UUID
  return `${prefix}-${uuid}`;
};

// Calculate expiry date based on tier
const calculateExpiryDate = (tier) => {
  const now = new Date();
  switch (tier) {
    case 'Basic':
      return new Date(now.setMonth(now.getMonth() + 1)); // 1 month
    case 'Professional':
      return new Date(now.setMonth(now.getMonth() + 6)); // 6 months
    case 'Enterprise':
      return new Date(now.setFullYear(now.getFullYear() + 1)); // 1 year
    default:
      throw new Error('Invalid membership tier');
  }
};

// Calculate upgrade amount based on current and new tier
const calculateUpgradeAmount = (currentTier, newTier, remainingDays) => {
  const MEMBERSHIP_PRICES = {
    Basic: 99,
    Professional: 299,
    Enterprise: 999
  };

  const MEMBERSHIP_DURATIONS = {
    Basic: 30, // 1 month in days
    Professional: 180, // 6 months in days
    Enterprise: 365 // 12 months in days
  };

  // Calculate pro-rated amounts
  const currentTierDailyRate = MEMBERSHIP_PRICES[currentTier] / MEMBERSHIP_DURATIONS[currentTier];
  const newTierDailyRate = MEMBERSHIP_PRICES[newTier] / MEMBERSHIP_DURATIONS[newTier];

  // Calculate the difference
  const upgradeAmount = Math.round((newTierDailyRate - currentTierDailyRate) * remainingDays);
  return Math.max(0, upgradeAmount); // Ensure amount is not negative
};

// Purchase membership
export const purchaseMembership = async (req, res) => {
  try {
    const { tier, paymentDetails } = req.body;
    const userId = req.user._id;

    console.log('Purchase request:', { tier, paymentDetails, userId });

    // Validate tier
    if (!['Basic', 'Professional', 'Enterprise'].includes(tier)) {
      return res.status(400).json({ 
        message: 'Invalid membership tier',
        validTiers: ['Basic', 'Professional', 'Enterprise']
      });
    }

    // Get user's current membership
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentMembership = user.membership;
    const isUpgrade = paymentDetails?.isUpgrade;

    // Handle upgrade logic
    if (isUpgrade) {
      if (!currentMembership || !currentMembership.tier) {
        return res.status(400).json({ 
          message: 'No current membership found for upgrade',
          currentMembership
        });
      }

      // Validate upgrade path
      const validUpgrades = {
        'Basic': ['Professional'],
        'Professional': ['Enterprise'],
        'Enterprise': []
      };

      if (!validUpgrades[currentMembership.tier].includes(tier)) {
        return res.status(400).json({ 
          message: `Invalid upgrade path. ${currentMembership.tier} members can only upgrade to: ${validUpgrades[currentMembership.tier].join(', ')}`,
          currentTier: currentMembership.tier,
          requestedTier: tier,
          validUpgrades: validUpgrades[currentMembership.tier]
        });
      }

      // Calculate expected upgrade amount
      const expectedAmount = MEMBERSHIP_PRICES[tier] - MEMBERSHIP_PRICES[currentMembership.tier];
      
      // Verify payment amount matches expected upgrade amount
      if (paymentDetails.amount !== expectedAmount) {
        return res.status(400).json({ 
          message: 'Invalid payment amount',
          expectedAmount,
          providedAmount: paymentDetails.amount,
          currentTier: currentMembership.tier,
          newTier: tier
        });
      }

      // Inactivate previous membership
      try {
        // Update previous membership in Membership collection
        await Membership.findOneAndUpdate(
          { user: userId, membershipId: currentMembership.membershipId },
          { 
            status: 'upgraded',
            deactivationDate: new Date(),
            deactivationReason: 'upgraded',
            upgradedTo: tier
          }
        );

        // Update previous membership in MembershipHistory
        await MembershipHistory.findOneAndUpdate(
          { user: userId, membershipId: currentMembership.membershipId },
          { 
            status: 'upgraded',
            deactivationDate: new Date(),
            deactivationReason: 'upgraded',
            upgradedTo: tier
          }
        );

        // Create activity record for membership deactivation
        const deactivationActivity = new Activity({
          user: userId,
          activityType: 'account',
          action: 'membership_deactivated',
          metadata: {
            membershipId: currentMembership.membershipId,
            tier: currentMembership.tier,
            deactivationDate: new Date(),
            reason: 'upgraded',
            upgradedTo: tier
          }
        });
        await deactivationActivity.save();

        // Create notification for membership deactivation
        const deactivationNotification = new Notification({
          user: userId,
          sender: userId,
          type: 'membership_deactivated',
          message: `Your ${currentMembership.tier} membership has been deactivated due to upgrade to ${tier} tier.`,
          metadata: {
            membershipId: currentMembership.membershipId,
            tier: currentMembership.tier,
            deactivationDate: new Date(),
            reason: 'upgraded',
            upgradedTo: tier
          },
          priority: 'high',
          link: '/membership/history'
        });
        await deactivationNotification.save();

      } catch (deactivationError) {
        console.error('Error deactivating previous membership:', deactivationError);
        // Continue with the upgrade process even if deactivation fails
      }
    }

    // Validate payment details
    if (!paymentDetails || !paymentDetails.paymentMethod) {
      return res.status(400).json({ 
        message: 'Payment method is required',
        requiredFields: ['paymentMethod', 'amount', 'currency', 'transactionId', 'paymentDate']
      });
    }

    // Validate required payment fields
    const requiredFields = ['amount', 'currency', 'transactionId', 'paymentDate'];
    const missingFields = requiredFields.filter(field => !paymentDetails[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required payment fields',
        missingFields
      });
    }

    // Validate payment method
    const validPaymentMethods = ['credit_card', 'debit_card', 'bank_transfer', 'other'];
    if (!validPaymentMethods.includes(paymentDetails.paymentMethod)) {
      return res.status(400).json({ 
        message: 'Invalid payment method',
        validMethods: validPaymentMethods,
        providedMethod: paymentDetails.paymentMethod
      });
    }

    // Generate membership details for new membership
    const membershipId = generateMembershipId();
    const purchaseDate = new Date();
    const expiryDate = calculateExpiryDate(tier);

    // Prepare payment details with required fields
    const completePaymentDetails = {
      amount: paymentDetails.amount,
      currency: paymentDetails.currency || 'USD',
      paymentMethod: paymentDetails.paymentMethod,
      transactionId: paymentDetails.transactionId,
      paymentDate: new Date(paymentDetails.paymentDate),
      isUpgrade: isUpgrade || false,
      previousTier: currentMembership?.tier,
      description: paymentDetails.description || `Membership ${isUpgrade ? 'upgrade' : 'purchase'} to ${tier} tier`,
      previousMembershipId: currentMembership?.membershipId
    };

    // Create membership history entry for new membership
    const membershipHistory = new MembershipHistory({
      user: userId,
      membershipId,
      tier,
      purchaseDate,
      expiryDate,
      status: 'active',
      paymentDetails: completePaymentDetails,
      previousMembershipId: currentMembership?.membershipId,
      renewalCount: currentMembership?.membershipId ? 1 : 0,
      upgradeFrom: isUpgrade ? currentMembership?.tier : null
    });

    await membershipHistory.save();

    // Update user with new membership details
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        membership: {
          membershipId,
          tier,
          purchaseDate,
          expiryDate,
          status: 'active',
          paymentDetails: completePaymentDetails,
          previousMembershipId: currentMembership?.membershipId
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create or update current membership
    await Membership.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        membershipId,
        tier,
        status: 'active',
        startDate: purchaseDate,
        expiryDate,
        paymentStatus: 'completed',
        paymentDetails: completePaymentDetails,
        previousMembershipId: currentMembership?.membershipId
      },
      { upsert: true, new: true }
    );

    // Create activity record
    try {
      const activity = new Activity({
        user: userId,
        activityType: 'account',
        action: isUpgrade ? 'membership_upgraded' : 'membership_purchased',
        metadata: {
          membershipId,
          tier,
          purchaseDate,
          expiryDate,
          amount: completePaymentDetails.amount,
          currency: completePaymentDetails.currency,
          isUpgrade,
          previousTier: currentMembership?.tier
        }
      });
      await activity.save();
    } catch (activityError) {
      console.error('Error creating activity record:', activityError);
    }

    // Create notification
    try {
      const notification = new Notification({
        user: userId,
        sender: userId,
        type: isUpgrade ? 'membership_upgraded' : 'membership_purchased',
        message: isUpgrade 
          ? `Your membership has been successfully upgraded to ${tier}. Membership ID: ${membershipId}`
          : `Your ${tier} membership has been successfully purchased. Membership ID: ${membershipId}`,
        metadata: {
          membershipId,
          tier,
          expiryDate,
          amount: completePaymentDetails.amount,
          currency: completePaymentDetails.currency,
          isUpgrade,
          previousTier: currentMembership?.tier
        },
        priority: 'high',
        link: '/membership'
      });
      await notification.save();
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    res.status(200).json({
      message: isUpgrade ? 'Membership upgraded successfully' : 'Membership purchased successfully',
      membership: {
        membershipId: updatedUser.membership.membershipId,
        tier: updatedUser.membership.tier,
        purchaseDate: updatedUser.membership.purchaseDate,
        expiryDate: updatedUser.membership.expiryDate,
        status: updatedUser.membership.status,
        paymentDetails: completePaymentDetails,
        previousMembershipId: currentMembership?.membershipId
      }
    });
  } catch (error) {
    console.error('Error purchasing/upgrading membership:', error);
    res.status(500).json({ 
      message: 'Error processing membership',
      error: error.message,
      details: error.stack
    });
  }
};

// Verify membership
export const verifyMembership = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user || !user.membership || !user.membership.membershipId) {
      return res.json({
        hasActiveMembership: false,
        message: 'No membership found'
      });
    }

    const now = new Date();
    const isExpired = user.membership.expiryDate < now;

    if (isExpired) {
      // Update membership status to expired
      user.membership.status = 'expired';
      await user.save();

      return res.json({
        hasActiveMembership: false,
        message: 'Membership has expired'
      });
    }

    res.json({
      hasActiveMembership: true,
      membership: {
        tier: user.membership.tier,
        expiryDate: user.membership.expiryDate,
        membershipId: user.membership.membershipId
      }
    });
  } catch (error) {
    console.error('Error verifying membership:', error);
    res.status(500).json({ message: 'Error checking membership status' });
  }
};

// Get membership details
export const getMembershipDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user || !user.membership || !user.membership.membershipId) {
      return res.status(404).json({ message: 'No membership found' });
    }

    res.json({
      membership: {
        membershipId: user.membership.membershipId,
        tier: user.membership.tier,
        purchaseDate: user.membership.purchaseDate,
        expiryDate: user.membership.expiryDate,
        status: user.membership.status,
        paymentDetails: user.membership.paymentDetails
      }
    });
  } catch (error) {
    console.error('Error getting membership details:', error);
    res.status(500).json({ message: 'Error retrieving membership details' });
  }
};

// Verify user's membership status
export const verifyMembershipById = async (req, res) => {
  try {
    const { membershipId } = req.body;

    const membership = await Membership.findOne({
      membershipId,
      status: 'active'
    });

    if (!membership) {
      return res.status(404).json({
        isValid: false,
        message: 'Invalid or expired membership ID'
      });
    }

    // Check if membership is expired
    if (membership.isExpired()) {
      membership.status = 'expired';
      await membership.save();
      
      return res.status(200).json({
        isValid: false,
        message: 'Membership has expired',
        membership: {
          tier: membership.tier,
          expiryDate: membership.expiryDate
        }
      });
    }

    // Return valid membership details
    return res.status(200).json({
      isValid: true,
      membership: {
        tier: membership.tier,
        expiryDate: membership.expiryDate,
        features: membership.features
      }
    });

  } catch (error) {
    console.error('Error verifying membership ID:', error);
    res.status(500).json({
      message: 'Error verifying membership ID',
      error: error.message
    });
  }
};

// Get user's membership history
export const getMembershipHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const memberships = await Membership.find({ user: userId })
      .sort({ startDate: -1 });

    res.status(200).json({
      memberships: memberships.map(m => ({
        membershipId: m.membershipId,
        tier: m.tier,
        status: m.status,
        startDate: m.startDate,
        expiryDate: m.expiryDate,
        features: m.features
      }))
    });

  } catch (error) {
    console.error('Error fetching membership history:', error);
    res.status(500).json({
      message: 'Error fetching membership history',
      error: error.message
    });
  }
};

// Cancel membership
export const cancelMembership = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's current membership
    const user = await User.findById(userId);
    if (!user || !user.membership || !user.membership.membershipId) {
      return res.status(404).json({ 
        message: 'No active membership found' 
      });
    }

    // Check if membership is already cancelled
    if (user.membership.status === 'cancelled') {
      return res.status(400).json({ 
        message: 'Membership is already cancelled' 
      });
    }

    const membershipId = user.membership.membershipId;
    const cancellationDate = new Date();

    // Update membership status in Membership collection
    const updatedMembership = await Membership.findOneAndUpdate(
      { user: userId, membershipId },
      { 
        status: 'cancelled'
      },
      { new: true }
    );

    if (!updatedMembership) {
      throw new Error('Failed to update membership status');
    }

    // Update membership status in MembershipHistory
    const updatedHistory = await MembershipHistory.findOneAndUpdate(
      { user: userId, membershipId },
      { 
        status: 'cancelled',
        notes: 'Cancelled by user'
      },
      { new: true }
    );

    if (!updatedHistory) {
      throw new Error('Failed to update membership history');
    }

    // Update user's membership status
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        'membership.status': 'cancelled'
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error('Failed to update user membership status');
    }

    // Create activity record for membership cancellation
    const activity = new Activity({
      user: userId,
      activityType: 'account',
      action: 'membership_cancelled',
      metadata: {
        membershipId,
        tier: user.membership.tier,
        cancellationDate,
        reason: 'user_cancelled'
      }
    });
    await activity.save();

    // Create notification for membership cancellation
    const notification = new Notification({
      user: userId,
      sender: userId,
      type: 'membership_cancelled',
      message: 'Your membership has been cancelled. You will need to purchase a new membership to access premium features.',
      metadata: {
        membershipId,
        tier: user.membership.tier,
        cancellationDate
      },
      priority: 'high',
      link: '/membership'
    });
    await notification.save();

    res.status(200).json({
      message: 'Membership cancelled successfully',
      membership: {
        membershipId,
        tier: user.membership.tier,
        status: 'cancelled',
        cancellationDate
      }
    });

  } catch (error) {
    console.error('Error cancelling membership:', error);
    res.status(500).json({ 
      message: 'Error cancelling membership',
      error: error.message 
    });
  }
};

// Downgrade membership to Basic tier
export const downgradeMembership = async (req, res) => {
  try {
    const userId = req.user._id;
    const { tier } = req.body;

    // Validate tier
    if (tier !== 'Basic') {
      return res.status(400).json({ 
        message: 'Can only downgrade to Basic tier' 
      });
    }

    // Get user's current membership
    const user = await User.findById(userId);
    if (!user || !user.membership || !user.membership.membershipId) {
      return res.status(404).json({ 
        message: 'No active membership found' 
      });
    }

    // Check if already Basic tier
    if (user.membership.tier === 'Basic') {
      return res.status(400).json({ 
        message: 'Already on Basic tier' 
      });
    }

    const membershipId = user.membership.membershipId;
    const downgradeDate = new Date();
    const previousTier = user.membership.tier;

    // Calculate new expiry date (keep the same expiry date)
    const expiryDate = user.membership.expiryDate;

    // Update membership status in Membership collection
    await Membership.findOneAndUpdate(
      { user: userId, membershipId },
      { 
        tier: 'Basic',
        status: 'active',
        downgradeDate,
        previousTier,
        notes: 'Downgraded to Basic tier'
      }
    );

    // Update membership status in MembershipHistory
    await MembershipHistory.findOneAndUpdate(
      { user: userId, membershipId },
      { 
        tier: 'Basic',
        status: 'active',
        downgradeDate,
        previousTier,
        notes: 'Downgraded to Basic tier'
      }
    );

    // Update user's membership
    await User.findByIdAndUpdate(userId, {
      'membership.tier': 'Basic',
      'membership.status': 'active',
      'membership.downgradeDate': downgradeDate,
      'membership.previousTier': previousTier
    });

    // Create activity record for membership downgrade
    const activity = new Activity({
      user: userId,
      activityType: 'account',
      action: 'membership_downgraded',
      metadata: {
        membershipId,
        previousTier,
        newTier: 'Basic',
        downgradeDate
      }
    });
    await activity.save();

    // Create notification for membership downgrade
    const notification = new Notification({
      user: userId,
      sender: userId,
      type: 'membership_downgraded',
      message: `Your membership has been downgraded from ${previousTier} to Basic tier. You will still have access to basic features.`,
      metadata: {
        membershipId,
        previousTier,
        newTier: 'Basic',
        downgradeDate
      },
      priority: 'high',
      link: '/membership'
    });
    await notification.save();

    res.status(200).json({
      message: 'Membership downgraded successfully',
      membership: {
        membershipId,
        tier: 'Basic',
        status: 'active',
        downgradeDate,
        previousTier,
        expiryDate
      }
    });

  } catch (error) {
    console.error('Error downgrading membership:', error);
    res.status(500).json({ 
      message: 'Error downgrading membership',
      error: error.message 
    });
  }
}; 