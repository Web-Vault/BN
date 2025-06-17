import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import axios from "axios";
import config from "../../config/config.js";
import { toast } from "react-hot-toast";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiActivity,
  FiArrowDown,
  FiArrowUp,
  FiUsers,
  FiCalendar,
} from "react-icons/fi";

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [warningReason, setWarningReason] = useState("");
  const [customWarningReason, setCustomWarningReason] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [chapters, setChapters] = useState(null);
  const [loadingInvestments, setLoadingInvestments] = useState(false);
  const [investmentError, setInvestmentError] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [fundingRequests, setFundingRequests] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [referralError, setReferralError] = useState(null);
  const [referralStats, setReferralStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [userAnnouncements, setUserAnnouncements] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [systemActivities, setSystemActivities] = useState([]);
  const [userActivities, setUserActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [warningDuration, setWarningDuration] = useState(7); // Default 7 days
  const [banDuration, setBanDuration] = useState(30); // Default 30 days
  const [showUnbanModal, setShowUnbanModal] = useState(false);
  const [activities, setActivities] = useState([]);

  const warningReasons = [
    "Inappropriate Content",
    "Spam Behavior",
    "Harassment",
    "Violation of Community Guidelines",
    "Suspicious Activity",
    "Other",
  ];

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "business", label: "Business" },
    { id: "connections", label: "Connections" },
    { id: "chapters", label: "Chapters" },
    { id: "investments", label: "Investments" },
    { id: "referrals", label: "Referrals" },
    //     { id: 'transactions', label: 'Transactions' },
    //     { id: "posts", label: "Announcements" },
    { id: "activity", label: "Activity" },
  ];

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await axios.get(
          `${config.API_BASE_URL}/api/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        // console.log("Admin check response:", response.data);
        setIsAdmin(response.data.user?.isAdmin === true);
      } catch (err) {
        console.error("Error checking admin status:", err);
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, []);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${config.API_BASE_URL}/api/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // console.log("Fetched user data:", response.data);
      setUser(response.data);
      fetchUserChapters(response.data.user.groupJoined.JoinedGroupId);
      setError(null);
    } catch (err) {
      setError("Failed to fetch user data. Please try again.");
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserChapters = async (chapterId) => {
    if (!chapterId) {
      setChapters(null);
      return;
    }
    // console.log("Fetching chapter details for ID:", chapterId);
    try {
      const response = await axios.get(
        `${config.API_BASE_URL}/api/chapters/${chapterId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // console.log("Fetched chapter details:", response.data);
      setChapters(response.data);
    } catch (err) {
      console.error("Error fetching chapter details:", err);
      setChapters(null);
    }
  };

  // Fetch user's business data
  //   const fetchBusinessData = async () => {
  //     try {
  //       const response = await axios.get(`${config.API_BASE_URL}/api/business/${userId}`, {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem('token')}`
  //         }
  //       });
  //       console.log('Fetched business data:', response.data);
  //       setUser(prev => ({ ...prev, business: response.data }));
  //     } catch (err) {
  //       console.error('Error fetching business data:', err);
  //     }
  //   };

  // Fetch user's connections
  const fetchConnections = async () => {
    try {
      const response = await axios.get(
        `${config.API_BASE_URL}/api/connections/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // console.log("Fetched connections:", response.data);
      setUser((prev) => ({ ...prev, connections: response.data }));
    } catch (err) {
      console.error("Error fetching connections:", err);
    }
  };

  // Fetch user's investments
  const fetchInvestments = async () => {
    if (!user?.user?._id) {
      // console.log("No user ID available, skipping investment fetch");
      return;
    }

    // console.log("Starting investment fetch for user:", user.user);
    setLoadingInvestments(true);
    setInvestmentError(null);

    try {
      const token = localStorage.getItem("token");
      // console.log("Auth token:", token ? "Present" : "Missing");

      // Fetch all investments using admin route
      // console.log("Fetching all investments via admin route...");
      const investmentsRes = await axios.get(
        `${config.API_BASE_URL}/api/investments/admin/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // console.log("All investments response:", investmentsRes.data);
      // console.log("Total investments received:", investmentsRes.data.length);

      // Separate investments into two categories
      const userInvestments = [];
      const userRequests = [];

      investmentsRes.data.forEach((investment) => {
        // Check if user is an investor
        const isInvestor = investment.investors?.some(
          (investor) =>
            investor.user === user.user._id ||
            investor.user._id === user.user._id
        );

        // Check if user is the seeker
        const isSeeker = investment.seeker._id === user.user._id;

        // Add to appropriate arrays
        if (isInvestor) {
          userInvestments.push({
            ...investment,
            isCreator: false,
          });
        }

        if (isSeeker) {
          userRequests.push({
            ...investment,
            isCreator: true,
          });
        }
      });

      // console.log("User investments:", userInvestments);
      // console.log("User funding requests:", userRequests);

      setInvestments(userInvestments);
      setFundingRequests(userRequests);
    } catch (err) {
      console.error("Error fetching investments:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setInvestmentError(
        err.response?.data?.msg ||
          "Failed to load investments. Please try again later."
      );
    } finally {
      setLoadingInvestments(false);
      // console.log("Investment fetch completed. Current states:", {
      //   investments: investments.length,
      //   fundingRequests: fundingRequests.length,
      //   loading: loadingInvestments,
      //   error: investmentError,
      // });
    }
  };

  useEffect(() => {
    // console.log("useEffect triggered. User:", user);
    if (user?.user?._id) {
      // console.log("User ID available, calling fetchInvestments");
      fetchInvestments();
    }
  }, [user?.user?._id]);

  // Fetch user's referrals
  const fetchReferrals = async () => {
    try {
      setLoadingReferrals(true);
      const response = await axios.get(
        `${config.API_BASE_URL}/api/referrals/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // console.log("Fetched referrals data:", response.data);
      setReferrals(response.data.referrals);
      setReferralStats(response.data.stats);
      setReferralError(null);
    } catch (err) {
      console.error("Error fetching referrals:", err);
      setReferralError("Failed to fetch referrals. Please try again.");
    } finally {
      setLoadingReferrals(false);
    }
  };

  // Fetch user's transactions
  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch investments made by the user (spending)
      const investmentsResponse = await axios.get(
        `${config.API_BASE_URL}/api/investments/my-investments/${userId}`,
        { headers }
      );

      // Fetch investments received by the user (earnings)
      const receivedInvestmentsResponse = await axios.get(
        `${config.API_BASE_URL}/api/investments/my-requests/${userId}`,
        { headers }
      );

      // Fetch withdrawals
      const withdrawalsResponse = await axios.get(
        `${config.API_BASE_URL}/api/investments/withdrawals`,
        { headers }
      );

      // Filter withdrawals for the specific user
      const userWithdrawals = withdrawalsResponse.data.filter(
        (withdrawal) => withdrawal.investor === userId
      );

      // Fetch referral earnings
      const referralsResponse = await axios.get(
        `${config.API_BASE_URL}/api/referrals/user/${userId}`,
        { headers }
      );

      // Process and combine all transactions
      const transactions = [
        // Spending transactions (investments made by user)
        ...investmentsResponse.data.map((inv) => ({
          _id: `spending-${inv._id}`,
          type: "investment",
          amount: `-$${inv.amount}`,
          status: inv.status,
          description: `Investment in ${
            inv.recipient?.username || "User"
          }'s request`,
          partner: inv.recipient?.username || "User",
          date: new Date(inv.createdAt).toISOString().split("T")[0],
          createdAt: inv.createdAt,
        })),

        // Earnings transactions (investments received)
        ...receivedInvestmentsResponse.data.map((inv) => ({
          _id: `investment-${inv._id}`,
          type: "investment",
          amount: `+$${inv.amount}`,
          status: inv.status,
          description: `Investment from ${inv.investor?.username || "User"}`,
          partner: inv.investor?.username || "User",
          date: new Date(inv.createdAt).toISOString().split("T")[0],
          createdAt: inv.createdAt,
        })),

        // Withdrawal transactions
        ...userWithdrawals.map((w) => ({
          _id: `withdrawal-${w._id}`,
          type: "interest",
          amount: `+$${w.amount}`,
          status: w.status,
          description: "Withdrawal request",
          partner: w.investment?.title || "Investment",
          date: new Date(w.updatedAt).toISOString().split("T")[0],
          createdAt: w.updatedAt,
        })),

        // Referral earnings
        ...referralsResponse.data.referrals
          .filter((ref) => ref.status === "completed")
          .map((ref) => ({
            _id: `referral-${ref._id}`,
            type: "referral",
            amount: `+$${ref.rewardAmount}`,
            status: "completed",
            description: `Referral bonus from ${
              ref.referredUser?.userName || "User"
            }`,
            partner: ref.referredUser?.userName || "User",
            date: new Date(ref.completedAt || ref.createdAt)
              .toISOString()
              .split("T")[0],
            createdAt: ref.completedAt || ref.createdAt,
          })),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setUser((prev) => ({
        ...prev,
        transactions,
      }));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions");
    }
  };

  // Fetch user's announcements
  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(
        `${config.API_BASE_URL}/api/announcements/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setUser((prev) => ({ ...prev, announcements: response.data }));
    } catch (err) {
      console.error("Error fetching announcements:", err);
    }
  };

  // Add useEffect for fetching user's posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user?._id) return;

      try {
        setPostsLoading(true);
        const token = localStorage.getItem("token");

        // Fetch posts for specific user using author query parameter
        const response = await axios.get(
          `${config.API_BASE_URL}/api/posts?author=${user._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Separate announcements and regular posts
        const announcements = response.data.data.filter(
          (post) => post.isAnnouncement
        );
        const regularPosts = response.data.data.filter(
          (post) => !post.isAnnouncement
        );

        setUserAnnouncements(announcements);
        setUserPosts(regularPosts);
        setPostsLoading(false);
      } catch (err) {
        console.error("Error fetching user posts:", err);
        setPostsLoading(false);
      }
    };

    fetchUserPosts();
  }, [user?._id]);

  // Add useEffect for fetching user's activities
  const fetchUserActivities = async () => {
    try {
      setActivitiesLoading(true);
      const response = await axios.get(
        `${config.API_BASE_URL}/api/activity/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("userActivities: ", response.data);
      if (response.data.success) {
        setSystemActivities(response.data.data.systemActivities || []);
        setUserActivities(response.data.data.userActivities || []);
      }
    } catch (err) {
      console.error("Error fetching user activities:", err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchUserData();
    fetchUserActivities();
  }, [userId]);

  // Fetch additional data when tab changes
  useEffect(() => {
    if (!user) return;

    switch (activeTab) {
      case "connections":
        fetchConnections();
        break;
      case "chapters":
        // fetchChapters();
        break;
      case "investments":
        fetchInvestments();
        break;
      case "referrals":
        fetchReferrals();
        break;
      //       case 'transactions':
      //         fetchTransactions();
      //         break;
      case "announcements":
        fetchAnnouncements();
        break;
      case "posts":
        // fetchPosts();
        break;
      default:
        break;
    }
  }, [activeTab, user?._id, userId]);

  const handleWarningSubmit = async () => {
    if (!adminPassword) {
      setAuthError("Please enter your password to confirm");
      return;
    }

    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/api/users/${userId}/warn`,
        {
          reason: warningReason === "Other" ? customWarningReason : warningReason,
          password: adminPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Warning sent successfully");
        setShowWarningModal(false);
        setWarningReason("");
        setCustomWarningReason("");
        setAdminPassword("");
        setAuthError("");
        fetchUserData(); // Refresh user data
      }
    } catch (error) {
      setAuthError(
        error.response?.data?.message ||
          "Failed to send warning. Please try again."
      );
    }
  };

  const handleBanUser = async (reason, duration, password) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${config.API_BASE_URL}/api/users/${userId}/ban`,
        { reason, duration, password },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("User banned successfully");
        setShowBanModal(false);
        fetchUserData(); // Refresh user data
      }
    } catch (error) {
      console.error("Error banning user:", error);
      toast.error(error.response?.data?.message || "Failed to ban user");
    } finally {
      setLoading(false);
    }
  };

  const handleUnbanUser = async (password) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${config.API_BASE_URL}/api/users/${userId}/unban`,
        { password },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("User unbanned successfully");
        setShowUnbanModal(false);
        fetchUserData(); // Refresh user data
      }
    } catch (error) {
      console.error("Error unbanning user:", error);
      toast.error(error.response?.data?.message || "Failed to unban user");
    } finally {
      setLoading(false);
    }
  };

  const calculateReturns = (investment, userInvestment) => {
    if (!investment || !userInvestment) return 0;

    if (investment.type === "equity") {
      const equityPercentage = parseFloat(investment.returns);
      const investorShare =
        (userInvestment.amount / investment.amount) * equityPercentage;
      return (userInvestment.amount * investorShare) / 100;
    } else if (investment.type === "loan") {
      const interestRate = parseFloat(investment.returns);
      return userInvestment.amount * (1 + interestRate / 100);
    }
    return 0; // For donations
  };

  const calculateStatus = (investment) => {
    const now = new Date();
    const deadline = new Date(investment.deadline);
    const isFullyFunded =
      parseFloat(investment.currentFunding) >= parseFloat(investment.amount);
    const isPastDeadline = now > deadline;

    // console.log("Status calculation for investment:", {
    //   id: investment._id,
    //   title: investment.title,
    //   currentFunding: investment.currentFunding,
    //   amount: investment.amount,
    //   isFullyFunded,
    //   deadline: investment.deadline,
    //   isPastDeadline,
    // });

    if (isFullyFunded) {
      return "funded";
    } else if (isPastDeadline) {
      return "expired";
    } else {
      return "active";
    }
  };

  const renderTabContent = () => {
    if (!user) return null;
    // console.log("Current user data in render:", user);

    switch (activeTab) {
      case "profile":
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Name
                    </label>
                    <p className="mt-1">
                      {user.user.userName || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="mt-1">
                      {user.user.userEmail || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Phone
                    </label>
                    <p className="mt-1">
                      {user.user.mobileNumber || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Industry
                    </label>
                    <p className="mt-1">
                      {user.user.industry || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <div className="mt-1 flex gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.user.isAccountVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user.user.isAccountVerified ? "Verified" : "Pending"}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.user.isMobileVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {user.user.isMobileVerified
                          ? "Mobile Verified"
                          : "Mobile Pending"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Joined Date
                    </label>
                    <p className="mt-1">
                      {user.user.createdAt
                        ? new Date(user.user.createdAt).toLocaleDateString()
                        : "Not available"}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Profile Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Bio
                    </label>
                    <p className="mt-1">{user.user.bio || "No bio provided"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Location
                    </label>
                    <p className="mt-1">
                      {user.user.location || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Website
                    </label>
                    <p className="mt-1">
                      {user.user.website || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Address
                    </label>
                    <p className="mt-1">
                      {user.user.address ? (
                        <>
                          {user.user.address.city &&
                            `${user.user.address.city}, `}
                          {user.user.address.state &&
                            `${user.user.address.state}, `}
                          {user.user.address.country}
                          {user.user.address.zipCode &&
                            ` (${user.user.address.zipCode})`}
                        </>
                      ) : (
                        "Not provided"
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Membership
                    </label>
                    <div className="mt-1">
                      {user.user.membership ? (
                        <>
                          <p>Tier: {user.user.membership.tier}</p>
                          <p>Status: {user.user.membership.status}</p>
                          <p>
                            Expires:{" "}
                            {user.user.membership.expiryDate
                              ? new Date(
                                  user.user.membership.expiryDate
                                ).toLocaleDateString("en-US", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </p>
                        </>
                      ) : (
                        "No active membership"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "business":
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Business Information
            </h3>
            {user.business ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Business Name
                  </label>
                  <p className="mt-1">{user.business.name || "Not provided"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Description
                  </label>
                  <p className="mt-1">
                    {user.business.bio || "No description provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Location
                  </label>
                  <p className="mt-1">
                    {user.business.location || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Contact
                  </label>
                  <p className="mt-1">
                    Email: {user.business.businessEmail || "Not provided"}
                    <br />
                    Phone:{" "}
                    {user.business.businessContactNumber || "Not provided"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No business information available</p>
            )}
          </div>
        );

      case "connections":
        return (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Connections
            </h3>
            {user.connections && user.connections.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {user.connections.map((connection) => (
                  <div
                    key={connection._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-3 sm:gap-4"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      {connection.userImage ? (
                        <img
                          src={connection.userImage}
                          alt={connection.userName}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-500 text-sm">
                            {connection.userName?.charAt(0) || "?"}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          {connection.userName || "Unknown User"}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {connection.userEmail || "No email provided"}
                        </p>
                        {connection.industry && (
                          <p className="text-sm text-gray-500 truncate">
                            {connection.industry}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/admin/users/${connection._id}`)}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>View Profile</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No connections found</p>
            )}
          </div>
        );

      case "chapters":
        return (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Chapter Membership
            </h3>
            {user.user.groupJoined?.Joined ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className="font-medium text-gray-900">
                        Current Chapter
                      </h4>
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {chapters?.chapterName || "Loading chapter details..."}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                            chapters?.chapterCreator?._id === user.user._id
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {chapters?.chapterCreator?._id === user.user._id
                            ? "Chapter Creator"
                            : "Chapter Member"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        navigate(`/admin/chapters/${chapters?._id}`)
                      }
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>View Chapter</span>
                    </button>
                  </div>
                  {chapters && (
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded-lg border border-gray-100">
                        <label className="block text-sm font-medium text-gray-500">
                          Description
                        </label>
                        <p className="mt-1 text-sm text-gray-900 line-clamp-2">
                          {chapters.chapterDesc || "Not specified"}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-100">
                        <label className="block text-sm font-medium text-gray-500">
                          Technology
                        </label>
                        <p className="mt-1 text-sm text-gray-900 line-clamp-2">
                          {chapters.chapterTech || "Not specified"}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-100">
                        <label className="block text-sm font-medium text-gray-500">
                          Region
                        </label>
                        <p className="mt-1 text-sm text-gray-900 line-clamp-2">
                          {chapters.chapterRegion || "Not specified"}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-100">
                        <label className="block text-sm font-medium text-gray-500">
                          City
                        </label>
                        <p className="mt-1 text-sm text-gray-900 line-clamp-2">
                          {chapters.chapterCity || "Not specified"}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-gray-100">
                        <label className="block text-sm font-medium text-gray-500">
                          Country
                        </label>
                        <p className="mt-1">
                          {chapters.chapterCountry || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Members
                        </label>
                        <p className="mt-1">
                          {chapters.members?.length || 0} members
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">
                User is not a member of any chapter
              </p>
            )}
          </div>
        );

      case "investments":
        // console.log("Rendering investments tab. Current states:", {
        //   investments: investments.length,
        //   fundingRequests: fundingRequests.length,
        //   loading: loadingInvestments,
        //   error: investmentError,
        // });
        return (
          <div className="space-y-6">
            {loadingInvestments ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : investmentError ? (
              <div className="text-red-500 text-center">{investmentError}</div>
            ) : investments.length === 0 && fundingRequests.length === 0 ? (
              <div className="text-center text-gray-500">
                No investments found
              </div>
            ) : (
              <>
                {/* Investment Opportunities Created */}
                {fundingRequests.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Investment Opportunities Created ({fundingRequests.length}
                      )
                    </h3>
                    <div className="grid gap-4">
                      {fundingRequests.map((request) => {
                        // console.log("Rendering funding request:", request);
                        const status = calculateStatus(request);
                        const fundingProgress = (
                          (parseFloat(request.currentFunding) /
                            parseFloat(request.amount)) *
                          100
                        ).toFixed(1);
                        return (
                          <div
                            key={request._id}
                            className="bg-white p-4 rounded-lg shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">
                                  {request.title}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Amount: ${request.amount}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Current Funding: ${request.currentFunding}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Created:{" "}
                                  {new Date(
                                    request.createdAt
                                  ).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Deadline:{" "}
                                  {new Date(
                                    request.deadline
                                  ).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Type: {request.type}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Returns: {request.returns}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 rounded text-sm ${
                                  status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : status === "funded"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {status}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-gray-600">
                              {request.description}
                            </p>
                            <div className="mt-2 text-sm text-gray-600">
                              Investors: {request.investors?.length || 0}
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              Progress: {fundingProgress}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Investments Made */}
                {investments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Investments Made ({investments.length})
                    </h3>
                    <div className="grid gap-4">
                      {investments.map((investment) => {
                        // console.log("Rendering investment:", investment);
                        const userInvestment = investment.investors?.find(
                          (inv) =>
                            inv.user === user.user._id ||
                            inv.user._id === user.user._id
                        );
                        const expectedReturn = calculateReturns(
                          investment,
                          userInvestment
                        );
                        const status = calculateStatus(investment);
                        const fundingProgress = (
                          (parseFloat(investment.currentFunding) /
                            parseFloat(investment.amount)) *
                          100
                        ).toFixed(1);
                        return (
                          <div
                            key={investment._id}
                            className="bg-white p-4 rounded-lg shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">
                                  {investment.title}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Invested: ${userInvestment?.amount || 0}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Total Funding: ${investment.currentFunding} /
                                  ${investment.amount}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Date:{" "}
                                  {new Date(
                                    investment.createdAt
                                  ).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Deadline:{" "}
                                  {new Date(
                                    investment.deadline
                                  ).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Type: {investment.type}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Return Rate: {investment.returns}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 rounded text-sm ${
                                  status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : status === "funded"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {status}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-gray-600">
                              {investment.description}
                            </p>
                            <div className="mt-2 text-sm text-gray-600">
                              Expected Return: ${expectedReturn.toFixed(2)}
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              Progress: {fundingProgress}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case "referrals":
        return (
          <div className="space-y-6">
            {loadingReferrals ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : referralError ? (
              <div className="text-red-500 text-center">{referralError}</div>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Referral Statistics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Referrals</p>
                      <p className="text-2xl font-bold">
                        {referralStats?.totalReferrals || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Completed Referrals
                      </p>
                      <p className="text-2xl font-bold">
                        {referralStats?.completedReferrals || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Pending Referrals</p>
                      <p className="text-2xl font-bold">
                        {referralStats?.pendingReferrals || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Earnings</p>
                      <p className="text-2xl font-bold">
                        ${referralStats?.totalEarnings?.toFixed(2) || 0}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Referral Code</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-bold">
                        {referralStats?.referralCode || "Not available"}
                      </p>
                      {referralStats?.referralCode && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              referralStats.referralCode
                            );
                            toast.success("Referral code copied to clipboard!");
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700"
                          title="Copy to clipboard"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Referral History
                  </h3>
                  {referrals && referrals.length > 0 ? (
                    <div className="space-y-4">
                      {referrals.map((referral) => (
                        <div
                          key={referral._id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">
                              Referred:{" "}
                              {referral.referredUser?.userName || "Unknown"}
                            </p>
                            <p className="text-sm text-gray-500">
                              Date:{" "}
                              {new Date(
                                referral.createdAt
                              ).toLocaleDateString()}
                              {referral.completedAt && (
                                <span className="ml-2">
                                  Completed:{" "}
                                  {new Date(
                                    referral.completedAt
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500">
                              Reward:{" "}
                              {referral.rewardType === "percentage"
                                ? `${referral.rewardValue}%`
                                : `$${referral.rewardValue}`}
                              {referral.rewardAmount > 0 &&
                                ` ($${referral.rewardAmount})`}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              referral.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : referral.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {referral.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No referrals found</p>
                  )}
                </div>
              </>
            )}
          </div>
        );

      case "transactions":
        const transactions = user.transactions || [];

        // Calculate earnings (investments received + referral earnings)
        const totalEarnings = transactions
          .filter((t) => {
            // For investments received, check if the user is the recipient
            if (t.type === "investment" && t.amount.startsWith("+")) {
              return t.recipient?._id === userId || t.recipient === userId;
            }
            // For referrals, check if the user is the referrer
            if (t.type === "referral") {
              return t.referrer?._id === userId || t.referrer === userId;
            }
            return false;
          })
          .reduce((sum, t) => {
            const amount = parseFloat(
              t.amount.replace("$", "").replace("+", "")
            );
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0);

        // Calculate spending (investments made)
        const totalSpending = transactions
          .filter((t) => {
            // For investments made, check if the user is the investor
            if (t.type === "investment" && t.amount.startsWith("-")) {
              return t.investor?._id === userId || t.investor === userId;
            }
            return false;
          })
          .reduce((sum, t) => {
            const amount = parseFloat(
              t.amount.replace("$", "").replace("-", "")
            );
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0);

        // Calculate returns (interest/withdrawals)
        const totalReturns = transactions
          .filter((t) => {
            // For returns, check if the user is the recipient
            if (t.type === "interest") {
              return t.recipient?._id === userId || t.recipient === userId;
            }
            return false;
          })
          .reduce((sum, t) => {
            const amount = parseFloat(
              t.amount.replace("$", "").replace("+", "")
            );
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0);

        // Net amount is earnings + returns - spending
        const netAmount = totalEarnings + totalReturns - totalSpending;

        // Log transaction details for debugging
        // console.log("Transaction Details:", {
        //   userId,
        //   totalTransactions: transactions.length,
        //   earnings: {
        //     count: transactions.filter(
        //       (t) => t.type === "investment" && t.amount.startsWith("+")
        //     ).length,
        //     amount: totalEarnings,
        //   },
        //   spending: {
        //     count: transactions.filter(
        //       (t) => t.type === "investment" && t.amount.startsWith("-")
        //     ).length,
        //     amount: totalSpending,
        //   },
        //   returns: {
        //     count: transactions.filter((t) => t.type === "interest").length,
        //     amount: totalReturns,
        //   },
        //   netAmount,
        // });

        return (
          <div className="space-y-6">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Earnings */}
              <div className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Total Earnings
                  </h3>
                  <div className="p-2 bg-green-100/50 rounded-lg">
                    <FiTrendingUp className="text-2xl text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  ${(totalEarnings + totalReturns).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  From investments ({totalEarnings.toFixed(2)}) and returns (
                  {totalReturns.toFixed(2)})
                </p>
              </div>

              {/* Total Spending */}
              <div className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Total Spending
                  </h3>
                  <div className="p-2 bg-red-100/50 rounded-lg">
                    <FiTrendingDown className="text-2xl text-red-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-red-600">
                  ${totalSpending.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  On investments and other transactions
                </p>
              </div>

              {/* Net Amount */}
              <div className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Net Amount
                  </h3>
                  <div
                    className={`p-2 rounded-lg ${
                      netAmount >= 0 ? "bg-green-100/50" : "bg-red-100/50"
                    }`}
                  >
                    {netAmount >= 0 ? (
                      <FiTrendingUp className="text-2xl text-green-600" />
                    ) : (
                      <FiTrendingDown className="text-2xl text-red-600" />
                    )}
                  </div>
                </div>
                <p
                  className={`text-3xl font-bold ${
                    netAmount >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ${Math.abs(netAmount).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {netAmount >= 0 ? "Net profit" : "Net loss"}
                </p>
              </div>
            </div>

            {/* Transactions List */}
            <div className="grid grid-cols-1 gap-4">
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-4 sm:p-6 transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                      {/* Transaction Details */}
                      <div className="flex-1 w-full">
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-2">
                          <div
                            className={`p-2 rounded-lg ${
                              transaction.type === "referral"
                                ? "bg-orange-100/50 text-orange-600"
                                : transaction.amount.startsWith("+")
                                ? "bg-green-100/50 text-green-600"
                                : "bg-red-100/50 text-red-600"
                            }`}
                          >
                            {transaction.type === "referral" ? (
                              <FiUsers className="text-xl" />
                            ) : transaction.amount.startsWith("+") ? (
                              <FiArrowDown className="text-xl" />
                            ) : (
                              <FiArrowUp className="text-xl" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 truncate">
                              {transaction.partner}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {transaction.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <FiCalendar className="text-blue-600 flex-shrink-0" />
                            <span className="whitespace-nowrap">
                              {transaction.date}
                            </span>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-md text-sm ${
                              transaction.type === "investment"
                                ? "bg-purple-100/50 text-purple-700"
                                : transaction.type === "interest"
                                ? "bg-green-100/50 text-green-700"
                                : "bg-orange-100/50 text-orange-700"
                            }`}
                          >
                            {transaction.type === "investment"
                              ? "Investment"
                              : transaction.type === "interest"
                              ? "Returns"
                              : "Referral Bonus"}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-md text-sm whitespace-nowrap ${
                              transaction.status === "completed"
                                ? "bg-green-100/50 text-green-700"
                                : transaction.status === "pending"
                                ? "bg-yellow-100/50 text-yellow-700"
                                : "bg-red-100/50 text-red-700"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div
                        className={`text-xl font-semibold ${
                          transaction.amount.startsWith("+")
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.amount}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-600">
                  No transactions found
                </div>
              )}
            </div>
          </div>
        );

      case "activity":
        return (
          <div className="space-y-6">
            {/* System Activities Section */}
            <div className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">System Activities</h3>
              {activitiesLoading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : systemActivities.length > 0 ? (
                <div className="space-y-4">
                  {systemActivities.map((activity) => (
                    <div
                      key={activity._id}
                      className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {activity.activityType}
                            </span>
                          </div>
                          <p className="text-gray-800">{activity.action}</p>
                          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                            <div className="mt-2 text-sm text-gray-600">
                              {Object.entries(activity.metadata).map(([key, value]) => (
                                <p key={key}>
                                  <span className="font-medium">{key}:</span> {value}
                                </p>
                              ))}
                            </div>
                          )}
                          <div className="mt-2 text-sm text-gray-500">
                            {new Date(activity.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No system activities found</p>
              )}
            </div>

            {/* User Activities Section */}
            <div className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">User Activities</h3>
              {activitiesLoading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : userActivities.length > 0 ? (
                <div className="space-y-4">
                  {userActivities.map((activity) => (
                    <div
                      key={activity._id}
                      className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              activity.status === 'verified' ? 'bg-green-100 text-green-800' :
                              activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {activity.type}
                            </span>
                          </div>
                          <p className="text-gray-800">{activity.content}</p>
                          {activity.typeContent && (
                            <p className="mt-1 text-sm text-gray-600">{activity.typeContent}</p>
                          )}
                          {/* {activity.businessAmount && (
                            <p className="mt-1 text-sm text-gray-600">
                              Business Amount: ${activity.businessAmount}
                            </p>
                          )} */}
                          {/* {activity.visitorCount && (
                            <p className="mt-1 text-sm text-gray-600">
                              Visitors: {activity.visitorCount}
                            </p>
                          )} */}
                          {activity.relatedUser && (
                            <p className="mt-1 text-sm text-gray-600">
                              Related User: {activity.relatedUser.userName}
                            </p>
                          )}
                          <div className="mt-2 text-sm text-gray-500">
                            {new Date(activity.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No user activities found</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const UnbanModal = ({ isOpen, onClose, onUnban, userName }) => {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!password) {
        setError("Please enter your admin password");
        return;
      }
      onUnban(password);
      setPassword("");
      setError("");
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Unban User</h2>
          <p className="text-gray-600 mb-4">
            Are you sure you want to unban {userName}? They will be able to access their account immediately.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter your admin password"
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Unban User
              </button>
            </div>
          </form>
        </div>
      </div>
    );
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

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600">{error}</div>
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
            <h1 className="text-2xl font-bold text-gray-800">User Details</h1>
            <button
              onClick={() => navigate("/admin/users")}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Users</span>
            </button>
          </div>

          {/* Action Buttons Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl ml-auto">
            {user?.user?.warnings?.count >= 3 ? (
              <button
                onClick={() => setShowBanModal(true)}
                className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Ban User (Max Warnings)</span>
              </button>
            ) : (
              <button
                onClick={() => setShowWarningModal(true)}
                className="w-full px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Send Warning ({user?.user?.warnings?.count || 0}/3)</span>
              </button>
            )}
            {user?.user?.banStatus?.isBanned ? (
              <button
                onClick={() => setShowUnbanModal(true)}
                className="w-full px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Unban User</span>
              </button>
            ) : (
              <button
                onClick={() => setShowBanModal(true)}
                className="w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Ban User</span>
              </button>
            )}
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
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Send Warning
              </h3>
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

                {warningReason === "Other" && (
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
                    setWarningReason("");
                    setCustomWarningReason("");
                    setAdminPassword("");
                    setAuthError("");
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Ban User
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to ban {user?.user?.userName}? This action will:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-500 mb-4">
                <li>Immediately revoke their access to the platform</li>
                <li>Send them a notification email</li>
                <li>Require admin approval to lift the ban</li>
              </ul>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Ban Reason
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

                {warningReason === "Other" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Reason
                    </label>
                    <textarea
                      value={customWarningReason}
                      onChange={(e) => setCustomWarningReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Enter custom ban reason"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ban Duration (days)
                  </label>
                  <input
                    type="number"
                    value={banDuration}
                    onChange={(e) => setBanDuration(parseInt(e.target.value))}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

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
                    setShowBanModal(false);
                    setWarningReason("");
                    setCustomWarningReason("");
                    setAdminPassword("");
                    setAuthError("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBanUser(warningReason, banDuration ? banDuration : null, adminPassword)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Ban User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unban Modal */}
        {showUnbanModal && (
          <UnbanModal
            isOpen={showUnbanModal}
            onClose={() => setShowUnbanModal(false)}
            onUnban={handleUnbanUser}
            userName={user?.user?.userName}
          />
        )}

        {/* Ban/Unban Activities Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Account Status History</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {user?.user?.banStatus?.banHistory?.length > 0 ? (
                  user.user.banStatus.banHistory.map((ban, index) => (
                    <div key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Ban #{index + 1}
                          </span>
                          <p className="mt-1 text-sm text-gray-600">
                            Reason: {ban.reason}
                            {ban.endDate && (
                              <span className="ml-2">
                                (Duration: {Math.ceil((new Date(ban.endDate) - new Date(ban.startDate)) / (1000 * 60 * 60 * 24))} days)
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            Banned by: {ban.adminId?.userName || 'Admin'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Banned on: {new Date(ban.startDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {ban.unbannedAt && (
                            <>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                                {ban.unbannedBy ? 'Unbanned by Admin' : 'Automatically Unbanned'}
                              </span>
                              {ban.unbannedBy && (
                                <p className="text-sm text-gray-500">
                                  Unbanned by: {ban.unbannedBy?.userName || 'Admin'}
                                </p>
                              )}
                              <p className="text-sm text-gray-500">
                                Unbanned on: {new Date(ban.unbannedAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </p>
                              {ban.unbannedReason && (
                                <p className="text-sm text-gray-500">
                                  Unban reason: {ban.unbannedReason}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ban.endDate && !ban.unbannedAt && (
                            <span className="text-yellow-600">
                              Expires: {new Date(ban.endDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No ban history found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserDetails;
