import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import config from '../../config/config.js';
import { FaCheck, FaTimes, FaHistory, FaInfoCircle, FaUsers, FaChevronDown, FaChevronUp, FaUserCircle } from 'react-icons/fa';

const MembershipManagement = () => {
  const [membershipTiers, setMembershipTiers] = useState([]);
  const [selectedTier, setSelectedTier] = useState('basic');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedMemberships, setExpandedMemberships] = useState(new Set());
  const [expandedHistory, setExpandedHistory] = useState(new Set());

  useEffect(() => {
    fetchMembershipTiers();
  }, []);

  useEffect(() => {
    if (selectedTier) {
      fetchUsersByTier(selectedTier);
    }
  }, [selectedTier]);

  const fetchMembershipTiers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${config.API_BASE_URL}/api/membership-tiers`);
      if (response.data.success) {
        const filteredTiers = response.data.data.filter(tier => 
          tier.tier.toLowerCase() === 'basic' || tier.tier.toLowerCase() === 'professional'
        );
        setMembershipTiers(filteredTiers);
        if (!selectedTier) {
          setSelectedTier('basic');
        }
      }
    } catch (err) {
      console.error('Error fetching tiers:', err);
      setError('Failed to load membership tiers');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersByTier = async (tierId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${config.API_BASE_URL}/api/membership-tiers/${tierId}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch users');
        setUsers([]);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTierSelect = (tier) => {
    setSelectedTier(tier);
  };

  const toggleMembershipExpand = (userId) => {
    setExpandedMemberships(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const toggleHistoryExpand = (userId) => {
    setExpandedHistory(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderContent = () => {
    if (loading && !users.length) {
      return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Membership Management</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search members..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Membership Tiers */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Membership Tiers</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {membershipTiers.map((tier) => (
                  <button
                    key={tier._id}
                    onClick={() => handleTierSelect(tier.tier)}
                    className={`relative flex flex-col h-full rounded-lg border transition-all duration-200 ${
                      selectedTier === tier.tier
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex-1 p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className={`text-base font-semibold ${
                            selectedTier === tier.tier ? 'text-blue-600' : 'text-gray-900'
                          }`}>
                            {tier.tier}
                          </h3>
                          <div className={`mt-1 ${
                            selectedTier === tier.tier ? 'text-blue-500' : 'text-gray-600'
                          }`}>
                            <span className="text-lg font-bold">${tier.price.toFixed(2)}</span>
                            <span className="text-sm ml-1">/month</span>
                          </div>
                        </div>
                        <div className={`p-2 rounded-md ${
                          selectedTier === tier.tier ? 'bg-blue-100' : 'bg-gray-50'
                        }`}>
                          <FaUsers className={`w-5 h-5 ${
                            selectedTier === tier.tier ? 'text-blue-600' : 'text-gray-500'
                          }`} />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {tier.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                              feature.included 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-red-100 text-red-600'
                            }`}>
                              {feature.included ? (
                                <FaCheck className="w-3 h-3" />
                              ) : (
                                <FaTimes className="w-3 h-3" />
                              )}
                            </div>
                            <span className={`text-sm ${
                              feature.included ? 'text-gray-700' : 'text-gray-500'
                            }`}>
                              {feature.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedTier === tier.tier && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-bl-lg">
                          Selected
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Membership Users</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user.user._id} className="p-6">
                  {/* User Info Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {user.user.userImage ? (
                        <img
                          src={user.user.userImage}
                          alt={user.user.userName}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <FaUserCircle className="w-10 h-10 text-gray-400" />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.user.userName}</h3>
                        <p className="text-sm text-gray-500">{user.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => toggleMembershipExpand(user.user._id)}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-50"
                      >
                        <span>Current Membership</span>
                        {expandedMemberships.has(user.user._id) ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                      </button>
                      <button
                        onClick={() => toggleHistoryExpand(user.user._id)}
                        className="text-gray-600 hover:text-gray-700 flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-50"
                      >
                        <FaHistory />
                        <span>History</span>
                        {expandedHistory.has(user.user._id) ? (
                          <FaChevronUp />
                        ) : (
                          <FaChevronDown />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Current Membership Details */}
                  {expandedMemberships.has(user.user._id) && (
                    <div className="mt-4">
                      <div className="bg-gray-50 rounded-lg border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-semibold text-gray-900">Current Membership</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.currentMembership.status)}`}>
                              {user.currentMembership.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs font-medium text-gray-500">Tier</p>
                                <p className="text-base font-medium text-gray-900">{user.currentMembership.tier}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500">Start Date</p>
                                <p className="text-base text-gray-900">{formatDate(user.currentMembership.startDate)}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500">Payment Status</p>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.currentMembership.paymentStatus)}`}>
                                  {user.currentMembership.paymentStatus}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs font-medium text-gray-500">Amount</p>
                                <p className="text-base font-medium text-gray-900">{formatPrice(user.currentMembership.paymentDetails?.amount || 0)}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500">Expiry Date</p>
                                <p className="text-base text-gray-900">{formatDate(user.currentMembership.expiryDate)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Membership History */}
                  {expandedHistory.has(user.user._id) && (
                    <div className="mt-4">
                      <h4 className="text-base font-semibold mb-3 text-gray-900">Membership History</h4>
                      {user.history.filter(record => record.tier !== user.currentMembership.tier).length > 0 ? (
                        <div className="space-y-3">
                          {user.history
                            .filter(record => record.tier !== user.currentMembership.tier)
                            .map((record, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <h5 className="text-base font-medium text-gray-900">{record.tier}</h5>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                                      {record.status}
                                    </span>
                                  </div>
                                </div>
                                <div className="p-6">
                                  <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <div>
                                        <p className="text-xs font-medium text-gray-500">Purchase Date</p>
                                        <p className="text-base text-gray-900">{formatDate(record.purchaseDate)}</p>
                                      </div>
                                      {record.paymentDetails && (
                                        <div>
                                          <p className="text-xs font-medium text-gray-500">Amount</p>
                                          <p className="text-base text-gray-900">{formatPrice(record.paymentDetails.amount || 0)}</p>
                                        </div>
                                      )}
                                    </div>
                                    <div className="space-y-4">
                                      <div>
                                        <p className="text-xs font-medium text-gray-500">Expiry Date</p>
                                        <p className="text-base text-gray-900">{formatDate(record.expiryDate)}</p>
                                      </div>
                                    </div>
                                  </div>
                                  {record.notes && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                      <p className="text-xs font-medium text-gray-500">Notes</p>
                                      <p className="mt-1 text-sm text-gray-900">{record.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
                          <p className="text-sm text-gray-500">No previous membership history found.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Membership Management</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search members..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Membership Tiers */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Membership Tiers</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {membershipTiers.map((tier) => (
                <button
                  key={tier._id}
                  onClick={() => handleTierSelect(tier.tier)}
                  className={`relative flex flex-col h-full rounded-lg border transition-all duration-200 ${
                    selectedTier === tier.tier
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex-1 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className={`text-base font-semibold ${
                          selectedTier === tier.tier ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {tier.tier}
                        </h3>
                        <div className={`mt-1 ${
                          selectedTier === tier.tier ? 'text-blue-500' : 'text-gray-600'
                        }`}>
                          <span className="text-lg font-bold">${tier.price.toFixed(2)}</span>
                          <span className="text-sm ml-1">/month</span>
                        </div>
                      </div>
                      <div className={`p-2 rounded-md ${
                        selectedTier === tier.tier ? 'bg-blue-100' : 'bg-gray-50'
                      }`}>
                        <FaUsers className={`w-5 h-5 ${
                          selectedTier === tier.tier ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {tier.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                            feature.included 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {feature.included ? (
                              <FaCheck className="w-3 h-3" />
                            ) : (
                              <FaTimes className="w-3 h-3" />
                            )}
                          </div>
                          <span className={`text-sm ${
                            feature.included ? 'text-gray-700' : 'text-gray-500'
                          }`}>
                            {feature.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedTier === tier.tier && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-bl-lg">
                        Selected
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Membership Users</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user.user._id} className="p-6">
                {/* User Info Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {user.user.userImage ? (
                      <img
                        src={user.user.userImage}
                        alt={user.user.userName}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <FaUserCircle className="w-10 h-10 text-gray-400" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.user.userName}</h3>
                      <p className="text-sm text-gray-500">{user.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleMembershipExpand(user.user._id)}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-2 px-4 py-2 rounded-md hover:bg-blue-50"
                    >
                      <span>Current Membership</span>
                      {expandedMemberships.has(user.user._id) ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </button>
                    <button
                      onClick={() => toggleHistoryExpand(user.user._id)}
                      className="text-gray-600 hover:text-gray-700 flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-50"
                    >
                      <FaHistory />
                      <span>History</span>
                      {expandedHistory.has(user.user._id) ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </button>
                  </div>
                </div>

                {/* Current Membership Details */}
                {expandedMemberships.has(user.user._id) && (
                  <div className="mt-4">
                    <div className="bg-gray-50 rounded-lg border border-gray-200">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-semibold text-gray-900">Current Membership</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.currentMembership.status)}`}>
                            {user.currentMembership.status}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs font-medium text-gray-500">Tier</p>
                              <p className="text-base font-medium text-gray-900">{user.currentMembership.tier}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Start Date</p>
                              <p className="text-base text-gray-900">{formatDate(user.currentMembership.startDate)}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Payment Status</p>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.currentMembership.paymentStatus)}`}>
                                {user.currentMembership.paymentStatus}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <p className="text-xs font-medium text-gray-500">Amount</p>
                              <p className="text-base font-medium text-gray-900">{formatPrice(user.currentMembership.paymentDetails?.amount || 0)}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500">Expiry Date</p>
                              <p className="text-base text-gray-900">{formatDate(user.currentMembership.expiryDate)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Membership History */}
                {expandedHistory.has(user.user._id) && (
                  <div className="mt-4">
                    <h4 className="text-base font-semibold mb-3 text-gray-900">Membership History</h4>
                    {user.history.filter(record => record.tier !== user.currentMembership.tier).length > 0 ? (
                      <div className="space-y-3">
                        {user.history
                          .filter(record => record.tier !== user.currentMembership.tier)
                          .map((record, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg border border-gray-200">
                              <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-base font-medium text-gray-900">{record.tier}</h5>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                                    {record.status}
                                  </span>
                                </div>
                              </div>
                              <div className="p-6">
                                <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <div>
                                      <p className="text-xs font-medium text-gray-500">Purchase Date</p>
                                      <p className="text-base text-gray-900">{formatDate(record.purchaseDate)}</p>
                                    </div>
                                    {record.paymentDetails && (
                                      <div>
                                        <p className="text-xs font-medium text-gray-500">Amount</p>
                                        <p className="text-base text-gray-900">{formatPrice(record.paymentDetails.amount || 0)}</p>
                                      </div>
                                    )}
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <p className="text-xs font-medium text-gray-500">Expiry Date</p>
                                      <p className="text-base text-gray-900">{formatDate(record.expiryDate)}</p>
                                    </div>
                                  </div>
                                </div>
                                {record.notes && (
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-xs font-medium text-gray-500">Notes</p>
                                    <p className="mt-1 text-sm text-gray-900">{record.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
                        <p className="text-sm text-gray-500">No previous membership history found.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MembershipManagement; 