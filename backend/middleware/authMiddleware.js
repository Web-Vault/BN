import jwt from "jsonwebtoken";
import User from "../models/users.js";

export const protect = async (req, res, next) => {
        let token = req.headers.authorization;

        // console.log("🔹 Token Received in Backend:", token);

        if (token && token.startsWith("Bearer ")) {
                try {
                        token = token.split(" ")[1];
                        // console.log("✅ Extracted Token:", token);

                        const decoded = jwt.verify(token, process.env.JWT_SECRET);
                        // console.log("✅ Decoded Token:", decoded);

                        req.user = await User.findById(decoded.id).select("-userPassword");

                        if (!req.user) {
                                // console.log("❌ User Not Found in Database!");
                                return res.status(401).json({ message: "User not found, authorization denied" });
                        }

                        // Check if user is banned
                        if (req.user.banStatus && req.user.banStatus.isBanned) {
                                return res.status(403).json({
                                        message: "Account is banned",
                                        banDetails: {
                                                reason: req.user.banStatus.reason,
                                                startDate: req.user.banStatus.startDate,
                                                endDate: req.user.banStatus.endDate,
                                                adminId: req.user.banStatus.adminId
                                        }
                                });
                        }

                        // console.log("✅ User Authenticated:", req.user);
                        next();
                } catch (error) {
                        console.error("❌ Token Verification Failed:", error);
                        return res.status(401).json({ message: "Invalid token, authorization denied" });
                }
        } else {
                // console.log("❌ No Token Found in Request Headers!");
                return res.status(401).json({ message: "Unauthorized access. Please login first!" });
        }
};