import users from "../models/users.js";
import Business from "../models/Business.js";
import Chapter from "../models/chapter.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Referral from "../models/referral.js";

// Helper function to generate unique referral code
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

                // Create user with referral code
                const user = await users.create({
                        userName,
                        userEmail,
                        userPassword: hashedPassword,
                        referralCode
                });

                // Generate JWT token
                const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                        expiresIn: "7d",
                });

                res.status(201).json({
                        message: "Registration successful",
                        user: { id: user._id, name: user.userName, email: user.userEmail },
                        token,
                });
        } catch (error) {
                console.error("Registration error:", error);
                res.status(500).json({ 
                    message: "Registration failed",
                    error: error.message 
                });
        }
};

// Login user
export const loginUser = async (req, res) => {
        try {
                const { email, password } = req.body;

                // Check if user exists
                const user = await users.findOne({ userEmail: email }); // Match schema field
                if (!user) {
                        return res.status(404).json({ message: "Invalid email or password" });
                }

                // Validate password
                const isMatch = await bcrypt.compare(password, user.userPassword);
                if (!isMatch) {
                        return res.status(400).json({ message: "Invalid email or password" });
                }

                // Generate JWT token
                const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
                        expiresIn: "7d",
                });

                res.json({
                        message: "Login successful",
                        user: {
                                id: user._id,
                                name: user.name,
                                email: user.email,
                                token,
                        },
                });
        } catch (error) {
                console.error("Error logging in:", error);
                res.status(500).json({ message: "Error logging in", error: error.message });
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
                });

                // Handle referral code if provided
                if (referralCode) {
                        try {
                                // Find referrer
                                const referrer = await users.findOne({ referralCode });
                                if (!referrer) {
                                        console.log("❌ Invalid referral code:", referralCode);
                                } else {
                                        // Create new referral
                                        const referral = new Referral({
                                                referrer: referrer._id,
                                                referredUser: req.user._id,
                                                referralCode: referralCode,
                                                status: 'pending'
                                        });
                                        await referral.save();
                                        console.log("✅ Referral created successfully");
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

                res.status(201).json({
                        message: "Onboarding data saved successfully",
                        user: updatedUser,
                        business: newBusiness,
                });
        } catch (error) {
                res.status(500).json({ message: "❌ Server error saving onboarding data", error: error.message });
        }
};

export const getAllUser = async (req, res) => {
        try {
                console.log('🔐 Logged in user:', req.user); // This should be set by auth middleware

                if (!req.user || !req.user._id) {
                        return res.status(401).json({ message: 'Unauthorized: User ID missing' });
                }

                const loggedInUserId = req.user._id;

                const allUsers = await users.find({ _id: { $ne: loggedInUserId } }).select('-password');

                res.status(200).json(allUsers);
        } catch (error) {
                console.error('❌ Error fetching users:', error);
                res.status(500).json({ message: 'Server error while fetching users' });
        }
};

export const getProfile = async (req, res) => {
        try {
                console.log("🔍 Incoming Request: ", req.headers); // ✅ Log request headers

                if (!req.user || !req.user._id) {
                        console.log("❌ User not found in request!");
                        return res.status(401).json({ message: "Not authorized, token failed" });
                }

                console.log("🔑 User ID from token:", req.user._id);
                const user = await users.findById(req.user._id).populate({path: 'connections', select: 'userName userEmail _id'});

                if (!user) {
                        console.log("❌ No user found in database!");
                        return res.status(404).json({ message: "User not found" });
                }

                console.log("✅ Found User:", user);
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
                        },
                        business: business || null,
                        hasJoinedChapter: chapter || null,

                });

        } catch (error) {
                console.error("❌ Profile Fetch Error:", error);
                res.status(500).json({ message: "Error fetching profile data", error: error.message });
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
      website
    } = req.body;

    // Update user info
    const updatedUser = await users.findByIdAndUpdate(
      req.user._id,
      {
        userName,
        industry,
        location,
        mobileNumber,
        bio,
        website
      },
      { new: true }
    ).select('-userPassword');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
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