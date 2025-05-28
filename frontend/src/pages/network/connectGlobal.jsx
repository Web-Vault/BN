import { useEffect, useState } from "react";
import {
  FiUserPlus,
  FiClock,
  FiMail,
  FiBriefcase,
  FiCheck,
  FiSearch,
  FiFilter,
  FiUsers,
  FiStar,
  FiBookmark,
} from "react-icons/fi";
import Navbar from "../../components/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ConnectPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");
  const [searchTerm, setSearchTerm] = useState("");
  const [showConnectedOnly, setShowConnectedOnly] = useState(false);
  const [connectionStatuses, setConnectionStatuses] = useState({});
  const [filters, setFilters] = useState({
    country: "",
    state: "",
    city: "",
    industry: "",
    chapter: "",
  });

  // Get unique locations and chapters from users
  const locations = users.reduce(
    (acc, user) => {
      if (user.address) {
        if (
          user.address.country &&
          !acc.countries.includes(user.address.country)
        ) {
          acc.countries.push(user.address.country);
        }
        if (user.address.state && !acc.states.includes(user.address.state)) {
          acc.states.push(user.address.state);
        }
        if (user.address.city && !acc.cities.includes(user.address.city)) {
          acc.cities.push(user.address.city);
        }
      }
      if (user.industry && !acc.industries.includes(user.industry)) {
        acc.industries.push(user.industry);
      }
      return acc;
    },
    { countries: [], states: [], cities: [], industries: [] }
  );

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch both users and chapters
        const [usersResponse, chaptersResponse] = await Promise.all([
          axios.get("http://localhost:5000/api/users/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/chapters", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUsers(usersResponse.data);
        setFilteredUsers(usersResponse.data);
        setChapters(chaptersResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter users based on search term and filters
  useEffect(() => {
    let filtered = users;

    // Filter by search term (name)
    if (searchTerm) {
      filtered = filtered.filter((user) =>
        user.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Filter by location
    if (filters.country) {
      filtered = filtered.filter(
        (user) => user.address?.country === filters.country
      );
    }
    if (filters.state) {
      filtered = filtered.filter(
        (user) => user.address?.state === filters.state
      );
    }
    if (filters.city) {
      filtered = filtered.filter((user) => user.address?.city === filters.city);
    }
    // Filter by industry
    if (filters.industry) {
      filtered = filtered.filter((user) => user.industry === filters.industry);
    }
    // Filter by chapter
    if (filters.chapter) {
      filtered = filtered.filter(
        (user) => user.groupJoined?.JoinedGroupId === filters.chapter
      );
    }

    // Filter connected users
    if (showConnectedOnly) {
      filtered = filtered.filter(
        (user) => connectionStatuses[user._id] === "accepted"
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, filters, users, showConnectedOnly, connectionStatuses]);

  useEffect(() => {
    const fetchConnectionStatus = async () => {
      try {
        const token = localStorage.getItem("token");

        const statusMap = {};
        await Promise.all(
          users.map(async (user) => {
            const res = await axios.get(
              `http://localhost:5000/api/connections/status/${user._id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            statusMap[user._id] = res.data.status;
          })
        );

        setConnectionStatuses(statusMap);
      } catch (err) {
        console.error("Error fetching connection statuses:", err);
      }
    };

    if (users.length > 0) fetchConnectionStatus();
  }, [users]);

  // Add function to check if user is new (within 30 days)
  const isNewUser = (createdAt) => {
    const creationDate = new Date(createdAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - creationDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 10;
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>{error}</p>;

  const sendRequest = async (receiverId) => {
    try {
      const token = localStorage.getItem("token");
      setStatus("loading");
      await axios.post(
        "http://localhost:5000/api/connections/request",
        { receiverId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStatus("sent");
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] p-3 lg:p-8">
        <div className="max-w-7xl mx-auto bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30">
          <div className="p-2 lg:p-8">
            <h2 className="p-2 text-2xl font-semibold mb-6 flex items-center gap-2 text-blue-600">
              <FiUserPlus /> Connect with Professionals
            </h2>

            {/* Search and Filter Section */}
            <div className="mb-8 space-y-4">
              {/* Connected Users Toggle */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowConnectedOnly(!showConnectedOnly)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    showConnectedOnly
                      ? "bg-blue-500 text-white"
                      : "bg-white/30 text-gray-700 hover:bg-white/40"
                  }`}
                >
                  <FiUsers className="text-lg" />
                  <span>
                    {showConnectedOnly
                      ? "Show All Users"
                      : "Show Connected Users"}
                  </span>
                </button>
              </div>
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 pl-10 bg-white/30 backdrop-blur-lg rounded-lg border border-white/20 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Country Filter */}
                <div className="relative">
                  <select
                    value={filters.country}
                    onChange={(e) =>
                      setFilters({ ...filters, country: e.target.value })
                    }
                    className="w-full p-3 pl-10 bg-white/30 backdrop-blur-lg rounded-lg border border-white/20 focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none"
                  >
                    <option value="">All Countries</option>
                    {locations.countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                {/* State Filter */}
                <div className="relative">
                  <select
                    value={filters.state}
                    onChange={(e) =>
                      setFilters({ ...filters, state: e.target.value })
                    }
                    className="w-full p-3 pl-10 bg-white/30 backdrop-blur-lg rounded-lg border border-white/20 focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none"
                  >
                    <option value="">All States</option>
                    {locations.states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                {/* City Filter */}
                <div className="relative">
                  <select
                    value={filters.city}
                    onChange={(e) =>
                      setFilters({ ...filters, city: e.target.value })
                    }
                    className="w-full p-3 pl-10 bg-white/30 backdrop-blur-lg rounded-lg border border-white/20 focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none"
                  >
                    <option value="">All Cities</option>
                    {locations.cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                {/* Industry Filter */}
                <div className="relative">
                  <select
                    value={filters.industry}
                    onChange={(e) =>
                      setFilters({ ...filters, industry: e.target.value })
                    }
                    className="w-full p-3 pl-10 bg-white/30 backdrop-blur-lg rounded-lg border border-white/20 focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none"
                  >
                    <option value="">All Industries</option>
                    {locations.industries.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                  <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                {/* Chapter Filter */}
                <div className="relative">
                  <select
                    value={filters.chapter}
                    onChange={(e) =>
                      setFilters({ ...filters, chapter: e.target.value })
                    }
                    className="w-full p-3 pl-10 bg-white/30 backdrop-blur-lg rounded-lg border border-white/20 focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none"
                  >
                    <option value="">All Chapters</option>
                    {chapters.map((chapter) => (
                      <option key={chapter._id} value={chapter._id}>
                        {chapter.chapterName}
                      </option>
                    ))}
                  </select>
                  <FiBookmark className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {/* User Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6 transition-shadow"
                >
                  {isNewUser(user.createdAt) && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg border border-white/20 backdrop-blur-sm">
                          <FiStar className="text-[10px]" />
                          New Joinee
                        </div>
                      )}
                  <div className="flex items-start gap-6 my-3">
                    <div className="w-20 h-20 flex-shrink-0 relative">
                      <img
                        src={
                          "https://img.freepik.com/free-vector/illustration-businessman_53876-5856.jpg?t=st=1742290205~exp=1742293805~hmac=51b36f46407e7bc32432f058e678995e49adba7ebb40a956ab64e55236f02415&w=740"
                        }
                        className="w-20 h-20 rounded-lg border-2 border-white/50 object-cover"
                        alt={user.userName}
                      />
                    </div>

                    <div className="flex-1">
                      <span
                        onClick={() => {
                          navigate(`/userProfile/${user._id}`);
                        }}
                        className="h2 d-block text-xl font-semibold text-gray-800 mb-2 p-1 relative cursor-pointer after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-gray-400 after:transition-all after:duration-300 hover:after:w-full rounded-full"
                      >
                        {user.userName}
                      </span>
                      <p className="text-sm text-gray-600 line-clamp-1 mb-4 mt-2">
                        {user.bio}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="bg-green-100/50 p-2 rounded-lg flex items-center gap-2">
                      <FiMail className="text-green-600" />
                      <span className="text-sm text-gray-600 truncate">
                        {user.userEmail}
                      </span>
                    </div>

                    <div className="bg-purple-100/50 p-2 rounded-lg flex items-center gap-2">
                      <FiBriefcase className="text-purple-600" />
                      <span className="text-sm text-gray-600 truncate">
                        {user.industry}
                      </span>
                    </div>

                    <button
                      onClick={() => sendRequest(user._id)}
                      disabled={
                        connectionStatuses[user._id] === "pending" ||
                        connectionStatuses[user._id] === "accepted"
                      }
                      className={`col-span-1 sm:col-span-1 p-2 rounded-lg flex items-center justify-center gap-2 ${
                        connectionStatuses[user._id] === "pending" ||
                        connectionStatuses[user._id] === "accepted"
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-xl"
                      } transition-all`}
                    >
                      {connectionStatuses[user._id] === "accepted" ? (
                        <button
                          className="flex items-center gap-1 px-3 py-1 text-white-700 text-sm cursor-not-allowed"
                          disabled
                        >
                          <FiCheck className="text-sm" />
                          Connected
                        </button>
                      ) : connectionStatuses[user._id] === "pending" ? (
                        <button
                          className="flex items-center gap-1 px-3 py-1 text-white-700 text-sm"
                          disabled
                        >
                          <FiClock className="text-sm" />
                          Pending
                        </button>
                      ) : (
                        <button className="flex items-center gap-1 px-3 py-1  text-white-700 text-sm">
                          <FiUserPlus className="text-sm" />
                          Connect
                        </button>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConnectPage;
