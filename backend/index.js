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

dotenv.config();

const app = express();

connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/activity", activityRoutes); // ✅ This connects the route!
app.use('/api/connections', connectionRoutes);

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
