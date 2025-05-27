import { useState, useEffect } from "react";
import {
  FiBell,
  FiGift,
  FiUsers,
  FiAward,
  FiCalendar,
  FiHeart,
  FiMessageSquare,
  FiTrash2,
  FiPlus,
  FiSend,
  FiDownload,
  FiX,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState("announcements");
  const [activeBirthdayTab, setActiveBirthdayTab] = useState("all");
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [postFilter, setPostFilter] = useState("all"); // "all" or "my"
  const [newPost, setNewPost] = useState("");
  const [newPostImages, setNewPostImages] = useState([]);
  const [newPostType, setNewPostType] = useState("news");
  const [postTypeFilter, setPostTypeFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [likes, setLikes] = useState({});
  const [expandedPost, setExpandedPost] = useState(null);
  const [newReply, setNewReply] = useState({});
  const [expandedReplies, setExpandedReplies] = useState({});
  const [downloadingImages, setDownloadingImages] = useState({});
  const [newImageUrl, setNewImageUrl] = useState("");

  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [usersRes, postsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/users/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/posts", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUsers(usersRes.data);
        setPosts(postsRes.data.data);
        setFilteredPosts(postsRes.data.data);

        // Initialize likes state based on current user's likes
        const initialLikes = {};
        postsRes.data.data.forEach((post) => {
          initialLikes[post._id] = post.likes.includes(currentUserId);
        });
        setLikes(initialLikes);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUserId]);

  // Update the useEffect for filtering
  useEffect(() => {
    let filtered = posts;

    // First filter by post type
    if (postTypeFilter !== "all") {
      filtered = filtered.filter((post) => post.type === postTypeFilter);
    }

    // Then filter by user if "My Posts" is selected
    if (postFilter === "my") {
      filtered = filtered.filter((post) => post.author._id === currentUserId);
    }

    setFilteredPosts(filtered);
  }, [postTypeFilter, postFilter, posts, currentUserId]);

  // Filter recent joiners (last 10 days)
  const recentJoiners = users.filter((user) => {
    const joinDate = new Date(user.createdAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 10;
  });

  // Filter birthdays
  const todayBirthdays = users.filter((user) => {
    if (!user.birthday) return false;
    const birthday = new Date(user.birthday);
    const today = new Date();
    return (
      birthday.getDate() === today.getDate() &&
      birthday.getMonth() === today.getMonth()
    );
  });

  const upcomingBirthdays = users
    .filter((user) => {
      if (!user.birthday) return false;
      const birthday = new Date(user.birthday);
      const today = new Date();
      const diffTime = birthday - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 7;
    })
    .sort((a, b) => new Date(a.birthday) - new Date(b.birthday));

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setNewPostImages([...newPostImages, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index) => {
    setNewPostImages(newPostImages.filter((_, i) => i !== index));
  };

  const handlePostSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Log the data being sent
      console.log('Sending post data:', {
        content: newPost,
        images: newPostImages,
        type: newPostType
      });

      const response = await axios.post(
        "http://localhost:5000/api/posts",
        {
          content: newPost,
          images: newPostImages,
          type: newPostType,
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log('Post response:', response.data); // Log the response

      // Add the new post to both posts and filteredPosts arrays
      const newPostData = response.data.data;
      setPosts([newPostData, ...posts]);
      setFilteredPosts([newPostData, ...filteredPosts]);

      // Initialize likes state for the new post
      setLikes((prev) => ({
        ...prev,
        [newPostData._id]: false,
      }));

      // Reset form
      setNewPost("");
      setNewPostImages([]);
      setNewPostType("news");
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Failed to create post");
    }
  };

  const handleCommentSubmit = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/posts/${postId}/comments`,
        { content: newComment[postId] },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update the comments state
      setComments({
        ...comments,
        [postId]: [...(comments[postId] || []), response.data],
      });

      // Update the posts state to reflect the new comment
      setPosts(
        posts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [...post.comments, response.data],
            };
          }
          return post;
        })
      );

      // Update filtered posts as well
      setFilteredPosts(
        filteredPosts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [...post.comments, response.data],
            };
          }
          return post;
        })
      );

      setNewComment({ ...newComment, [postId]: "" });
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleReplySubmit = async (postId, commentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5000/api/posts/${postId}/comments/${commentId}/replies`,
        { content: newReply[commentId] },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update comments with the new reply
      setComments((prev) => ({
        ...prev,
        [postId]: prev[postId].map((comment) =>
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

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/posts/${postId}/comments/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments({
        ...comments,
        [postId]: comments[postId].filter((c) => c._id !== commentId),
      });
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");
    const currentUserId = localStorage.getItem("userId");

    try {
      // Optimistically update UI
      setPosts(
        posts.map((post) => {
          if (post._id === postId) {
            const newLikes = likes[postId]
              ? post.likes.filter((id) => id !== currentUserId)
              : [...post.likes, currentUserId];
            return { ...post, likes: newLikes };
          }
          return post;
        })
      );

      // Update likes state
      setLikes((prev) => ({
        ...prev,
        [postId]: !prev[postId],
      }));

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
      setPosts(
        posts.map((post) => (post._id === postId ? response.data.data : post))
      );
    }
  };

  const toggleCommentSection = (postId) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  const toggleReplyInput = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleDeletePost = async (postId, e) => {
    e.stopPropagation(); // Prevent navigation to post detail
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove the post from both posts and filteredPosts
      setPosts(posts.filter((post) => post._id !== postId));
      setFilteredPosts(filteredPosts.filter((post) => post._id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post");
    }
  };

  const handleImageDownload = async (imageUrl, postId, imageIndex, e) => {
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] p-3 lg:p-8">
        <div className="max-w-7xl mx-auto bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30">
          {/* Main Tabs */}
          <div className="border-b border-white/20">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("announcements")}
                className={`py-4 px-1 border-b-2 font-semibold flex items-center gap-2 ${
                  activeTab === "announcements"
                    ? "text-blue-600 border-blue-500"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                <FiBell className="text-lg" /> Announcements
              </button>
              <button
                onClick={() => setActiveTab("birthdays")}
                className={`py-4 px-1 border-b-2 font-semibold flex items-center gap-2 ${
                  activeTab === "birthdays"
                    ? "text-blue-600 border-blue-500"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                <FiGift className="text-lg" /> Birthdays
              </button>
              <button
                onClick={() => setActiveTab("recent")}
                className={`py-4 px-1 border-b-2 font-semibold flex items-center gap-2 ${
                  activeTab === "recent"
                    ? "text-blue-600 border-blue-500"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                <FiUsers className="text-lg" /> Recent Joiners
              </button>
              <button
                onClick={() => setActiveTab("membership")}
                className={`py-4 px-1 border-b-2 font-semibold flex items-center gap-2 ${
                  activeTab === "membership"
                    ? "text-blue-600 border-blue-500"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                <FiAward className="text-lg" /> Membership
              </button>
              <button
                onClick={() => setActiveTab("attendance")}
                className={`py-4 px-1 border-b-2 font-semibold flex items-center gap-2 ${
                  activeTab === "attendance"
                    ? "text-blue-600 border-blue-500"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                <FiCalendar className="text-lg" /> Attendance
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {/* Announcements Tab */}
            {activeTab === "announcements" && (
              <div className="p-2 lg:p-8">
                <div className="bg-white/30 backdrop-blur-sm rounded-xl border border-white/20 mb-8">
                  {/* Post Filter */}
                  <nav className="flex flex-wrap gap-4 p-2 lg:p-4 border-b border-white/20">
                    <div className="flex gap-4">
                      <button
                        onClick={() => setPostFilter("all")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                          postFilter === "all"
                            ? "bg-blue-100/50 text-blue-600"
                            : "hover:bg-white/20"
                        }`}
                      >
                        All Posts
                      </button>
                      <button
                        onClick={() => setPostFilter("my")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                          postFilter === "my"
                            ? "bg-blue-100/50 text-blue-600"
                            : "hover:bg-white/20"
                        }`}
                      >
                        My Posts
                      </button>
                    </div>
                    <div className="flex gap-4">
                      <select
                        value={postTypeFilter}
                        onChange={(e) => setPostTypeFilter(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-white/50 border border-white/20 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      >
                        <option value="all">All Types</option>
                        <option value="news">News</option>
                        <option value="events">Events</option>
                        <option value="others">Others</option>
                      </select>
                      <div className="text-sm text-gray-600 flex items-center">
                        {filteredPosts.length} posts found
                      </div>
                    </div>
                  </nav>

                  {/* New Post Form */}
                  <div className="p-4 space-y-6">
                    <div className="bg-white/30 backdrop-blur-lg rounded-xl p-6">
                      <textarea
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        placeholder="Share something with the community..."
                        className="w-full p-4 rounded-lg bg-white/50 border border-white/20 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        rows="3"
                      />
                      <div className="mt-4 space-y-4">
                        {/* Image Input Section */}
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newImageUrl}
                              onChange={(e) => setNewImageUrl(e.target.value)}
                              placeholder="Enter image URL"
                              className="flex-1 p-2 rounded-lg bg-white/50 border border-white/20 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                            />
                            <button
                              onClick={handleAddImage}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                            >
                              <FiPlus /> Add Image
                            </button>
                          </div>

                          {/* Preview Added Images */}
                          {newPostImages.length > 0 && (
                            <div style={getImageGridStyles(newPostImages.length)}>
                              {newPostImages.map((imageUrl, index) => (
                                <div 
                                  key={index} 
                                  style={getImageContainerStyles(newPostImages.length, index)}
                                  className="group"
                                >
                                  <img
                                    src={imageUrl}
                                    alt={`Preview ${index + 1}`}
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
                                  <button
                                    onClick={() => handleRemoveImage(index)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600"
                                  >
                                    <FiX />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <select
                          value={newPostType}
                          onChange={(e) => setNewPostType(e.target.value)}
                          className="w-full p-2 rounded-lg bg-white/50 border border-white/20 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        >
                          <option value="news">News</option>
                          <option value="events">Events</option>
                          <option value="others">Others</option>
                        </select>
                      </div>
                      <button
                        onClick={handlePostSubmit}
                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                      >
                        <FiPlus /> Post
                      </button>
                    </div>

                    {/* Posts List */}
                    <div className="space-y-6">
                      {filteredPosts.map((post) => (
                        <div
                          key={post._id}
                          className="bg-white/30 backdrop-blur-lg rounded-xl p-6 cursor-pointer relative"
                          onClick={() => navigate(`/post/${post._id}`)}
                        >
                          <div className="absolute top-4 right-4 flex items-center gap-2">
                            {post.type && (
                              <span
                                className={`px-3 py-2 rounded-xl text-xs font-medium ${
                                  post.type === "news"
                                    ? "bg-blue-100 text-blue-800"
                                    : post.type === "events"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                              </span>
                            )}
                            {/* Delete button for user's own posts */}
                            {post.author._id === currentUserId && (
                              <button
                                onClick={(e) => handleDeletePost(post._id, e)}
                                className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                              >
                                <FiTrash2 />
                              </button>
                            )}
                          </div>
                          <div className="flex items-start gap-4">
                            <img
                              src={
                                post.author.userImage ||
                                "https://via.placeholder.com/40"
                              }
                              alt={post.author.userName}
                              className="w-12 h-12 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold">
                                    {post.author.userName}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {new Date(
                                      post.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <p className="text-gray-600 mt-2">
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
                                        onClick={(e) => e.stopPropagation()}
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
                                            {downloadingImages[`${post._id}-${index}`] !== undefined && (
                                              <motion.div
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: "100px", opacity: 1 }}
                                                exit={{ width: 0, opacity: 0 }}
                                                className="h-1 bg-white/80 rounded-full overflow-hidden"
                                              >
                                                <motion.div
                                                  initial={{ width: "0%" }}
                                                  animate={{
                                                    width: `${downloadingImages[`${post._id}-${index}`]}%`,
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
                                            onClick={(e) => handleImageDownload(imageUrl, post._id, index, e)}
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLike(post._id);
                                  }}
                                  className={`flex items-center gap-2 ${
                                    likes[post._id]
                                      ? "text-red-500"
                                      : "text-gray-500"
                                  }`}
                                >
                                  <FiHeart
                                    className={
                                      likes[post._id] ? "fill-current" : ""
                                    }
                                  />
                                  <span>{post.likes.length}</span>
                                </button>
                                <div className="flex items-center gap-2 text-gray-500">
                                  <FiMessageSquare />
                                  <span>{post.comments.length}</span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCommentSection(post._id);
                                  }}
                                  className="flex items-center gap-2 text-gray-500"
                                >
                                  <FiMessageSquare /> Comment
                                </button>
                              </div>

                              {/* Comments Section */}
                              {expandedPost === post._id && (
                                <div
                                  className="mt-4 space-y-4"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {comments[post._id]?.map((comment) => (
                                    <div
                                      key={comment._id}
                                      className="bg-white/20 rounded-lg p-4"
                                    >
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <h4 className="font-medium">
                                              {comment.author.userName}
                                            </h4>
                                            <button
                                              onClick={() =>
                                                toggleReplyInput(comment._id)
                                              }
                                              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                            >
                                              <FiMessageSquare className="text-sm" />{" "}
                                              Reply
                                            </button>
                                          </div>
                                          <p className="text-gray-600 mt-1">
                                            {comment.content}
                                          </p>

                                          {/* Reply input field */}
                                          {expandedReplies[comment._id] && (
                                            <div className="mt-2 flex gap-2">
                                              <input
                                                type="text"
                                                value={
                                                  newReply[comment._id] || ""
                                                }
                                                onChange={(e) =>
                                                  setNewReply({
                                                    ...newReply,
                                                    [comment._id]:
                                                      e.target.value,
                                                  })
                                                }
                                                placeholder="Write a reply..."
                                                className="flex-1 p-2 rounded-lg bg-white/50 border border-white/20 focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                                              />
                                              <button
                                                onClick={() =>
                                                  handleReplySubmit(
                                                    post._id,
                                                    comment._id
                                                  )
                                                }
                                                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                              >
                                                <FiSend />
                                              </button>
                                            </div>
                                          )}

                                          {/* Display replies */}
                                          {comment.replies &&
                                            comment.replies.length > 0 && (
                                              <div className="mt-3 ml-6 space-y-3">
                                                {comment.replies.map(
                                                  (reply) => (
                                                    <div
                                                      key={reply._id}
                                                      className="bg-white/10 rounded-lg p-3"
                                                    >
                                                      <div className="flex justify-between items-start">
                                                        <div>
                                                          <h5 className="font-medium text-sm">
                                                            {
                                                              reply.author
                                                                .userName
                                                            }
                                                          </h5>
                                                          <p className="text-gray-600 text-sm">
                                                            {reply.content}
                                                          </p>
                                                        </div>
                                                        {reply.author._id ===
                                                          currentUserId && (
                                                          <button
                                                            onClick={() =>
                                                              handleDeleteComment(
                                                                post._id,
                                                                reply._id
                                                              )
                                                            }
                                                            className="text-red-500 hover:text-red-600"
                                                          >
                                                            <FiTrash2 />
                                                          </button>
                                                        )}
                                                      </div>
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                            )}
                                        </div>
                                        {comment.author._id ===
                                          currentUserId && (
                                          <button
                                            onClick={() =>
                                              handleDeleteComment(
                                                post._id,
                                                comment._id
                                              )
                                            }
                                            className="text-red-500 hover:text-red-600 ml-2"
                                          >
                                            <FiTrash2 />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}

                                  {/* New Comment Form */}
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={newComment[post._id] || ""}
                                      onChange={(e) =>
                                        setNewComment({
                                          ...newComment,
                                          [post._id]: e.target.value,
                                        })
                                      }
                                      placeholder="Write a comment..."
                                      className="flex-1 p-2 rounded-lg bg-white/50 border border-white/20 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                    />
                                    <button
                                      onClick={() =>
                                        handleCommentSubmit(post._id)
                                      }
                                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                      <FiSend />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>{" "}
              </div>
            )}

            {/* Birthdays Tab */}
            {activeTab === "birthdays" && (
              <div className="p-2 lg:p-8">
                <div className="bg-white/30 backdrop-blur-sm rounded-xl border border-white/20 mb-8">
                  <nav className="flex space-x-8 p-2 lg:p-4 border-b border-white/20">
                    <button
                      onClick={() => setActiveBirthdayTab("all")}
                      className={`px-4 py-2 rounded-lg ${
                        activeBirthdayTab === "all"
                          ? "bg-blue-100/50 text-blue-600"
                          : "hover:bg-white/20"
                      }`}
                    >
                      All Birthdays
                    </button>
                    <button
                      onClick={() => setActiveBirthdayTab("upcoming")}
                      className={`px-4 py-2 rounded-lg ${
                        activeBirthdayTab === "upcoming"
                          ? "bg-blue-100/50 text-blue-600"
                          : "hover:bg-white/20"
                      }`}
                    >
                      Upcoming
                    </button>
                  </nav>

                  {activeBirthdayTab === "all" ? (
                    <div className="p-4 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users
                          .filter((user) => user.birthday)
                          .sort(
                            (a, b) =>
                              new Date(a.birthday) - new Date(b.birthday)
                          )
                          .map((user) => (
                            <div
                              key={user._id}
                              className="bg-white/30 backdrop-blur-lg rounded-xl p-6"
                            >
                              <div className="flex items-center gap-4">
                                <img
                                  src={user.userImage || "default-avatar.png"}
                                  alt={user.userName}
                                  className="w-16 h-16 rounded-full"
                                />
                                <div>
                                  <h3
                                    onClick={() => {
                                      navigate(`/userProfile/${user._id}`);
                                    }}
                                    className="h2 d-block font-semibold text-gray-800 mb-2 p-1 relative cursor-pointer after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-gray-400 after:transition-all after:duration-300 hover:after:w-full rounded-full"
                                  >
                                    {user.userName}
                                  </h3>
                                  <p className="text-gray-600">
                                    {new Date(
                                      user.birthday
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 space-y-6">
                      {/* Today's Birthdays */}
                      <div>
                        <h3 className="text-xl font-semibold mb-4">
                          Today's Birthdays
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {todayBirthdays.map((user) => (
                            <div
                              key={user._id}
                              className="bg-white/30 backdrop-blur-lg rounded-xl p-6"
                            >
                              <div className="flex items-center gap-4">
                                <img
                                  src={user.userImage || "default-avatar.png"}
                                  alt={user.userName}
                                  className="w-16 h-16 rounded-full"
                                />
                                <div>
                                  <h3
                                    onClick={() => {
                                      navigate(`/userProfile/${user._id}`);
                                    }}
                                    className="h2 d-block font-semibold text-gray-800 mb-2 p-1 relative cursor-pointer after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-gray-400 after:transition-all after:duration-300 hover:after:w-full rounded-full"
                                  >
                                    {user.userName}
                                  </h3>
                                  <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                    Send Wishes
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Upcoming Birthdays */}
                      <div>
                        <h3 className="text-xl font-semibold mb-4">
                          Upcoming Birthdays{" "}
                          <span className="text-sm text-gray-600">
                            ( in next 7 days )
                          </span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {upcomingBirthdays.map((user) => (
                            <div
                              key={user._id}
                              className="bg-white/30 backdrop-blur-lg rounded-xl p-6"
                            >
                              <div className="flex items-center gap-4">
                                <img
                                  src={user.userImage || "default-avatar.png"}
                                  alt={user.userName}
                                  className="w-16 h-16 rounded-full"
                                />
                                <div>
                                  <h3 className="font-semibold">
                                    {user.userName}
                                  </h3>
                                  <p className="text-gray-600">
                                    {new Date(
                                      user.birthday
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Joiners Tab */}
            {activeTab === "recent" && (
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentJoiners.map((user) => (
                  <div
                    key={user._id}
                    className="bg-white/30 backdrop-blur-lg rounded-xl p-6"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={user.userImage || "default-avatar.png"}
                        alt={user.userName}
                        className="w-16 h-16 rounded-full"
                      />
                      <div>
                        <h3
                          onClick={() => {
                            navigate(`/userProfile/${user._id}`);
                          }}
                          className="h2 d-block font-semibold text-gray-800 mb-2 p-1 relative cursor-pointer after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-gray-400 after:transition-all after:duration-300 hover:after:w-full rounded-full"
                        >
                          {user.userName}
                        </h3>
                        <p className="text-gray-600">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Membership Tab */}
            {activeTab === "membership" && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Membership Information
                </h2>
                <p className="text-gray-600 mt-4">
                  This section is under development.
                </p>
              </div>
            )}

            {/* Attendance Tab */}
            {activeTab === "attendance" && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Attendance Records
                </h2>
                <p className="text-gray-600 mt-4">
                  This section is under development.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CommunityPage;
