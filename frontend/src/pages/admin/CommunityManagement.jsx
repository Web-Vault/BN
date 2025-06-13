import React, { useState } from 'react';
import AdminLayout from './AdminLayout';

const CommunityManagement = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  const tabs = [
    { id: 'posts', label: 'Community Posts' },
    { id: 'memberships', label: 'Memberships' },
    { id: 'announcements', label: 'Announcements' },
  ];

  // Demo data - replace with actual API calls
  const posts = [
    { id: 1, title: 'Business Networking Tips', author: 'John Doe', likes: 45, comments: 12, status: 'Active' },
    { id: 2, title: 'Investment Opportunities', author: 'Jane Smith', likes: 32, comments: 8, status: 'Reported' },
    { id: 3, title: 'Chapter Meeting Summary', author: 'Bob Johnson', likes: 28, comments: 5, status: 'Active' },
  ];

  const memberships = [
    { id: 1, tier: 'Basic', price: '$99', users: 450, status: 'Active' },
    { id: 2, tier: 'Professional', price: '$199', users: 250, status: 'Active' },
    { id: 3, tier: 'Enterprise', price: '$499', users: 100, status: 'Active' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Community Posts</h2>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Search posts..."
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engagement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{post.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{post.author}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {post.likes} likes • {post.comments} comments
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => setSelectedPost(post)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'memberships':
        return (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Membership Tiers</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Add Tier
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              {memberships.map((tier) => (
                <div key={tier.id} className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900">{tier.tier}</h3>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">{tier.price}</p>
                  <p className="mt-2 text-sm text-gray-500">{tier.users} users</p>
                  <div className="mt-4 space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'announcements':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Announcements</h2>
              <button 
                onClick={() => setShowAnnouncementModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Announcement
              </button>
            </div>
            <div className="space-y-4">
              {/* Add announcements list here */}
              <p className="text-gray-500">Announcements will be displayed here.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Community Management</h1>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
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

        {/* Post Details Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Post Details</h3>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Title</h4>
                  <p className="mt-1">{selectedPost.title}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Author</h4>
                  <p className="mt-1">{selectedPost.author}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Engagement</h4>
                  <p className="mt-1">{selectedPost.likes} likes • {selectedPost.comments} comments</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <p className="mt-1">{selectedPost.status}</p>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                    Edit Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Announcement Modal */}
        {showAnnouncementModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create Announcement</h3>
                <button
                  onClick={() => setShowAnnouncementModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    rows={4}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowAnnouncementModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CommunityManagement; 