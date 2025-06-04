// models/investment.js
import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    currentFunding: { type: Number, default: 0 },
    type: {
      type: String,
      enum: ["equity", "loan", "donation"],
      required: true,
    },
    returns: { type: String }, // "5% annual" or "20% equity"
    deadline: { type: Date },
    seeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: false // Making it optional for backward compatibility
    },
    investors: [
      {
        user: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "users",
          required: true 
        },
        amount: { 
          type: Number, 
          required: true,
          min: 0
        },
        returns: { 
          type: Number, 
          default: 0 
        },
        status: {
          type: String,
          enum: ["pending", "active", "completed"],
          default: "pending"
        },
        date: { 
          type: Date, 
          default: Date.now 
        },
        percentage: {
          type: Number,
          default: 0
        }
      },
    ],
    status: {
      type: String,
      enum: ["open", "funded", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);

// Calculate total funding
investmentSchema.virtual('totalFunding').get(function() {
  return this.investors.reduce((sum, investor) => sum + investor.amount, 0);
});

// Calculate funding percentage for each investor
investmentSchema.methods.calculateInvestorPercentages = function() {
  const totalAmount = this.amount;
  this.investors.forEach(investor => {
    investor.percentage = (investor.amount / totalAmount) * 100;
  });
  return this;
};

// Get investment amount for a specific user
investmentSchema.methods.getUserInvestment = function(userId) {
  const investment = this.investors.find(inv => inv.user.toString() === userId.toString());
  return investment ? investment.amount : 0;
};

export default mongoose.model("Investment", investmentSchema);
