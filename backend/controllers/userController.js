import users from "../models/users.js";
import Business from "../models/Business.js";
import Chapter from "../models/chapter.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Referral from "../models/Referral.js";
import nodemailer from "nodemailer";
import twilio from "twilio";
import dotenv from "dotenv";
import Activity from "../models/activity.js";
import { createActivityNotification } from "./notificationController.js";
import Membership from "../models/membership.js";
import Notification from "../models/notification.js";
import MembershipHistory from "../models/membershipHistory.js";

dotenv.config();

const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

console.log('Email Config:', {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD ? 'Password is set' : 'Password is missing'
});

console.log('Twilio Config:', {
    accountSid: process.env.TWILIO_ACCOUNT_SID ? 'Account SID is set' : 'Account SID is missing',
    authToken: process.env.TWILIO_AUTH_TOKEN ? 'Auth Token is set' : 'Auth Token is missing',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER ? 'Phone Number is set' : 'Phone Number is missing'
});

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

transporter.verify(function(error, success) {
    if (error) {
        console.log('SMTP Configuration Error:', error);
    } else {
        console.log('SMTP Server is ready to take our messages');
        console.log('Twilio Account SID:', process.env.TWILIO_ACCOUNT_SID);
        console.log('Twilio Phone Number:', process.env.TWILIO_PHONE_NUMBER);
    }
});

// Helper function to generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationEmail = async (email, otp) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            throw new Error('Email configuration is missing. Please check your .env file.');
        }

        const mailOptions = {
            from: `"BN Platform" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Email Verification',
            html: `
                <h1>Email Verification</h1>
                <p>Your verification code is: <strong>${otp}</strong></p>
                <p>This code will expire in 10 minutes.</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

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

// Helper function to format phone number to E.164 format
const formatPhoneNumber = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    const withoutLeadingZero = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
    
    const withCountryCode = withoutLeadingZero.startsWith('91') ? withoutLeadingZero : `91${withoutLeadingZero}`;
    
    return `+${withCountryCode}`;
};

const sendSMS = async (to, message) => {
    try {
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
            throw new Error('Twilio configuration is missing. Please check your .env file.');
        }

        const formattedNumber = formatPhoneNumber(to);
        console.log('Sending SMS to formatted number:', formattedNumber);

        const result = await twilioClient.messages.create({
            body: message,
            to: formattedNumber,
            from: process.env.TWILIO_PHONE_NUMBER
        });

        console.log('SMS sent successfully:', result.sid);
        return true;
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw error;
    }
};

const otpCooldowns = new Map();

const canSendOTP = (userId) => {
    const lastSentTime = otpCooldowns.get(userId);
    if (!lastSentTime) return true;
    
    const cooldownPeriod = 60 * 1000; // 1 minute in milliseconds
    return Date.now() - lastSentTime >= cooldownPeriod;
};

export const registerUser = async (req, res) => {
    try {
        const { userName, userEmail, userPassword } = req.body;

        if (!userName) {
            return res.status(400).json({ message: "username required" });
        }
        if (!userEmail) {
            return res.status(400).json({ message: "email required" });
        }
        if (!userPassword) {
            return res.status(400).json({ message: "password required" });
        }

        // Check if user already exists
        const existingUser = await users.findOne({ userEmail });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userPassword, salt);

        // Generate unique referral code
        const referralCode = await generateUniqueReferralCode();

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Create user with verification fields
        const user = await users.create({
            userName,
            userEmail,
            userPassword: hashedPassword,
            referralCode,
            isAccountVerified: 0,
            isMobileVerified: false,
            verificationOTP: otp,
            otpExpiry
        });

        try {
            // Send verification email
            await sendVerificationEmail(userEmail, otp);
            
            res.status(201).json({
                message: "Registration successful. Please verify your email.",
                user: { id: user._id, name: user.userName, email: user.userEmail },
                requiresVerification: true
            });
        } catch (emailError) {
            // If email sending fails, delete the user and return error
            await users.findByIdAndDelete(user._id);
            console.error("Email sending failed:", emailError);
            return res.status(500).json({ 
                message: "Registration failed due to email service error. Please try again later.",
                error: emailError.message 
            });
        }
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ 
            message: "Registration failed",
            error: error.message 
        });
    }
};

