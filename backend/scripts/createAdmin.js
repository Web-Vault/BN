import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import users from "../models/users.js";
import connectDB from "../config/db.js";
import Referral from "../models/Referral.js";

dotenv.config();

const generateUniqueReferralCode = async () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    do {
        code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        // Check if code already exists
        const existingUser = await users.findOne({ referralCode: code });
        if (!existingUser) {
            return code;
        }
    } while (true);
};

const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log("Connected to MongoDB");

        // Check if admin user already exists
        const existingAdmin = await users.findOne({ isAdmin: true });
        if (existingAdmin) {
            console.log("Admin user already exists");
            process.exit(0);
        }

        // Generate unique referral code
        const referralCode = await generateUniqueReferralCode();

        // Create admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("Admin@499", salt);

        const adminUser = await users.create({
            userName: "Aryan [ADMIN]",
            userEmail: "admin@bn.com",
            userPassword: hashedPassword,
            isAdmin: true,
            isAccountVerified: true,
            referralCode: referralCode,
            // Add complete onboarding data
            industry: "Technology",
            isSeeker: false,
            groupJoined: {
                Joined: false,
                JoinedGroupId: null
            },
            website: "https://bn.com",
            location: "Global",
            mobileNumber: "+919876543210",
            bio: "System Administrator",
            address: {
                city: "Global",
                state: "Global",
                country: "Global",
                zipCode: "000000"
            },
            birthday: new Date("1990-01-01"),
            isAccountVerified: true,
            isMobileVerified: true,
            onboardingStatus: {
                isCompleted: true,
                completedSteps: [
                    { step: 'profile', completedAt: new Date() },
                    { step: 'verification', completedAt: new Date() },
                    { step: 'preferences', completedAt: new Date() }
                ],
                lastUpdated: new Date()
            },
            membership: {
                membershipId: "BN-ADMIN499",
                tier: "Enterprise",
                status: "active",
                purchaseDate: new Date(),
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
                paymentDetails: {
                    amount: 999,
                    currency: "USD",
                    transactionId: "ADMIN-001",
                    paymentDate: new Date()
                }
            }
        });

        console.log("Admin user created successfully:", adminUser);
        process.exit(0);
    } catch (error) {
        console.error("Error creating admin user:", error);
        process.exit(1);
    }
};

createAdminUser(); 