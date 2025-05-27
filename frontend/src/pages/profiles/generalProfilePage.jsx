import { useState, useEffect } from "react";
import {
  FiUser,
  FiBriefcase,
  FiMail,
  FiMapPin,
  FiGlobe,
  FiClock,
  FiInfo,
  FiStar,
  FiGift,
} from "react-icons/fi";
import Navbar from "../../components/Navbar";
import { useParams } from "react-router-dom";
import axios from "axios";

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
`;

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

  // Add function to check if user is new (within 10 days)
  const isNewUser = (createdAt) => {
    const creationDate = new Date(createdAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - creationDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 10;
  };

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

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  if (!user) {
    return <div className="text-center p-4">Loading profile...</div>;
  }

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
                  <div className="relative">
                    <img
                      src="https://img.freepik.com/free-vector/illustration-businessman_53876-5856.jpg?t=st=1742290205~exp=1742293805~hmac=51b36f46407e7bc32432f058e678995e49adba7ebb40a956ab64e55236f02415&w=740"
                      className="w-[8rem] h-[8rem] rounded-xl border-4 border-white/50 shadow-lg"
                      alt="Profile"
                    />
                    {isNewUser(user.user.createdAt) && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg border border-white/20 backdrop-blur-sm">
                        <FiStar className="text-[10px]" />
                        New Joinee
                      </div>
                    )}
                  </div>
                  <div className=" flex items-center justify-between flex-1">
                    <div className="block">
                      <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {user.user.userName}
                      </h1>
                      <p className="text-gray-600 flex items-center gap-2 mb-4">
                        <FiMail className="text-blue-500" />{" "}
                        {user.user.userEmail}
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <div className="bg-blue-100/50 px-4 py-2 rounded-lg flex items-center gap-2">
                          <FiBriefcase className="text-blue-600" />{" "}
                          {user.user.industry}
                        </div>
                        <div className="bg-purple-100/50 px-4 py-2 rounded-lg flex items-center gap-2">
                          <FiMapPin className="text-purple-600" />{" "}
                          {user.user.location}
                        </div>
                        {/* <div className="bg-green-100/50 px-4 py-2 rounded-lg flex items-center gap-2">
                          <FiGlobe className="text-green-600" />{" "}
                          {userData.website}
                        </div> */}
                        <div className="bg-orange-100/50 px-4 py-2 rounded-lg flex items-center gap-2">
                          <FiInfo className="text-orange-600" />{" "}
                          {user.user.mobileNumber}
                        </div>
                        <div className="relative group">
                          <style>{birthdayStyles}</style>
                          <div
                            className={`bg-purple-100/50 px-4 py-2 rounded-lg flex items-center gap-2 
                            ${
                              isBirthdayToday(user.user.birthday)
                                ? "border-2 border-pink-300 animate-[glow_2s_ease-in-out_infinite]"
                                : ""
                            }`}
                          >
                            <div className="relative">
                              <FiGift
                                className={`text-purple-600 ${
                                  isBirthdayToday(user.user.birthday)
                                    ? "animate-[float_3s_ease-in-out_infinite]"
                                    : ""
                                }`}
                              />
                              {isBirthdayToday(user.user.birthday) && (
                                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-pink-400 rounded-full animate-[sparkle_2s_ease-in-out_infinite]" />
                              )}
                            </div>
                            {user.user.birthday
                              ? new Date(user.user.birthday).toLocaleDateString()
                              : "Not set"}
                            {isBirthdayToday(user.user.birthday) && (
                              <>
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-400 rounded-full animate-[sparkle_3s_ease-in-out_infinite] delay-100" />
                                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full animate-[sparkle_2s_ease-in-out_infinite] delay-150" />
                                <div className="absolute -top-1 left-1/2 w-1.5 h-1.5 bg-pink-400 rounded-full animate-[sparkle_2.5s_ease-in-out_infinite] delay-200" />
                                <div className="absolute -bottom-1 right-1/2 w-1.5 h-1.5 bg-pink-400 rounded-full animate-[sparkle_3.5s_ease-in-out_infinite] delay-250" />
                              </>
                            )}
                          </div>
                          {user.user.birthday && (
                            <div className="absolute bottom-full left-0 mb-2 w-48 bg-white text-gray-800 text-xs rounded-lg p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              {isBirthdayToday(user.user.birthday) ? (
                                <div className="flex flex-col gap-2">
                                  <div className="flex items-center gap-2 text-pink-600">
                                    <FiGift className="text-pink-600" />
                                    <span>Happy Birthday! 🎉</span>
                                  </div>
                                  <div className="text-xs text-gray-500 italic">
                                    Wishing you a day filled with happiness and joy!
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <FiClock className="text-green-600" />
                                  <span>
                                    {calculateDaysUntilBirthday(user.user.birthday)}{" "}
                                    days until birthday
                                  </span>
                                </div>
                              )}
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
                  <p className="text-gray-600 leading-relaxed pl-8 border-l-4 border-blue-100">
                    {user.user.bio}
                  </p>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="grid grid-cols-1 gap-8 p-8">
                {/* Business Information Section */}
                {user.business && (
                  <div className="bg-white/30 backdrop-blur-sm p-6 rounded-xl border border-white/20 transition-all duration-300 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100/20">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-blue-600">
                      <FiBriefcase /> Business Information
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-white/20">
                        <div className="bg-blue-100/50 p-3 rounded-lg">
                          <FiBriefcase className="text-blue-600 text-xl" />
                        </div>
                        <div>
                          <p className="font-medium">Business Name</p>
                          <p className="text-gray-600">{user.business.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-white/20">
                        <div className="bg-purple-100/50 p-3 rounded-lg">
                          <FiMapPin className="text-purple-600 text-xl" />
                        </div>
                        <div>
                          <p className="font-medium">Business Location</p>
                          <p className="text-gray-600">
                            {user.business.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-white/20">
                        <div className="bg-green-100/50 p-3 rounded-lg">
                          <FiMail className="text-green-600 text-xl" />
                        </div>
                        <div>
                          <p className="font-medium">Business Contact</p>
                          <p className="text-gray-600">
                            {user.business.businessEmail}
                          </p>
                          <p className="text-gray-600">
                            {user.business.businessContactNumber}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 p-3 rounded-lg transition-all duration-300 hover:bg-white/20">
                        <p className="font-medium mb-2">Business Description</p>
                        <p className="text-gray-600 leading-relaxed">
                          {user.business.bio}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
