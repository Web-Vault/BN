import { useState, useEffect, useCallback } from "react";
import {
  FiActivity,
  FiUser,
  FiPlus,
  FiStar,
  FiClock,
  FiCheckCircle,
  FiType,
  FiFilter,
  FiX,
  // FiUserCheck,
} from "react-icons/fi";
import Navbar from "../../components/Navbar.js";
import config from "../../config/config.js";
import axios from "axios";
import UserSearchInput from "../../components/UserSearchInput";

const ActivityPage = () => {
  const [activeTab, setActiveTab] = useState("system");
  const [userActivities, setUserActivities] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [rejectedActivities, setRejectedActivities] = useState([]);
  const [showForm, setShowForm] = useState(false); // Toggle form visibility
  const [userNames, setUserNames] = useState({}); // Store user names
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("thisWeek");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newActivity, setNewActivity] = useState({
    content: "",
    type: "One-To-One",
    typeContent: "",
    date: new Date().toISOString().split("T")[0],
    rating: 5,
    visitorCount: 0,
    businessAmount: 0,
    referenceDetails: "",
    meetingLocation: "",
    meetingDuration: 30,
    businessCategory: "",
    referralStatus: "pending",
    businessStatus: "pending",
    visitorType: "guest",
    eventType: "chapter",
  });

  const [activities, setActivities] = useState([]);
  const [selectedType, setSelectedType] = useState("all"); // New state for filter
  const [selectedUser, setSelectedUser] = useState(null);

  // Add function to fetch user details
  const fetchUserDetails = useCallback(
    async (userId) => {
      if (!userId || userNames[userId]) return;

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${config.API_BASE_URL}/api/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data && response.data.user) {
          // console.log(`Fetched user details for ${userId}:`, response.data.user);
          setUserNames((prev) => {
            const newNames = {
              ...prev,
              [userId]: response.data.user.userName,
            };
            // console.log('Updated userNames state:', newNames);
            return newNames;
          });
        }
      } catch (err) {
        console.error(`❌ Error fetching user details for ${userId}:`, err);
        // Set a fallback name if user fetch fails
        setUserNames((prev) => ({
          ...prev,
          [userId]: `User ${userId.slice(-4)}`,
        }));
      }
    },
    [userNames]
  );

  // Separate useEffect for fetching user details
  useEffect(() => {
    const fetchAllUserDetails = async () => {
      const userIds = new Set();

      // Collect all user IDs from activities
      activities.forEach((activity) => {
        if (activity.metadata) {
          if (activity.metadata.referredUser) {
            userIds.add(activity.metadata.referredUser);
          }
          if (activity.metadata.referrer) {
            userIds.add(activity.metadata.referrer);
          }
        }
      });

      // console.log('Found user IDs to fetch:', Array.from(userIds));

      // Fetch all user details in parallel
      const fetchPromises = Array.from(userIds).map((userId) =>
        fetchUserDetails(userId)
      );
      await Promise.all(fetchPromises);
    };

    if (activities.length > 0) {
      fetchAllUserDetails();
    }
  }, [activities, fetchUserDetails]);

  // Update useEffect to only fetch activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `${config.API_BASE_URL}/api/activity/user`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // console.log('Fetched activities:', response.data);
        setActivities(response.data);
      } catch (err) {
        console.error("❌ Error fetching activities:", err);
        setError("Failed to load activity history");
      }
    };

    fetchActivities();
  }, []);

  const fetchUserActivities = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${config.API_BASE_URL}/api/activity/userActivity?timePeriod=${selectedTimePeriod}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserActivities(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user activities:", error);
      setError("Failed to fetch activities");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserActivities();
  }, [selectedTimePeriod]);

  // Fetch pending verifications
  useEffect(() => {
    const fetchPendingVerifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${config.API_BASE_URL}/api/activity/pending-verifications`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPendingVerifications(response.data);
      } catch (err) {
        console.error("❌ Error fetching pending verifications:", err);
      }
    };

    fetchPendingVerifications();
  }, []);

  // Fetch rejected activities
  useEffect(() => {
    const fetchRejectedActivities = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${config.API_BASE_URL}/api/activity/rejected`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRejectedActivities(response.data);
      } catch (err) {
        console.error("❌ Error fetching rejected activities:", err);
      }
    };

    fetchRejectedActivities();
  }, []);

  // Handle adding new user activity
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setNewActivity((prev) => ({
      ...prev,
      relatedUser: user._id,
    }));
  };

  const handleAddActivity = async () => {
    try {
      if (!selectedUser) {
        setError("Please select a related user");
        return;
      }

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${config.API_BASE_URL}/api/activity/userActivity`,
        {
          ...newActivity,
          relatedUser: selectedUser._id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Add the new activity to the list
      setUserActivities((prev) => [response.data, ...prev]);

      // Reset form
      setNewActivity({
        content: "",
        type: "One-To-One",
        typeContent: "",
        date: new Date().toISOString().split("T")[0],
        rating: 5,
        visitorCount: 0,
        businessAmount: 0,
        referenceDetails: "",
        meetingLocation: "",
        meetingDuration: 30,
        businessCategory: "",
        referralStatus: "pending",
        businessStatus: "pending",
        visitorType: "guest",
        eventType: "chapter",
      });
      setSelectedUser(null);
      setShowForm(false);
      setError(null);
    } catch (err) {
      console.error("❌ Error adding activity:", err);
      setError(err.response?.data?.message || "Failed to add activity");
    }
  };

  // Get unique activity types for filter options
  const activityTypes = [
    "all",
    ...new Set(userActivities.map((activity) => activity.type)),
  ];

  // Filter activities based on selected type
  const filteredUserActivities =
    selectedType === "all"
      ? userActivities
      : userActivities.filter((activity) => activity.type === selectedType);

  // Get unique action types for system activities
  const systemActivityTypes = [
    "all",
    ...new Set(activities.map((activity) => activity.action)),
  ];

  // Filter system activities based on selected type
  const filteredSystemActivities =
    selectedType === "all"
      ? activities
      : activities.filter((activity) => activity.action === selectedType);

  // Handle activity verification
  const handleVerifyActivity = async (activityId, isVerified, notes) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${config.API_BASE_URL}/api/activity/verify/${activityId}`,
        { isVerified, verificationNotes: notes },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Remove from pending verifications
      setPendingVerifications((prev) =>
        prev.filter((activity) => activity._id !== activityId)
      );

      // If verified, add to user activities
      if (isVerified) {
        setUserActivities((prev) => [response.data, ...prev]);
      } else {
        // If rejected, add to rejected activities
        setRejectedActivities((prev) => [response.data, ...prev]);
      }

      // Refresh all activity lists
      const [userActivitiesRes, pendingRes, rejectedRes] = await Promise.all([
        axios.get(`${config.API_BASE_URL}/api/activity/userActivity`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${config.API_BASE_URL}/api/activity/pending-verifications`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${config.API_BASE_URL}/api/activity/rejected`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setUserActivities(userActivitiesRes.data);
      setPendingVerifications(pendingRes.data);
      setRejectedActivities(rejectedRes.data);
    } catch (err) {
      console.error("❌ Error verifying activity:", err);
      setError(err.response?.data?.message || "Failed to verify activity");
    }
  };

  // Update the metadata display section
  const renderMetadataValue = useCallback(
    (key, value) => {
      if (key === "referredUser" || key === "referrer") {
        const userName = userNames[value];
        // console.log(`Rendering ${key}:`, { value, userName, allNames: userNames });
        return userName || value;
      }
      if (typeof value === "object") {
        return JSON.stringify(value);
      }
      return value?.toString() || "N/A";
    },
    [userNames]
  );

  const getDateRangeText = () => {
    const endDate = new Date();
    let startDate = new Date();

    switch (selectedTimePeriod) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        return `Showing activities for ${startDate.toLocaleDateString()}`;
      case "thisWeek":
        startDate.setDate(startDate.getDate() - 7);
        return `Showing activities from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`;
      case "lastWeek":
        startDate.setDate(startDate.getDate() - 14);
        return `Showing activities from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`;
      case "lastMonth":
        startDate.setMonth(startDate.getMonth() - 1);
        return `Showing activities from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`;
      case "overall":
        return "Showing all activities";
      default:
        return "";
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] p-3 lg:p-8">
        <div className="max-w-7xl mx-auto bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30">
          {/* Tabs Navigation */}
          <div className="border-b border-white/20">
            <nav className="grid grid-cols-2 md:grid-cols-4 lg:flex lg:space-x-8 gap-2 lg:gap-0 px-3 lg:px-6">
              <button
                onClick={() => setActiveTab("system")}
                className={`py-3 lg:py-4 px-2 lg:px-1 border-b-2 font-semibold flex items-center justify-center lg:justify-start gap-2 text-sm lg:text-base ${
                  activeTab === "system"
                    ? "text-blue-600 border-blue-500"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                <FiActivity className="text-base lg:text-lg" />
                <span className="whitespace-nowrap">System</span>
              </button>
              <button
                onClick={() => setActiveTab("user")}
                className={`py-3 lg:py-4 px-2 lg:px-1 border-b-2 font-semibold flex items-center justify-center lg:justify-start gap-2 text-sm lg:text-base ${
                  activeTab === "user"
                    ? "text-blue-600 border-blue-500"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                <FiUser className="text-base lg:text-lg" />
                <span className="whitespace-nowrap">User</span>
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`py-3 lg:py-4 px-2 lg:px-1 border-b-2 font-semibold flex items-center justify-center lg:justify-start gap-2 text-sm lg:text-base ${
                  activeTab === "pending"
                    ? "text-blue-600 border-blue-500"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                <FiClock className="text-base lg:text-lg" />
                <span className="whitespace-nowrap">Pending</span>
                {pendingVerifications.length > 0 && (
                  <span className="bg-yellow-500 text-white text-xs px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full">
                    {pendingVerifications.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("rejected")}
                className={`py-3 lg:py-4 px-2 lg:px-1 border-b-2 font-semibold flex items-center justify-center lg:justify-start gap-2 text-sm lg:text-base ${
                  activeTab === "rejected"
                    ? "text-blue-600 border-blue-500"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                <FiX className="text-base lg:text-lg" />
                <span className="whitespace-nowrap">Rejected</span>
                {rejectedActivities.length > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full">
                    {" "}
                    {rejectedActivities.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* System Activity Tab */}
          {activeTab === "system" && (
            <div className="p-2 lg:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-blue-600">
                  <FiActivity /> System Activities
                </h2>

                {/* Filter Dropdown for System Activities */}
                <div className="relative w-full sm:w-auto">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full sm:w-auto pl-10 pr-4 py-2 bg-white/90 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 appearance-none"
                  >
                    {systemActivityTypes.map((type) => (
                      <option key={type} value={type}>
                        {type === "all" ? "All Activities" : type}
                      </option>
                    ))}
                  </select>
                  <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none" />
                </div>
              </div>

              <div className="columns-1 md:columns-2 gap-6 space-y-6">
                {filteredSystemActivities.map((activity) => (
                  <div
                    key={activity._id}
                    className="break-inside-avoid bg-white/30 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/50 transition-all"
                  >
                    {/* Activity Header */}
                    <div className="p-4 border-b border-white/20">
                      <div className="flex items-center gap-2">
                        <div className="pr-1 bg-blue-100/50 rounded-lg">
                          <FiCheckCircle className="text-blue-600 text-xl" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-600 flex items-center gap-2">
                            <FiClock className="text-blue-600" />{" "}
                            {new Date(activity.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Activity Metadata */}
                    {activity.metadata &&
                      Object.keys(activity.metadata).length > 0 && (
                        <div className="p-4 bg-white/50">
                          <p className="font-medium text-gray-700 mb-2">
                            Details:
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(activity.metadata).map(
                              ([key, value]) => (
                                <div key={key} className="flex flex-col">
                                  <span className="text-gray-600 capitalize text-xs">
                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                  </span>
                                  <span className="text-gray-800 font-medium truncate">
                                    {renderMetadataValue(key, value)}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Activity Tab */}
          {activeTab === "user" && (
            <div className="p-2 lg:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
                  <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-blue-600">
                    <FiUser /> User Activities
                  </h2>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    {/* Time Period Selector */}
                    <div className="relative w-full sm:w-auto">
                      <select
                        value={selectedTimePeriod}
                        onChange={(e) => setSelectedTimePeriod(e.target.value)}
                        className="w-full sm:w-auto pl-10 pr-4 py-2 bg-white/90 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 appearance-none"
                      >
                        <option value="today">Today</option>
                        <option value="thisWeek">This Week</option>
                        <option value="lastWeek">Last Week</option>
                        <option value="lastMonth">Last Month</option>
                        <option value="overall">Overall</option>
                      </select>
                      <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none" />
                    </div>

                    {/* Activity Type Filter */}
                    <div className="relative w-full sm:w-auto">
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full sm:w-auto pl-10 pr-4 py-2 bg-white/90 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 appearance-none"
                      >
                        {activityTypes.map((type) => (
                          <option key={type} value={type}>
                            {type === "all" ? "All Activities" : type}
                          </option>
                        ))}
                      </select>
                      <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none" />
                    </div>
                  </div>
                </div>

              {/* Date Range Display */}
              <div className="mb-4 flex justify-end mr-1 text-sm text-gray-600">
                <span>{getDateRangeText()}</span>
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center">{error}</div>
              ) : (
                <>
                  {/* Add Activity Button */}
                  <div className="mb-8">
                    <button
                      onClick={() => setShowForm(true)}
                      className="mb-6 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FiPlus /> Add New Activity
                    </button>
                  </div>

                  {/* Add Activity Form */}
                  {showForm && (
                    <div className="mb-8 p-6 bg-white/30 backdrop-blur-sm rounded-lg border border-white/20">
                      <h3 className="text-xl font-semibold mb-4 text-gray-800">
                        Add New Activity
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Activity Type
                          </label>
                          <select
                            value={newActivity.type}
                            onChange={(e) =>
                              setNewActivity({
                                ...newActivity,
                                type: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <optgroup label="Core Activities">
                              <option value="One-To-One">
                                One-To-One Meeting
                              </option>
                              <option value="Business Received">
                                Business Received
                              </option>
                              <option value="Visitors">
                                Number of Visitors
                              </option>
                              <option value="Business Given">
                                Business Given
                              </option>
                            </optgroup>
                            <optgroup label="BNI Activities">
                              <option value="Chapter Meeting">
                                Chapter Meeting
                              </option>
                              <option value="BNI Training">BNI Training</option>
                              <option value="BNI Event">BNI Event</option>
                              <option value="BNI Leadership">
                                BNI Leadership
                              </option>
                            </optgroup>
                          </select>
                        </div>

                        {/* Dynamic Fields based on Activity Type */}
                        {newActivity.type === "One-To-One" && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Meeting With
                              </label>
                              <input
                                type="text"
                                value={newActivity.typeContent}
                                onChange={(e) =>
                                  setNewActivity({
                                    ...newActivity,
                                    typeContent: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter person's name"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Meeting Location
                              </label>
                              <input
                                type="text"
                                value={newActivity.meetingLocation}
                                onChange={(e) =>
                                  setNewActivity({
                                    ...newActivity,
                                    meetingLocation: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter meeting location"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Meeting Duration (minutes)
                              </label>
                              <input
                                type="number"
                                value={newActivity.meetingDuration}
                                onChange={(e) =>
                                  setNewActivity({
                                    ...newActivity,
                                    meetingDuration: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter duration in minutes"
                                min="0"
                              />
                            </div>
                          </>
                        )}

                        {(newActivity.type === "Reference Received" ||
                          newActivity.type === "Reference Given") && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {newActivity.type === "Reference Received"
                                  ? "Referred By"
                                  : "Referred To"}
                              </label>
                              <input
                                type="text"
                                value={newActivity.typeContent}
                                onChange={(e) =>
                                  setNewActivity({
                                    ...newActivity,
                                    typeContent: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={
                                  newActivity.type === "Reference Received"
                                    ? "Enter referrer's name"
                                    : "Enter person's name"
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reference Details
                              </label>
                              <textarea
                                value={newActivity.referenceDetails}
                                onChange={(e) =>
                                  setNewActivity({
                                    ...newActivity,
                                    referenceDetails: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="2"
                                placeholder="Enter reference details..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Referral Status
                              </label>
                              <select
                                value={newActivity.referralStatus}
                                onChange={(e) =>
                                  setNewActivity({
                                    ...newActivity,
                                    referralStatus: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="pending">Pending</option>
                                <option value="converted">Converted</option>
                                <option value="lost">Lost</option>
                              </select>
                            </div>
                          </>
                        )}

                        {(newActivity.type === "Business Received" ||
                          newActivity.type === "Business Given") && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {newActivity.type === "Business Received"
                                  ? "Business From"
                                  : "Business To"}
                              </label>
                              <input
                                type="text"
                                value={newActivity.typeContent}
                                onChange={(e) =>
                                  setNewActivity({
                                    ...newActivity,
                                    typeContent: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={
                                  newActivity.type === "Business Received"
                                    ? "Enter business provider's name"
                                    : "Enter client's name"
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Business Amount
                              </label>
                              <input
                                type="number"
                                value={newActivity.businessAmount}
                                onChange={(e) =>
                                  setNewActivity({
                                    ...newActivity,
                                    businessAmount: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter amount"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Business Category
                              </label>
                              <input
                                type="text"
                                value={newActivity.businessCategory}
                                onChange={(e) =>
                                  setNewActivity({
                                    ...newActivity,
                                    businessCategory: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter business category"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Business Status
                              </label>
                              <select
                                value={newActivity.businessStatus}
                                onChange={(e) =>
                                  setNewActivity({
                                    ...newActivity,
                                    businessStatus: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </>
                        )}

                        {newActivity.type === "Visitors" && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Number of Visitors
                              </label>
                              <input
                                type="number"
                                value={newActivity.visitorCount}
                                onChange={(e) =>
                                  setNewActivity({
                                    ...newActivity,
                                    visitorCount: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter number of visitors"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Visitor Type
                              </label>
                              <select
                                value={newActivity.visitorType}
                                onChange={(e) =>
                                  setNewActivity({
                                    ...newActivity,
                                    visitorType: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="guest">Guest</option>
                                <option value="member">Member</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                          </>
                        )}

                        {(newActivity.type === "Chapter Meeting" ||
                          newActivity.type === "BNI Training" ||
                          newActivity.type === "BNI Event" ||
                          newActivity.type === "BNI Leadership") && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Event Type
                            </label>
                            <select
                              value={newActivity.eventType}
                              onChange={(e) =>
                                setNewActivity({
                                  ...newActivity,
                                  eventType: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="chapter">Chapter</option>
                              <option value="regional">Regional</option>
                              <option value="national">National</option>
                              <option value="international">
                                International
                              </option>
                            </select>
                          </div>
                        )}

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Related User
                          </label>
                          <UserSearchInput
                            onUserSelect={handleUserSelect}
                            selectedUser={selectedUser}
                            setSelectedUser={setSelectedUser}
                          />
                          {newActivity.type !== "Visitors" && !selectedUser && (
                            <p className="mt-1 text-sm text-yellow-600">
                              Please select a user to connect this activity with
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Activity Description
                          </label>
                          <textarea
                            value={newActivity.content}
                            onChange={(e) =>
                              setNewActivity({
                                ...newActivity,
                                content: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            placeholder="Describe your activity..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rating
                          </label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() =>
                                  setNewActivity({
                                    ...newActivity,
                                    rating: star,
                                  })
                                }
                                className={`text-2xl ${
                                  star <= newActivity.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              >
                                <FiStar />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleAddActivity}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Save Activity
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* User Activities List */}
                  <div className="columns-1 md:columns-2 gap-6 space-y-6">
                    {filteredUserActivities.map((activity) => (
                      <div
                        key={activity._id}
                        className="break-inside-avoid bg-white/30 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/50 transition-all"
                      >
                        {/* Activity Header */}
                        <div className="p-4 border-b border-white/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="pr-1 bg-blue-100/50 rounded-lg">
                                <FiType className="text-blue-600 text-xl" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  {activity.type}
                                </p>
                                {activity.typeContent && (
                                  <p className="text-sm text-gray-600">
                                    {activity.typeContent}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, index) => (
                                <FiStar
                                  key={index}
                                  className={`text-lg ${
                                    index < activity.rating
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Activity Content */}
                        <div className="p-4">
                          <p className="text-gray-700">{activity.content}</p>
                          {activity.type === "Visitors" &&
                            activity.visitorCount > 0 && (
                              <p className="text-sm text-gray-600 mt-2">
                                Visitors: {activity.visitorCount}
                              </p>
                            )}
                          {(activity.type === "Business Received" ||
                            activity.type === "Business Given") &&
                            activity.businessAmount > 0 && (
                              <p className="text-sm text-gray-600 mt-2">
                                Amount: ${activity.businessAmount}
                              </p>
                            )}
                          {(activity.type === "Reference Received" ||
                            activity.type === "Reference Given") &&
                            activity.referenceDetails && (
                              <p className="text-sm text-gray-600 mt-2">
                                Details: {activity.referenceDetails}
                              </p>
                            )}

                          {/* Creator Information */}
                          <div className="mt-4 flex items-center gap-2">
                            <img
                              src={
                                activity.userId?.userImage ||
                                "/default-avatar.png"
                              }
                              alt={activity.userId?.userName || "User"}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                Created by{" "}
                                {activity.userId?.userName || "Unknown User"}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center gap-2">
                                <FiClock className="text-blue-600" />
                                {new Date(activity.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Related User Information */}
                          {activity.relatedUser && (
                            <div className="mt-2 flex items-center gap-2">
                              <img
                                src={
                                  activity.relatedUser?.userImage ||
                                  "/default-avatar.png"
                                }
                                alt={
                                  activity.relatedUser?.userName ||
                                  "Related User"
                                }
                                className="w-8 h-8 rounded-full"
                              />
                              <p className="text-sm text-gray-600">
                                Related to{" "}
                                {activity.relatedUser?.userName ||
                                  "Unknown User"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Pending Verifications Tab */}
          {activeTab === "pending" && (
            <div className="p-2 lg:p-8">
              <h2 className="text-2xl font-semibold mb-6">
                Pending Verifications
              </h2>
              <div className="space-y-4">
                {pendingVerifications.map((activity) => (
                  <div
                    key={activity._id}
                    className="bg-white/30 backdrop-blur-sm rounded-lg border border-white/20 p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {activity.type}
                        </h3>
                        <p className="text-sm text-gray-600">
                          From: {activity.userId?.userName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleVerifyActivity(activity._id, true, "Verified")
                          }
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => {
                            const notes = prompt("Enter rejection reason:");
                            if (notes) {
                              handleVerifyActivity(activity._id, false, notes);
                            }
                          }}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{activity.content}</p>
                    <div className="text-sm text-gray-500">
                      Created: {new Date(activity.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
                {pendingVerifications.length === 0 && (
                  <p className="text-center text-gray-600">
                    No pending verifications
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Rejected Activities Tab */}
          {activeTab === "rejected" && (
            <div className="p-2 lg:p-8">
              <h2 className="text-2xl font-semibold mb-6">
                Rejected Activities
              </h2>
              <div className="space-y-4">
                {rejectedActivities.map((activity) => (
                  <div
                    key={activity._id}
                    className="bg-white/30 backdrop-blur-sm rounded-lg border border-white/20 p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {activity.type}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Rejected by: {activity.verifiedBy?.userName}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                        Rejected
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{activity.content}</p>
                    {activity.verificationNotes && (
                      <div className="bg-red-50 p-3 rounded-lg mb-4">
                        <p className="text-sm text-red-700">
                          Rejection reason: {activity.verificationNotes}
                        </p>
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      Rejected on:{" "}
                      {new Date(activity.verificationDate).toLocaleString()}
                    </div>
                  </div>
                ))}
                {rejectedActivities.length === 0 && (
                  <p className="text-center text-gray-600">
                    No rejected activities
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ActivityPage;
