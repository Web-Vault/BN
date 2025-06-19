import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiHeart,
  FiMessageSquare,
  FiTrash2,
  FiSend,
  FiArrowLeft,
  FiDownload,
  FiX,
  FiClock,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Navbar from "../../components/Navbar.js";
import config from "../../config/config.js";
import { toast } from "react-hot-toast";

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
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [likes, setLikes] = useState([]);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [newReply, setNewReply] = useState({});
  const [downloadingImages, setDownloadingImages] = useState({});
  const [userMembership, setUserMembership] = useState(null);
  const [enableComments, setEnableComments] = useState(undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [postResponse, membershipResponse] = await Promise.all([
          axios.get(`${config.API_BASE_URL}/api/posts/${postId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${config.API_BASE_URL}/api/membership/verify`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setPost(postResponse.data.data);
        setComments(postResponse.data.data.comments || []);
        setLikes(postResponse.data.data.likes || []);
        setUserMembership(membershipResponse.data.membership);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Failed to load post");
        setLoading(false);
      }
    };

    const fetchCommentSetting = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}/api/settings/comments`);
        const data = await response.json();
        setEnableComments(typeof data.enableComments === 'boolean' ? data.enableComments : true);
      } catch (error) {
        setEnableComments(true);
      }
    };

    fetchData();
    fetchCommentSetting();
  }, [postId]);

  const handleProfileClick = (userId) => {
    if (!userMembership || 
        (userMembership.tier !== "Professional" && 
         userMembership.tier !== "Enterprise")) {
      toast.error("Upgrade to Professional tier to view user profiles");
      return;
    }
    navigate(`/userProfile/${userId}`);
  };

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
        `${config.API_BASE_URL}/api/posts/${postId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error("Error liking post:", err);
      // Revert optimistic update on error
      const response = await axios.get(
        `${config.API_BASE_URL}/api/posts/${postId}`,
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
        `${config.API_BASE_URL}/api/posts/${postId}/comments`,
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
        `${config.API_BASE_URL}/api/posts/${postId}/comments/${commentId}`,
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
        `${config.API_BASE_URL}/api/posts/${post._id}/comments/${commentId}/replies`,
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
        `${config.API_BASE_URL}/api/posts/${postId}/comments/${commentId}/replies/${replyId}`,
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
            className="mb-4 sm:mb-6 flex items-center gap-2 text-white hover:text-blue-200 transition-colors text-sm sm:text-base"
          >
            <FiArrowLeft /> Back to Community
          </button>

          {/* Post */}
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg border border-white/20">
            <div className="flex items-start gap-3 sm:gap-4">
              <img
                src={post.author?.userImage || "default-avatar.png"}
                alt={`${post.author?.userName || "Anonymous User"}'s profile`}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white/50"
              />
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <h3
                    onClick={() => handleProfileClick(post.author._id)}
                    className={`h2 d-block text-lg sm:text-2xl font-semibold text-gray-800 p-1 relative cursor-pointer after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-gray-400 after:transition-all after:duration-300 hover:after:w-full rounded-full ${
                      (!userMembership || (userMembership.tier !== "Professional" && userMembership.tier !== "Enterprise")) 
                        ? 'opacity-50 cursor-not-allowed' 
                        : ''
                    }`}
                  > 
                    {post.author?.userName || "Anonymous User"}
                  </h3>
                  <span className="text-xs sm:text-sm text-black">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 mt-2 text-base sm:text-lg leading-relaxed">
                  {post.content}
                </p>

                {/* Display images if they exist */}
                {post.images && post.images.length > 0 && (
                  <div className="mt-3 sm:mt-4">
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
                                  animate={{ width: "80px", opacity: 1 }}
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
                              className="bg-white/80 p-1.5 sm:p-2 rounded-full hover:bg-white transition-colors"
                            >
                              <FiDownload className="text-blue-600 text-sm sm:text-base" />
                            </motion.button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-sm sm:text-base ${
                      likes
                        ? "bg-red-100 text-red-500"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    <FiHeart className="text-base sm:text-lg" /> Like ({post.likes?.length || 0})
                  </button>
                  <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gray-100 text-gray-500 text-sm sm:text-base">
                    <FiMessageSquare className="text-base sm:text-lg" /> Comments (
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
          {enableComments === false ? (
            <div className="flex flex-col items-center justify-center bg-red-50 border border-red-200 rounded-xl p-8 my-6 shadow text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-lg font-semibold text-red-700 mb-1">Comments Unavailable</div>
              <div className="text-base text-red-600">Comments are not available to post or to watch.</div>
            </div>
          ) : (
            <div className="bg-white/50 backdrop-blur-lg rounded-xl p-4 sm:p-6 shadow-lg border border-white/20">
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800">
                Comments
              </h3>
              <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
                {post.comments?.map((comment) => (
                  <div key={comment._id} className="bg-white/20 rounded-lg p-3 sm:p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4
                            onClick={() => handleProfileClick(comment.author._id)}
                            className="h2 d-block font-medium text-gray-800 p-1 relative cursor-pointer after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-gray-400 after:transition-all after:duration-300 hover:after:w-full rounded-full text-sm sm:text-base"
                          >
                            {comment.author.userName}
                          </h4>
                          <button
                            onClick={() => toggleReplyInput(comment._id)}
                            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <FiMessageSquare className="text-xs sm:text-sm" /> Reply
                          </button>
                        </div>
                        <p className="text-gray-600 mt-1 text-sm sm:text-base">{comment.content}</p>

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
                              className="px-2 sm:px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                            >
                              <FiSend />
                            </button>
                          </div>
                        )}

                        {/* Display replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 ml-4 sm:ml-6 space-y-2 sm:space-y-3">
                            {comment.replies.map((reply) => (
                              <div
                                key={reply._id}
                                className="bg-white/10 rounded-lg p-2 sm:p-3"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5
                                      onClick={() => handleProfileClick(reply.author._id)}
                                      className="h2 d-block font-medium text-xs sm:text-sm text-gray-800 mb-1 sm:mb-2 p-1 relative cursor-pointer after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-gray-400 after:transition-all after:duration-300 hover:after:w-full rounded-full"
                                    >
                                      {reply.author.userName}
                                    </h5>
                                    <p className="text-gray-600 text-xs sm:text-sm">
                                      {reply.content}
                                    </p>
                                  </div>
                                  {reply.author._id === localStorage.getItem("userId") && (
                                    <button
                                      onClick={() => handleDeleteReply(comment._id, reply._id)}
                                      className="text-red-500 hover:text-red-600 text-sm sm:text-base"
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
                          className="text-red-500 hover:text-red-600 ml-2 text-sm sm:text-base"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* New Comment Form */}
                <div className="mt-4 sm:mt-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={enableComments === false ? "Commenting is disabled by the administrator" : "Write a comment..."}
                      className="flex-1 p-2 rounded-lg bg-white/50 border border-white/20 focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base"
                      disabled={enableComments === false}
                    />
                    <button
                      onClick={handleCommentSubmit}
                      className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={enableComments === false}
                      title={enableComments === false ? "Commenting is disabled by the administrator" : "Send"}
                    >
                      <FiSend />
                    </button>
                  </div>
                  {enableComments === false && (
                    <div className="text-xs text-red-500 mt-2">Commenting is disabled by the administrator.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SinglePost;
