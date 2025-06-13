import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';

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

  // Demo data - replace with actual API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setChapter({
        id: chapterId,
        name: 'Business Leaders',
        description: 'A community of business leaders and entrepreneurs',
        location: 'New York, USA',
        status: 'Active',
        foundedDate: '2024-01-01',
        warnings: 0,
        members: [
          { id: 1, name: 'John Doe', role: 'Admin', joinedDate: '2024-01-01' },
          { id: 2, name: 'Jane Smith', role: 'Member', joinedDate: '2024-01-15' },
        ],
        joinRequests: [
          { id: 1, name: 'Bob Johnson', date: '2024-02-15', status: 'Pending' },
          { id: 2, name: 'Alice Brown', date: '2024-02-14', status: 'Pending' },
        ],
        meetings: [
          { id: 1, title: 'Monthly Strategy', date: '2024-03-01', attendees: 15 },
          { id: 2, title: 'Networking Event', date: '2024-03-15', attendees: 25 },
        ],
        events: [
          { id: 1, title: 'Business Workshop', date: '2024-03-20', participants: 30 },
          { id: 2, title: 'Industry Conference', date: '2024-04-01', participants: 50 },
        ],
        posts: [
          { id: 1, title: 'New Business Opportunity', author: 'John Doe', date: '2024-02-15' },
          { id: 2, title: 'Success Story', author: 'Jane Smith', date: '2024-02-14' },
        ],
        statistics: {
          totalMembers: 25,
          activeMembers: 20,
          totalMeetings: 12,
          totalEvents: 8,
          totalPosts: 45,
          averageAttendance: 18,
        },
      });
      setLoading(false);
    }, 1000);
  }, [chapterId]);

  const handleWarningSubmit = async () => {
    if (!adminPassword) {
      setAuthError('Please enter your password to confirm');
      return;
    }

    try {
      // Here you would make an API call to send warning
      const finalReason = warningReason === 'Other' ? customWarningReason : warningReason;
      console.log('Sending warning to chapter:', chapter.id);
      console.log('Reason:', finalReason);
      console.log('Admin password:', adminPassword);
      
      // Close modal and reset state
      setShowWarningModal(false);
      setWarningReason('');
      setCustomWarningReason('');
      setAdminPassword('');
      setAuthError('');
    } catch (error) {
      setAuthError('Failed to send warning. Please try again.');
    }
  };

  const handleBanSubmit = async () => {
    if (!adminPassword) {
      setAuthError('Please enter your password to confirm');
      return;
    }

    try {
      // Here you would make an API call to ban chapter
      console.log('Banning chapter:', chapter.id);
      console.log('Admin password:', adminPassword);
      
      // Close modal and reset state
      setShowBanModal(false);
      setAdminPassword('');
      setAuthError('');
    } catch (error) {
      setAuthError('Failed to ban chapter. Please try again.');
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
                    <p className="mt-1">{chapter.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Description</label>
                    <p className="mt-1">{chapter.description}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Location</label>
                    <p className="mt-1">{chapter.location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <p className="mt-1">{chapter.status}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Founded Date</label>
                    <p className="mt-1">{chapter.foundedDate}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total Members</p>
                    <p className="text-2xl font-semibold">{chapter.statistics.totalMembers}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Active Members</p>
                    <p className="text-2xl font-semibold">{chapter.statistics.activeMembers}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total Meetings</p>
                    <p className="text-2xl font-semibold">{chapter.statistics.totalMeetings}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total Events</p>
                    <p className="text-2xl font-semibold">{chapter.statistics.totalEvents}</p>
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
              {chapter.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-gray-500">Role: {member.role}</p>
                    <p className="text-sm text-gray-500">Joined: {member.joinedDate}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-900">View Profile</button>
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
              {chapter.joinRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{request.name}</p>
                    <p className="text-sm text-gray-500">Requested: {request.date}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm text-green-600 bg-green-100 rounded-md hover:bg-green-200">
                      Approve
                    </button>
                    <button className="px-3 py-1 text-sm text-red-600 bg-red-100 rounded-md hover:bg-red-200">
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
              {chapter.meetings.map((meeting) => (
                <div key={meeting.id} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">{meeting.title}</p>
                  <p className="text-sm text-gray-500">Date: {meeting.date}</p>
                  <p className="text-sm text-gray-500">Attendees: {meeting.attendees}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'events':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Chapter Events</h3>
            <div className="space-y-4">
              {chapter.events.map((event) => (
                <div key={event.id} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-gray-500">Date: {event.date}</p>
                  <p className="text-sm text-gray-500">Participants: {event.participants}</p>
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
              {chapter.posts.map((post) => (
                <div key={post.id} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">{post.title}</p>
                  <p className="text-sm text-gray-500">Author: {post.author}</p>
                  <p className="text-sm text-gray-500">Date: {post.date}</p>
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
                  <p className="text-sm">Total Members: {chapter.statistics.totalMembers}</p>
                  <p className="text-sm">Active Members: {chapter.statistics.activeMembers}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500">Engagement</h4>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">Total Meetings: {chapter.statistics.totalMeetings}</p>
                  <p className="text-sm">Total Events: {chapter.statistics.totalEvents}</p>
                  <p className="text-sm">Average Attendance: {chapter.statistics.averageAttendance}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500">Content</h4>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">Total Posts: {chapter.statistics.totalPosts}</p>
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Chapter Details</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowWarningModal(true)}
              className="px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Send Warning
            </button>
            <button
              onClick={() => setShowBanModal(true)}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Ban Chapter
            </button>
            <button
              onClick={() => navigate('/admin/chapters')}
              className="text-blue-600 hover:text-blue-900"
            >
              ← Back to Chapters
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