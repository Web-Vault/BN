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
        },
        {
                timestamps: true,
        }
);

export default mongoose.model("Chapter", chapterSchema);
