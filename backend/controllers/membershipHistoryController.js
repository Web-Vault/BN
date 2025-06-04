import MembershipHistory from '../models/membershipHistory.js';
import Membership from '../models/membership.js';
import User from '../models/users.js';

// Get user's membership history
export const getMembershipHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const history = await MembershipHistory.find({ user: userId })
      .sort({ purchaseDate: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error fetching membership history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch membership history'
    });
  }
};

// Create a new membership history entry
export const createMembershipHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      tier,
      expiryDate,
      paymentDetails,
      previousMembershipId
    } = req.body;

    // Generate a unique membership ID
    const membershipId = `MEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Get renewal count if this is a renewal
    let renewalCount = 0;
    if (previousMembershipId) {
      const previousMembership = await MembershipHistory.findOne({ membershipId: previousMembershipId });
      if (previousMembership) {
        renewalCount = previousMembership.renewalCount + 1;
      }
    }

    // Create new membership history entry
    const membershipHistory = new MembershipHistory({
      user: userId,
      membershipId,
      tier,
      expiryDate,
      paymentDetails,
      previousMembershipId,
      renewalCount
    });

    await membershipHistory.save();

    // Update user's current membership
    await User.findByIdAndUpdate(userId, {
      'membership.membershipId': membershipId,
      'membership.tier': tier,
      'membership.purchaseDate': new Date(),
      'membership.expiryDate': expiryDate,
      'membership.status': 'active',
      'membership.paymentDetails': paymentDetails
    });

    // Create or update current membership
    await Membership.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        tier,
        status: 'active',
        startDate: new Date(),
        expiryDate,
        paymentStatus: 'completed',
        paymentDetails
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Membership history created successfully',
      membershipHistory
    });
  } catch (error) {
    console.error('Error creating membership history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create membership history'
    });
  }
};

// Update membership status (e.g., when expired or cancelled)
export const updateMembershipStatus = async (req, res) => {
  try {
    const { membershipId } = req.params;
    const { status, cancellationReason, notes } = req.body;

    const membershipHistory = await MembershipHistory.findOneAndUpdate(
      { membershipId },
      {
        status,
        cancellationReason,
        notes,
        ...(status === 'cancelled' && { expiryDate: new Date() })
      },
      { new: true }
    );

    if (!membershipHistory) {
      return res.status(404).json({
        success: false,
        message: 'Membership history not found'
      });
    }

    // Update user's current membership status if this is the active membership
    const user = await User.findOne({ 'membership.membershipId': membershipId });
    if (user) {
      await User.findByIdAndUpdate(user._id, {
        'membership.status': status
      });

      // Update current membership status
      await Membership.findOneAndUpdate(
        { user: user._id },
        { status }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Membership status updated successfully',
      membershipHistory
    });
  } catch (error) {
    console.error('Error updating membership status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update membership status'
    });
  }
};

// Get membership statistics
export const getMembershipStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await MembershipHistory.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalPurchases: { $sum: 1 },
          totalSpent: { $sum: '$paymentDetails.amount' },
          averageDuration: {
            $avg: {
              $divide: [
                { $subtract: ['$expiryDate', '$purchaseDate'] },
                1000 * 60 * 60 * 24 // Convert to days
              ]
            }
          },
          tierDistribution: {
            $push: '$tier'
          }
        }
      }
    ]);

    // Calculate tier distribution percentages
    const tierCounts = stats[0]?.tierDistribution.reduce((acc, tier) => {
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {});

    const tierDistribution = Object.entries(tierCounts || {}).map(([tier, count]) => ({
      tier,
      count,
      percentage: (count / (stats[0]?.totalPurchases || 1)) * 100
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalPurchases: stats[0]?.totalPurchases || 0,
        totalSpent: stats[0]?.totalSpent || 0,
        averageDuration: Math.round(stats[0]?.averageDuration || 0),
        tierDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching membership stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch membership statistics'
    });
  }
}; 