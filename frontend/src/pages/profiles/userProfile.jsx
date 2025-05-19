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
  // FiEdit,
  FiMinus,
  FiUserMinus,
  FiUserCheck,
} from "react-icons/fi";
import Navbar from "../../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

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

        console.log("chapter API response: ", chapterData.data[0]);
        setChapter(chapterData.data[0]._id);
        console.log("chapter ID: ", typeof chapterData.data[0]._id);
        console.log("chapter members: ", chapterData.data[0].members);

        if (
          chapterData.data[0].chapterCreator._id ===
          localStorage.getItem("userId")
        ) {
          setCreator(true);
        }

        console.log("isCreator: ", isCreator);

        if (response.data) {
          setUser(response.data.user || {}); // Ensure no null values
          setBusiness(response.data.business || {}); // Handle missing business
          setUsersChapter(response.data.hasJoinedChapter || {});
          setMyConnections(response.data.user.userConnections);
          console.log("MyConnections", response.data.user.userConnections);
          if (response.data.hasJoinedChapter !== null) {
            setChapter(response.data.hasJoinedChapter._id);
          }
        }
      } catch (error) {
        console.error(
          "❌ Error fetching profile:",
          error.response ? error.response.data : error.message
        );
        setError("Failed to load profile data. navigating to login page");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, isCreator]);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!user || Object.keys(user).length === 0)
    return <p>No user data available.</p>;

  // Mock data
  const userData = {
    // name: "John Doe",
    // email: "johndoe@example.com",
    // bio: "Entrepreneur and tech enthusiast with a passion for building scalable SaaS solutions. Focused on AI-driven innovations.",
    // industry: "Technology",
    // address: "123 Main St, New York, USA",
    // contact: "+1 234 567 890",
    website: "https://johndoe.com",
    business: {
      //   name: "Tech Corp Inc.",
      //   industry: "Software Development",
      //   email: "contact@techcorp.com",
      //   phone: "+1 234 567 890",
      //   address: "Silicon Valley, CA",
      //   description:
      //     "Innovative tech solutions provider specializing in AI, cloud computing, and enterprise software.",
      established: "2025",
    },
    connections: [
      { id: 1, name: "Jane Smith", role: "CEO at InnovateX" },
      { id: 2, name: "Mike Johnson", role: "CTO at NextGen" },
    ],
    requests: {
      received: [{ id: 1, name: "Alex Brown", role: "Founder at Startify" }],
      sent: [
        {
          id: 1,
          name: "Emily Davis",
          role: "Investor at VentureFund",
          status: "pending",
        },
      ],
    },
    fundingRequests: [
      {
        id: 1,
        title: "Tech Expansion",
        amount: "$50,000",
        investor: "Tech Ventures",
        type: "Equity",
        returns: "15%",
        dueDate: "2024-12-31",
      },
      {
        id: 2,
        title: "Equity sharing",
        amount: "$50,000",
        investor: "Tech Ventures",
        type: "Equity",
        returns: "15%",
        dueDate: "2024-12-31",
      },
      {
        id: 3,
        title: "shares locking",
        amount: "$50,000",
        investor: "Tech Ventures",
        type: "Equity",
        returns: "15%",
        dueDate: "2024-12-31",
      },
      {
        id: 4,
        title: "just for fun.",
        amount: "$50,000",
        investor: "Tech Ventures",
        type: "Equity",
        returns: "15%",
        dueDate: "2024-12-31",
      },
    ],
    investments: [
      {
        id: 1,
        title: "Green Energy",
        amount: "$25,000",
        type: "Equity",
        interest: "$1,250",
        status: "Active",
      },
      {
        id: 2,
        title: "Solar Energy",
        amount: "$25,000",
        type: "Equity",
        interest: "$1,250",
        status: "Active",
      },
      {
        id: 3,
        title: "Thermal Energy",
        amount: "$25,000",
        type: "Equity",
        interest: "$1,250",
        status: "Active",
      },
    ],
  };

  const handleRemoveProfile = async () => {
    alert("Profile is Removed.");
    navigate("/register");
  };

  const handleRemoveBusiness = async () => {
    alert("Business Desc. is Removed.");
  };

  // const goToChapterDashboard = (chapterId) => {
  //   navigate(`/chapterDashboard/${chapterId}`); // Navigating to the route
  // };

  const goToChapterCreation = () => {
    navigate("/chapterCreation"); // Navigating to the route
  };

  const goToReferrals = () => {
    navigate("/referrals"); // Navigating to the route
  };

  const goToTransactions = () => {
    navigate("/myTransactions"); // Navigating to the route
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
                        <div className="bg-orange-100/50 px-4 py-2 rounded-lg flex items-center gap-2">
                          <FiInfo className="text-orange-600" />{" "}
                          {user.mobileNumber}
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
                            <>
                              <Link
                                to={`/chapterDashboard/${chapter}`}
                                className="bg-blue-100/50 px-4 py-2 rounded-lg flex items-center gap-2  cursor-pointer lg:w-max w-full"
                              >
                                <FiGlobe className="text-blue-600" /> My Chapter
                                Dashboard
                              </Link>
                            </>
                          ) : (
                            <>
                              <div
                                onClick={goToChapterCreation}
                                className="bg-blue-100/50 px-4 py-2 rounded-lg flex items-center gap-2  cursor-pointer"
                              >
                                <FiPlus className="text-blue-600" /> Create
                                Chapter
                              </div>
                            </>
                          )}

                          {/* <div
                            onClick={goToChapterDashboard}
                            className="bg-blue-100/50 px-4 py-2 rounded-lg flex items-center gap-2  cursor-pointer lg:w-max w-full"
                          >
                            <FiGlobe className="text-blue-600" /> My Chapter
                            Dashboard
                          </div> */}

                          {/* <div
                            onClick={goToChapterCreation}
                            className="bg-blue-100/50 px-4 py-2 rounded-lg flex items-center gap-2  cursor-pointer"
                          >
                            <FiPlus className="text-blue-600" /> Create Chapter
                          </div> */}
                          {/* <div className="bg-green-100/50 px-4 py-2 rounded-lg flex items-center gap-2  cursor-pointer lg:w-max w-full">
                            <FiEdit className="text-green-600" /> Edit Profile
                            And Business
                          </div> */}
                          <div
                            onClick={handleRemoveBusiness}
                            className="bg-purple-100/50 px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer lg:w-max w-full"
                          >
                            <FiMinus className="text-purple-600" /> Remove My
                            Business
                          </div>
                          {/*  */}

                          <div
                            onClick={handleRemoveProfile}
                            className="bg-green-100/50 px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer lg:w-max w-full"
                          >
                            <FiUserMinus className="text-green-600" /> Remove
                            Profile
                          </div>
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
                    <div className="bg-blue-100/50 my-4 px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer w-max">
                      <FiPlus className="text-blue-600" /> Add Business
                      Information
                    </div>
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

                {/* Funding Requests - Styled */}
                {investmentsTab === "funding" && (
                  <div className="p-4 space-y-6">
                    <button className="mb-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2">
                      <FiPlus className="text-lg" /> New Funding Request
                    </button>

                    {userData.fundingRequests.map((request) => (
                      <div
                        key={request.id}
                        className="bg-white/30 backdrop-blur-sm p-4 rounded-lg border border-white/20 hover:bg-white/50 transition-all"
                      >
                        <div className="lg:flex lg:justify-between items-center">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800">
                              {request.title}
                            </h4>
                            <div className="mt-2 flex items-center gap-4 text-gray-600">
                              <span className="bg-blue-100/50 px-3 py-1 rounded-lg text-sm text-blue-700">
                                {request.type}
                              </span>
                              <span className="flex items-center gap-1">
                                <FiBriefcase className="text-blue-600" />{" "}
                                {request.investor}
                              </span>
                            </div>
                          </div>
                          <div className="lg:text-right p-2 lg:p-0">
                            <p className="text-2xl font-bold text-blue-600">
                              {request.amount}
                            </p>
                            <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <FiTrendingUp className="text-blue-600" />{" "}
                                {request.returns}
                              </span>
                              <span className="flex items-center gap-1">
                                <FiClock className="text-blue-600" />{" "}
                                {request.dueDate}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* My Investments - Styled */}
                {investmentsTab === "investments" && (
                  <div className="p-4 space-y-6">
                    {userData.investments.map((investment) => (
                      <div
                        key={investment.id}
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
                              <span className="flex items-center gap-1">
                                {/* <FiDollarSign className="text-purple-600" /> */}{" "}
                                {investment.amount}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 lg:mt-0 lg:text-right">
                            <p className="text-xl font-bold text-blue-600">
                              +{investment.interest}
                            </p>
                            <div className="mt-3 flex items-center lg:flex-start lg:justify-left justify-between gap-2">
                              <span
                                className={`px-2 py-1 text-sm rounded-lg ${
                                  investment.status === "Active"
                                    ? "bg-blue-100/50 text-blue-700"
                                    : "bg-red-100/50 text-red-700"
                                }`}
                              >
                                {investment.status}
                              </span>
                              <button className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-shadow">
                                Withdraw
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// inner

// outer

export default UserProfile;
