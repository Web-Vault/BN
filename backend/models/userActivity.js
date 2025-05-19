import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
        {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
                content: { type: String, required: true },
                type: {
                        type: String,
                        enum: ["Others", "Referral", "One-To-One"],
                        default: "Others",
                },
                typeContent: { type: String }, // optional: for referral or one-to-one name
                rating: { type: Number, min: 1, max: 5 },
        },
        { timestamps: true }
);

export default mongoose.model("userActivity", activitySchema);