// Add new endpoint for OTP verification
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await users.findOne({ userEmail: email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if OTP is expired
        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        // Verify OTP
        if (user.verificationOTP !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Update user verification status
        user.isAccountVerified = 1;
        user.verificationOTP = undefined;
        user.otpExpiry = undefined;
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.status(200).json({
            message: "Email verified successfully",
            user: { id: user._id, name: user.userName, email: user.userEmail },
            token
        });
    } catch (error) {
        console.error("OTP verification error:", error);
        res.status(500).json({ 
            message: "OTP verification failed",
            error: error.message 
        });
    }
};

// Update login to check for account verification
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await users.findOne({ userEmail: email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Check if user is banned
        if (user.banStatus && user.banStatus.isBanned) {
            return res.status(403).json({
                message: "Account is banned",
                banDetails: {
                    reason: user.banStatus.reason,
                    startDate: user.banStatus.startDate,
                    endDate: user.banStatus.endDate,
                    adminId: user.banStatus.adminId
                }
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.userPassword);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        // Return user data without password
        const userData = {
            id: user._id,
            userName: user.userName,
            userEmail: user.userEmail,
            isAdmin: user.isAdmin,
            token,
            onboardingStatus: user.onboardingStatus
        };

        res.json({
            message: "Login successful",
            user: userData,
            redirectTo: user.isAdmin ? '/admin-panel' : '/profile'
        });
    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({ message: "Error logging in" });
    }
};

export const onboarding = async (req, res) => {
        try {
                const {
                        fullName,
                        contactNumber,
                        bio,
                        location,
                        industry,
                        seeker,
                        wantsBusiness,
                        businessName,
                        businessDescription,
                        businessLocation,
                        businessPhone,
                        businessEmail,
                        referralCode,
                        birthday,
                        address
                } = req.body;

                // Update user info in Users collection
                const updatedUser = await users.findByIdAndUpdate(req.user._id, {
                        userName: fullName,
                        mobileNumber: contactNumber,
                        bio,
                        location,
                        industry,
                        isSeeker: seeker,
                        groupJoined: false,
                        // New fields
                        birthday: birthday ? new Date(birthday) : null,
                        address: {
                            city: address?.city || "",
                            state: address?.state || "",
                            country: address?.country || "",
                            zipCode: address?.zipCode || ""
                        },
                        // Set verification flags
                        isAccountVerified: 1,
                        // Add onboarding status
                        onboardingStatus: {
                            isCompleted: true,
                            completedSteps: [
                                { step: 'profile', completedAt: new Date() },
                                { step: 'verification', completedAt: new Date() },
                                { step: 'preferences', completedAt: new Date() }
                            ],
                            lastUpdated: new Date()
                        }
                }, { new: true });

                // Handle referral code if provided
                if (referralCode) {
                        try {
                                // Find referrer
                                const referrer = await users.findOne({ referralCode });
                                if (!referrer) {
                                        // console.log("❌ Invalid referral code:", referralCode);
                                } else {
                                        // Create new referral
                                        const referral = new Referral({
                                                referrer: referrer._id,
                                                referredUser: req.user._id,
                                                referralCode: referralCode,
                                                status: 'pending'
                                        });
                                        await referral.save();
                                        // console.log("✅ Referral created successfully");

                                        // Create activity for the referred user
                                        const referralActivity = await new Activity({
                                            user: req.user._id,
                                            activityType: "referral",
                                            action: "referral_received",
                                            metadata: {
                                                referralId: referral._id,
                                                referrerId: referrer._id,
                                                referrerName: referrer.userName,
                                                referralCode: referralCode,
                                                status: "pending",
                                                task: "Complete your first investment to earn rewards for your referrer"
                                            }
                                        }).save();
                                        // console.log("✅ Activity created successfully");

                                        try {
                                                // Create notification for the referred user
                                                const notification = await createActivityNotification(referralActivity, req.user._id, "referral_received");
                                                // console.log("✅ Notification created successfully:", notification);
                                        } catch (notificationError) {
                                                console.error("❌ Error creating notification:", notificationError);
                                                // Don't throw the error, just log it so the onboarding can continue
                                        }
                                }
                        } catch (error) {
                                console.error("❌ Error creating referral:", error);
                        }
                }

                let newBusiness = null;

                // If the user provides business info, insert into Business collection
                if (wantsBusiness) {
                        newBusiness = await Business.create({
                                name: businessName,
                                bio: businessDescription,
                                location: businessLocation,
                                businessEmail: businessEmail,
                                businessContactNumber: businessPhone,
                                CreatorName: req.user._id,
                        });
                }

                res.json({
                        msg: "Onboarding completed successfully",
                        user: updatedUser,
                        business: newBusiness
                });
        } catch (err) {
                console.error("❌ Onboarding error:", err);
                res.status(500).json({ msg: "Server Error" });
        }
};

export const getAllUser = async (req, res) => {
        try {
                // console.log('🔐 Logged in user:', req.user); 
                // This should be set by auth middleware

                if (!req.user || !req.user._id) {
                        return res.status(401).json({ message: 'Unauthorized: User ID missing' });
                }

                const loggedInUserId = req.user._id;

                // Find all users except the logged-in user and admin users
                const allUsers = await users.find({ 
                    _id: { $ne: loggedInUserId },
                    isAdmin: { $ne: true }  // Exclude admin users
                }).select('-password');

                res.status(200).json(allUsers);
        } catch (error) {
                console.error('❌ Error fetching users:', error);
                res.status(500).json({ message: 'Server error while fetching users' });
        }
};

export const getProfile = async (req, res) => {
        try {
                if (!req.user || !req.user._id) {
                        return res.status(401).json({ message: "Not authorized, token failed" });
                }

                const user = await users.findById(req.user._id).populate({path: 'connections', select: 'userName userEmail _id'});

                if (!user) {
                        return res.status(404).json({ message: "User not found" });
                }

                const business = await Business.findOne({ CreatorName: req.user._id });

                const chapter = await Chapter.findOne({
                        $or: [
                                { ChapterCreator: req.user._id },
                                { members: req.user._id }
                        ]
                });

                res.status(200).json({
                        user: {
                                id: user._id,
                                name: user.userName,
                                email: user.userEmail,
                                industry: user.industry,
                                location: user.location,
                                bio: user.bio,
                                mobileNumber: user.mobileNumber,
                                userConnections: user.connections,
                                isSeeker: user.isSeeker,
                                isMobileVerified: user.isMobileVerified,
                                isEmailVerified: user.isAccountVerified,
                                birthday: user.birthday,
                                membership: user.membership,
                                address: user.address,
                                isAdmin: user.isAdmin
                        },
                        business: business || null,
                        hasJoinedChapter: chapter || null,
                });

        } catch (error) {
                console.error("❌ Profile Fetch Error:", error);
                res.status(500).json({ message: "Error fetching profile data", error: error.message });
        }
};

export const getUserById = async (req, res) => {
  try {
    const user = await users.findById(req.params.userId)
      .select('-userPassword')
      .populate('banStatus.currentBan.adminId', 'userName')
      .populate('banStatus.banHistory.adminId', 'userName')
      .populate('banStatus.banHistory.unbannedBy', 'userName');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error in getUserById:", error);
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
        try {
                const user = await users.findById(req.params.id).select("-userPassword"); // exclude password
                const userBusiness = await Business.findOne({ CreatorName: req.params.id });

                if (!user) {
                        return res.status(404).json({ message: "User not found" });
                }

                res.status(200).json({ user, business: userBusiness });
        } catch (error) {
                console.error("❌ Error fetching profile:", error);
                res.status(500).json({ message: "Server Error", error: error.message });
        }
};

export const addBusinessInfo = async (req, res) => {
  try {
    const {
      name,
      bio,
      location,
      businessEmail,
      businessContactNumber
    } = req.body;

    // Check if user already has a business
    const existingBusiness = await Business.findOne({ CreatorName: req.user._id });
    if (existingBusiness) {
      return res.status(400).json({ message: "Business information already exists" });
    }

    // Create new business
    const newBusiness = await Business.create({
      name,
      bio,
      location,
      businessEmail,
      businessContactNumber,
      CreatorName: req.user._id,
    });

    res.status(201).json({
      message: "Business information added successfully",
      business: newBusiness
    });
  } catch (error) {
    console.error("Error adding business information:", error);
    res.status(500).json({ 
      message: "Failed to add business information", 
      error: error.message 
    });
  }
};

export const removeBusinessInfo = async (req, res) => {
  try {
    // Find and delete the business associated with the user
    const deletedBusiness = await Business.findOneAndDelete({ 
      CreatorName: req.user._id 
    });

    if (!deletedBusiness) {
      return res.status(404).json({ 
        message: "No business information found to remove" 
      });
    }

    res.status(200).json({
      message: "Business information removed successfully",
      business: deletedBusiness
    });
  } catch (error) {
    console.error("Error removing business information:", error);
    res.status(500).json({ 
      message: "Failed to remove business information", 
      error: error.message 
    });
  }
};

export const updateProfile = async (req, res) => {
    try {
        const {
            userName,
            industry,
            location,
            mobileNumber,
            bio,
            website,
            birthday
        } = req.body;

        // Get current user data to check if mobile number changed
        const currentUser = await users.findById(req.user._id);
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if mobile number has changed
        const mobileNumberChanged = currentUser.mobileNumber !== mobileNumber;

        // Update user info
        const updatedUser = await users.findByIdAndUpdate(
            req.user._id,
            {
                userName,
                industry,
                location,
                mobileNumber,
                bio,
                website,
                birthday: birthday ? new Date(birthday) : undefined,
                // Set isMobileVerified to false if mobile number changed
                isMobileVerified: mobileNumberChanged ? false : currentUser.isMobileVerified
            },
            { new: true }
        ).select('-userPassword');

        // If mobile number changed, don't send OTP here - let the frontend handle it
        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
            mobileNumberChanged
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ 
            message: "Failed to update profile", 
            error: error.message 
        });
    }
};

export const updateBusinessInfo = async (req, res) => {
  try {
    const {
      name,
      bio,
      location,
      businessEmail,
      businessContactNumber
    } = req.body;

    // Find and update the business associated with the user
    const updatedBusiness = await Business.findOneAndUpdate(
      { CreatorName: req.user._id },
      {
        name,
        bio,
        location,
        businessEmail,
        businessContactNumber
      },
      { new: true }
    );

    if (!updatedBusiness) {
      return res.status(404).json({ 
        message: "No business information found to update" 
      });
    }

    res.status(200).json({
      message: "Business information updated successfully",
      business: updatedBusiness
    });
  } catch (error) {
    console.error("Error updating business information:", error);
    res.status(500).json({ 
      message: "Failed to update business information", 
      error: error.message 
    });
        }
};

// Add resend OTP endpoint
export const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await users.findOne({ userEmail: email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Update user with new OTP
        user.verificationOTP = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send new verification email
        await sendVerificationEmail(email, otp);

        res.status(200).json({
            message: "New OTP sent successfully"
        });
    } catch (error) {
        console.error("Resend OTP error:", error);
        res.status(500).json({ 
            message: "Failed to resend OTP",
            error: error.message 
        });
    }
};

// Generate and send OTP for mobile verification
export const resendMobileOTP = async (req, res) => {
    try {
        const user = await users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.mobileNumber) {
            return res.status(400).json({ message: "Mobile number not found" });
        }

        // Check cooldown period
        if (!canSendOTP(user._id.toString())) {
            return res.status(429).json({ 
                message: "Please wait 1 minute before requesting another OTP" 
            });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP in user document with expiry (10 minutes)
        user.mobileOTP = otp;
        user.mobileOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        // Save with validation
        await user.save({ validateBeforeSave: true });

        // Send OTP via SMS
        const message = `Your BN Platform verification code is: ${otp}. This code will expire in 10 minutes. We don't recommend to share your OPT(s) to anyone.`;
        await sendSMS(user.mobileNumber, message);

        // Update cooldown timestamp
        otpCooldowns.set(user._id.toString(), Date.now());

        res.json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error sending mobile OTP:", error);
        res.status(500).json({ 
            message: "Error sending OTP", 
            error: error.message 
        });
    }
};

// Verify mobile OTP
export const verifyMobileOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        // Explicitly select the OTP fields
        const user = await users.findById(req.user.id).select('+mobileOTP +mobileOTPExpiry');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if OTP exists and is not expired
        if (!user.mobileOTP || !user.mobileOTPExpiry) {
            return res.status(400).json({ message: "No OTP found. Please request a new one." });
        }

        if (new Date() > user.mobileOTPExpiry) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        // Verify OTP
        if (user.mobileOTP !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Update user's mobile verification status
        user.isMobileVerified = true;
        user.mobileOTP = undefined;
        user.mobileOTPExpiry = undefined;
        await user.save();

        res.json({ message: "Mobile number verified successfully" });
    } catch (error) {
        console.error("Error verifying mobile OTP:", error);
        res.status(500).json({ message: "Error verifying OTP", error: error.message });
    }
};

// Search users by name or email
export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query || query.length < 2) {
            return res.status(400).json({ 
                success: false,
                message: "Search query must be at least 2 characters long" 
            });
        }

        const searchResults = await users.find({
            $or: [
                { userName: { $regex: query, $options: 'i' } },
                { userEmail: { $regex: query, $options: 'i' } }
            ],
            _id: { $ne: req.user._id } // Exclude current user
        })
        .select('userName userEmail userImage')
        .limit(10);

        res.status(200).json(searchResults);
    } catch (error) {
        console.error("❌ Error searching users:", error);
        res.status(500).json({ 
            success: false,
            message: "Failed to search users",
            error: error.message 
        });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        // Verify admin password
        const admin = await users.findById(req.user._id);
        const isMatch = await bcrypt.compare(password, admin.userPassword);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Find and delete the user
        const user = await users.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete user's business if exists
        await Business.findOneAndDelete({ CreatorName: id });

        // Delete user's activities
        await Activity.deleteMany({ user: id });

        // Delete user's notifications
        await Notification.deleteMany({ user: id });

        // Delete user's membership history
        await MembershipHistory.deleteMany({ user: id });

        // Delete the user
        await users.findByIdAndDelete(id);

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ 
            message: "Failed to delete user", 
            error: error.message 
        });
    }
};

