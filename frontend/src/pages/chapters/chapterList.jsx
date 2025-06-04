import { useState, useEffect } from "react";
import {
  FiUsers,
  FiUser,
  FiMail,
  FiBriefcase,
  FiPlus,
  FiCheck,
  FiClock,
  FiInfo,
} from "react-icons/fi";
import Navbar from "../../components/Navbar.js";
import axios from "axios";
import config from "../../config/config.js";

const GroupsPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [users, setUsers] = useState();
  const [chapters, setChapters] = useState([]);
  const [error, setError] = useState("");
  const [isUserInAnyChapter, setIsUserInAnyChapter] = useState(false);
  const [userChapterStatus, setUserChapterStatus] = useState(null); // 'creator' or 'member' or null
  const [showStatusMessage, setShowStatusMessage] = useState(false);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const token = localStorage.getItem("token");
        const [chaptersRes, userRes] = await Promise.all([
          axios.get(`${config.API_BASE_URL}/api/chapters`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${config.API_BASE_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setChapters(chaptersRes.data);
        setUsers(userRes.data);

        // Check if user is a creator or member of any chapter
        const isCreator = chaptersRes.data.some(
          (chapter) => chapter.chapterCreator?._id === userId
        );
        const isMember = chaptersRes.data.some(
          (chapter) => chapter.members?.some((member) => member._id === userId)
        );

        if (isCreator) {
          setIsUserInAnyChapter(true);
          setUserChapterStatus('creator');
        } else if (isMember) {
          setIsUserInAnyChapter(true);
          setUserChapterStatus('member');
        } else {
          setIsUserInAnyChapter(false);
          setUserChapterStatus(null);
        }
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        setError("Failed to load chapters");
      }
    };

    fetchChapters();
  }, [userId]);

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
    if (isUserInAnyChapter) {
      setShowStatusMessage(true);
      setTimeout(() => setShowStatusMessage(false), 3000); // Hide message after 3 seconds
      return;
    }

    console.log("Joining Chapter ID:", chapterId);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${config.API_BASE_URL}/api/chapters/join/${chapterId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ Join Request Sent:", response.data);
    } catch (err) {
      console.error("❌ Error joining group:", err.response?.data || err.message);
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

          {/* Show error message when trying to join while already in a chapter */}
          {showStatusMessage && (
            <div className="mx-6 mt-4 p-3 rounded-lg bg-red-100/50 text-red-700 flex items-center gap-2 animate-fade-in">
              <FiInfo className="text-lg" />
              {userChapterStatus === 'creator' 
                ? "You are a creator of a chapter. You cannot join other chapters."
                : "You are already a member of a chapter. You cannot join other chapters."}
            </div>
          )}

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
                  disabled={group.chapterCreator?._id === userId || group.members?.some((member) => member._id === userId)}
                  className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
                    group.chapterCreator?._id === userId || group.members?.some((member) => member._id === userId)
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

// Add this at the top of the file with other styles
const styles = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
`;

// Add this right after the imports
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default GroupsPage;
