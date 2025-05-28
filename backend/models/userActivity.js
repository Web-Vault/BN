import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
        {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
                content: { type: String, required: true },
                type: {
                        type: String,
                        enum: ["One-To-One", "Business Received", "Business Given", "Visitors", "Chapter Meeting", "BNI Training", "BNI Event", "BNI Leadership"],
                        required: true,
                },
                typeContent: { type: String }, // optional: for referral or one-to-one name
                date: { type: Date, default: Date.now },
                rating: { type: Number, min: 1, max: 5 },
                visitorCount: { type: Number, default: 0 },
                businessAmount: { type: Number, default: 0 },
                referenceDetails: { type: String },
                relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
                meetingLocation: { type: String },
                meetingDuration: { type: Number },
                businessCategory: { type: String },
                referralStatus: { type: String, enum: ["pending", "converted", "lost"], default: "pending" },
                businessStatus: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },
                visitorType: { type: String, enum: ["guest", "member", "other"], default: "guest" },
                eventType: { type: String, enum: ["chapter", "regional", "national", "international"], default: "chapter" },
                status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
                isVerified: { type: Boolean, default: false },
                verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
                verificationDate: { type: Date },
                verificationNotes: { type: String },
                visibility: { type: String, enum: ["public", "private"], default: "public" }
        },
        { timestamps: true }
);

export default mongoose.model("userActivity", activitySchema);
