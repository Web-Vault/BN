import mongoose from 'mongoose';

const membershipHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  membershipId: {
    type: String,
    required: true
  },
  tier: {
    type: String,
    enum: ['Basic', 'Professional', 'Enterprise'],
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'upgraded'],
    default: 'active'
  },
  paymentDetails: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    transactionId: String,
    paymentDate: {
      type: Date,
      default: Date.now
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'bank_transfer', 'other'],
      required: true
    }
  },
  renewalCount: {
    type: Number,
    default: 0
  },
  previousMembershipId: {
    type: String,
    default: null
  },
  cancellationReason: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
membershipHistorySchema.index({ user: 1, purchaseDate: -1 });
membershipHistorySchema.index({ membershipId: 1 }, { unique: true });
membershipHistorySchema.index({ status: 1, expiryDate: 1 });

const MembershipHistory = mongoose.model('MembershipHistory', membershipHistorySchema);

export default MembershipHistory; 