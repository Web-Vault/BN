import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';
import config from '../../config/config';
import { FaUsers, FaCalendarAlt, FaChartLine, FaNewspaper } from "react-icons/fa";

const ChapterDetails = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [warningReason, setWarningReason] = useState('');
  const [customWarningReason, setCustomWarningReason] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const warningReasons = [
    'Inappropriate Content',
    'Spam Behavior',
    'Violation of Community Guidelines',
    'Suspicious Activity',
    'Misuse of Platform',
    'Other'
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'members', label: 'Members' },
    { id: 'requests', label: 'Join Requests' },
    { id: 'meetings', label: 'Meetings' },
    { id: 'events', label: 'Events' },
    { id: 'posts', label: 'Posts' },
    { id: 'statistics', label: 'Statistics' },
  ];

  useEffect(() => {
    const fetchChapterDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${config.API_BASE_URL}/api/chapters/${chapterId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChapter(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching chapter details:', error);
        toast.error('Failed to fetch chapter details');
        setLoading(false);
      }
    };

    fetchChapterDetails();
  }, [chapterId]);

  const handleWarningSubmit = async () => {
    if (!adminPassword) {
      setAuthError('Please enter your password to confirm');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const finalReason = warningReason === 'Other' ? customWarningReason : warningReason;
      
      await axios.post(
        `${config.API_BASE_URL}/api/chapters/${chapterId}/warn`,
        {
          reason: finalReason,
          adminPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Warning sent successfully');
      setShowWarningModal(false);
      setWarningReason('');
      setCustomWarningReason('');
      setAdminPassword('');
      setAuthError('');
    } catch (error) {
      console.error('Error sending warning:', error);
      setAuthError(error.response?.data?.message || 'Failed to send warning. Please try again.');
    }
  };

  const handleBanSubmit = async () => {
    if (!adminPassword) {
      setAuthError('Please enter your password to confirm');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${config.API_BASE_URL}/api/chapters/${chapterId}/ban`,
        { adminPassword },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Chapter banned successfully');
      setShowBanModal(false);
      setAdminPassword('');
      setAuthError('');
      navigate('/admin/chapters');
    } catch (error) {
      console.error('Error banning chapter:', error);
      setAuthError(error.response?.data?.message || 'Failed to ban chapter. Please try again.');
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${config.API_BASE_URL}/api/chapters/${action}/${chapterId}/${requestId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success(`Request ${action}ed successfully`);
      // Refresh chapter data
      const response = await axios.get(`${config.API_BASE_URL}/api/chapters/${chapterId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChapter(response.data);
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast.error(`Failed to ${action} request. Please try again.`);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${config.API_BASE_URL}/api/chapters/${chapterId}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Post deleted successfully');
      // Refresh chapter data
      const response = await axios.get(`${config.API_BASE_URL}/api/chapters/${chapterId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChapter(response.data);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${config.API_BASE_URL}/api/chapters/remove-member`, {
        chapterId,
        userId: memberId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Member removed successfully');
      // Refresh chapter data
      const response = await axios.get(`${config.API_BASE_URL}/api/chapters/${chapterId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChapter(response.data);
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const renderTabContent = () => {
    if (!chapter) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Chapter Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Name</label>
                    <p className="mt-1">{chapter.chapterName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Description</label>
                    <p className="mt-1">{chapter.chapterDescription}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Location</label>
                    <p className="mt-1">
                      {chapter.chapterCity ? `${chapter.chapterCity}, ${chapter.chapterRegion}` : chapter.chapterRegion}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Creator</label>
                    <p className="mt-1">{chapter.chapterCreator.userName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Founded Date</label>
                    <p className="mt-1">{new Date(chapter.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total Members</p>
                    <p className="text-2xl font-semibold">{chapter.memberCount || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total Meetings</p>
                    <p className="text-2xl font-semibold">{chapter.meetingCount || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total Events</p>
                    <p className="text-2xl font-semibold">{chapter.eventCount || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'members':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Chapter Members</h3>
            <div className="space-y-4">
              {chapter.members?.map((member) => (
                <div key={member._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-4">
                  <div className="w-full sm:w-auto min-w-0">
                    <p className="font-medium truncate">{member.userName}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                      <p className="text-sm text-gray-500">
                        Role: {member._id === chapter.chapterCreator._id ? 'Chapter Admin' : 'Chapter Member'}
                      </p>
                      {/* <span className="hidden sm:inline text-gray-300">•</span>
                      <p className="text-sm text-gray-500">Joined: {new Date(member.joinedAt).toLocaleDateString()}</p> */}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => navigate(`/admin/users/${member.userId}`)}
                      className="w-full sm:w-auto text-blue-600 hover:text-blue-900 px-3 py-1.5 rounded-md hover:bg-blue-50 text-sm font-medium flex items-center justify-center"
                    >
                      View Profile
                    </button>
                    {member._id !== chapter.chapterCreator._id && (
                      <button 
                        onClick={() => handleRemoveMember(member._id)}
                        className="w-full sm:w-auto text-red-600 hover:text-red-900 px-3 py-1.5 rounded-md hover:bg-red-50 text-sm font-medium flex items-center justify-center"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'requests':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Join Requests</h3>
            <div className="space-y-4">
              {chapter.joinRequests?.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{request.userName}</p>
                    <p className="text-sm text-gray-500">Requested: {new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleRequestAction(request._id, 'accept')}
                      className="px-3 py-1 text-sm text-green-600 bg-green-100 rounded-md hover:bg-green-200"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleRequestAction(request._id, 'reject')}
                      className="px-3 py-1 text-sm text-red-600 bg-red-100 rounded-md hover:bg-red-200"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'meetings':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Chapter Meetings</h3>
            <div className="space-y-4">
              {chapter.meetings?.map((meeting) => (
                <div key={meeting._id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-3">
                    <div className="w-full sm:w-auto min-w-0">
                      <h4 className="text-lg font-semibold text-gray-900 truncate">{meeting.title}</h4>
                      <p className="text-sm text-gray-600 truncate">Created by: {meeting.createdBy?.userName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                      meeting.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                      meeting.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Date:</span>
                      <span className="text-gray-700">
                        {new Date(meeting.date).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Location:</span>
                      <span className="text-gray-700 truncate max-w-[150px]">{meeting.location || 'Online'}</span>
                    </div>
                    {meeting.meetingLink && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500">Link:</span>
                        <a 
                          href={meeting.meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[200px]"
                        >
                          {meeting.meetingLink}
                        </a>
                      </div>
                    )}
                    {meeting.attendance && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500">Attendance:</span>
                        <span className="text-gray-700">
                          {meeting.attendance.filter(a => a.status === 'present').length} present
                        </span>
                      </div>
                    )}
                  </div>

                  {meeting.description && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 line-clamp-2">{meeting.description}</p>
                    </div>
                  )}

                  {meeting.attendance && meeting.attendance.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Attendance Details</p>
                      <div className="space-y-2">
                        {meeting.attendance.map((record) => (
                          <div key={record._id} className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              {record.user?.userImage && (
                                <img 
                                  src={record.user.userImage} 
                                  alt={record.user?.userName || 'User'} 
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              )}
                              <span className="truncate max-w-[150px]">{record.user?.userName || 'Unknown User'}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                                record.status === 'present' ? 'bg-green-100 text-green-800' :
                                record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                                record.status === 'left_early' ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </span>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {new Date(record.joinTime).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'events':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Chapter Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              {chapter.events?.map((event) => (
                <div key={event._id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 truncate">{event.title}</h4>
                      <p className="text-sm text-gray-600 truncate">Created by: {event.creator?.userName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                      new Date(event.date) > new Date() ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {new Date(event.date) > new Date() ? 'Upcoming' : 'Past'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Date:</span>
                      <span className="text-sm text-gray-600">
                        {new Date(event.date).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Location:</span>
                      <span className="text-sm text-gray-600 truncate">{event.location || 'Online'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Capacity:</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {event.bookings?.length || 0}/{event.totalSeats}
                          </span>
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ 
                                width: `${((event.bookings?.length || 0) / event.totalSeats) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Price:</span>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">
                          {event.entryFee ? `$${event.entryFee}` : 'Free'}
                        </span>
                        {event.entryFee && (
                          <span className="text-xs text-gray-500">
                            Revenue: ${(event.entryFee * (event.bookings?.length || 0)).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {event.description && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                    </div>
                  )}

                  {event.bookings && event.bookings.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Registered Attendees</p>
                      <div className="space-y-2">
                        {event.bookings.map((booking) => (
                          <div key={booking._id} className="flex items-center gap-2 text-sm text-gray-600">
                            {booking.user?.userImage && (
                              <img 
                                src={booking.user.userImage} 
                                alt={booking.user.userName} 
                                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                              />
                            )}
                            <span className="truncate">{booking.user?.userName}</span>
                            <span className="text-gray-400">•</span>
                            <span className="truncate">{booking.user?.userEmail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'posts':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Chapter Posts</h3>
            <div className="space-y-4">
              {chapter.activities?.map((post) => (
                <div key={post._id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3 mb-3">
                    {post.user?.userImage && (
                      <img 
                        src={post.user.userImage} 
                        alt={post.user?.userName || 'User'} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {post.user?.userName || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(post.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{post.content}</p>
                  {post.image && (
                    <img 
                      src={post.image} 
                      alt="Post content" 
                      className="rounded-lg max-h-96 w-full object-cover mb-3"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'statistics':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Chapter Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500">Membership</h4>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">Total Members: {chapter.memberCount || 0}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500">Engagement</h4>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">Total Meetings: {chapter.meetingCount || 0}</p>
                  <p className="text-sm">Total Events: {chapter.eventCount || 0}</p>
                  <p className="text-sm">Average Attendance: {chapter.averageAttendance || 0}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500">Content</h4>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">Total Posts: {chapter.postCount || 0}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="space-y-4">
          {/* Header Row */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Chapter Details</h1>
            <button
              onClick={() => navigate('/admin/chapters')}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Chapters</span>
            </button>
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl ml-auto">
            <button
              onClick={() => setShowWarningModal(true)}
              className="w-full px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Send Warning</span>
            </button>
            <button
              onClick={() => setShowBanModal(true)}
              className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Ban Chapter</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Warning Modal */}
        {showWarningModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Send Warning</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Warning Reason
                  </label>
                  <select
                    value={warningReason}
                    onChange={(e) => setWarningReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a reason</option>
                    {warningReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>

                {warningReason === 'Other' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Reason
                    </label>
                    <textarea
                      value={customWarningReason}
                      onChange={(e) => setCustomWarningReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Enter custom warning reason"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your password to confirm
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your password"
                  />
                  {authError && (
                    <p className="mt-2 text-sm text-red-600">{authError}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowWarningModal(false);
                    setWarningReason('');
                    setCustomWarningReason('');
                    setAdminPassword('');
                    setAuthError('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWarningSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Send Warning
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ban Modal */}
        {showBanModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ban Chapter</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to ban {chapter.name}? This action will:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-500 mb-4">
                <li>Immediately suspend all chapter activities</li>
                <li>Notify all chapter members</li>
                <li>Require admin approval to lift the ban</li>
                <li>Archive all chapter content</li>
              </ul>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your password to confirm
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
                {authError && (
                  <p className="mt-2 text-sm text-red-600">{authError}</p>
                )}
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowBanModal(false);
                    setAdminPassword('');
                    setAuthError('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBanSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Ban Chapter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ChapterDetails; 