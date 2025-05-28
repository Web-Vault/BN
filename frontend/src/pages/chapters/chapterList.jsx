import { useState, useEffect } from "react";
import {
  FiUsers,
  FiUser,
  FiMail,
  FiBriefcase,
  FiPlus,
  FiCheck,
  FiClock,
} from "react-icons/fi";
import Navbar from "../../components/Navbar";
import axios from "axios";

const GroupsPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  // const [myGroups, setMyGroups] = useState([]); // Track joined groups
  const [users, setUsers] = useState();
  const [chapters, setChapters] = useState([]);
  const [error, setError] = useState("");
  // const [memberAction, setMemberAction] = useState();

  const userId = localStorage.getItem("userId");
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const token = localStorage.getItem("token");

        const [chaptersRes, userRes] = await Promise.all([
          axios.get("http://localhost:5000/api/chapters", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setChapters(chaptersRes.data);
        setUsers(userRes.data);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        setError("Failed to load chapters");
      }
    };

    fetchChapters();
  }, []);

  console.log("users : ", users);
  console.log("chapters : ", chapters);
  // Mock data for all groups

  // chapters.map((group) => {
  //   if (group.chapterCreator?._id === userId) {
  //     setMemberAction("Creator");
  //   } else {
  //     group.members.map((member) => {
  //       if (member._id === userId) {
  //         setMemberAction("Member");
  //       }
  //     });
  //   }
  // });

  // Handle joining a group
  const handleJoinGroup = async (chapterId) => {
    console.log("Joining Chapter ID:", chapterId);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `http://localhost:5000/api/chapters/join/${chapterId}`,
        {}, // important for Express to register as POST
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Join Request Sent:", response.data);
    } catch (err) {
      console.error(
        "❌ Error joining group:",
        err.response?.data || err.message
      );
      alert("Already requested to Join. Kindly wait for approval.");
    }
  };

  // Filter groups by category

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] p-2 lg:p-8">
        <div className="max-w-7xl mx-auto bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30">
          {/* Tabs Navigation */}
          <div className="border-b border-white/20">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("all")}
                className={`py-4 px-1 border-b-2 font-medium flex items-center gap-2 ${
                  activeTab === "all"
                    ? "text-blue-600 border-blue-500"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                <FiUsers className="text-lg" /> All Groups
              </button>
            </nav>
          </div>

          {/* Category Filter Dropdown */}
          {error && (
            <div className="text-red-600 bg-red-100 rounded-lg p-3 mx-6 mt-4 shadow">
              {error}
            </div>
          )}

          {/* Groups Grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-3 lg:p-8">
            {chapters.map((group) => (
              <div
                key={group._id}
                className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6 transition-shadow"
              >
                {/* Group Name and Description */}
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {group.chapterName}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {group.chapterDesc}
                </p>

                {/* Members Count */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <FiUsers className="text-blue-600" />
                  <span>{group.members.length} Members</span>
                </div>

                {/* Owner Info */}
                <div className="space-y-2 mb-4">
                  <div className="space-y-2 lg:flex gap-2 lg:items-center flex-col lg:flex-row justify-between sm:flex flex-col">
                    <div className="bg-green-100/50 p-2 rounded-lg flex items-center gap-2 text-sm mt-2 w-full">
                      <FiUser className="text-blue-600" />
                      <span>{group.chapterCreator?.userName}</span>
                    </div>
                    <div className="bg-green-100/50 p-2 rounded-lg flex items-center gap-2 text-sm">
                      <FiBriefcase className="text-blue-600" />
                      <span>{group.chapterTech}</span>
                    </div>
                  </div>
                  <div className="bg-green-100/50 p-2 rounded-lg flex items-center gap-2 text-sm w-full">
                    <FiMail className="text-blue-600" />
                    <span>{group.chapterCreator?.userEmail}</span>
                  </div>
                </div>
                {/* Join Button */}
                <button
                  onClick={() => handleJoinGroup(group._id)}
                  disabled={
                    group.chapterCreator?._id === userId ||
                    group.members?.some((member) => member._id === userId)
                  }
                  className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
                    group.chapterCreator?._id === userId ||
                    group.members?.some((member) => member._id === userId)
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-xl"
                  } transition-all`}
                >
                  {group.chapterCreator?._id === userId ? (
                    <>
                      <FiCheck className="text-sm" /> Creator
                    </>
                  ) : group.members?.some((member) => member._id === userId) ? (
                    <>
                      <FiClock className="text-sm" /> Member
                    </>
                  ) : (
                    <>
                      <FiPlus className="text-sm" /> Join Group
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupsPage;
