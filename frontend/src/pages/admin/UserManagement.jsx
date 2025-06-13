import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import config from '../../config/config.js';

const UserManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_BASE_URL}/api/users/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search users
  const searchUsers = async (query) => {
    if (!query || query.length < 2) {
      fetchUsers();
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${config.API_BASE_URL}/api/users/search?query=${query}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to search users. Please try again.');
      console.error('Error searching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleViewUser = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
    setDeletePassword('');
    setDeleteError('');
  };

  const handleDeleteConfirm = async () => {
    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm deletion');
      return;
    }

    try {
      await axios.delete(`${config.API_BASE_URL}/api/users/${userToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        data: { password: deletePassword }
      });
      
      // Remove the deleted user from the list
      setUsers(users.filter(user => user._id !== userToDelete._id));
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setUserToDelete(null);
      setDeletePassword('');
      setDeleteError('');
    } catch (error) {
      setDeleteError(error.response?.data?.message || 'Failed to delete user. Please try again.');
    }
  };

  const getMembershipStatus = (user) => {
    if (!user.membership) return 'No Membership';
    return user.membership.status || 'No Status';
  };

  const getMembershipTier = (user) => {
    if (!user.membership) return 'N/A';
    return user.membership.tier || 'N/A';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">User Management</h1>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => navigate('/admin/users/add')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add User
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={user.userImage || 'https://via.placeholder.com/40'}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.userName}</div>
                          <div className="text-sm text-gray-500">{user.industry || 'No Industry'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.userEmail}</div>
                      <div className="text-sm text-gray-500">{user.mobileNumber || 'No Phone'}</div>
                      <div className="text-sm text-gray-500">{user.location || 'No Location'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getMembershipTier(user)}</div>
                      <div className="text-sm text-gray-500">{getMembershipStatus(user)}</div>
                      {user.membership?.expiryDate && (
                        <div className="text-sm text-gray-500">
                          Expires: {formatDate(user.membership.expiryDate)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isAccountVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.isAccountVerified ? 'Verified' : 'Pending'}
                        </span>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isMobileVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.isMobileVerified ? 'Mobile Verified' : 'Mobile Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewUser(user._id)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete User</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete {userToDelete?.userName}? This action cannot be undone.
                  </p>
                  <input
                    type="password"
                    placeholder="Enter your password to confirm"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="mt-4 px-3 py-2 border rounded-md w-full"
                  />
                  {deleteError && (
                    <p className="mt-2 text-sm text-red-600">{deleteError}</p>
                  )}
                </div>
                <div className="items-center px-4 py-3">
                  <button
                    onClick={handleDeleteConfirm}
                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="ml-3 px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
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

export default UserManagement; 