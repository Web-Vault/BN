import mongoose from "mongoose";

const meetingAttendanceSchema = new mongoose.Schema(
  {
    meeting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true
    },
    joinTime: {
      type: Date,
      default: Date.now
    },
    leaveTime: {
      type: Date
    },
    duration: {
      type: Number, // Duration in minutes
      default: 0
    },
    status: {
      type: String,
      enum: ["present", "late", "left_early", "absent"],
      default: "present"
    }
  },
  { timestamps: true }
);

// Create a compound index to prevent duplicate attendance records
meetingAttendanceSchema.index({ meeting: 1, user: 1 }, { unique: true });

export default mongoose.model("MeetingAttendance", meetingAttendanceSchema); 