// @desc    Warn a user
// @route   POST /api/users/:userId/warn
// @access  Private/Admin
export const warnUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason, password } = req.body;

        // Verify admin password
        const admin = await users.findById(req.user._id);
        const isMatch = await bcrypt.compare(password, admin.userPassword);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const user = await users.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Initialize warnings if they don't exist
        if (!user.warnings) {
            user.warnings = {
                count: 0,
                history: []
            };
        }

        // Add warning to history
        const warning = {
            reason,
            date: new Date(),
            adminId: req.user._id
        };

        // Update warnings using $set and $push operators
        await users.findByIdAndUpdate(userId, {
            $set: { 'warnings.count': (user.warnings.count || 0) + 1 },
            $push: { 'warnings.history': warning }
        });

        // Get updated user data
        const updatedUser = await users.findById(userId);

        // Try to send email, but don't fail the whole operation if email fails
        try {
            // Create reusable transporter
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                },
                tls: {
                    rejectUnauthorized: false // Only use this in development
                }
            });

            // Verify transporter configuration
            await transporter.verify();

            const mailOptions = {
                from: `"Business Network" <${process.env.EMAIL_USER}>`,
                to: user.userEmail,
                subject: "Warning from Business Network",
                html: `
                    <h1>Warning Notice</h1>
                    <p>Dear ${user.userName},</p>
                    <p>You have received a warning for the following reason:</p>
                    <p><strong>${reason}</strong></p>
                    <p>This is warning ${(user.warnings.count || 0) + 1} of 3. After 3 warnings, your account may be banned.</p>
                    <p>Please review our community guidelines and ensure compliance.</p>
                    <p>Best regards,<br>Business Network Team</p>
                `
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('Warning email sent:', info.messageId);

            res.json({
                success: true,
                message: "Warning sent successfully",
                warnings: updatedUser.warnings,
                emailSent: true
            });
        } catch (emailError) {
            console.error("Error sending warning email:", emailError);
            
            // Still return success but indicate email wasn't sent
            res.json({
                success: true,
                message: "Warning recorded but email could not be sent",
                warnings: updatedUser.warnings,
                emailSent: false,
                emailError: emailError.message
            });
        }
    } catch (error) {
        console.error("Error in warnUser:", error);
        res.status(500).json({ 
            message: "Error sending warning",
            error: error.message 
        });
    }
};

