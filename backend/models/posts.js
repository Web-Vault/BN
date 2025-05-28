import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"
    }],
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }],
    images: [{
      type: String,
      required: false
    }],
    type: {
      type: String,
      enum: ['news', 'events', 'others'],
      default: 'news'
    },
    isAnnouncement: {
      type: Boolean,
      default: false
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter"
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ chapter: 1, createdAt: -1 });
postSchema.index({ isAnnouncement: 1, createdAt: -1 });
postSchema.index({ type: 1, createdAt: -1 });

const Post = mongoose.model("Post", postSchema);

export default Post; 