import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiHeart,
  FiMessageSquare,
  FiTrash2,
  FiSend,
  FiArrowLeft,
  FiDownload,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Navbar from "../../components/Navbar";

// Update the CSS styles at the top of the file
const getImageGridStyles = (imageCount) => {
  if (imageCount === 1) {
    return {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '8px',
      padding: '8px',
    };
  } else if (imageCount === 2) {
    return {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '8px',
      padding: '8px',
    };
  } else if (imageCount === 3) {
    return {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gridTemplateRows: 'repeat(2, 1fr)',
      gap: '8px',
      padding: '8px',
    };
  } else {
    return {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gridAutoRows: '200px',
      gap: '8px',
      padding: '8px',
    };
  }
};

const getImageContainerStyles = (imageCount, index, aspectRatio) => {
  const baseStyles = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '8px',
    cursor: 'pointer',
  };

  if (imageCount === 1) {
    return {
      ...baseStyles,
      gridColumn: '1 / -1',
      aspectRatio: '16/9',
    };
  } else if (imageCount === 2) {
    return {
      ...baseStyles,
      aspectRatio: '1/1',
    };
  } else if (imageCount === 3) {
    if (index === 0) {
      return {
        ...baseStyles,
        gridColumn: '1 / -1',
        aspectRatio: '16/9',
      };
    } else {
      return {
        ...baseStyles,
        aspectRatio: '1/1',
      };
    }
  } else {
    // For 4 or more images
    return {
      ...baseStyles,
      aspectRatio: aspectRatio || '1/1',
    };
  }
};

