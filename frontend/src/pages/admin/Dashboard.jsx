import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import config from '../../config/config.js';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    users: [],
    chapters: [],
    posts: [],
    admins: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch only the data we know exists
        const [usersRes, chaptersRes, adminsRes] = await Promise.all([
          axios.get(`${config.API_BASE_URL}/api/users/all`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }),
          axios.get(`${config.API_BASE_URL}/api/chapters`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }),
          axios.get(`${config.API_BASE_URL}/api/admin/all`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          })
        ]);

        // Sort users by creation date (newest first)
        const sortedUsers = [...(usersRes.data || [])].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );

        setDashboardData({
          users: sortedUsers,
          chapters: chaptersRes.data || [],
          posts: [], // We'll add this when we implement post fetching
          admins: adminsRes.data || []
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">
            <p className="text-lg font-semibold">Error loading dashboard</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={dashboardData.users.length}
            icon="👥"
          />
          <StatCard
            title="Active Chapters"
            value={dashboardData.chapters.length}
            icon="🏢"
          />
          <StatCard
            title="Total Admins"
            value={dashboardData.admins.length}
            icon="👑"
          />
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/admin/users" className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  👥
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Manage Users</p>
                  <p className="text-xs text-gray-500">View and manage all users</p>
                </div>
              </Link>

              <Link to="/admin/chapters" className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  🏢
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Manage Chapters</p>
                  <p className="text-xs text-gray-500">View and manage chapters</p>
                </div>
              </Link>

              <Link to="/admin/posts" className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  📝
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Manage Posts</p>
                  <p className="text-xs text-gray-500">View and manage posts</p>
                </div>
              </Link>

              <Link to="/admin/settings" className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  ⚙️
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Settings</p>
                  <p className="text-xs text-gray-500">Configure system settings</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Members</h2>
              <div className="space-y-4">
                {dashboardData.users.slice(0, 5).map((user) => (
                  <div key={user._id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        👤
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {user.userName || 'Unknown'}
                      </p>
                      <div className="flex flex-col text-sm text-gray-500">
                        <span>{user.email}</span>
                        <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Chapters */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Active Chapters</h2>
              <div className="space-y-4">
                {dashboardData.chapters.slice(0, 5).map((chapter) => (
                  <div key={chapter._id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        🏢
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {chapter.chapterName}
                      </p>
                      <div className="flex flex-col text-sm text-gray-500">
                        <span>Members: {chapter.members?.length || 0}</span>
                        <span>Tech: {chapter.chapterTech || 'Not specified'}</span>
                        <span>Created: {new Date(chapter.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="ml-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export default Dashboard; 