import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    meetingType: {
      type: String,
      enum: ["online", "offline"],
      required: true,
    },
    meetingLink: {
      type: String,
      // Required only for online meetings
      validate: {
        validator: function(v) {
          return this.meetingType !== "online" || (this.meetingType === "online" && v);
        },
        message: "Meeting link is required for online meetings",
      },
    },
    location: {
      type: String,
      // Required only for offline meetings
      validate: {
        validator: function(v) {
          return this.meetingType !== "offline" || (this.meetingType === "offline" && v);
        },
        message: "Location is required for offline meetings",
      },
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
meetingSchema.index({ chapter: 1, date: 1 });
meetingSchema.index({ createdBy: 1, date: 1 });

// Method to check if meeting is upcoming
meetingSchema.methods.isUpcoming = function() {
  const meetingDateTime = new Date(`${this.date.toISOString().split('T')[0]}T${this.time}`);
  return meetingDateTime > new Date();
};

// Method to check if meeting is ongoing
meetingSchema.methods.isOngoing = function() {
  const meetingDateTime = new Date(`${this.date.toISOString().split('T')[0]}T${this.time}`);
  const endDateTime = new Date(`${this.date.toISOString().split('T')[0]}T${this.endTime}`);
  const now = new Date();
  return now >= meetingDateTime && now <= endDateTime;
};

// Method to check if meeting has ended
meetingSchema.methods.hasEnded = function() {
  const endDateTime = new Date(`${this.date.toISOString().split('T')[0]}T${this.endTime}`);
  return new Date() > endDateTime;
};

// Method to update meeting status
meetingSchema.methods.updateStatus = function() {
  if (this.status === 'cancelled') return; // Don't update cancelled meetings
  
  if (this.isUpcoming()) {
    this.status = 'upcoming';
  } else if (this.isOngoing()) {
    this.status = 'ongoing';
  } else if (this.hasEnded()) {
    this.status = 'completed';
  }
};

// Update meeting status based on date and time
meetingSchema.pre('save', function(next) {
  this.updateStatus();
  next();
});

// Static method to update all meeting statuses
meetingSchema.statics.updateAllStatuses = async function() {
  const meetings = await this.find({
    status: { $in: ['upcoming', 'ongoing'] }
  });

  for (const meeting of meetings) {
    const oldStatus = meeting.status;
    meeting.updateStatus();
    
    if (oldStatus !== meeting.status) {
      await meeting.save();
    }
  }
};

export default mongoose.model("Meeting", meetingSchema); 