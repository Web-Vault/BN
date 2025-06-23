import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
        {
                userImage: { type: String },
                userName: { type: String, required: true },
                userEmail: { type: String, required: true, unique: true },
                userPassword: { type: String, required: true },
                isAdmin: { type: Boolean, default: false },
                isSuperAdmin: { type: Boolean, default: false },
                industry: { type: String },
                isSeeker: { type: Boolean },
                groupJoined: {
                        Joined: { type: Boolean, default: false },
                        JoinedGroupId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", default: null }
                },
                website: { type: String },
                location: { type: String },
                mobileNumber: { type: String },
                bio: { type: String },
                referralCode: { type: String, required: false },

                // Warning and ban related fields
                warnings: {
                    count: { type: Number, default: 0 },
                    history: [{
                        reason: { type: String, required: true },
                        date: { type: Date, default: Date.now },
                        adminId: { type: mongoose.Schema.Types.ObjectId, ref: "users" }
                    }]
                },
                banStatus: {
                    isBanned: { type: Boolean, default: false },
                    currentBan: {
                        reason: String,
                        startDate: Date,
                        endDate: Date,
                        adminId: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'users'
                        }
                    },
                    banHistory: [{
                        reason: String,
                        startDate: Date,
                        endDate: Date,
                        adminId: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'users'
                        },
                        unbannedAt: Date,
                        unbannedBy: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'users'
                        },
                        unbannedReason: String
                    }],
                    banCount: {
                        type: Number,
                        default: 0
                    }
                },

                // New onboarding fields
                address: {
                    city: { type: String },
                    state: { type: String },
                    country: { type: String },
                    zipCode: { type: String }
                },
                birthday: { type: Date },
                isAccountVerified: { type: Boolean, default: false },
                isMobileVerified: { type: Boolean, default: false },
                registerOTP: { 
                    code: { type: String },
                    expiresAt: { type: Date }
                },
                mobileAuthOTP: {
                    code: { type: String },
                    expiresAt: { type: Date }
                },
                // 
                connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],

                verificationOTP: {
                    type: String
                },
                otpExpiry: {
                    type: Date
                },
                verificationFlag: {
                    type: Number,
                    default: 0
                },
                mobileOTP: {
                    type: String,
                    select: false
                },
                mobileOTPExpiry: {
                    type: Date,
                    select: false
                },

                membership: {
                    membershipId: {
                        type: String,
                        unique: true,
                        sparse: true  // Allows null/undefined values
                    },
                    tier: {
                        type: String,
                        enum: ['Basic', 'Professional', 'Enterprise'],
                        default: null
                    },
                    purchaseDate: {
                        type: Date,
                        default: null
                    },
                    expiryDate: {
                        type: Date,
                        default: null
                    },
                    status: {
                        type: String,
                        enum: ['active', 'expired', 'cancelled'],
                        default: null
                    },
                    paymentDetails: {
                        amount: Number,
                        currency: {
                            type: String,
                            default: 'USD'
                        },
                        transactionId: String,
                        paymentDate: Date
                    }
                },
                // Add onboarding status
                onboardingStatus: {
                    isCompleted: {
                        type: Boolean,
                        default: false
                    },
                    completedSteps: [{
                        step: {
                            type: String,
                            enum: ['profile', 'verification', 'preferences']
                        },
                        completedAt: {
                            type: Date,
                            default: Date.now
                        }
                    }],
                    lastUpdated: {
                        type: Date,
                        default: Date.now
                    }
                },
                // 2FA fields
                twoFactorEnabled: { type: Boolean, default: false },
                twoFactorSecret: { type: String },
        }, {
        timestamps: true,
}
);

// Create a sparse unique index for referralCode
userSchema.index({ referralCode: 1 }, { unique: true, sparse: true });

export default mongoose.model("users", userSchema);