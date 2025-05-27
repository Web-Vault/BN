import { useState, useEffect } from "react";
import {
  FiUsers,
  FiClock,
  FiBriefcase,
  FiMail,
  FiX,
  FiCheck,
  FiFileText,
  FiImage,
  FiTrash,
  FiPlus,
} from "react-icons/fi";
import Navbar from "../../components/Navbar";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const GroupDashboard = () => {
  const [activeTab, setActiveTab] = useState("activity");
  const [activeMemberTab, setActiveMemberTab] = useState("current");

  const { chapterId } = useParams();
  console.log("id", chapterId);

  const [chapter, setChapter] = useState(null);
  const [error, setError] = useState("");
  const [isCreator, setCreator] = useState(false);

  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState("");

  const [showPostForm, setShowPostForm] = useState(false);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:5000/api/chapters/${chapterId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("✅ Chapter fetched:", response.data);
        setChapter(response.data);

        if (
          response.data.chapterCreator._id === localStorage.getItem("userId")
        ) {
          setCreator(true);
        }
      } catch (err) {
        console.error("❌ Error fetching chapter:", err);
        setError("Failed to load chapter data.");
      }
    };

    fetchChapter();
  }, [chapterId]);

  const navigate = useNavigate();

  console.log("error: ", error);

  // const goToOthersProfile = () => {
  //   navigate(`/userProfile/${userId}`);
  // };

  // const handleDeleteChapter = () => {
  //   alert("Chapter '" + chapter.ChapterName + "' Deleted successfully!");
  //   navigate("/chapter");
  // };

  const handleAcceptRequest = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `http://localhost:5000/api/chapters/accept/${chapterId}/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Request accepted:", response.data);

      // Refresh data
      const updatedChapter = await axios.get(
        `http://localhost:5000/api/chapters/${chapterId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setChapter(updatedChapter.data);
    } catch (err) {
      console.error("❌ Error accepting request:", err);
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `http://localhost:5000/api/chapters/reject/${chapterId}/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("❌ Request rejected:", response.data);

      // Refresh data
      const updatedChapter = await axios.get(
        `http://localhost:5000/api/chapters/${chapterId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setChapter(updatedChapter.data);
    } catch (err) {
      console.error("❌ Error rejecting request:", err);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/api/chapters/remove-member",
        {
          chapterId: chapter._id,
          userId: memberId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Member removed:", response.data);

      // Refresh data
      const updatedChapter = await axios.get(
        `http://localhost:5000/api/chapters/${chapterId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setChapter(updatedChapter.data);
    } catch (err) {
      console.error("❌ Error removing member:", err);
    }
  };

  const handleSubmitPost = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `http://localhost:5000/api/chapters/${chapterId}/posts`,
        {
          content: postContent,
          image: postImage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Post added:", response.data);

      // Clear the form
      setPostContent("");
      setPostImage("");
      setShowPostForm(false);

      // Refresh chapter data by calling the same fetch function again

      // Refresh data
      const updatedChapter = await axios.get(
        `http://localhost:5000/api/chapters/${chapterId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setChapter(updatedChapter.data);
    } catch (error) {
      console.error("❌ Error submitting post:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] p-3 lg:p-8">
        <div className="max-w-7xl mx-auto bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30">
          <div className="p-3 lg:p-8">
            {/* Group Info Section */}
            {activeTab !== "members" && (
              <div className="bg-gradient-to-br from-blue-50/30 to-purple-50/30 backdrop-blur-sm rounded-xl border border-white/20 p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100/50 rounded-lg">
                        <FiUsers className="text-2xl text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Members</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {chapter?.members?.length || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-100/50 rounded-lg">
                        <FiFileText className="text-2xl text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Posts</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {chapter?.activities?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                  {isCreator ? (
                    <div
                      // onClick={handleDeleteChapter}
                      className="flex items-center gap-2 hover:bg-red-100/50 p-2 rounded-lg transition-all cursor-pointer"
                    >
                      <div className="p-3 bg-red-100/50 rounded-lg">
                        <FiTrash className="text-2l text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-red-600">Delete Chapter</p>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
                <div className="mt-6 space-y-4">
                  <h1 className="text-3xl font-bold text-gray-800">
                    {chapter?.chapterName}
                  </h1>
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-blue-100/50 px-4 py-2 rounded-lg flex items-center gap-2">
                      <FiClock className="text-blue-600" /> Created:{" "}
                      {new Date(chapter?.createdAt).toLocaleDateString()}
                    </div>
                    <div className="bg-purple-100/50 px-4 py-2 rounded-lg flex items-center gap-2">
                      <FiBriefcase className="text-purple-600" />{" "}
                      {chapter?.chapterTech}
                    </div>
                  </div>
                  <p className="text-gray-600 mt-4">{chapter?.chapterDesc}</p>
                </div>
              </div>
            )}

            {/* Main Tabs Navigation */}
            <div className="border-b border-white/20 mb-6">
              <nav className="flex space-x-8 justify-between">
                <div className="flex space-x-8 ">
                  <button
                    onClick={() => setActiveTab("activity")}
                    className={`py-4 px-1 border-b-2 font-medium flex items-center gap-2 ${
                      activeTab === "activity"
                        ? "text-blue-600 border-blue-500"
                        : "text-gray-600 hover:text-blue-500"
                    }`}
                  >
                    <FiFileText className="text-lg" /> Activity
                  </button>
                  <button
                    onClick={() => setActiveTab("members")}
                    className={`py-4 px-1 border-b-2 font-medium flex items-center gap-2 ${
                      activeTab === "members"
                        ? "text-blue-600 border-blue-500"
                        : "text-gray-600 hover:text-blue-500"
                    }`}
                  >
                    <FiUsers className="text-lg" /> Members
                  </button>
                </div>
                <div>
                  <span
                    onClick={() => setShowPostForm(true)}
                    className="relative right-0 bg-purple-100/50 px-4 py-2 ml-auto m-3 rounded-lg flex items-center w-max gap-2 cursor-pointer hover:bg-purple-200 transition"
                  >
                    <FiPlus className="text-lg" /> Add Post
                  </span>
                </div>
              </nav>
            </div>

            {/* form model */}

            {showPostForm && (
              <div
                className="fixed inset-0 bg-black/20 z-20 flex items-center justify-center"
                onClick={() => setShowPostForm(false)}
              >
                <div
                  className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-semibold text-blue-600">
                    Create New Post
                  </h3>

                  <textarea
                    rows={3}
                    placeholder="What's on your mind?"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-500"
                  />

                  <input
                    type="text"
                    placeholder="Image URL (optional)"
                    value={postImage}
                    onChange={(e) => setPostImage(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-500"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowPostForm(false)}
                      className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitPost}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* form model end */}

            {/* Activity Tab Content */}
            {activeTab === "activity" && (
              <div className="grid grid-cols-1 gap-6">
                {chapter?.activities?.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-3 transition-shadow"
                  >
                    <div className="">
                      <div className="flex flex-start gap-4">
                        <img
                          src={activity.user?.profileImage || "fallback.png"}
                          className="w-10 h-10 lg:w-20 lg:h-20 rounded-xl border-2 border-white/50 object-cover"
                          alt={activity.user?.userName}
                        />
                        <div className="flex-1">
                          <div className="gap-3 mb-2">
                            <h3 className="font-semibold text-gray-800">
                              {activity.user}
                              {activity.user?.userName}
                            </h3>
                            <span className="text-[11px] lg:text-sm text-gray-500">
                              <FiClock className="inline mr-1" />{" "}
                              {new Date(activity.timestamp).toLocaleString()}{" "}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="lg:ml-24">
                        <p className="text-gray-600">{activity.content}</p>
                        {activity.image && (
                          <div className="mt-4">
                            <img
                              src={activity.image}
                              className="rounded-lg w-full max-w-2xl border border-white/20"
                              alt="Post content"
                            />
                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                              <FiImage className="text-blue-600" /> Included
                              image
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Members Tab Content */}
            {activeTab === "members" && (
              <div>
                {/* Inner Tabs */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setActiveMemberTab("current")}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      activeMemberTab === "current"
                        ? "bg-blue-100/50 text-blue-600"
                        : "hover:bg-white/20 text-gray-600"
                    }`}
                  >
                    Current Members ({chapter?.members?.length})
                  </button>
                  {isCreator ? (
                    <button
                      onClick={() => setActiveMemberTab("requests")}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                        activeMemberTab === "requests"
                          ? "bg-blue-100/50 text-blue-600"
                          : "hover:bg-white/20 text-gray-600"
                      }`}
                    >
                      Join Requests ({chapter?.joinRequests.length})
                    </button>
                  ) : (
                    <></>
                  )}
                </div>

                {/* Current Members Grid */}
                {activeMemberTab === "current" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {chapter?.members?.map((member) => (
                      <div
                        key={member.id}
                        className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6 transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={member.userImage || "fallback.png"}
                            className="w-20 h-20 rounded-xl border-2 border-white/50 object-cover"
                            alt={member.userName}
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">
                              {member.userName}
                            </h3>
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FiMail className="text-blue-600" />{" "}
                                {member.userEmail}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FiBriefcase className="text-blue-600" />{" "}
                                {member.industry}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between gap-2">
                          <button
                            onClick={() => {
                              navigate(`/userProfile/${member._id}`);
                            }}
                            className="w-full mt-4 px-4 py-2 bg-blue-100/50 text-blue-600 rounded-lg hover:bg-blue-200/50 transition-colors"
                          >
                            View Member
                          </button>
                          {isCreator ? (
                            <button
                              onClick={() => handleRemoveMember(member._id)}
                              className="w-full mt-4 px-4 py-2 bg-red-100/50 text-red-600 rounded-lg hover:bg-red-200/50 transition-colors"
                            >
                              Remove Member
                            </button>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Join Requests Grid */}
                {activeMemberTab === "requests" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {chapter?.joinRequests?.map((request) => (
                      <div
                        key={request.id}
                        className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6 transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={request.userImage || "fallback.png"}
                            className="w-20 h-20 rounded-xl border-2 border-white/50 object-cover"
                            alt={request.userName}
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">
                              {request.userName}{" "}
                            </h3>
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FiMail className="text-blue-600" />{" "}
                                {request.userEmail}{" "}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FiBriefcase className="text-blue-600" />{" "}
                                {request.industry}
                              </div>
                              <p className="text-sm text-gray-600 mt-2">
                                {request.bio}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleAcceptRequest(request._id)}
                              className="p-2 bg-green-100/50 text-green-600 rounded-lg hover:bg-green-200/50 transition-colors"
                            >
                              <FiCheck className="text-lg" />
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request._id)}
                              className="p-2 bg-red-100/50 text-red-600 rounded-lg hover:bg-red-200/50 transition-colors"
                            >
                              <FiX className="text-lg" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/*  */}
        </div>
      </div>
    </>
  );
};

export default GroupDashboard;
