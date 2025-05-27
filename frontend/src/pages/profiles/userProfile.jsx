import { useState, useEffect } from "react";
import {
  FiUser,
  FiBriefcase,
  FiDollarSign,
  FiPlus,
  FiMail,
  FiMapPin,
  FiGlobe,
  FiClock,
  FiInfo,
  FiDownload,
  FiUpload,
  FiTrendingUp,
  FiLink,
  FiEdit,
  FiMinus,
  FiTrello,
  FiUserCheck,
  FiAlertCircle,
  FiCheck,
  FiGift,
  FiCheckCircle
} from "react-icons/fi";
import Navbar from "../../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import WithdrawalForm from "../../components/WithdrawalForm";

const birthdayStyles = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
    100% { transform: translateY(0px); }
  }
  @keyframes sparkle {
    0% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
    100% { opacity: 0.4; transform: scale(1); }
  }
  @keyframes glow {
    0% { box-shadow: 0 0 5px rgba(236, 72, 153, 0.2); }
    50% { box-shadow: 0 0 15px rgba(236, 72, 153, 0.4); }
    100% { box-shadow: 0 0 5px rgba(236, 72, 153, 0.2); }
  }
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [connectionsTab, setConnectionsTab] = useState("connections");
  const [investmentsTab, setInvestmentsTab] = useState("funding");

  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [chapter, setChapter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreator, setCreator] = useState(false);
  const [usersChapter, setUsersChapter] = useState(null);

  const [requests, setRequests] = useState([]);

  const [myConnections, setMyConnections] = useState([]);

  const [fundingRequests, setFundingRequests] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loadingInvestments, setLoadingInvestments] = useState(false);
  const [errorInvestments, setErrorInvestments] = useState("");

  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);

  const calculateDaysUntilBirthday = (birthday) => {
    if (!birthday) return null;

    const today = new Date();
    const birthDate = new Date(birthday);
    const nextBirthday = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );

    // If birthday has passed this year, calculate for next year
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = nextBirthday - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isBirthdayToday = (birthday) => {
    if (!birthday) return false;
    const today = new Date();
    const birthDate = new Date(birthday);
    return (
      today.getDate() === birthDate.getDate() &&
      today.getMonth() === birthDate.getMonth()
    );
  };

  useEffect(() => {
    const fetchInvestmentData = async () => {
      try {
        setLoadingInvestments(true);
        const token = localStorage.getItem("token");

        if (user.isSeeker) {
          // Fetch seeker's funding requests
          const fundingRes = await axios.get(
            "http://localhost:5000/api/investments/my-requests",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setFundingRequests(fundingRes.data);
          console.log("fundingRequests: ", fundingRes.data);
        } else {
          // Fetch investor's investments
          const investmentsRes = await axios.get(
            "http://localhost:5000/api/investments/my-investments",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setInvestments(investmentsRes.data);
          console.log("investments: ", investmentsRes.data);

          // Fetch withdrawals
          const withdrawalsRes = await axios.get(
            "http://localhost:5000/api/investments/withdrawals",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setWithdrawals(withdrawalsRes.data);
          console.log("withdrawals: ", withdrawalsRes.data);
        }

        // Fetch open requests for seekers to see their own, investors to see all open
        const requestsRes = await axios.get(
          "http://localhost:5000/api/investments",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFundingRequests(requestsRes.data);
        console.log("requests: ", requestsRes.data);
      } catch (err) {
        setErrorInvestments(
          err.response?.data?.msg || "Error loading investment data"
        );
      } finally {
        setLoadingInvestments(false);
      }
    };

    if (user) fetchInvestmentData();
  }, [user]);

  const handleInvest = async (investmentId) => {
    try {
      const token = localStorage.getItem("token");
      const amount = prompt("Enter investment amount:");

      if (!amount || isNaN(amount)) return;

      await axios.post(
        `http://localhost:5000/api/investments/${investmentId}/invest`,
        { amount: Number(amount) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresh data
      const res = await axios.get("http://localhost:5000/api/investments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFundingRequests(res.data);

      const result = await axios.get(
        "http://localhost:5000/api/investments/my-investments",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInvestments(result.data);
    } catch (err) {
      console.error("Investment failed:", err);
      alert(err.response?.data?.msg || "Investment failed. Please try again.");
    }
  };

  const handleWithdrawal = async (investmentId) => {
    const investment = investments.find((inv) => inv._id === investmentId);
    setSelectedInvestment(investment);
    setShowWithdrawalForm(true);
  };

  const handleWithdrawSubmit = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      console.log(
        "Submitting withdrawal for investment:",
        selectedInvestment._id
      );

      const response = await axios.post(
        `http://localhost:5000/api/investments/${selectedInvestment._id}/withdraw`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.msg === "Withdrawal request submitted successfully") {
        // Refresh investments
        const investmentsRes = await axios.get(
          "http://localhost:5000/api/investments/my-investments",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setInvestments(investmentsRes.data);

        // Refresh withdrawals
        const withdrawalsRes = await axios.get(
          "http://localhost:5000/api/investments/withdrawals",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setWithdrawals(withdrawalsRes.data);

        setShowWithdrawalForm(false);
        setSelectedInvestment(null);
        alert("Withdrawal request submitted successfully!");
      } else {
        throw new Error(response.data.msg || "Withdrawal failed");
      }
    } catch (err) {
      console.error("Withdrawal failed:", err);
      alert(err.response?.data?.msg || "Withdrawal failed. Please try again.");
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem("token"); // Or however you store it

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axios.get(
        "http://localhost:5000/api/connections/requests",
        config
      );
      setRequests(res.data);
      console.log("requests: ", res.data);
    };
    fetchRequests();
  }, []);

  const handleAccept = async (id) => {
    const token = localStorage.getItem("token");
    await axios.put(
      `http://localhost:5000/api/connections/requests/${id}/accept`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setRequests(requests.filter((req) => req._id !== id));

    const response = await axios.get(
      "http://localhost:5000/api/users/profile",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setMyConnections(response.data.user.userConnections);
  };

  const handleReject = async (id) => {
    const token = localStorage.getItem("token");

    const response = await axios.put(
      `http://localhost:5000/api/connections/requests/${id}/reject`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("response", response.data);
    setRequests(requests.filter((req) => req._id !== id));
  };

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("🔑 Token found:", token);

        if (!token) throw new Error("User not authenticated");

        const response = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const chapterData = await axios.get(
          "http://localhost:5000/api/chapters",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("✅ API Response:", response.data);
        console.log("chapter API response: ", chapterData.data);

        // Set user and business data
        if (response.data) {
          setUser(response.data.user || {});
          setBusiness(response.data.business || {});
          setUsersChapter(response.data.hasJoinedChapter || null);
          setMyConnections(response.data.user.userConnections || []);
        }

        // Handle chapter data safely
        if (chapterData.data && chapterData.data.length > 0) {
          const chapter = chapterData.data[0];
          setChapter(chapter._id);

          // Check if user is creator
          if (
            chapter.chapterCreator &&
            chapter.chapterCreator._id === localStorage.getItem("userId")
          ) {
            setCreator(true);
          }
        } else {
          setChapter(null);
          setCreator(false);
        }
      } catch (error) {
        console.error(
          "❌ Error fetching profile:",
          error.response ? error.response.data : error.message
        );
        setError("Failed to load profile data. Navigating to login page");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!user || Object.keys(user).length === 0)
    return <p>No user data available.</p>;

  // Mock data
  const userData = {
    website: "https://potfolio.aryanlathigara.com",
    business: {
      established: "2025",
    },
  };


  const handleRemoveBusiness = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        "http://localhost:5000/api/users/business/remove",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        // Refresh the page to show updated data
        window.location.reload();
      }
    } catch (error) {
      console.error("Error removing business:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleWithdrawalrequests = () => {
    navigate("/withdrawal-requests");
  };

  const goToChapterCreation = () => {
    navigate("/chapterCreation");
  };

  const goToReferrals = () => {
    navigate("/referrals");
  };

  const goToTransactions = () => {
    navigate("/myTransactions");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] px-3 lg:p-8">
        <div className="max-w-7xl mx-auto bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30">
          {/* Main Tabs */}
          <div className="border-b border-white/20">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-4 px-1 border-b-2 font-semibold flex items-center gap-2 ${
                  activeTab === "profile"
                    ? "text-blue-600 border-blue-500"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                <FiUser className="text-lg" /> Profile
              </button>
              <button
                onClick={() => setActiveTab("investments")}
                className={`py-4 px-1 border-b-2 font-semibold flex items-center gap-2 ${
                  activeTab === "investments"
                    ? "text-blue-600 border-blue-500"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                <FiBriefcase className="text-lg" /> Investments
              </button>
            </nav>
          </div>

          {/* Profile Tab Content */}
          {activeTab === "profile" && (
            <>
              {/* Profile Header */}
              <div className="p-2 lg:p-8 border-b border-white/20">
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <img
                    src="https://img.freepik.com/free-vector/illustration-businessman_53876-5856.jpg?t=st=1742290205~exp=1742293805~hmac=51b36f46407e7bc32432f058e678995e49adba7ebb40a956ab64e55236f02415&w=740"
                    className="w-[8rem] h-[8rem] rounded-xl border-4 border-white/50 shadow-lg"
                    alt="Profile"
                  />
                  <div className=" flex flex-col md:flex-row items-start md:items-center justify-between flex-1 w-full gap-8">
                    <div className="block">
                      <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {user.name}
                      </h1>
                      <p className="text-gray-600 flex items-center gap-2 mb-4">
                        <FiMail className="text-blue-500" /> {user.email}
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <div className="bg-blue-100/50 px-4 py-2 rounded-lg flex items-center gap-2">
                          <FiBriefcase className="text-blue-600" />{" "}
                          {user.industry}
                        </div>
                        <div className="bg-purple-100/50 px-4 py-2 rounded-lg flex items-center gap-2">
                          <FiMapPin className="text-purple-600" />{" "}
                          {user.location}
                        </div>
                        <div className="bg-green-100/50 px-4 py-2 rounded-lg flex items-center gap-2">
                          <FiGlobe className="text-green-600" />{" "}
                          {userData.website}
                        </div>
                        <div className="relative group">
                          <div className="bg-blue-100/50 px-4 py-2 rounded-lg flex items-center gap-2">
                            {user.isMobileVerified === false ? (
                              <FiInfo className="text-orange-600" />
                            ) : (
                              <FiCheckCircle className="text-blue-600" />
                            )}{" "}
                            {user.mobileNumber}
                            {user.isMobileVerified === false ? (
                              <div
                                onClick={() => navigate("/verify-mobile")}
                                className="cursor-pointer ml-2 bg-red-100/50 px-2 py-1 rounded text-xs text-red-600 flex items-center gap-1"
                              >
                                <FiAlertCircle className="text-red-600" />
                                Unverified
                              </div>
                            ) : (
                              <div className="ml-2 bg-green-100/50 px-2 py-1 rounded text-xs text-green-600 flex items-center gap-1">
                                <FiCheck className="text-green-600" />
                                Verified
                              </div>
                            )}
                          </div>
                          {user.isMobileVerified === false && (
                            <div className="absolute bottom-full left-0 mb-2 w-48 bg-white text-gray-800 text-xs rounded-lg p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              Click to verify your mobile number
                            </div>
                          )}
                        </div>
                        <div className="relative group">
                          <style>{birthdayStyles}</style>
                          <div
                            className={`bg-purple-100/50 px-4 py-2 rounded-lg flex items-center gap-2 
                            ${
                              isBirthdayToday(user.birthday)
                                ? "border-2 border-pink-300 animate-[glow_2s_ease-in-out_infinite]"
                                : ""
                            }`}
                          >
                            <div className="relative">
                              <FiGift
                                className={`text-purple-600 ${
                                  isBirthdayToday(user.birthday)
                                    ? "animate-[float_3s_ease-in-out_infinite]"
                                    : ""
                                }`}
                              />
                              {isBirthdayToday(user.birthday) && (
                                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-pink-400 rounded-full animate-[sparkle_2s_ease-in-out_infinite]" />
                              )}
                            </div>
                            {user.birthday
                              ? new Date(user.birthday).toLocaleDateString()
                              : "Not set"}
                            {isBirthdayToday(user.birthday) && (
                              <>
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-400 rounded-full animate-[sparkle_3s_ease-in-out_infinite]" />
                                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full animate-[sparkle_2s_ease-in-out_infinite] delay-100" />
                                <div className="absolute -top-1 left-1/2 w-1.5 h-1.5 bg-pink-400 rounded-full animate-[sparkle_2.5s_ease-in-out_infinite] delay-150" />
                                <div className="absolute -bottom-1 right-1/2 w-1.5 h-1.5 bg-pink-400 rounded-full animate-[sparkle_3.5s_ease-in-out_infinite] delay-200" />
                              </>
                            )}
                          </div>
                          {user.birthday && (
                            <div className="absolute bottom-full left-0 mb-2 w-48 bg-white text-gray-800 text-xs rounded-lg p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              {isBirthdayToday(user.birthday) ? (
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2 text-pink-600">
                                    <FiGift className="text-pink-600" />
                                    <span>Happy Birthday! 🎉</span>
                                  </div>
                                  <div className="text-xs text-gray-500 italic">
                                    Wishing you a day filled with happiness and
                                    joy!
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <FiClock className="text-green-600" />
                                  <span>
                                    {calculateDaysUntilBirthday(user.birthday)}{" "}
                                    days until birthday
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 bg-gradient-to-r from-blue-50/30 to-purple-50/30 p-6 rounded-xl border border-white/20">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-600">
                        <FiLink className="w-6 h-6 p-1.5 bg-blue-100 rounded-lg text-blue-600" />
                        Other Links
                      </h3>
                      <div className="text-gray-600 leading-relaxed pl-4 lg:pl-8 border-l-4 border-blue-100">
                        <div className="flex flex-wrap gap-4">
                          {isCreator || usersChapter !== null ? (
                            <Link
                              to={`/chapterDashboard/${chapter}`}
                              className="bg-blue-100/50 px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer lg:w-max w-full"
                            >
                              <FiGlobe className="text-blue-600" /> My Chapter
                            </Link>
                          ) : (
                            <div
                              onClick={goToChapterCreation}
                              className="bg-blue-100/50 px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
                            >
                              <FiPlus className="text-blue-600" /> Create
                              Chapter
                            </div>
                          )}

                          <div
                            onClick={() => navigate("/edit-profile")}
                            className="bg-green-100/50 px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer lg:w-max w-full"
                          >
                            <FiEdit className="text-green-600" /> Edit Profile
                            And Business
                          </div>
                          <div
                            onClick={handleRemoveBusiness}
                            className="bg-purple-100/50 px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer lg:w-max w-full"
                          >
                            <FiMinus className="text-purple-600" /> Remove My
                            Business
                          </div>
                          {/*  */}
                          <div
                            onClick={goToReferrals}
                            className="bg-blue-100/50 px-4 py-2 rounded-lg flex items-center gap-2  cursor-pointer lg:w-max w-full"
                          >
                            <FiUserCheck className="text-blue-600" /> Referrals
                          </div>
                          <div
                            onClick={goToTransactions}
                            className="bg-green-100/50 px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer lg:w-max w-full"
                          >
                            <FiDollarSign className="text-green-600" /> My
                            Transactions
                          </div>
                          {user.isSeeker && (
                            <div
                              onClick={handleWithdrawalrequests}
                              className="bg-purple-100/50 px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer lg:w-max w-full"
                            >
                              <FiTrello className="text-green-600" /> Withdrawal
                              Requests
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 bg-gradient-to-r from-blue-50/30 to-purple-50/30 p-6 rounded-xl border border-white/20">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-600">
                    <FiInfo className="w-6 h-6 p-1.5 bg-blue-100 rounded-lg text-blue-600" />
                    About Me
                  </h3>
                  <p className="text-gray-600 leading-relaxed pl-4 lg:pl-8 border-l-4 border-blue-100">
                    {user.bio}
                  </p>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-2 lg:p-8">
                {/* Business Information Section */}

                {business && Object.keys(business).length > 0 ? (
                  <div className="bg-white/30 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-blue-600">
                      <FiBriefcase /> {business.name}
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100/50 p-3 rounded-lg">
                          <FiClock className="text-blue-600 text-xl" />
                        </div>
                        <div>
                          <p className="font-medium">Established</p>
                          <p className="text-gray-600">
                            {userData.business.established}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100/50 p-3 rounded-lg">
                          <FiMapPin className="text-purple-600 text-xl" />
                        </div>
                        <div>
                          <p className="font-medium">Business Address</p>
                          <p className="text-gray-600">{business.location}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-green-100/50 p-3 rounded-lg">
                          <FiMail className="text-green-600 text-xl" />
                        </div>
                        <div>
                          <p className="font-medium">Business Contact</p>
                          <p className="text-gray-600">
                            {business.businessEmail}
                          </p>
                          <p className="text-gray-600">
                            {business.businessContactNumber}
                          </p>
                        </div>
                      </div>

                      <p className="mt-4 text-gray-600 leading-relaxed">
                        {business.bio}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-gray-600 leading-relaxed">
                    No business details available
                    <button
                      onClick={() => navigate("/add-business-info")}
                      className="bg-blue-100/50 my-4 px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer w-max"
                    >
                      <FiPlus className="text-blue-600" /> Add Business
                      Information
                    </button>
                  </p>
                )}

                {/* Connections Section */}
                <div className="bg-white/30 backdrop-blur-sm rounded-xl border lg:p-6 border-white/20">
                  <div className="mb-6">
                    <nav className="flex flex-start gap-2 mt-2">
                      <button
                        onClick={() => setConnectionsTab("connections")}
                        className={`px-4 py-2 rounded-lg ${
                          connectionsTab === "connections"
                            ? "bg-blue-100/50 text-blue-600"
                            : "hover:bg-white/20"
                        }`}
                      >
                        Connections ({myConnections.length})
                      </button>
                      <button
                        onClick={() => setConnectionsTab("requests")}
                        className={`px-4 py-2 rounded-lg ${
                          connectionsTab === "requests"
                            ? "bg-blue-100/50 text-blue-600"
                            : "hover:bg-white/20"
                        }`}
                      >
                        Requests
                      </button>
                    </nav>
                  </div>

                  {connectionsTab === "connections" ? (
                    <div className="space-y-4 mx-2 lg:mx-0">
                      {myConnections?.map((connection) => (
                        <div
                          key={connection._id}
                          className="flex items-center justify-between p-4 bg-white/30 backdrop-blur-sm rounded-lg border border-white/20"
                        >
                          <div>
                            <h3 className="font-semibold">
                              {connection.userName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {connection.userEmail}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              navigate(`/userProfile/${connection._id}`);
                            }}
                            className="px-4 py-2 bg-blue-100/50 text-blue-600 rounded-lg hover:bg-blue-200/30 transition-colors"
                          >
                            View Profile
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-orange-50/30 p-4 mx-3 rounded-xl border border-orange-200/30">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <FiDownload className="text-orange-600" />
                          Received Requests (
                          {
                            requests.filter(
                              (req) => req.receiver._id === user.id
                            ).length
                          }
                          )
                        </h3>
                        <div className="space-y-3">
                          {requests
                            .filter((req) => req.receiver._id === user.id)
                            .map((request) => (
                              <div
                                key={request._id}
                                className="flex items-center justify-between p-3 bg-white/30 rounded-lg border border-white/20"
                              >
                                <div>
                                  <p className="font-medium">
                                    {request.sender?.userName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {request.sender?.userEmail}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAccept(request._id)}
                                    className="px-3 py-1.5 bg-green-100/50 text-green-600 rounded-lg"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleReject(request._id)}
                                    className="px-3 py-1.5 bg-red-100/50 text-red-600 rounded-lg"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="bg-purple-50/30 mx-3 p-4 rounded-xl border border-purple-200/30">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <FiUpload className="text-purple-600" />
                          Sent Requests (
                          {
                            requests.filter((req) => req.sender._id === user.id)
                              .length
                          }
                          )
                        </h3>
                        <div className="space-y-3">
                          {requests
                            .filter((req) => req.sender._id === user.id)
                            .map((request) => (
                              <div
                                key={request._id}
                                className="flex items-center justify-between p-3 bg-white/30 rounded-lg border border-white/20"
                              >
                                <div>
                                  <p className="font-medium">
                                    {request.receiver.userName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {request.receiver.userEmail}
                                  </p>
                                </div>
                                <span
                                  className={`px-3 py-1.5 rounded-lg ${
                                    request.status === "pending"
                                      ? "bg-yellow-100/50 text-yellow-700"
                                      : "bg-red-100/50 text-red-700"
                                  }`}
                                >
                                  {request.status}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Investments Tab Content */}
          {activeTab === "investments" && (
            <div className="p-2 lg:p-8">
              <div className="bg-white/30 backdrop-blur-sm rounded-xl border border-white/20 mb-8">
                <nav className="flex space-x-8 p-2 lg:p-4 border-b border-white/20">
                  <button
                    onClick={() => setInvestmentsTab("funding")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      investmentsTab === "funding"
                        ? "bg-blue-100/50 text-blue-600"
                        : "hover:bg-white/20"
                    }`}
                  >
                    <FiDollarSign className="text-blue-600" /> Funding Requests
                  </button>
                  <button
                    onClick={() => setInvestmentsTab("investments")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      investmentsTab === "investments"
                        ? "bg-blue-100/50 text-blue-600"
                        : "hover:bg-white/20"
                    }`}
                  >
                    <FiTrendingUp className="text-blue-600" /> My Investments
                  </button>
                </nav>

                {/* Funding Requests */}
                {investmentsTab === "funding" ? (
                  <div className="p-4 space-y-6">
                    {user.isSeeker && (
                      <button
                        onClick={() => navigate("/create-investment")}
                        className="mb-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
                      >
                        <FiPlus className="text-lg" /> New Funding Request
                      </button>
                    )}

                    {loadingInvestments ? (
                      <div className="text-center py-8">Loading...</div>
                    ) : errorInvestments ? (
                      <div className="text-red-500 p-4">{errorInvestments}</div>
                    ) : fundingRequests.length > 0 ? (
                      fundingRequests.map((request) => {
                        const isDeadlinePassed =
                          new Date(request.deadline) < new Date();
                        const isFullyFunded =
                          request.currentFunding >= request.amount;
                        const canInvest = !isDeadlinePassed && !isFullyFunded;
                        console.log("request: ", request);
                        return (
                          <div
                            key={request._id}
                            className="bg-white/30 backdrop-blur-sm p-4 rounded-lg border border-white/20 hover:bg-white/50 transition-all"
                          >
                            <div className="lg:flex lg:justify-between items-center">
                              <div>
                                <h4 className="text-lg font-semibold text-gray-800">
                                  {request.title}
                                  <br />
                                </h4>
                                <span className="text-sm text-gray-600 font-normal border-l-2 border-gray-400 pl-2">
                                  {request.description}
                                </span>
                                <div className="mt-2 flex items-center gap-4 text-gray-600">
                                  <span className="bg-blue-100/50 px-3 py-1 rounded-lg text-sm text-blue-700">
                                    {request.type}
                                  </span>
                                  <span
                                    className={`flex items-center gap-1 ${
                                      isDeadlinePassed
                                        ? "text-red-600"
                                        : "text-blue-600"
                                    }`}
                                  >
                                    <FiClock
                                      className={
                                        isDeadlinePassed
                                          ? "text-red-600"
                                          : "text-blue-600"
                                      }
                                    />
                                    {isDeadlinePassed
                                      ? "Deadline Passed"
                                      : new Date(
                                          request.deadline
                                        ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div className="lg:text-right p-2 lg:p-0">
                                <p className="text-2xl font-bold text-blue-600">
                                  ${request.currentFunding}/${request.amount}
                                </p>
                                <div className="mt-2 flex justify-end items-center gap-3 text-sm text-gray-600">
                                  <span className="flex items-center gap-1 d-block text-nowrap">
                                    <FiTrendingUp className="text-blue-600" />
                                    {request.returns}
                                  </span>
                                  {!user.isSeeker && (
                                    <button
                                      onClick={() => handleInvest(request._id)}
                                      disabled={!canInvest}
                                      className={`px-4 py-2 rounded-lg ${
                                        canInvest
                                          ? "bg-green-500 text-white hover:bg-green-600"
                                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                      }`}
                                    >
                                      {isDeadlinePassed
                                        ? "Deadline Passed"
                                        : isFullyFunded
                                        ? "Fully Funded"
                                        : "Invest"}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  isFullyFunded ? "bg-green-600" : "bg-blue-600"
                                }`}
                                style={{
                                  width: `${
                                    (request.currentFunding / request.amount) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-500">
                        No funding requests available.
                      </p>
                    )}
                  </div>
                ) : (
                  // My Investments Tab
                  <div className="p-4 space-y-6">
                    {loadingInvestments ? (
                      <div className="text-center py-8">Loading...</div>
                    ) : errorInvestments ? (
                      <div className="text-red-500 p-4">{errorInvestments}</div>
                    ) : investments.length > 0 ? (
                      investments.map((investment) => {
                        // Find any withdrawals for this investment
                        const investmentWithdrawals = withdrawals.filter(
                          (w) =>
                            w.investment && w.investment._id === investment._id
                        );

                        // Check if there's a pending or processing withdrawal
                        const hasActiveWithdrawal = investmentWithdrawals.some(
                          (w) =>
                            w.status === "pending" || w.status === "processing"
                        );

                        // Check if there's a completed withdrawal
                        const hasCompletedWithdrawal =
                          investmentWithdrawals.some(
                            (w) => w.status === "completed"
                          );

                        // Check if deadline has passed
                        const isDeadlinePassed = investment.deadline
                          ? new Date(investment.deadline) < new Date()
                          : false;

                        return (
                          <div
                            key={investment._id}
                            className="bg-white/30 backdrop-blur-sm p-4 rounded-lg border border-white/20 hover:bg-white/50 transition-all"
                          >
                            <div className="lg:flex lg:justify-between items-center">
                              <div>
                                <h4 className="text-lg font-semibold text-gray-800">
                                  {investment.title}
                                </h4>
                                <div className="mt-2 flex items-center gap-4 text-gray-600">
                                  <span className="bg-purple-100/50 px-3 py-1 rounded-lg text-sm text-purple-700">
                                    {investment.type}
                                  </span>
                                  <span className="flex items-center gap-1 text-gray-600">
                                    <FiDollarSign className="text-purple-600" />
                                    Your Investment: $
                                    {investment.investors.find(
                                      (inv) =>
                                        inv.user ===
                                        localStorage.getItem("userId")
                                    )?.amount || 0}
                                  </span>
                                  <span className="flex items-center gap-1 text-gray-600">
                                    <FiClock className="text-purple-600" />
                                    Deadline:{" "}
                                    {new Date(
                                      investment.deadline
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-3 lg:mt-0 lg:text-right">
                                <p className="text-xl font-bold text-blue-600">
                                  Returns: ${investment.returns.toFixed(2)}
                                </p>
                                <div className="mt-3 flex justify-end items-center gap-2">
                                  <span
                                    className={`px-2 py-1 text-sm rounded-lg ${
                                      investment.status === "Active"
                                        ? "bg-blue-100/50 text-blue-700"
                                        : "bg-red-100/50 text-red-700"
                                    }`}
                                  >
                                    {investment.status}
                                  </span>
                                  {hasActiveWithdrawal && (
                                    <span className="px-2 py-1 text-sm rounded-lg bg-yellow-100/50 text-yellow-700">
                                      Withdrawal in Progress
                                    </span>
                                  )}
                                  {hasCompletedWithdrawal && (
                                    <span className="px-2 py-1 text-sm rounded-lg bg-green-100/50 text-green-700">
                                      Withdrawn
                                    </span>
                                  )}
                                  {isDeadlinePassed && (
                                    <button
                                      className={`px-4 py-1.5 rounded-lg transition-shadow ${
                                        hasActiveWithdrawal ||
                                        hasCompletedWithdrawal
                                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                          : "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg"
                                      }`}
                                      onClick={() =>
                                        handleWithdrawal(investment._id)
                                      }
                                      disabled={
                                        hasActiveWithdrawal ||
                                        hasCompletedWithdrawal
                                      }
                                    >
                                      {hasActiveWithdrawal
                                        ? "Withdrawal in Progress"
                                        : hasCompletedWithdrawal
                                        ? "Already Withdrawn"
                                        : "Withdraw"}
                                    </button>
                                  )}
                                  {!isDeadlinePassed && (
                                    <span className="px-2 py-1 text-sm rounded-lg bg-yellow-100/50 text-yellow-700">
                                      Wait for Deadline
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-500">No investments found.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showWithdrawalForm && selectedInvestment && (
        <WithdrawalForm
          investment={selectedInvestment}
          onClose={() => {
            setShowWithdrawalForm(false);
            setSelectedInvestment(null);
          }}
          onWithdraw={handleWithdrawSubmit}
        />
      )}
    </>
  );
};


export default UserProfile;
