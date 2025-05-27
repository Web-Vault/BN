import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    referredUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    referralCode: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'expired'],
      default: 'pending'
    },
    rewardAmount: {
      type: Number,
      default: 0
    },
    rewardType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    rewardValue: {
      type: Number,
      default: 10 // 10% by default
    },
    completedAt: {
      type: Date
    },
    expiresAt: {
      type: Date,
      default: () => new Date(+new Date() + 30*24*60*60*1000) // 30 days from creation
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
referralSchema.index({ referrer: 1, referredUser: 1 }, { unique: true });
referralSchema.index({ referralCode: 1 });
referralSchema.index({ status: 1 });

// Method to check if referral is expired
referralSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Method to complete referral
referralSchema.methods.complete = async function(amount) {
  if (this.status !== 'pending') {
    throw new Error('Referral is not pending');
  }

  if (this.isExpired()) {
    this.status = 'expired';
    await this.save();
    throw new Error('Referral has expired');
  }

  this.status = 'completed';
  this.completedAt = new Date();
  
  // Calculate reward based on type
  if (this.rewardType === 'percentage') {
    this.rewardAmount = (amount * this.rewardValue) / 100;
  } else {
    this.rewardAmount = this.rewardValue;
  }

  await this.save();
  return this;
};

// Check if model exists before creating
const Referral = mongoose.models.Referral || mongoose.model('Referral', referralSchema);

export default Referral; 