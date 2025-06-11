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
  FiX,
  FiMapPin,
  FiAlertCircle,
} from "react-icons/fi";
import Navbar from "../../components/Navbar.js";
import axios from "axios";
import config from "../../config/config.js";

const GroupsPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [users, setUsers] = useState();
  const [chapters, setChapters] = useState([]);
  const [filteredChapters, setFilteredChapters] = useState([]);
  const [error, setError] = useState("");
  const [isUserInAnyChapter, setIsUserInAnyChapter] = useState(false);
  const [userChapterStatus, setUserChapterStatus] = useState(null);
  const [showStatusMessage, setShowStatusMessage] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Filter states
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedTech, setSelectedTech] = useState("");

  // Get unique regions and technologies from chapters
  const regions = [...new Set(chapters.map(chapter => chapter.chapterRegion))].filter(Boolean);
  const technologies = [...new Set(chapters.map(chapter => chapter.chapterTech))].filter(Boolean);

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
        setFilteredChapters(chaptersRes.data);
        setUsers(userRes.data.user);

        console.log("Fetched User Data:", userRes.data.user);
        console.log("User Address:", userRes.data.user?.address);
        console.log("User State:", userRes.data.user?.address?.state);

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

  // Apply filters whenever filter states change
  useEffect(() => {
    let filtered = [...chapters];

    if (selectedRegion) {
      filtered = filtered.filter(chapter => chapter.chapterRegion === selectedRegion);
    }

    if (selectedTech) {
      filtered = filtered.filter(chapter => chapter.chapterTech === selectedTech);
    }

    setFilteredChapters(filtered);
  }, [selectedRegion, selectedTech, chapters]);

  const clearFilters = () => {
    setSelectedRegion("");
    setSelectedTech("");
  };

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
  const handleJoinGroup = async (chapterId, chapterRegion) => {
    if (isUserInAnyChapter) {
      setStatusMessage(userChapterStatus === 'creator' 
        ? "You are a creator of a chapter. You cannot join other chapters."
        : "You are already a member of a chapter. You cannot join other chapters.");
      setShowStatusMessage(true);
      setTimeout(() => setShowStatusMessage(false), 3000);
      return;
    }

    // Check if user's state matches chapter's region
    const userState = users?.state || users?.address?.state;
    
    if (!userState) {
      setStatusMessage("Please update your profile with your state information before joining a chapter.");
      setShowStatusMessage(true);
      setTimeout(() => setShowStatusMessage(false), 3000);
      return;
    }

    if (userState.toLowerCase() !== chapterRegion?.toLowerCase()) {
      setStatusMessage(`You can only join chapters in your region (${userState}). This chapter is in ${chapterRegion}.`);
      setShowStatusMessage(true);
      setTimeout(() => setShowStatusMessage(false), 3000);
      return;
    }

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
      setStatusMessage("Join request sent successfully!");
      setShowStatusMessage(true);
      setTimeout(() => setShowStatusMessage(false), 3000);
    } catch (err) {
      console.error("❌ Error joining group:", err.response?.data || err.message);
      setStatusMessage("Already requested to Join. Kindly wait for approval.");
      setShowStatusMessage(true);
      setTimeout(() => setShowStatusMessage(false), 3000);
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

          {/* Filters Section */}
          <div className="px-4 sm:px-6 py-4 border-b border-white/20">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-end">
              <div className={`w-full ${(selectedRegion || selectedTech) ? 'sm:w-2/5' : 'sm:w-1/2'}`}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm"
                >
                  <option value="">All Regions</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
              <div className={`w-full ${(selectedRegion || selectedTech) ? 'sm:w-2/5' : 'sm:w-1/2'}`}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technology
                </label>
                <select
                  value={selectedTech}
                  onChange={(e) => setSelectedTech(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm"
                >
                  <option value="">All Technologies</option>
                  {technologies.map((tech) => (
                    <option key={tech} value={tech}>
                      {tech}
                    </option>
                  ))}
                </select>
              </div>
              {(selectedRegion || selectedTech) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-100/50 backdrop-blur-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  <FiX className="text-lg" />
                  Remove Filters
                </button>
              )}
            </div>
            {filteredChapters.length === 0 && (
              <div className="mt-4 text-center text-gray-600">
                No chapters found matching the selected filters.
              </div>
            )}
          </div>

          {/* Show error message when trying to join while already in a chapter */}
          {showStatusMessage && (
            <div className="mx-6 mt-4 p-3 rounded-lg bg-red-100/50 text-red-700 flex items-center gap-2 animate-fade-in">
              <FiAlertCircle className="text-lg" />
              {statusMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-red-600 bg-red-100 rounded-lg p-3 mx-6 mt-4 shadow">
              {error}
            </div>
          )}

          {/* Groups Grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-3 lg:p-8">
            {filteredChapters.map((group) => (
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
                  <div className="bg-green-100/50 p-2 rounded-lg flex items-center gap-2 text-sm w-full">
                    <FiMapPin className="text-blue-600" />
                    <span>{group.chapterRegion}</span>
                  </div>
                </div>
                {/* Join Button */}
                <button
                  onClick={() => handleJoinGroup(group._id, group.chapterRegion)}
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
