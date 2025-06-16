import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import config from '../../config/config.js';
import { FaImage } from 'react-icons/fa';

const CommunityManagement = () => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPost, setNewPost] = useState({
    content: '',
    type: 'news',
    isAnnouncement: false,
    images: []
  });
  const [imageUrls, setImageUrls] = useState(['']);
  const [previewImages, setPreviewImages] = useState([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({ content: '' });
  const [showPostModal, setShowPostModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_BASE_URL}/api/posts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        params: {
          isAnnouncement: searchTerm.includes('announcement') ? 'true' : undefined
        }
      });
      setPosts(response.data.data);
    } catch (error) {
      toast.error('Error fetching posts');
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    try {
      const response = await axios.post(`${config.API_BASE_URL}/api/posts`, newPost, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPosts([response.data.data, ...posts]);
      setShowCreatePostModal(false);
      setNewPost({ content: '', type: 'news', isAnnouncement: false, images: [] });
      toast.success('Post created successfully');
    } catch (error) {
      toast.error('Error creating post');
      console.error('Error creating post:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${config.API_BASE_URL}/api/posts/${postToDelete}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPosts(posts.filter(post => post._id !== postToDelete));
      setShowDeleteModal(false);
      setPostToDelete(null);
      toast.success('Post deleted successfully');
    } catch (error) {
      toast.error('Error deleting post');
      console.error('Error deleting post:', error);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    // If less than 24 hours, show relative time
    if (diffInSeconds < 86400) {
      if (diffInSeconds < 60) {
        return 'just now';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
      } else {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      }
    }
    
    // If more than 24 hours, show full date and time
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Helper function to render comment and its replies
  const renderComment = (comment) => {
    return (
      <div key={comment._id} className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-start space-x-3">
          <img
            src={comment.author?.userImage || 'https://via.placeholder.com/40'}
            alt={comment.author?.userName || 'User'}
            className="h-8 w-8 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                {comment.author?.userName || 'Unknown User'}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
            
            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {comment.replies.map((reply) => (
                  <div key={reply._id} className="bg-white rounded-lg p-3">
                    <div className="flex items-start space-x-3">
                      <img
                        src={reply.author?.userImage || 'https://via.placeholder.com/40'}
                        alt={reply.author?.userName || 'User'}
                        className="h-6 w-6 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {reply.author?.userName || 'Unknown User'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{reply.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);

    // Update preview with validation
    const newPreviewImages = [...previewImages];
    if (value.trim() !== '') {
      // Validate URL
      try {
        new URL(value);
        newPreviewImages[index] = value;
      } catch (e) {
        newPreviewImages[index] = 'https://via.placeholder.com/80?text=Invalid+URL';
      }
    } else {
      newPreviewImages[index] = '';
    }
    setPreviewImages(newPreviewImages);
  };

  const addImageUrlField = () => {
    setImageUrls([...imageUrls, '']);
    setPreviewImages([...previewImages, '']);
  };

  const removeImageUrlField = (index) => {
    const newImageUrls = imageUrls.filter((_, i) => i !== index);
    const newPreviewImages = previewImages.filter((_, i) => i !== index);
    setImageUrls(newImageUrls);
    setPreviewImages(newPreviewImages);
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      // Validate image URLs before submission
      const validImageUrls = imageUrls.filter(url => {
        try {
          new URL(url);
          return true;
        } catch (e) {
          return false;
        }
      });

      const formData = {
        content: announcementForm.content,
        type: 'news',
        isAnnouncement: true,
        images: validImageUrls
      };

      const response = await axios.post(`${config.API_BASE_URL}/api/posts`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setShowAnnouncementModal(false);
        setAnnouncementForm({ content: '' });
        setImageUrls(['']);
        setPreviewImages([]);
        fetchPosts();
        toast.success('Announcement created successfully');
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error(error.response?.data?.message || 'Error creating announcement');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Community Management</h1>
        </div>

        {/* Community Posts Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Community Posts</h2>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchPosts()}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  onClick={() => setShowAnnouncementModal(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  Create Announcement
                </button>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engagement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          post.isAnnouncement ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {post.isAnnouncement ? 'Announcement' : post.type}
                        </span>
                        {post.images && post.images.length > 0 && (
                          <FaImage className="text-gray-400" title="Contains images" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{post.content}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{post.author.userName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {post.likes.length} likes • {post.comments.length} comments
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => setSelectedPost(post)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleDeletePost(post._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Post Details Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto my-8">
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Post Details</h3>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Type</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedPost.isAnnouncement ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedPost.isAnnouncement ? 'Announcement' : selectedPost.type}
                    </span>
                    {selectedPost.images && selectedPost.images.length > 0 && (
                      <FaImage className="text-gray-400" title="Contains images" />
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Content</h4>
                  <p className="mt-1 text-sm text-gray-900 break-words">{selectedPost.content}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Author</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedPost.author.userName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Engagement</h4>
                  <div className="mt-2 space-y-4">
                    {/* Likes Section */}
                    <div>
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium text-gray-700">
                          {selectedPost.likes?.length || 0} {selectedPost.likes?.length === 1 ? 'Like' : 'Likes'}
                        </h5>
                      </div>
                      {selectedPost.likes && selectedPost.likes.length > 0 && (
                        <div className="mt-2 bg-gray-50 rounded-lg p-3">
                          <ul className="divide-y divide-gray-200">
                            {selectedPost.likes.map((like) => (
                              <li key={like._id} className="py-2 flex items-center space-x-3">
                                <img
                                  src={like.userImage || 'https://via.placeholder.com/40'}
                                  alt={like.userName || 'User'}
                                  className="h-8 w-8 rounded-full"
                                />
                                <span className="text-sm text-gray-900">{like.userName}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Comments Section */}
                    <div>
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium text-gray-700">
                          {selectedPost.comments?.length || 0} {selectedPost.comments?.length === 1 ? 'Comment' : 'Comments'}
                        </h5>
                      </div>
                      {selectedPost.comments && selectedPost.comments.length > 0 && (
                        <div className="mt-2 space-y-4">
                          {selectedPost.comments.map((comment) => (
                            <div key={comment._id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-start space-x-3">
                                <img
                                  src={comment.author?.userImage || 'https://via.placeholder.com/40'}
                                  alt={comment.author?.userName || 'User'}
                                  className="h-8 w-8 rounded-full"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900">
                                      {comment.author?.userName}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(comment.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                                  
                                  {/* Replies */}
                                  {comment.replies && comment.replies.length > 0 && (
                                    <div className="mt-3 space-y-3">
                                      {comment.replies.map((reply) => (
                                        <div key={reply._id} className="bg-white rounded-lg p-3">
                                          <div className="flex items-start space-x-3">
                                            <img
                                              src={reply.author?.userImage || 'https://via.placeholder.com/40'}
                                              alt={reply.author?.userName || 'User'}
                                              className="h-6 w-6 rounded-full"
                                            />
                                            <div className="flex-1">
                                              <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-900">
                                                  {reply.author?.userName}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                  {formatDate(reply.createdAt)}
                                                </span>
                                              </div>
                                              <p className="text-sm text-gray-700 mt-1">{reply.content}</p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {selectedPost.images && selectedPost.images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Images</h4>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedPost.images.map((image, index) => (
                        <div key={index} className="relative group aspect-w-16 aspect-h-9">
                          <img 
                            src={image} 
                            alt={`Post image ${index + 1}`} 
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                            <button 
                              onClick={() => window.open(image, '_blank')}
                              className="opacity-0 group-hover:opacity-100 bg-white bg-opacity-80 px-3 py-1 rounded-full text-sm font-medium transition-opacity duration-200"
                            >
                              View Full Size
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 rounded-b-lg">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => handleDeletePost(selectedPost._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Post Modal */}
        {showCreatePostModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto my-8">
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Create Post</h3>
                  <button
                    onClick={() => setShowCreatePostModal(false)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="px-6 py-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={newPost.type}
                    onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="news">News</option>
                    <option value="events">Events</option>
                    <option value="others">Others</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Is Announcement</label>
                  <input
                    type="checkbox"
                    checked={newPost.isAnnouncement}
                    onChange={(e) => setNewPost({ ...newPost, isAnnouncement: e.target.checked })}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    rows={4}
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 rounded-b-lg">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowCreatePostModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePost}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Announcement Modal */}
        {showAnnouncementModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Create Announcement</h3>
                  <button
                    onClick={() => {
                      setShowAnnouncementModal(false);
                      setAnnouncementForm({ content: '' });
                      setImageUrls(['']);
                      setPreviewImages([]);
                    }}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <form onSubmit={handleCreateAnnouncement} className="px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                      Content
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      rows={4}
                      value={announcementForm.content}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                      placeholder="Enter your announcement content here..."
                    />
                  </div>

                  {/* Image URLs Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URLs
                    </label>
                    <div className="space-y-3">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <input
                                type="url"
                                value={url}
                                onChange={(e) => handleImageUrlChange(index, e.target.value)}
                                placeholder="Enter image URL"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              />
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() => removeImageUrlField(index)}
                                  className="p-1 text-red-600 hover:text-red-800"
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
                            </div>
                            {/* Image Preview */}
                            {previewImages[index] && (
                              <div className="mt-2 relative group">
                                <img
                                  src={previewImages[index]}
                                  alt={`Preview ${index + 1}`}
                                  className="h-24 w-24 object-cover rounded-md shadow-sm"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/80?text=Invalid+URL';
                                  }}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-md flex items-center justify-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newImageUrls = [...imageUrls];
                                      const newPreviewImages = [...previewImages];
                                      newImageUrls[index] = '';
                                      newPreviewImages[index] = '';
                                      setImageUrls(newImageUrls);
                                      setPreviewImages(newPreviewImages);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-white bg-red-600 rounded-full p-1 hover:bg-red-700 transition-opacity"
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addImageUrlField}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Image URL
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAnnouncementModal(false);
                      setAnnouncementForm({ content: '' });
                      setImageUrls(['']);
                      setPreviewImages([]);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Announcement
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Confirm Delete</h3>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setPostToDelete(null);
                    }}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this post? This action cannot be undone.
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPostToDelete(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CommunityManagement; 