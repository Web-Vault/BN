import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import bodyParser from "body-parser";

import userRoutes from "./routes/userRoutes.js";
import chapterRoutes from "./routes/chapterRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import connectionRoutes from './routes/connectionRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import postRoutes from './routes/postRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import eventRoutes from "./routes/eventRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import membershipRoutes from './routes/membershipRoutes.js';
import membershipHistoryRoutes from './routes/membershipHistoryRoutes.js';
import membershipTierRoutes from './routes/membershipTierRoutes.js';
import adminRoutes from './routes/admin.js';
import settingsRoutes from './routes/settingsRoutes.js';

import path from "path";

dotenv.config();

const app = express();

// Serve QR codes statically
app.use("/qrcodes", express.static(path.join(process.cwd(), "public", "qrcodes")));

connectDB();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'https://bn-frontend.onrender.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/activity", activityRoutes); // ✅ This connects the route!
app.use('/api/connections', connectionRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', meetingRoutes);
app.use("/api", eventRoutes);
app.use("/api/reports", reportRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/membership-history', membershipHistoryRoutes);
app.use('/api/membership-tiers', membershipTierRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

mongoose
        .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log("✅ MongoDB Connected Successfully!"))
        .catch((err) => {
                console.error("❌ MongoDB Connection Error:", err);
                process.exit(1);
        });


// Default Route
app.get("/", (req, res) => {
        res.status(200).json({ message: "🚀 API is running..." });
});

// 404 Error Handling Middleware
app.use((req, res, next) => {
        res.status(404).json({ success: false, message: "❌ Route Not Found!" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
