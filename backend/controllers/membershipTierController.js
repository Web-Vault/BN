import MembershipTier from '../models/MembershipTier.js';
import User from '../models/users.js';
import MembershipHistory from '../models/membershipHistory.js';
import Membership from '../models/membership.js';

// Get all membership tiers
export const getAllTiers = async (req, res) => {
  try {
    const tiers = await MembershipTier.find();
    res.status(200).json({
      success: true,
      data: tiers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching membership tiers',
      error: error.message
    });
  }
};

// Get users by tier with membership details
export const getUsersByTier = async (req, res) => {
  try {
    const { tierId } = req.params;
    // console.log('Getting users for tier:', tierId);

    // Skip tier verification if tierId is 'all'
    if (tierId !== 'all') {
      // Verify the tier exists
      const tier = await MembershipTier.findOne({ tier: { $regex: new RegExp(`^${tierId}$`, 'i') } });
      // console.log('Found tier:', tier);
      
      if (!tier) {
        return res.status(404).json({
          success: false,
          message: 'Membership tier not found'
        });
      }
    }

    // Get all current memberships
    const currentMemberships = await Membership.find()
      .populate('user', 'userName email userImage')
      .lean();
    // console.log('Found current memberships:', currentMemberships.length);

    // Get all membership history
    const membershipHistory = await MembershipHistory.find()
      .populate('user', 'userName email userImage')
      .lean();
    // console.log('Found membership history:', membershipHistory.length);

    // Combine current membership and history data
    const userData = new Map();

    // Process current memberships
    currentMemberships.forEach(membership => {
      if (!membership.user) return; // Skip if no user data
      
      const userId = membership.user._id.toString();
      if (!userData.has(userId)) {
        userData.set(userId, {
          user: membership.user,
          currentMembership: {
            tier: membership.tier,
            status: membership.status,
            startDate: membership.startDate,
            expiryDate: membership.expiryDate,
            paymentStatus: membership.paymentStatus,
            paymentDetails: membership.paymentDetails
          },
          history: []
        });
      }
    });

    // Process membership history
    membershipHistory.forEach(history => {
      if (!history.user) return; // Skip if no user data
      
      const userId = history.user._id.toString();
      if (!userData.has(userId)) {
        userData.set(userId, {
          user: history.user,
          currentMembership: {
            tier: 'none',
            status: 'none',
            startDate: null,
            expiryDate: null,
            paymentStatus: 'none',
            paymentDetails: null
          },
          history: []
        });
      }
      userData.get(userId).history.push({
        tier: history.tier,
        status: history.status,
        purchaseDate: history.purchaseDate,
        expiryDate: history.expiryDate,
        notes: history.notes,
        paymentDetails: history.paymentDetails
      });
    });

    // Convert Map to array and filter by tier if needed
    let users = Array.from(userData.values());
    // console.log('Total users before filtering:', users.length);

    if (tierId !== 'all') {
      users = users.filter(user => 
        user.currentMembership.tier.toLowerCase() === tierId.toLowerCase()
      );
      // console.log('Users after tier filtering:', users.length);
    }

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error in getUsersByTier:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users by tier',
      error: error.message
    });
  }
};

// Get membership history by tier
export const getMembershipHistoryByTier = async (req, res) => {
  try {
    const { tierId } = req.params;
    
    // Verify tier exists
    const tier = await MembershipTier.findOne({ tier: tierId });
    if (!tier) {
      return res.status(404).json({
        success: false,
        message: 'Membership tier not found'
      });
    }

    // Get all membership history for users with this tier
    const history = await MembershipHistory.find({ tier: tierId })
      .populate('user', 'userName email userImage')
      .sort({ purchaseDate: -1 });

    // Group history by user
    const historyByUser = history.reduce((acc, record) => {
      const userId = record.user._id.toString();
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push({
        tier: record.tier,
        status: record.status,
        purchaseDate: record.purchaseDate,
        expiryDate: record.expiryDate,
        notes: record.notes,
        paymentDetails: record.paymentDetails
      });
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: historyByUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching membership history',
      error: error.message
    });
  }
};

// Update membership tier
export const updateTier = async (req, res) => {
  try {
    const { tierId } = req.params;
    const { features } = req.body;

    // Validate features array
    if (!Array.isArray(features)) {
      return res.status(400).json({
        success: false,
        message: 'Features must be an array'
      });
    }

    // Validate each feature
    for (const feature of features) {
      if (!feature.name || typeof feature.included !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Each feature must have a name and included status'
        });
      }
    }

    // Find and update the tier
    const updatedTier = await MembershipTier.findByIdAndUpdate(
      tierId,
      { features },
      { new: true, runValidators: true }
    );

    if (!updatedTier) {
      return res.status(404).json({
        success: false,
        message: 'Membership tier not found'
      });
    }

    res.status(200).json({
      success: true,
      data: updatedTier
    });
  } catch (error) {
    console.error('Error updating membership tier:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating membership tier',
      error: error.message
    });
  }
}; 