// @desc    Ban a user
// @route   POST /api/users/:userId/ban
// @access  Private/Admin
export const banUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason, duration, password } = req.body;

        // Verify admin password
        const admin = await users.findById(req.user._id);
        const isMatch = await bcrypt.compare(password, admin.userPassword);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const user = await users.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Calculate ban end date
        const startDate = new Date();
        const endDate = duration ? new Date(startDate.getTime() + (duration * 24 * 60 * 60 * 1000)) : null;

        // Create new ban record
        const newBan = {
            reason,
            startDate,
            endDate,
            adminId: req.user._id
        };

        // Update user ban status
        const updatedUser = await users.findByIdAndUpdate(
            userId,
            {
                $set: {
                    'banStatus.isBanned': true,
                    'banStatus.currentBan': newBan
                },
                $push: {
                    'banStatus.banHistory': newBan
                },
                $inc: {
                    'banStatus.banCount': 1
                }
            },
            { new: true }
        );

        // Log ban activity
        await Activity.create({
            user: userId,
            activityType: "account",
            action: "User Banned",
            metadata: {
                reason,
                duration: duration ? `${duration} days` : 'permanent',
                startDate,
                endDate,
                bannedBy: req.user._id,
                adminName: admin.userName,
                banCount: updatedUser.banStatus.banCount
            }
        });

        // Try to send email, but don't fail the whole operation if email fails
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                },
                tls: {
                    rejectUnauthorized: false // Only use this in development
                }
            });

            // Verify transporter configuration
            await transporter.verify();

            const mailOptions = {
                from: `"Business Network" <${process.env.EMAIL_USER}>`,
                to: user.userEmail,
                subject: "Account Banned - Business Network",
                html: `
                    <h1>Account Banned</h1>
                    <p>Dear ${user.userName},</p>
                    <p>Your account has been banned for the following reason:</p>
                    <p><strong>${reason}</strong></p>
                    ${endDate ? 
                        `<p>Your ban will be in effect until: ${endDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</p>` :
                        '<p>This is a permanent ban.</p>'
                    }
                    <p>If you believe this is a mistake, please contact our support team.</p>
                    <p>Best regards,<br>Business Network Team</p>
                `
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('Ban email sent:', info.messageId);

            res.json({
                success: true,
                message: "User banned successfully",
                user: updatedUser,
                emailSent: true,
                banDetails: {
                    reason,
                    startDate,
                    endDate,
                    duration: duration ? `${duration} days` : 'permanent'
                }
            });
        } catch (emailError) {
            console.error("Error sending ban email:", emailError);
            
            // Still return success but indicate email wasn't sent
            res.json({
                success: true,
                message: "User banned but email could not be sent",
                user: updatedUser,
                emailSent: false,
                emailError: emailError.message,
                banDetails: {
                    reason,
                    startDate,
                    endDate,
                    duration: duration ? `${duration} days` : 'permanent'
                }
            });
        }
    } catch (error) {
        console.error("Error in banUser:", error);
        res.status(500).json({ 
            message: "Error banning user",
            error: error.message 
        });
    }
};

