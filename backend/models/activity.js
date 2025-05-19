import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
        {
                user: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "users",
                        required: true,
                },
                activityType: {
                        type: String,
                        enum: ["account", "business", "investment", "referral"],
                        required: true,
                },
                action: {
                        type: String,
                        required: true,
                },
                metadata: {
                        type: Object, // Optional: can store extra info like IDs, names, amounts, etc.
                        default: {},
                },
        },
        {
                timestamps: true, // Adds createdAt and updatedAt
        }
);

export default mongoose.model("Activity", activitySchema);
