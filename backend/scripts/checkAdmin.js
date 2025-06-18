import mongoose from "mongoose";
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

const checkAdminUsers = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log("✅ Connected to MongoDB");

        // Find all admin users
        const adminUsers = await users.find({ isAdmin: true });
        
        if (adminUsers.length === 0) {
            console.log("ℹ️ No admin users found in the database");
        } else {
            console.log(`Found ${adminUsers.length} admin user(s):`);
            adminUsers.forEach(admin => {
                console.log("\nAdmin Details:");
                console.log("Name:", admin.userName);
                console.log("Email:", admin.userEmail);
                console.log("Created At:", admin.createdAt);
                console.log("Last Updated:", admin.updatedAt);
                console.log("Is Verified:", admin.isAccountVerified);
                console.log("Is Mobile Verified:", admin.isMobileVerified);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error checking admin users:", error.message);
        process.exit(1);
    }
};

checkAdminUsers(); 