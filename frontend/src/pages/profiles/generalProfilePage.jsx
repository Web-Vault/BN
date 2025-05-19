import { useState, useEffect } from "react";
import {
  FiUser,
  FiBriefcase,
  FiMail,
  FiMapPin,
  FiGlobe,
  // FiClock,
  FiInfo,
} from "react-icons/fi";
import Navbar from "../../components/Navbar";
import { useParams } from "react-router-dom";
import axios from "axios";

const GeneralProfile = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/users/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(response.data);
        console.log("user: ", response.data);
      } catch (err) {
        console.error("❌ Error loading profile:", err);
        setError("Failed to load user profile.");
      }
    };

    fetchUser();
  }, [id]);

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  if (!user) {
    return <div className="text-center p-4">Loading profile...</div>;
  }

  // Mock data
  const userData = {
    name: "John Doe",
    email: "johndoe@example.com",
    bio: "Entrepreneur and tech enthusiast with a passion for building scalable SaaS solutions. Focused on AI-driven innovations.",
    industry: "Technology",
    address: "123 Main St, New York, USA",
    contact: "+1 234 567 890",
    website: "https://johndoe.com",
    business: {
      name: "Tech Corp Inc.",
      industry: "Software Development",
      email: "contact@techcorp.com",
      phone: "+1 234 567 890",
      address: "Silicon Valley, CA",
      description:
        "Innovative tech solutions provider specializing in AI, cloud computing, and enterprise software.",
      established: "2015",
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
  };
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] p-2 lg:p-8">
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
            </nav>
          </div>

          {/* Profile Tab Content */}
          {activeTab === "profile" && (
            <>
              {/* Profile Header */}
              <div className="p-3 lg:p-8 border-b border-white/20">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                  <img
                    src="https://img.freepik.com/free-vector/illustration-businessman_53876-5856.jpg?t=st=1742290205~exp=1742293805~hmac=51b36f46407e7bc32432f058e678995e49adba7ebb40a956ab64e55236f02415&w=740"
                    className="w-[8rem] h-[8rem] rounded-xl border-4 border-white/50 shadow-lg"
                    alt="Profile"
                  />
                  <div className=" flex items-center justify-between flex-1">
                    <div className="block">
                      <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {user.userName}
                      </h1>
                      <p className="text-gray-600 flex items-center gap-2 mb-4">
                        <FiMail className="text-blue-500" /> {user.userEmail}
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
                  </div>
                </div>
                <div className="mt-6 bg-gradient-to-r from-blue-50/30 to-purple-50/30 p-6 rounded-xl border border-white/20">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-600">
                    <FiInfo className="w-6 h-6 p-1.5 bg-blue-100 rounded-lg text-blue-600" />
                    About Me
                  </h3>
                  <p className="text-gray-600 leading-relaxed pl-8 border-l-4 border-blue-100">
                    {user.bio}
                  </p>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                {/* Business Information Section
                <div className="bg-white/30 backdrop-blur-sm p-6 rounded-xl border border-white/20">
                  <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-blue-600">
                    <FiBriefcase /> Business Information
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
                        <p className="text-gray-600">
                          {userData.business.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-green-100/50 p-3 rounded-lg">
                        <FiMail className="text-green-600 text-xl" />
                      </div>
                      <div>
                        <p className="font-medium">Business Contact</p>
                        <p className="text-gray-600">
                          {userData.business.email}
                        </p>
                        <p className="text-gray-600">
                          {userData.business.phone}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-gray-600 leading-relaxed">
                      {userData.business.description}
                    </p>
                  </div>
                </div>
                 */}
              </div>
            </>
          )}

          {/* Investments Tab Content */}
        </div>
      </div>
    </>
  );
};

export default GeneralProfile;
