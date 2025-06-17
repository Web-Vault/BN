import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import config from '../../config/config.js';
import { FaCheck, FaTimes, FaHistory, FaInfoCircle, FaUsers, FaChevronDown, FaChevronUp, FaUserCircle, FaEdit, FaTrash } from 'react-icons/fa';

const MembershipManagement = () => {
  const [membershipTiers, setMembershipTiers] = useState([]);
  const [selectedTier, setSelectedTier] = useState('basic');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedMemberships, setExpandedMemberships] = useState(new Set());
  const [expandedHistory, setExpandedHistory] = useState(new Set());
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [showEditTierModal, setShowEditTierModal] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [newFeature, setNewFeature] = useState({ name: '', included: true });
  const sliderRef = useRef(null);

  useEffect(() => {
    fetchMembershipTiers();
  }, []);

  useEffect(() => {
    if (selectedTier) {
      fetchUsersByTier(selectedTier);
    }
  }, [selectedTier]);

  // Add scroll snapping and auto-selection behavior
  useEffect(() => {
    if (!sliderRef.current) return;

    const slider = sliderRef.current;
    let isScrolling = false;
    let scrollTimeout;

    // Set up Intersection Observer for auto-selection
    const options = {
      root: slider,
      threshold: 0.7, // Card needs to be 70% visible to be considered centered
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const tierId = entry.target.getAttribute('data-tier');
          if (tierId) {
            setSelectedTier(tierId);
          }
        }
      });
    }, options);

    // Observe all tier cards
    const cards = slider.querySelectorAll('.tier-card');
    cards.forEach((card) => observer.observe(card));

    const handleScroll = () => {
      if (!isScrolling) {
        isScrolling = true;
      }

      // Clear the previous timeout
      clearTimeout(scrollTimeout);

      // Set a new timeout
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        
        // Get the current scroll position
        const scrollLeft = slider.scrollLeft;
        const cardWidth = 280; // Width of each card
        const gap = 16; // Gap between cards (4 * 4px)
        const totalWidth = cardWidth + gap;
        
        // Calculate the nearest card position
        const nearestCard = Math.round(scrollLeft / totalWidth);
        
        // Scroll to the nearest card
        slider.scrollTo({
          left: nearestCard * totalWidth,
          behavior: 'smooth'
        });
      }, 100); // Wait for 100ms after scrolling stops
    };

    slider.addEventListener('scroll', handleScroll);
    return () => {
      slider.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
      cards.forEach((card) => observer.unobserve(card));
    };
  }, [membershipTiers]); // Add membershipTiers as dependency to re-observe when tiers change

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

  const handleEditTier = (tier) => {
    setEditingTier({ ...tier });
    setShowEditTierModal(true);
  };

  const handleAddFeature = () => {
    if (!newFeature.name.trim()) return;
    
    setEditingTier(prev => ({
      ...prev,
      features: [...prev.features, { ...newFeature }]
    }));
    setNewFeature({ name: '', included: true });
  };

  const handleRemoveFeature = (index) => {
    setEditingTier(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleToggleFeature = (index) => {
    setEditingTier(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => 
        i === index ? { ...feature, included: !feature.included } : feature
      )
    }));
  };

  const handleSaveTier = async () => {
    try {
      const response = await axios.put(
        `${config.API_BASE_URL}/api/membership-tiers/${editingTier._id}`,
        { features: editingTier.features },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setMembershipTiers(prevTiers => 
          prevTiers.map(tier => 
            tier._id === editingTier._id ? response.data.data : tier
          )
        );
        setShowEditTierModal(false);
        setEditingTier(null);
        setNewFeature({ name: '', included: true });
        toast.success('Tier updated successfully');
      }
    } catch (error) {
      console.error('Error updating tier:', error);
      toast.error(error.response?.data?.message || 'Error updating tier');
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
        <div className="space-y-4 sm:space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Membership Management</h1>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search members..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Membership Tiers</h2>
            </div>
            <div className="p-4 sm:p-6">
              <div className="sm:hidden">
                <div 
                  ref={sliderRef} 
                  className="overflow-x-auto scrollbar-hide scroll-smooth"
                  style={{
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  <div className="flex gap-4 pb-4 px-2">
                    {membershipTiers.map((tier) => (
                      <div 
                        key={tier._id} 
                        className="flex-none w-[280px] snap-center tier-card"
                        data-tier={tier.tier}
                        style={{
                          scrollSnapAlign: 'center',
                          scrollSnapStop: 'always'
                        }}
                      >
                        <button
                          onClick={() => handleTierSelect(tier.tier)}
                          className={`relative w-full flex flex-col h-full rounded-lg border transition-all duration-200 ${
                            selectedTier === tier.tier
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex-1 p-4">
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
                              <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-md ${
                                  selectedTier === tier.tier ? 'bg-blue-100' : 'bg-gray-50'
                                }`}>
                                  <FaUsers className={`w-5 h-5 ${
                                    selectedTier === tier.tier ? 'text-blue-600' : 'text-gray-500'
                                  }`} />
                                </div>
                                {selectedTier === tier.tier && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditTier(tier);
                                    }}
                                    className="p-2 text-gray-600 hover:text-blue-600 rounded-md hover:bg-gray-100"
                                  >
                                    <FaEdit className="w-5 h-5" />
                                  </button>
                                )}
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
                              <div className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-tr-lg rounded-bl-lg">
                                Selected
                              </div>
                            </div>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center gap-1 mt-4">
                  {membershipTiers.map((tier, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                        selectedTier === tier.tier ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="hidden sm:grid sm:grid-cols-2 gap-4">
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
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-md ${
                            selectedTier === tier.tier ? 'bg-blue-100' : 'bg-gray-50'
                          }`}>
                            <FaUsers className={`w-5 h-5 ${
                              selectedTier === tier.tier ? 'text-blue-600' : 'text-gray-500'
                            }`} />
                          </div>
                          {selectedTier === tier.tier && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTier(tier);
                              }}
                              className="p-2 text-gray-600 hover:text-blue-600 rounded-md hover:bg-gray-100"
                            >
                              <FaEdit className="w-5 h-5" />
                            </button>
                          )}
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
                        <div className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-tr-lg rounded-bl-lg">
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
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Membership Users</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user.user._id} className="p-4 sm:p-6">
                  {/* User Info Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                        <h3 className="font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-[300px]" title={user.user.userName}>
                          {user.user.userName}
                        </h3>
                        <p className="text-sm text-gray-500 truncate max-w-[200px] sm:max-w-[300px]" title={user.user.email}>
                          {user.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                      <button
                        onClick={() => toggleMembershipExpand(user.user._id)}
                        className="w-full sm:w-auto text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 px-4 py-2 rounded-md hover:bg-blue-50"
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
                        className="w-full sm:w-auto text-gray-600 hover:text-gray-700 flex items-center justify-center gap-2 px-4 py-2 rounded-md hover:bg-gray-50"
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
                        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <h4 className="text-base font-semibold text-gray-900">Current Membership</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.currentMembership.status)}`}>
                              {user.currentMembership.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 sm:p-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <h5 className="text-base font-medium text-gray-900">{record.tier}</h5>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                                      {record.status}
                                    </span>
                                  </div>
                                </div>
                                <div className="p-4 sm:p-6">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
      <div className="space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Membership Management</h1>
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search members..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Membership Tiers</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="sm:hidden">
              <div 
                ref={sliderRef} 
                className="overflow-x-auto scrollbar-hide scroll-smooth"
                style={{
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                <div className="flex gap-4 pb-4 px-2">
                  {membershipTiers.map((tier) => (
                    <div 
                      key={tier._id} 
                      className="flex-none w-[280px] snap-center tier-card"
                      data-tier={tier.tier}
                      style={{
                        scrollSnapAlign: 'center',
                        scrollSnapStop: 'always'
                      }}
                    >
                      <button
                        onClick={() => handleTierSelect(tier.tier)}
                        className={`relative w-full flex flex-col h-full rounded-lg border transition-all duration-200 ${
                          selectedTier === tier.tier
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex-1 p-4">
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
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-md ${
                                selectedTier === tier.tier ? 'bg-blue-100' : 'bg-gray-50'
                              }`}>
                                <FaUsers className={`w-5 h-5 ${
                                  selectedTier === tier.tier ? 'text-blue-600' : 'text-gray-500'
                                }`} />
                              </div>
                              {selectedTier === tier.tier && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditTier(tier);
                                  }}
                                  className="p-2 text-gray-600 hover:text-blue-600 rounded-md hover:bg-gray-100"
                                >
                                  <FaEdit className="w-5 h-5" />
                                </button>
                              )}
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
                            <div className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-tr-lg rounded-bl-lg">
                              Selected
                            </div>
                          </div>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center gap-1 mt-4">
                {membershipTiers.map((tier, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                      selectedTier === tier.tier ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="hidden sm:grid sm:grid-cols-2 gap-4">
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
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-md ${
                          selectedTier === tier.tier ? 'bg-blue-100' : 'bg-gray-50'
                        }`}>
                          <FaUsers className={`w-5 h-5 ${
                            selectedTier === tier.tier ? 'text-blue-600' : 'text-gray-500'
                          }`} />
                        </div>
                        {selectedTier === tier.tier && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTier(tier);
                            }}
                            className="p-2 text-gray-600 hover:text-blue-600 rounded-md hover:bg-gray-100"
                          >
                            <FaEdit className="w-5 h-5" />
                          </button>
                        )}
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
                      <div className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-tr-lg rounded-bl-lg">
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
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Membership Users</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user.user._id} className="p-4 sm:p-6">
                {/* User Info Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                      <h3 className="font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-[300px]" title={user.user.userName}>
                        {user.user.userName}
                      </h3>
                      <p className="text-sm text-gray-500 truncate max-w-[200px] sm:max-w-[300px]" title={user.user.email}>
                        {user.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                    <button
                      onClick={() => toggleMembershipExpand(user.user._id)}
                      className="w-full sm:w-auto text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 px-4 py-2 rounded-md hover:bg-blue-50"
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
                      className="w-full sm:w-auto text-gray-600 hover:text-gray-700 flex items-center justify-center gap-2 px-4 py-2 rounded-md hover:bg-gray-50"
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
                      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h4 className="text-base font-semibold text-gray-900">Current Membership</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.currentMembership.status)}`}>
                            {user.currentMembership.status}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <h5 className="text-base font-medium text-gray-900">{record.tier}</h5>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                                    {record.status}
                                  </span>
                                </div>
                              </div>
                              <div className="p-4 sm:p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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

      {/* Edit Tier Modal */}
      {showEditTierModal && editingTier && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Edit {editingTier.tier} Membership Tier
              </h3>
            </div>
            
            {/* Content */}
            <div className="px-4 sm:px-6 py-4">
              <div className="space-y-6">
                {/* Features List */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Features</h4>
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                    {editingTier.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleFeature(index)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              feature.included ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {feature.included ? <FaCheck className="w-3 h-3" /> : <FaTimes className="w-3 h-3" />}
                          </button>
                          <span className="text-sm text-gray-900">{feature.name}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveFeature(index)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add New Feature */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Feature</h4>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input
                      type="text"
                      value={newFeature.name}
                      onChange={(e) => setNewFeature(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter feature name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newFeature.name.trim()) {
                          handleAddFeature();
                        }
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={newFeature.included}
                          onChange={(e) => setNewFeature(prev => ({ ...prev, included: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Included
                      </label>
                    </div>
                    <button
                      onClick={handleAddFeature}
                      disabled={!newFeature.name.trim()}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-white">
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    setShowEditTierModal(false);
                    setEditingTier(null);
                    setNewFeature({ name: '', included: true });
                  }}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTier}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default MembershipManagement; 