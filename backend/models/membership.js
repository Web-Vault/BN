import mongoose from 'mongoose';

const membershipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  membershipId: {
    type: String,
    required: true,
    unique: true
  },
  tier: {
    type: String,
    enum: ['Basic', 'Professional', 'Enterprise'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentDetails: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    transactionId: String,
    paymentDate: Date,
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'bank_transfer', 'other'],
      required: true
    }
  }
}, {
  timestamps: true
});

// Indexes for faster queries
membershipSchema.index({ user: 1, status: 1, expiryDate: 1 });
membershipSchema.index({ membershipId: 1 }, { unique: true });

const Membership = mongoose.model('Membership', membershipSchema);

export default Membership; 