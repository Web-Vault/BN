import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import users from "../models/users.js";
import connectDB from "../config/db.js";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: join(__dirname, '..', '.env') });

const resetAdmin = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log("✅ Connected to MongoDB");

        // Delete existing admin users
        const deleteResult = await users.deleteMany({ isAdmin: true });
        console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing admin user(s)`);

        // Create new admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("Admin@499", salt);

        const adminUser = await users.create({
            userName: "Aryan [ADMIN]",
            userEmail: "admin@bn.com",
            userPassword: hashedPassword,
            isAdmin: true,
            isAccountVerified: true,
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

        console.log("\n✅ New admin user created successfully!");
        console.log("\nAdmin Credentials:");
        console.log("📧 Email:", adminUser.userEmail);
        console.log("🔑 Password: Admin@499");
        console.log("\n⚠️ Important: Please change the password after first login");

        // Verify the admin was created
        const verifyAdmin = await users.findOne({ isAdmin: true });
        if (verifyAdmin) {
            console.log("\n✅ Verification: Admin user exists in database");
            console.log("Name:", verifyAdmin.userName);
            console.log("Email:", verifyAdmin.userEmail);
            console.log("Created At:", verifyAdmin.createdAt);
        } else {
            console.log("\n❌ Error: Admin user not found after creation");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
};

resetAdmin(); 