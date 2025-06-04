// models/chapter.js
import mongoose from "mongoose";

const activitySchema = mongoose.Schema({
        user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        content: { type: String },
        image: { type: String },
        timestamp: { type: Date, default: Date.now },
});

const chapterSchema = mongoose.Schema(
        {
                chapterName: { type: String, required: true },
                chapterDesc: { type: String },
                chapterTech: { type: String },
                chapterCreator: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
                members: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
                activities: [activitySchema],
                joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
                meetings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Meeting" }],
                events: [{
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Event"
                }],
        },
        {
                timestamps: true,
        }
);

// Add index for meetings
chapterSchema.index({ meetings: 1 });

// Check if the model exists before creating a new one
const Chapter = mongoose.models.Chapter || mongoose.model("Chapter", chapterSchema);

export default Chapter;
