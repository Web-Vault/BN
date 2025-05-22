import { useEffect, useState } from "react";
import {
  FiUserPlus,
  FiClock,
  FiMail,
  FiBriefcase,
  FiCheck,
} from "react-icons/fi";
import Navbar from "../../components/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ConnectPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("idle");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/api/users/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        console.error(
          "Failed to fetch users:",
          err.response?.data || err.message
        );
        setError(err.response?.data?.message || "Failed to load users");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const [connectionStatuses, setConnectionStatuses] = useState({});

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

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>{error}</p>;

  const sendRequest = async (receiverId) => {
    // Add receiverId parameter
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

            {/* User Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6 transition-shadow"
                >
                  <div className="flex items-start gap-6 my-3">
                    {/* Profile Image */}
                    <div className="w-20 h-20 flex-shrink-0">
                      <img
                        src={"https://img.freepik.com/free-vector/illustration-businessman_53876-5856.jpg?t=st=1742290205~exp=1742293805~hmac=51b36f46407e7bc32432f058e678995e49adba7ebb40a956ab64e55236f02415&w=740"}
                        className="w-20 h-20 rounded-lg border-2 border-white/50 object-cover"
                        alt={user.userName}
                      />
                    </div>

                    {/* User Info */}
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
                  {/* Email, Industry, and Connect Button */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Email */}
                    <div className="bg-green-100/50 p-2 rounded-lg flex items-center gap-2">
                      <FiMail className="text-green-600" />
                      <span className="text-sm text-gray-600 truncate">
                        {user.userEmail}
                      </span>
                    </div>

                    {/* Industry */}
                    <div className="bg-purple-100/50 p-2 rounded-lg flex items-center gap-2">
                      <FiBriefcase className="text-purple-600" />
                      <span className="text-sm text-gray-600 truncate">
                        {user.industry}
                      </span>
                    </div>

                    {/* Connect Button */}
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
                        <button
                          // onClick={() => handleConnect(user._id)}
                          className="flex items-center gap-1 px-3 py-1  text-white-700 text-sm"
                        >
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