const SinglePost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [likes, setLikes] = useState(false);
  const [newReply, setNewReply] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});
  const [downloadingImages, setDownloadingImages] = useState({});

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/posts/${postId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Post data:", response.data.data);
        setPost(response.data.data);
        // Initialize like state based on current user
        const currentUserId = localStorage.getItem("userId");
        setLikes(response.data.data.likes.includes(currentUserId));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post");
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleLike = async () => {
    const token = localStorage.getItem("token");
    const currentUserId = localStorage.getItem("userId");

    try {
      // Optimistically update UI
      setPost((prevPost) => ({
        ...prevPost,
        likes: likes
          ? prevPost.likes.filter((id) => id !== currentUserId)
          : [...prevPost.likes, currentUserId],
      }));

      // Update likes state
      setLikes(!likes);

      // Make API call
      await axios.post(
        `http://localhost:5000/api/posts/${postId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error("Error liking post:", err);
      // Revert optimistic update on error
      const response = await axios.get(
        `http://localhost:5000/api/posts/${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPost(response.data.data);
      setLikes(response.data.data.likes.includes(currentUserId));
    }
  };

  const handleCommentSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/posts/${postId}/comments`,
        { content: newComment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update post with the new comment
      setPost(prev => ({
        ...prev,
        comments: [...(prev.comments || []), response.data]
      }));

      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/posts/${postId}/comments/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update post state by removing the deleted comment
      setPost(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c._id !== commentId)
      }));

      // Clear any expanded reply inputs for the deleted comment
      setExpandedReplies(prev => {
        const newState = { ...prev };
        delete newState[commentId];
        return newState;
      });

      // Clear any pending replies for the deleted comment
      setNewReply(prev => {
        const newState = { ...prev };
        delete newState[commentId];
        return newState;
      });
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const handleReplySubmit = async (commentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/posts/${post._id}/comments/${commentId}/replies`,
        { content: newReply[commentId] },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update post with the new reply
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                replies: [...(comment.replies || []), response.data],
              }
            : comment
        ),
      }));

      // Clear the reply input
      setNewReply((prev) => ({ ...prev, [commentId]: "" }));
    } catch (err) {
      console.error("Error adding reply:", err);
    }
  };

  const toggleReplyInput = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleDeleteReply = async (commentId, replyId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/posts/${postId}/comments/${commentId}/replies/${replyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update post state by removing the deleted reply
      setPost(prev => ({
        ...prev,
        comments: prev.comments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: comment.replies.filter(reply => reply._id !== replyId)
            };
          }
          return comment;
        })
      }));
    } catch (err) {
      console.error("Error deleting reply:", err);
    }
  };

  const handleImageDownload = async (imageUrl, imageIndex, e) => {
    e.stopPropagation();
    const key = `${postId}-${imageIndex}`;

    try {
      setDownloadingImages((prev) => ({ ...prev, [key]: 0 }));

      // Simulate download progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setDownloadingImages((prev) => ({ ...prev, [key]: i }));
      }

      // Actual download
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `image-${postId}-${imageIndex}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Reset progress
      setTimeout(() => {
        setDownloadingImages((prev) => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });
      }, 500);
    } catch (error) {
      console.error("Error downloading image:", error);
      setDownloadingImages((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] p-3 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-white hover:text-blue-200 transition-colors"
          >
            <FiArrowLeft /> Back to Community
          </button>

          {/* Post */}
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 mb-6 shadow-lg border border-white/20">
            <div className="flex items-start gap-4">
              <img
                src={post.author?.userImage || "default-avatar.png"}
                alt={post.author?.userName || "User"}
                className="w-12 h-12 rounded-full border-2 border-white/50"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3
                    onClick={() => {
                      navigate(`/userProfile/${post.author._id}`);
                    }}
                    className="h2 d-block text-2xl font-semibold text-gray-800 mb-2 p-1 relative cursor-pointer after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-gray-400 after:transition-all after:duration-300 hover:after:w-full rounded-full"
                  >
                    {post.author?.userName || "Anonymous User"}
                  </h3>
                  <span className="text-sm text-black">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 mt-2 text-lg leading-relaxed">
                  {post.content}
                </p>

                {/* Display images if they exist */}
                {post.images && post.images.length > 0 && (
                  <div className="mt-4">
                    <div style={getImageGridStyles(post.images.length)}>
                      {post.images.map((imageUrl, index) => (
                        <div 
                          key={index} 
                          style={getImageContainerStyles(post.images.length, index)}
                          className="group"
                        >
                          <img
                            src={imageUrl}
                            alt={`Post image ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                            }}
                            onLoad={(e) => {
                              // Calculate and set aspect ratio
                              const img = e.target;
                              const aspectRatio = img.naturalWidth / img.naturalHeight;
                              img.parentElement.style.aspectRatio = aspectRatio;
                            }}
                          />
                          <div className="absolute bottom-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <AnimatePresence>
                              {downloadingImages[`${postId}-${index}`] !== undefined && (
                                <motion.div
                                  initial={{ width: 0, opacity: 0 }}
                                  animate={{ width: "100px", opacity: 1 }}
                                  exit={{ width: 0, opacity: 0 }}
                                  className="h-1 bg-white/80 rounded-full overflow-hidden"
                                >
                                  <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{
                                      width: `${downloadingImages[`${postId}-${index}`]}%`,
                                    }}
                                    className="h-full bg-blue-500"
                                    transition={{ duration: 0.1 }}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => handleImageDownload(imageUrl, index, e)}
                              className="bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
                            >
                              <FiDownload className="text-blue-600" />
                            </motion.button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      likes
                        ? "bg-red-100 text-red-500"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    <FiHeart className="text-lg" /> Like ({post.likes?.length || 0})
                  </button>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-500">
                    <FiMessageSquare className="text-lg" /> Comments (
                    {post.comments?.reduce(
                      (total, comment) =>
                        total + 1 + (comment.replies?.length || 0),
                      0
                    ) || 0}
                    )
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white/50 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/20">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">
              Comments
            </h3>

            <div className="mt-8 space-y-6">
              {post.comments?.map((comment) => (
                <div key={comment._id} className="bg-white/20 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4
                          onClick={() => {
                            navigate(`/userProfile/${comment.author._id}`);
                          }}
                          className="h2 d-block font-medium text-gray-800 mb-2 p-1 relative cursor-pointer after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-gray-400 after:transition-all after:duration-300 hover:after:w-full rounded-full"
                        >
                          {comment.author.userName}
                        </h4>
                        <button
                          onClick={() => toggleReplyInput(comment._id)}
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <FiMessageSquare className="text-sm" /> Reply
                        </button>
                      </div>
                      <p className="text-gray-600 mt-1">{comment.content}</p>

                      {/* Reply input field */}
                      {expandedReplies[comment._id] && (
                        <div className="mt-2 flex gap-2">
                          <input
                            type="text"
                            value={newReply[comment._id] || ""}
                            onChange={(e) =>
                              setNewReply({
                                ...newReply,
                                [comment._id]: e.target.value,
                              })
                            }
                            placeholder="Write a reply..."
                            className="flex-1 p-2 rounded-lg bg-white/50 border border-white/20 focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                          />
                          <button
                            onClick={() => handleReplySubmit(comment._id)}
                            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                          >
                            <FiSend />
                          </button>
                        </div>
                      )}

                      {/* Display replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 ml-6 space-y-3">
                          {comment.replies.map((reply) => (
                            <div
                              key={reply._id}
                              className="bg-white/10 rounded-lg p-3"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5
                                    onClick={() => {
                                      navigate(`/userProfile/${reply.author._id}`);
                                    }}
                                    className="h2 d-block font-medium text-sm text-gray-800 mb-2 p-1 relative cursor-pointer after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-gray-400 after:transition-all after:duration-300 hover:after:w-full rounded-full"
                                  >
                                    {reply.author.userName}
                                  </h5>
                                  <p className="text-gray-600 text-sm">
                                    {reply.content}
                                  </p>
                                </div>
                                {reply.author._id ===
                                  localStorage.getItem("userId") && (
                                  <button
                                    onClick={() => handleDeleteReply(comment._id, reply._id)}
                                    className="text-red-500 hover:text-red-600"
                                  >
                                    <FiTrash2 />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {comment.author._id === localStorage.getItem("userId") && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-red-500 hover:text-red-600 ml-2"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* New Comment Form */}
              <div className="mt-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 p-2 rounded-lg bg-white/50 border border-white/20 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <button
                    onClick={handleCommentSubmit}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <FiSend />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SinglePost;
