import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
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
    venue: {
      type: String,
      required: true,
    },
    entryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      default: "",
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    bookings: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
      bookingDate: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled"],
        default: "pending",
      },
      paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Add index for better query performance
eventSchema.index({ chapter: 1, date: 1 });

const Event = mongoose.model("Event", eventSchema);

export default Event; 