// @desc    Unban a user
// @route   POST /api/users/:userId/unban
// @access  Private/Admin
export const unbanUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { password, reason } = req.body;

        // Verify admin password
        const admin = await users.findById(req.user._id);
        const isMatch = await bcrypt.compare(password, admin.userPassword);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const user = await users.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Store current ban details
        const currentBan = user.banStatus.currentBan;

        // Update the last ban history entry with unban details
        const unbanDetails = {
            unbannedAt: new Date(),
            unbannedBy: req.user._id,
            unbannedReason: reason || "Admin decision"
        };

        // Update user ban status
        const updatedUser = await users.findByIdAndUpdate(
            userId,
            {
                $set: {
                    'banStatus.isBanned': false,
                    'banStatus.currentBan': null,
                    [`banStatus.banHistory.${user.banStatus.banHistory.length - 1}`]: {
                        ...currentBan,
                        ...unbanDetails
                    }
                }
            },
            { new: true }
        );

        // Log unban activity
        await Activity.create({
            user: userId,
            activityType: "account",
            action: "User Unbanned",
            metadata: {
                previousBanReason: currentBan.reason,
                banStartDate: currentBan.startDate,
                banEndDate: currentBan.endDate,
                unbannedBy: req.user._id,
                adminName: admin.userName,
                unbannedAt: unbanDetails.unbannedAt,
                unbannedReason: unbanDetails.unbannedReason,
                banCount: user.banStatus.banCount
            }
        });

        // Try to send email, but don't fail the whole operation if email fails
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                },
                tls: {
                    rejectUnauthorized: false // Only use this in development
                }
            });

            // Verify transporter configuration
            await transporter.verify();

            const mailOptions = {
                from: `"Business Network" <${process.env.EMAIL_USER}>`,
                to: user.userEmail,
                subject: "Account Unbanned - Business Network",
                html: `
                    <h1>Account Unbanned</h1>
                    <p>Dear ${user.userName},</p>
                    <p>Your account has been unbanned. You can now log in and access your account.</p>
                    <p>Best regards,<br>Business Network Team</p>
                `
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('Unban email sent:', info.messageId);

            res.json({
                success: true,
                message: "User unbanned successfully",
                user: updatedUser,
                emailSent: true
            });
        } catch (emailError) {
            console.error("Error sending unban email:", emailError);
            
            // Still return success but indicate email wasn't sent
            res.json({
                success: true,
                message: "User unbanned but email could not be sent",
                user: updatedUser,
                emailSent: false,
                emailError: emailError.message
            });
        }
    } catch (error) {
        console.error("Error in unbanUser:", error);
        res.status(500).json({ 
            message: "Error unbanning user",
            error: error.message 
        });
    }
};

