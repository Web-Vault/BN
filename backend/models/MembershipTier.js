import mongoose from 'mongoose';

const membershipTierSchema = new mongoose.Schema({
  tier: {
    type: String,
    required: true,
    enum: ['basic', 'professional'],
    unique: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    comment: 'Duration in months'
  },
  features: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    included: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
membershipTierSchema.index({ tier: 1 });

// Virtual for formatted price
membershipTierSchema.virtual('formattedPrice').get(function() {
  return `$${this.price}`;
});

// Virtual for formatted duration
membershipTierSchema.virtual('formattedDuration').get(function() {
  return `${this.duration} ${this.duration === 1 ? 'month' : 'months'}`;
});

const MembershipTier = mongoose.model('MembershipTier', membershipTierSchema);

export default MembershipTier; 