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
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">User Management</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {/* <button
              onClick={() => navigate('/admin/users/add')}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add User
            </button> */}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-0">
            {users.map((user, index) => (
              <div 
                key={user._id} 
                className={`bg-white border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors ${
                  index === 0 ? 'rounded-t-xl lg:rounded-t-xl' : ''
                } ${index === users.length - 1 ? 'rounded-b-xl lg:rounded-b-xl' : ''} ${
                  index % 2 === 0 && index !== users.length - 1 ? 'md:rounded-b-xl' : ''
                } ${
                  index % 2 === 1 && index !== users.length - 1 ? 'md:rounded-t-xl' : ''
                }`}
              >
                <div className="p-4">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                    {/* User Header */}
                    <div className="flex items-center gap-3 flex-shrink-0 w-full lg:w-auto">
                      <div className="relative">
                        <img
                          className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
                          src={user.userImage || 'https://via.placeholder.com/40'}
                          alt=""
                        />
                        {user.isAccountVerified && (
                          <span className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-gray-900 truncate">{user.userName}</h3>
                          {user.isMobileVerified && (
                            <span className="text-blue-500" title="Mobile Verified">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{user.userEmail}</p>
                      </div>
                    </div>

                    {/* User Details */}
                    <div className="hidden lg:flex items-center gap-6 flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0 max-w-[200px]">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="truncate" title={user.industry || 'No Industry'}>{user.industry || 'No Industry'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0 max-w-[200px]">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate" title={user.location || 'No Location'}>{user.location || 'No Location'}</span>
                      </div>
                    </div>

                    {/* Membership Status */}
                    <div className="hidden lg:flex items-center gap-6 min-w-0">
                      <div className="min-w-0 max-w-[150px]">
                        <span className="text-xs font-medium text-gray-500">Membership</span>
                        <p className="text-sm font-medium text-gray-900 truncate" title={getMembershipTier(user)}>{getMembershipTier(user)}</p>
                      </div>
                      {user.membership?.expiryDate && (
                        <div className="min-w-0 max-w-[150px]">
                          <span className="text-xs font-medium text-gray-500">Expires</span>
                          <p className="text-sm text-gray-900 truncate" title={formatDate(user.membership.expiryDate)}>{formatDate(user.membership.expiryDate)}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 w-full lg:w-auto lg:ml-auto">
                      <button
                        onClick={() => handleViewUser(user._id)}
                        className="flex-1 lg:flex-none px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="hidden sm:inline">View</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="flex-1 lg:flex-none px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Mobile View Details */}
                  <div className="mt-4 lg:hidden space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="truncate" title={user.industry || 'No Industry'}>{user.industry || 'No Industry'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate" title={user.location || 'No Location'}>{user.location || 'No Location'}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 max-w-[150px]">
                          <span className="text-xs font-medium text-gray-500">Membership</span>
                          <p className="text-sm font-medium text-gray-900 truncate" title={getMembershipTier(user)}>{getMembershipTier(user)}</p>
                        </div>
                        {user.membership?.expiryDate && (
                          <div className="text-right min-w-0 max-w-[150px]">
                            <span className="text-xs font-medium text-gray-500">Expires</span>
                            <p className="text-sm text-gray-900 truncate" title={formatDate(user.membership.expiryDate)}>{formatDate(user.membership.expiryDate)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-[90%] max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete User</h3>
                <div className="mt-2 px-4 sm:px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete {userToDelete?.userName}? This action cannot be undone.
                  </p>
                  <input
                    type="password"
                    placeholder="Enter your password to confirm"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="mt-4 px-3 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  {deleteError && (
                    <p className="mt-2 text-sm text-red-600">{deleteError}</p>
                  )}
                </div>
                <div className="items-center px-4 py-3 flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={handleDeleteConfirm}
                    className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
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