// Add this new function to handle automatic unbans
export const checkAndHandleExpiredBans = async () => {
  try {
    const now = new Date();
    
    // Find all users with expired bans
    const usersWithExpiredBans = await users.find({
      'banStatus.isBanned': true,
      'banStatus.currentBan.endDate': { $lt: now }
    });

    console.log(`Found ${usersWithExpiredBans.length} users with expired bans`);

    for (const user of usersWithExpiredBans) {
      const currentBan = user.banStatus.currentBan;
      
      // Create unban details
      const unbanDetails = {
        unbannedAt: now,
        unbannedBy: null, // System unban
        unbannedReason: "Ban duration expired"
      };

      // Update user ban status
      await users.findByIdAndUpdate(user._id, {
        $set: {
          'banStatus.isBanned': false,
          'banStatus.currentBan': null,
          [`banStatus.banHistory.${user.banStatus.banHistory.length - 1}`]: {
            ...currentBan,
            ...unbanDetails
          }
        }
      });

      // Log the automatic unban activity
      await Activity.create({
        user: user._id,
        activityType: "account",
        action: "User Unbanned",
        metadata: {
          previousBanReason: currentBan.reason,
          banStartDate: currentBan.startDate,
          banEndDate: currentBan.endDate,
          unbannedAt: now,
          unbannedReason: "Ban duration expired",
          banCount: user.banStatus.banCount,
          isAutomatic: true
        }
      });

      // Send email notification
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        const mailOptions = {
          from: `"Business Network" <${process.env.EMAIL_USER}>`,
          to: user.userEmail,
          subject: "Account Unbanned - Business Network",
          html: `
            <h1>Account Unbanned</h1>
            <p>Dear ${user.userName},</p>
            <p>Your account has been automatically unbanned as your ban duration has expired.</p>
            <p>You can now log in and access your account.</p>
            <p>Best regards,<br>Business Network Team</p>
          `
        };

        await transporter.sendMail(mailOptions);
      } catch (emailError) {
        console.error("Error sending unban email:", emailError);
      }

      console.log(`Automatically unbanned user ${user._id}`);
    }
  } catch (error) {
    console.error("Error in checkAndHandleExpiredBans:", error);
  }
};

// Add this to your existing code to run the check periodically
// You can adjust the interval as needed (currently set to 5 minutes)
setInterval(checkAndHandleExpiredBans, 5 * 60 * 1000);