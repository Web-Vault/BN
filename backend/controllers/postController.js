import Post from "../models/posts.js";
import Comment from "../models/comments.js";
import { protect } from "../middleware/authMiddleware.js";

// Create a new post/announcement
export const createPost = async (req, res) => {
  try {
    const { content, isAnnouncement, type, images } = req.body;
    const userId = req.user._id; // From auth middleware

    console.log('Received post data:', { content, isAnnouncement, type, images }); // Debug log

    const newPost = new Post({
      content,
      author: userId,
      isAnnouncement: isAnnouncement || false,
      type: type || 'news',
      images: Array.isArray(images) ? images : [] // Ensure images is an array
    });

    const savedPost = await newPost.save();
    
    // Populate author details
    await savedPost.populate('author', 'userName userImage');
    
    console.log('Saved post:', savedPost); // Debug log

    res.status(201).json({
      success: true,
      data: savedPost
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating post',
      error: error.message
    });
  }
};

// Get all posts/announcements
export const getPosts = async (req, res) => {
  try {
    const { isAnnouncement } = req.query;
    const query = {};

    // Add filters if provided
    if (isAnnouncement) {
      query.isAnnouncement = isAnnouncement === 'true';
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: 'author',
        select: 'userName userImage',
        model: 'users'
      })
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'userName userImage',
          model: 'users'
        }
      });

    // Ensure we're sending an array
    res.status(200).json({
      success: true,
      data: posts || [] // Ensure we always send an array
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching posts',
      error: error.message,
      data: [] // Send empty array on error
    });
  }
};

// Get a single post by ID
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate({
        path: 'author',
        select: 'userName userImage',
        model: 'users'
      })
      .populate({
        path: 'comments',
        model: 'Comment',
        populate: [
          {
            path: 'author',
            select: 'userName userImage',
            model: 'users'
          },
          {
            path: 'replies',
            model: 'Comment',
            populate: {
              path: 'author',
              select: 'userName userImage',
              model: 'users'
            }
          }
        ]
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching post',
      error: error.message
    });
  }
};

// Like/Unlike a post
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const userId = req.user._id;
    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      // Like the post
      post.likes.push(userId);
    } else {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
    }

    await post.save();
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling like',
      error: error.message
    });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Delete all comments associated with this post
    await Comment.deleteMany({ post: req.params.id });

    // Delete the post
    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post and associated comments deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting post',
      error: error.message
    });
  }
};

// Add comment to a post
export const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Create a new comment document
    const newComment = new Comment({
      content: req.body.content,
      author: req.user._id,
      post: post._id,
      createdAt: new Date()
    });

    // Save the comment
    const savedComment = await newComment.save();

    // Add the comment reference to the post
    post.comments.push(savedComment._id);
    await post.save();

    // Populate the comment with author details
    const populatedComment = await Comment.findById(savedComment._id)
      .populate('author', 'userName userImage');

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user is the author of the comment
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Remove comment reference from post
    post.comments = post.comments.filter(
      commentId => commentId.toString() !== req.params.commentId
    );
    await post.save();

    // Delete the comment document
    await comment.deleteOne();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
};

// Add reply to a comment
export const addReply = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const parentComment = await Comment.findById(req.params.commentId);
    if (!parentComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Create a new reply document
    const newReply = new Comment({
      content: req.body.content,
      author: req.user._id,
      post: post._id,
      parentComment: parentComment._id,
      createdAt: new Date()
    });

    // Save the reply
    const savedReply = await newReply.save();

    // Add the reply reference to the parent comment
    parentComment.replies.push(savedReply._id);
    await parentComment.save();

    // Populate the reply with author details
    const populatedReply = await Comment.findById(savedReply._id)
      .populate('author', 'userName userImage');

    res.status(201).json(populatedReply);
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ message: 'Error adding reply' });
  }
};

// Delete a reply
export const deleteReply = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const parentComment = await Comment.findById(req.params.commentId);
    if (!parentComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const reply = await Comment.findById(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Check if the user is the author of the reply
    if (reply.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this reply' });
    }

    // Remove reply reference from parent comment
    parentComment.replies = parentComment.replies.filter(
      replyId => replyId.toString() !== req.params.replyId
    );
    await parentComment.save();

    // Delete the reply document
    await reply.deleteOne();

    res.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ message: 'Error deleting reply' });
  }
}; 