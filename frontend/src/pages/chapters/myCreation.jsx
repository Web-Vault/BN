import { useState, useEffect, useCallback } from "react";
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
  FiCalendar,
  FiMapPin,
  FiVideo,
  FiAlertCircle,
  FiCheckCircle,
  FiClock as FiClockIcon,
  FiPlayCircle,
  FiEdit,
} from "react-icons/fi";
import Navbar from "../../components/Navbar.js";
import config from "../../config/config.js";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const GroupDashboard = () => {
  const [activeTab, setActiveTab] = useState("activity");
  const [activeMemberTab, setActiveMemberTab] = useState("current");
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [meetingData, setMeetingData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    endTime: "",
    meetingLink: "",
    meetingType: "online",
    location: "",
  });

  const { chapterId } = useParams();
  console.log("id", chapterId);

  const [chapter, setChapter] = useState(null);
  const [error, setError] = useState("");
  const [isCreator, setCreator] = useState(false);

  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState("");

  const [showPostForm, setShowPostForm] = useState(false);

  // Add state for attendance
  const [meetingAttendance, setMeetingAttendance] = useState({});
  const [loadingAttendance, setLoadingAttendance] = useState({});
  const [hiddenAttendanceMeetings, setHiddenAttendanceMeetings] = useState(
    new Set()
  );

  // Add a new state for tracking which meetings have attendance data loaded
  const [loadedAttendanceMeetings, setLoadedAttendanceMeetings] = useState(
    new Set()
  );

  // Add this state for chapter members
  const [chapterMembers, setChapterMembers] = useState([]);

  // Add new state for events
  const [showEventForm, setShowEventForm] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [expandedBookingDetails, setExpandedBookingDetails] = useState(
    new Set()
  );
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    purpose: "",
    date: "",
    time: "",
    endTime: "",
    venue: "",
    entryFee: 0,
    totalSeats: 0,
    availableSeats: 0,
    image: "",
  });

  const fetchChapter = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      // First update meeting statuses
      await axios.post(
        `${config.API_BASE_URL}/api/meetings/update-statuses`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Then fetch updated chapter data
      const response = await axios.get(
        `${config.API_BASE_URL}/api/chapters/${chapterId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Chapter fetched:", response.data);
      setChapter(response.data);
      setChapterMembers(response.data.members || []);

      if (response.data.chapterCreator._id === localStorage.getItem("userId")) {
        setCreator(true);
      }
    } catch (err) {
      console.error("❌ Error fetching chapter:", err);
      setError("Failed to load chapter data.");
    }
  }, [chapterId]);

  // Initial fetch
  useEffect(() => {
    fetchChapter();
  }, [fetchChapter]);

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
        `${config.API_BASE_URL}/api/chapters/accept/${chapterId}/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Request accepted:", response.data);

      // Refresh data
      const updatedChapter = await axios.get(
        `${config.API_BASE_URL}/api/chapters/${chapterId}`,
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
        `${config.API_BASE_URL}/api/chapters/reject/${chapterId}/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("❌ Request rejected:", response.data);

      // Refresh data
      const updatedChapter = await axios.get(
        `${config.API_BASE_URL}/api/chapters/${chapterId}`,
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
        `${config.API_BASE_URL}/api/chapters/remove-member`,
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
        `${config.API_BASE_URL}/api/chapters/${chapterId}`,
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
        `${config.API_BASE_URL}/api/chapters/${chapterId}/posts`,
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
        `${config.API_BASE_URL}/api/chapters/${chapterId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setChapter(updatedChapter.data);
    } catch (error) {
      console.error("❌ Error submitting post:", error);
    }
  };

  const handleCreateMeeting = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Creating meeting with data:", meetingData); // Debug log
      const response = await axios.post(
        `${config.API_BASE_URL}/api/chapters/${chapterId}/meetings`,
        meetingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Meeting created:", response.data); // Debug log

      // Clear form and close modal
      setMeetingData({
        title: "",
        description: "",
        date: "",
        time: "",
        endTime: "",
        meetingLink: "",
        meetingType: "online",
        location: "",
      });
      setShowMeetingForm(false);

      // Refresh chapter data
      const updatedChapter = await axios.get(
        `${config.API_BASE_URL}/api/chapters/${chapterId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Updated chapter data:", updatedChapter.data); // Debug log
      setChapter(updatedChapter.data);
    } catch (error) {
      console.error("❌ Error creating meeting:", error);
      if (error.response) {
        console.error("Error response:", error.response.data); // Debug log
      }
      alert("Failed to create meeting. Please try again.");
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${config.API_BASE_URL}/api/chapters/${chapterId}/meetings/${meetingId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresh chapter data
      const updatedChapter = await axios.get(
        `${config.API_BASE_URL}/api/chapters/${chapterId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChapter(updatedChapter.data);
    } catch (error) {
      console.error("❌ Error deleting meeting:", error);
      alert("Failed to delete meeting. Please try again.");
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "upcoming":
        return {
          color: "text-blue-600 bg-blue-100/50",
          icon: <FiClockIcon className="text-lg" />,
          label: "Upcoming",
        };
      case "ongoing":
        return {
          color: "text-green-600 bg-green-100/50",
          icon: <FiPlayCircle className="text-lg" />,
          label: "Ongoing",
        };
      case "completed":
        return {
          color: "text-purple-600 bg-purple-100/50",
          icon: <FiCheckCircle className="text-lg" />,
          label: "Completed",
        };
      case "cancelled":
        return {
          color: "text-red-600 bg-red-100/50",
          icon: <FiAlertCircle className="text-lg" />,
          label: "Cancelled",
        };
      default:
        return {
          color: "text-gray-600 bg-gray-100/50",
          icon: <FiClockIcon className="text-lg" />,
          label: "Unknown",
        };
    }
  };

  const updateMeetingStatuses = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${config.API_BASE_URL}/api/meetings/update-statuses`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresh chapter data
      const updatedChapter = await axios.get(
        `${config.API_BASE_URL}/api/chapters/${chapterId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChapter(updatedChapter.data);
    } catch (error) {
      console.error("❌ Error updating meeting statuses:", error);
    }
  }, [chapterId]);

  useEffect(() => {
    updateMeetingStatuses();
  }, [updateMeetingStatuses]);

  useEffect(() => {
    if (activeTab === "meetings") {
      const refreshInterval = setInterval(fetchChapter, 30000);
      return () => clearInterval(refreshInterval);
    }
  }, [activeTab, chapterId]);

  // Update the fetchMeetingAttendance function
  const fetchMeetingAttendance = async (meetingId) => {
    try {
      console.log("Fetching attendance for meeting:", meetingId);
      setLoadingAttendance((prev) => ({ ...prev, [meetingId]: true }));
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${config.API_BASE_URL}/api/chapters/${chapterId}/meetings/${meetingId}/attendance`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Raw attendance response:", response.data);

      // Validate the response data
      if (!response.data || !response.data.attendance) {
        console.error("Invalid attendance data received from API");
        return;
      }

      // The backend returns { attendance: [...], stats: {...} }
      const attendanceRecords = response.data.attendance;
      console.log("Processed attendance data:", attendanceRecords);

      setMeetingAttendance((prev) => {
        const newState = { ...prev, [meetingId]: attendanceRecords };
        console.log("New attendance state:", newState);
        return newState;
      });

      setLoadedAttendanceMeetings((prev) => {
        const newSet = new Set([...prev, meetingId]);
        console.log("New loaded meetings set:", Array.from(newSet));
        return newSet;
      });
    } catch (error) {
      console.error("Error fetching attendance:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
    } finally {
      setLoadingAttendance((prev) => ({ ...prev, [meetingId]: false }));
    }
  };

  // Add function to handle joining/leaving meetings
  const handleMeetingAction = async (meetingId, action) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${config.API_BASE_URL}/api/chapters/${chapterId}/meetings/${meetingId}/${action}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Refresh attendance data
      if (action === "join") {
        fetchMeetingAttendance(meetingId);
      }
    } catch (error) {
      console.error(`Error ${action}ing meeting:`, error);
      alert(error.response?.data?.message || `Failed to ${action} meeting`);
    }
  };

  const handleCreateEvent = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Creating event with data:", eventData); // Debug log
      const response = await axios.post(
        `${config.API_BASE_URL}/api/chapters/${chapterId}/events`,
        eventData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Event created:", response.data); // Debug log

      // Clear form and close modal
      setEventData({
        title: "",
        description: "",
        purpose: "",
        date: "",
        time: "",
        endTime: "",
        venue: "",
        entryFee: 0,
        totalSeats: 0,
        availableSeats: 0,
        image: "",
      });
      setShowEventForm(false);

      // Refresh chapter data
      const updatedChapter = await axios.get(
        `${config.API_BASE_URL}/api/chapters/${chapterId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Updated chapter data:", updatedChapter.data); // Debug log
      setChapter(updatedChapter.data);
    } catch (error) {
      console.error("❌ Error creating event:", error);
      if (error.response) {
        console.error("Error response:", error.response.data); // Debug log
      }
      alert("Failed to create event. Please try again.");
    }
  };

  const handleEditEvent = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${config.API_BASE_URL}/api/chapters/${chapterId}/events/${eventData._id}`,
        eventData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Event updated:", response.data);

      // Clear form and close modal
      setEventData({
        title: "",
        description: "",
        purpose: "",
        date: "",
        time: "",
        endTime: "",
        venue: "",
        entryFee: 0,
        totalSeats: 0,
        availableSeats: 0,
        image: "",
      });
      setShowEventForm(false);
      setIsEditingEvent(false);

      // Refresh chapter data
      const updatedChapter = await axios.get(
        `${config.API_BASE_URL}/api/chapters/${chapterId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChapter(updatedChapter.data);
    } catch (error) {
      console.error("❌ Error updating event:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
      alert("Failed to update event. Please try again.");
    }
  };

  const openEditEventForm = (event) => {
    setEventData({
      _id: event._id,
      title: event.title,
      description: event.description,
      purpose: event.purpose,
      date: event.date,
      time: event.time,
      endTime: event.endTime,
      venue: event.venue,
      entryFee: event.entryFee,
      totalSeats: event.totalSeats,
      availableSeats: event.availableSeats,
      image: event.image,
    });
    setIsEditingEvent(true);
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${config.API_BASE_URL}/api/chapters/${chapterId}/events/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresh chapter data
      const updatedChapter = await axios.get(
        `${config.API_BASE_URL}/api/chapters/${chapterId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChapter(updatedChapter.data);
    } catch (error) {
      console.error("❌ Error deleting event:", error);
      alert("Failed to delete event. Please try again.");
    }
  };

  const handleBookEvent = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${config.API_BASE_URL}/api/chapters/${chapterId}/events/${selectedEvent._id}/book`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Event booked:", response.data);

      // Close confirmation modal
      setShowBookingConfirmation(false);
      setSelectedEvent(null);

      // Refresh chapter data
      const updatedChapter = await axios.get(
        `${config.API_BASE_URL}/api/chapters/${chapterId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChapter(updatedChapter.data);
    } catch (error) {
      console.error("❌ Error booking event:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        alert(
          error.response.data.message ||
            "Failed to book event. Please try again."
        );
      } else {
        alert("Failed to book event. Please try again.");
      }
    }
  };

  const openBookingConfirmation = (event) => {
    setSelectedEvent(event);
    setShowBookingConfirmation(true);
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
              <nav className="flex flex-col lg:flex-row lg:space-x-8 lg:justify-between">
                <div className="grid grid-cols-2 lg:flex lg:flex-nowrap lg:space-x-8 gap-1 lg:gap-0 w-full lg:w-auto">
                  <button
                    onClick={() => setActiveTab("activity")}
                    className={`py-2.5 lg:py-4 px-2 lg:px-1 border-b-2 font-medium flex items-center justify-center lg:justify-start gap-1.5 lg:gap-2 text-sm lg:text-base ${
                      activeTab === "activity"
                        ? "text-blue-600 border-blue-500"
                        : "text-gray-600 hover:text-blue-500"
                    }`}
                  >
                    <FiFileText className="text-base lg:text-lg" /> Activity
                  </button>
                  <button
                    onClick={() => setActiveTab("members")}
                    className={`py-2.5 lg:py-4 px-2 lg:px-1 border-b-2 font-medium flex items-center justify-center lg:justify-start gap-1.5 lg:gap-2 text-sm lg:text-base ${
                      activeTab === "members"
                        ? "text-blue-600 border-blue-500"
                        : "text-gray-600 hover:text-blue-500"
                    }`}
                  >
                    <FiUsers className="text-base lg:text-lg" /> Members
                  </button>
                  <button
                    onClick={() => setActiveTab("meetings")}
                    className={`py-2.5 lg:py-4 px-2 lg:px-1 border-b-2 font-medium flex items-center justify-center lg:justify-start gap-1.5 lg:gap-2 text-sm lg:text-base ${
                      activeTab === "meetings"
                        ? "text-blue-600 border-blue-500"
                        : "text-gray-600 hover:text-blue-500"
                    }`}
                  >
                    <FiCalendar className="text-base lg:text-lg" /> Meetings
                  </button>
                  <button
                    onClick={() => setActiveTab("events")}
                    className={`py-2.5 lg:py-4 px-2 lg:px-1 border-b-2 font-medium flex items-center justify-center lg:justify-start gap-1.5 lg:gap-2 text-sm lg:text-base ${
                      activeTab === "events"
                        ? "text-blue-600 border-blue-500"
                        : "text-gray-600 hover:text-blue-500"
                    }`}
                  >
                    <FiCalendar className="text-base lg:text-lg" /> Events
                  </button>
                </div>
                <div className="mt-3 lg:mt-0 flex justify-center lg:justify-end w-full lg:w-auto">
                  {activeTab === "meetings" && isCreator && (
                    <span
                      onClick={() => setShowMeetingForm(true)}
                      className="relative right-0 bg-purple-100/50 px-3 lg:px-4 py-2 ml-auto m-2 lg:m-3 rounded-lg flex items-center justify-center lg:justify-start w-full lg:w-auto gap-1.5 lg:gap-2 cursor-pointer hover:bg-purple-200 transition text-sm lg:text-base"
                    >
                      <FiPlus className="text-base lg:text-lg" /> Schedule
                      Meeting
                    </span>
                  )}
                  {activeTab === "activity" && (
                    <span
                      onClick={() => setShowPostForm(true)}
                      className="relative right-0 bg-purple-100/50 px-3 lg:px-4 py-2 ml-auto m-2 lg:m-3 rounded-lg flex items-center justify-center lg:justify-start w-full lg:w-auto gap-1.5 lg:gap-2 cursor-pointer hover:bg-purple-200 transition text-sm lg:text-base"
                    >
                      <FiPlus className="text-base lg:text-lg" /> Add Post
                    </span>
                  )}
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

            {/* Meeting Form Modal */}
            {showMeetingForm && (
              <div
                className="fixed inset-0 bg-black/20 z-20 flex items-center justify-center"
                onClick={() => setShowMeetingForm(false)}
              >
                <div
                  className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-semibold text-blue-600">
                    Schedule New Meeting
                  </h3>

                  <input
                    type="text"
                    placeholder="Meeting Title"
                    value={meetingData.title}
                    onChange={(e) =>
                      setMeetingData({ ...meetingData, title: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-500"
                  />

                  <textarea
                    rows={3}
                    placeholder="Meeting Description"
                    value={meetingData.description}
                    onChange={(e) =>
                      setMeetingData({
                        ...meetingData,
                        description: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-500"
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <input
                        type="date"
                        value={meetingData.date}
                        onChange={(e) =>
                          setMeetingData({
                            ...meetingData,
                            date: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="time"
                        value={meetingData.time}
                        onChange={(e) =>
                          setMeetingData({
                            ...meetingData,
                            time: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="time"
                        value={meetingData.endTime}
                        onChange={(e) =>
                          setMeetingData({
                            ...meetingData,
                            endTime: e.target.value,
                          })
                        }
                        placeholder="End Time"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="online"
                        checked={meetingData.meetingType === "online"}
                        onChange={(e) =>
                          setMeetingData({
                            ...meetingData,
                            meetingType: e.target.value,
                          })
                        }
                      />
                      Online
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="offline"
                        checked={meetingData.meetingType === "offline"}
                        onChange={(e) =>
                          setMeetingData({
                            ...meetingData,
                            meetingType: e.target.value,
                          })
                        }
                      />
                      Offline
                    </label>
                  </div>

                  {meetingData.meetingType === "online" ? (
                    <input
                      type="text"
                      placeholder="Meeting Link (e.g., Zoom, Google Meet)"
                      value={meetingData.meetingLink}
                      onChange={(e) =>
                        setMeetingData({
                          ...meetingData,
                          meetingLink: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-500"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="Meeting Location"
                      value={meetingData.location}
                      onChange={(e) =>
                        setMeetingData({
                          ...meetingData,
                          location: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-500"
                    />
                  )}

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowMeetingForm(false)}
                      className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateMeeting}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Schedule
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Meetings Tab Content */}
            {activeTab === "meetings" && (
              <div className="grid grid-cols-1 gap-6">
                {chapter?.meetings?.length > 0 ? (
                  chapter.meetings.map((meeting) => {
                    console.log("Rendering meeting:", meeting); // Debug log
                    const statusInfo = getStatusInfo(meeting.status);
                    const canJoinMeeting =
                      meeting.meetingType === "online" &&
                      meeting.status === "ongoing";
                    const isAttending =
                      meeting.meetingType === "online" &&
                      meeting.status === "ongoing" &&
                      meetingAttendance[meeting._id]?.some(
                        (a) => a.user._id === localStorage.getItem("userId")
                      );

                    return (
                      <div
                        key={meeting._id}
                        className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6 transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-semibold text-gray-800">
                                {meeting.title}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${statusInfo.color}`}
                              >
                                {statusInfo.icon}
                                {statusInfo.label}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-4">
                              {meeting.description}
                            </p>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-600">
                                <FiCalendar className="text-blue-600" />
                                <span>
                                  {new Date(meeting.date).toLocaleDateString()}{" "}
                                  from {meeting.time} to{" "}
                                  {meeting.endTime || "No end time set"}
                                </span>
                              </div>

                              {meeting.meetingType === "online" ? (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <FiVideo className="text-blue-600" />
                                  {canJoinMeeting ? (
                                    <div className="flex items-center gap-2">
                                      <a
                                        href={meeting.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                      >
                                        {meeting.meetingLink}
                                      </a>
                                      {!isAttending && (
                                        <button
                                          onClick={() =>
                                            handleMeetingAction(
                                              meeting._id,
                                              "join"
                                            )
                                          }
                                          className="ml-2 px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                        >
                                          Mark Attendance
                                        </button>
                                      )}
                                      {isAttending && (
                                        <button
                                          onClick={() =>
                                            handleMeetingAction(
                                              meeting._id,
                                              "leave"
                                            )
                                          }
                                          className="ml-2 px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                        >
                                          Leave Meeting
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-500 italic">
                                      {meeting.status === "upcoming"
                                        ? "Join link will be available when meeting starts"
                                        : meeting.status === "completed"
                                        ? "Meeting has ended"
                                        : "Meeting is cancelled"}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <FiMapPin className="text-blue-600" />
                                  <span>{meeting.location}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {isCreator && (
                            <button
                              onClick={() => handleDeleteMeeting(meeting._id)}
                              className="p-2 text-red-600 hover:bg-red-100/50 rounded-lg transition-colors"
                              title="Delete Meeting"
                            >
                              <FiTrash className="text-lg" />
                            </button>
                          )}
                        </div>

                        {/* Add attendance section for completed meetings */}
                        {meeting.status === "completed" && (
                          <div className="mt-4 pt-4 border-t border-white/20">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-lg font-semibold text-gray-800">
                                Meeting Attendance
                              </h4>
                              <div className="flex gap-2">
                                {!loadedAttendanceMeetings.has(meeting._id) &&
                                  !loadingAttendance[meeting._id] && (
                                    <button
                                      onClick={() => {
                                        console.log(
                                          "View Attendance clicked for meeting:",
                                          meeting._id
                                        );
                                        console.log(
                                          "Current loaded meetings:",
                                          Array.from(loadedAttendanceMeetings)
                                        );
                                        fetchMeetingAttendance(meeting._id);
                                      }}
                                      className="px-4 py-2 bg-purple-100/50 hover:bg-purple-200/50 text-purple-600 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                      <FiUsers className="text-lg" /> View
                                      Attendance
                                    </button>
                                  )}
                                {loadedAttendanceMeetings.has(meeting._id) && (
                                  <button
                                    onClick={() => {
                                      setHiddenAttendanceMeetings((prev) => {
                                        const newSet = new Set(prev);
                                        if (newSet.has(meeting._id)) {
                                          newSet.delete(meeting._id);
                                        } else {
                                          newSet.add(meeting._id);
                                        }
                                        return newSet;
                                      });
                                    }}
                                    className="px-4 py-2 bg-blue-100/50 hover:bg-blue-200/50 text-blue-600 rounded-lg transition-colors flex items-center gap-2"
                                  >
                                    {hiddenAttendanceMeetings.has(
                                      meeting._id
                                    ) ? (
                                      <>
                                        <FiUsers className="text-lg" /> Show
                                        Attendance
                                      </>
                                    ) : (
                                      <>
                                        <FiX className="text-lg" /> Hide
                                        Attendance
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>

                            {loadingAttendance[meeting._id] ? (
                              <div className="text-center py-4 bg-white/50 rounded-lg">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-2 text-gray-600">
                                  Loading attendance data...
                                </p>
                              </div>
                            ) : loadedAttendanceMeetings.has(meeting._id) &&
                              !hiddenAttendanceMeetings.has(meeting._id) ? (
                              <div className="space-y-4">
                                {/* Overall Attendance Rate */}
                                <div className="bg-white/50 p-4 rounded-lg flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="text-center">
                                      <div className="text-3xl font-bold text-blue-600">
                                        {(() => {
                                          const attendance =
                                            meetingAttendance[meeting._id];
                                          console.log(
                                            "Current attendance data:",
                                            attendance
                                          );
                                          console.log(
                                            "Chapter members:",
                                            chapterMembers
                                          );

                                          if (!Array.isArray(attendance)) {
                                            console.log(
                                              "Attendance is not an array"
                                            );
                                            return "0%";
                                          }

                                          const presentCount =
                                            attendance.filter(
                                              (a) =>
                                                a.status === "present" ||
                                                a.status === "late"
                                            ).length;
                                          const rate = Math.round(
                                            (presentCount /
                                              chapterMembers.length) *
                                              100
                                          );
                                          console.log(
                                            "Present count:",
                                            presentCount
                                          );
                                          console.log("Attendance rate:", rate);
                                          return `${rate}%`;
                                        })()}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        Attendance Rate
                                      </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {(() => {
                                        const attendance =
                                          meetingAttendance[meeting._id];
                                        if (!Array.isArray(attendance)) {
                                          return `0 of ${chapterMembers.length} members attended`;
                                        }
                                        const presentCount = attendance.filter(
                                          (a) =>
                                            a.status === "present" ||
                                            a.status === "late"
                                        ).length;
                                        return `${presentCount} of ${chapterMembers.length} members attended`;
                                      })()}
                                    </div>
                                  </div>
                                </div>

                                {/* Attendance Statistics */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white/50 rounded-lg">
                                  <div className="text-center p-3 bg-green-100 rounded-lg">
                                    <div className="text-2xl font-bold text-green-800">
                                      {(() => {
                                        const attendance =
                                          meetingAttendance[meeting._id];
                                        if (!Array.isArray(attendance))
                                          return 0;
                                        return attendance.filter(
                                          (a) => a.status === "present"
                                        ).length;
                                      })()}
                                    </div>
                                    <div className="text-sm text-green-600">
                                      Present
                                    </div>
                                  </div>
                                  <div className="text-center p-3 bg-yellow-100 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-800">
                                      {(() => {
                                        const attendance =
                                          meetingAttendance[meeting._id];
                                        if (!Array.isArray(attendance))
                                          return 0;
                                        return attendance.filter(
                                          (a) => a.status === "late"
                                        ).length;
                                      })()}
                                    </div>
                                    <div className="text-sm text-yellow-600">
                                      Late
                                    </div>
                                  </div>
                                  <div className="text-center p-3 bg-orange-100 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-800">
                                      {(() => {
                                        const attendance =
                                          meetingAttendance[meeting._id];
                                        if (!Array.isArray(attendance))
                                          return 0;
                                        return attendance.filter(
                                          (a) => a.status === "left_early"
                                        ).length;
                                      })()}
                                    </div>
                                    <div className="text-sm text-orange-600">
                                      Left Early
                                    </div>
                                  </div>
                                  <div className="text-center p-3 bg-red-100 rounded-lg">
                                    <div className="text-2xl font-bold text-red-800">
                                      {(() => {
                                        const attendance =
                                          meetingAttendance[meeting._id];
                                        if (!Array.isArray(attendance))
                                          return chapterMembers.length;
                                        const presentCount = attendance.filter(
                                          (a) =>
                                            a.status === "present" ||
                                            a.status === "late"
                                        ).length;
                                        return (
                                          chapterMembers.length - presentCount
                                        );
                                      })()}
                                    </div>
                                    <div className="text-sm text-red-600">
                                      Absent
                                    </div>
                                  </div>
                                </div>

                                {/* Attendee Details */}
                                <div className="mt-6">
                                  <h5 className="font-medium text-gray-700 mb-3">
                                    Attendee Details
                                  </h5>
                                  <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {Array.isArray(
                                      meetingAttendance[meeting._id]
                                    ) ? (
                                      meetingAttendance[meeting._id].map(
                                        (record) => (
                                          <div
                                            key={record._id}
                                            className="flex items-center justify-between bg-white/50 p-3 rounded-lg hover:bg-white/70 transition-colors"
                                          >
                                            <div className="flex items-center gap-3">
                                              <img
                                                src={
                                                  record.user?.userImage ||
                                                  "/default-avatar.png"
                                                }
                                                alt={
                                                  record.user?.userName ||
                                                  "User"
                                                }
                                                className="w-10 h-10 rounded-full border-2 border-white object-cover"
                                              />
                                              <div>
                                                <div
                                                  onClick={() =>
                                                    record.user?._id &&
                                                    navigate(
                                                      `/userProfile/${record.user._id}`
                                                    )
                                                  }
                                                  className="h2 d-block text-xl font-medium text-gray-800 mb-2 p-1 relative cursor-pointer after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-gray-400 after:transition-all after:duration-300 hover:after:w-full rounded-full"
                                                >
                                                  {record.user?.userName ||
                                                    "Unknown User"}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                  Joined:{" "}
                                                  {record.joinTime
                                                    ? new Date(
                                                        record.joinTime
                                                      ).toLocaleTimeString()
                                                    : "N/A"}
                                                  {record.leaveTime &&
                                                    ` - Left: ${new Date(
                                                      record.leaveTime
                                                    ).toLocaleTimeString()}`}
                                                </div>
                                              </div>
                                            </div>
                                            <span
                                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                record.status === "present"
                                                  ? "bg-green-100 text-green-800"
                                                  : record.status === "late"
                                                  ? "bg-yellow-100 text-yellow-800"
                                                  : record.status ===
                                                    "left_early"
                                                  ? "bg-orange-100 text-orange-800"
                                                  : "bg-red-100 text-red-800"
                                              }`}
                                            >
                                              {record.status
                                                ? record.status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                  record.status.slice(1)
                                                : "Unknown"}
                                            </span>
                                          </div>
                                        )
                                      )
                                    ) : (
                                      <div className="text-center py-4 text-gray-600">
                                        No attendance records available
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-600">
                    No meetings scheduled yet.
                    {isCreator && (
                      <div className="mt-4">
                        <button
                          onClick={() => setShowMeetingForm(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <FiPlus /> Schedule First Meeting
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

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
                    Current Members ({chapter?.members?.length || 0})
                  </button>
                  {isCreator && (
                    <button
                      onClick={() => setActiveMemberTab("requests")}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                        activeMemberTab === "requests"
                          ? "bg-blue-100/50 text-blue-600"
                          : "hover:bg-white/20 text-gray-600"
                      }`}
                    >
                      Join Requests ({chapter?.joinRequests?.length || 0})
                    </button>
                  )}
                </div>

                {/* Current Members Grid */}
                {activeMemberTab === "current" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {chapter?.members?.map((member) => (
                      <div
                        key={member._id}
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
                            onClick={() =>
                              navigate(`/userProfile/${member._id}`)
                            }
                            className="w-full mt-4 px-4 py-2 bg-blue-100/50 text-blue-600 rounded-lg hover:bg-blue-200/50 transition-colors"
                          >
                            View Member
                          </button>
                          {isCreator && (
                            <button
                              onClick={() => handleRemoveMember(member._id)}
                              className="w-full mt-4 px-4 py-2 bg-red-100/50 text-red-600 rounded-lg hover:bg-red-200/50 transition-colors"
                            >
                              Remove Member
                            </button>
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
                        key={request._id}
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
                              {request.userName}
                            </h3>
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FiMail className="text-blue-600" />{" "}
                                {request.userEmail}
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

            {/* Events Tab Content */}
            {activeTab === "events" && (
              <div className="grid grid-cols-1 gap-6">
                {chapter?.events && chapter.events.length > 0 ? (
                  chapter.events.map((event) => (
                    <div
                      key={event._id}
                      className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6 transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold text-gray-800">
                              {event.title}
                            </h3>
                            <span className="px-3 py-1 rounded-full text-sm bg-blue-100/50 text-blue-600">
                              {event.entryFee > 0
                                ? `₹${event.entryFee}`
                                : "Free Entry"}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-4">
                            {event.description}
                          </p>
                          <p className="text-gray-600 mb-4">
                            <strong>Purpose:</strong> {event.purpose}
                          </p>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <FiCalendar className="text-blue-600" />
                              <span>
                                {new Date(event.date).toLocaleDateString()} from{" "}
                                {event.time} to {event.endTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <FiMapPin className="text-blue-600" />
                              <span>{event.venue}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <FiUsers className="text-blue-600" />
                              <span>
                                {event.availableSeats} of {event.totalSeats}{" "}
                                seats available
                              </span>
                            </div>
                          </div>

                          {/* Book Button for Members */}
                          {!isCreator && (
                            <button
                              onClick={() => openBookingConfirmation(event)}
                              disabled={
                                event.availableSeats === 0 ||
                                event.bookings?.some(
                                  (booking) =>
                                    booking.user ===
                                    localStorage.getItem("userId")
                                ) ||
                                new Date(event.date) <=
                                  new Date(Date.now() + 24 * 60 * 60 * 1000)
                              }
                              className={`mt-4 px-4 py-2 rounded-lg ${
                                event.availableSeats > 0 &&
                                !event.bookings?.some(
                                  (booking) =>
                                    booking.user ===
                                    localStorage.getItem("userId")
                                ) &&
                                new Date(event.date) >
                                  new Date(Date.now() + 24 * 60 * 60 * 1000)
                                  ? "bg-blue-600 text-white hover:bg-blue-700"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              } transition-colors`}
                            >
                              {event.bookings?.some(
                                (booking) =>
                                  booking.user ===
                                  localStorage.getItem("userId")
                              )
                                ? "Already Booked"
                                : event.availableSeats === 0
                                ? "No Seats Available"
                                : new Date(event.date) <=
                                  new Date(Date.now() + 24 * 60 * 60 * 1000)
                                ? "Booking Closed"
                                : "Book Seat"}
                            </button>
                          )}

                          {/* Booking Details for Chapter Creator */}
                          {isCreator &&
                            event.bookings &&
                            event.bookings.length > 0 && (
                              <div className="mt-6 pt-6 border-t border-white/20">
                                <div className="flex justify-between items-center mb-4">
                                  <h4 className="text-lg font-semibold text-gray-800">
                                    Booking Details
                                  </h4>
                                  <button
                                    onClick={() => {
                                      setExpandedBookingDetails((prev) => {
                                        const newSet = new Set(prev);
                                        if (newSet.has(event._id)) {
                                          newSet.delete(event._id);
                                        } else {
                                          newSet.add(event._id);
                                        }
                                        return newSet;
                                      });
                                    }}
                                    className="px-4 py-2 bg-blue-100/50 hover:bg-blue-200/50 text-blue-600 rounded-lg transition-colors flex items-center gap-2"
                                  >
                                    {expandedBookingDetails.has(event._id) ? (
                                      <>
                                        <FiX className="text-lg" /> Hide Details
                                      </>
                                    ) : (
                                      <>
                                        <FiUsers className="text-lg" /> Show
                                        Details
                                      </>
                                    )}
                                  </button>
                                </div>
                                {expandedBookingDetails.has(event._id) && (
                                  <div className="space-y-4">
                                    {/* Booking Statistics */}
                                    <div className="grid grid-cols-3 gap-4">
                                      <div className="bg-white/50 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                          {event.bookings.length}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          Total Bookings
                                        </div>
                                      </div>
                                      <div className="bg-white/50 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                          {
                                            event.bookings.filter(
                                              (b) =>
                                                b.paymentStatus === "completed"
                                            ).length
                                          }
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          Completed Bookings
                                        </div>
                                      </div>
                                      <div className="bg-white/50 p-4 rounded-lg text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                          ₹
                                          {event.bookings.reduce(
                                            (total, booking) => {
                                              if (
                                                booking.paymentStatus ===
                                                "completed"
                                              ) {
                                                return (
                                                  total + (event.entryFee || 0)
                                                );
                                              }
                                              return total;
                                            },
                                            0
                                          )}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          Total Revenue
                                        </div>
                                      </div>
                                    </div>

                                    {/* Booked Members List */}
                                    <div className="mt-4">
                                      <h5 className="font-medium text-gray-700 mb-3">
                                        Booked Members
                                      </h5>
                                      <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {event.bookings.map((booking) => (
                                          <div
                                            key={booking._id}
                                            className="flex items-center justify-between bg-white/50 p-3 rounded-lg"
                                          >
                                            <div className="flex items-center gap-3">
                                              <img
                                                src={
                                                  booking.user?.userImage ||
                                                  "/default-avatar.png"
                                                }
                                                alt={
                                                  booking.user?.userName ||
                                                  "User"
                                                }
                                                className="w-10 h-10 rounded-full border-2 border-white object-cover"
                                              />
                                              <div>
                                                <div
                                                  onClick={() =>
                                                    booking.user?._id &&
                                                    navigate(
                                                      `/userProfile/${booking.user._id}`
                                                    )
                                                  }
                                                  className="font-medium text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
                                                >
                                                  {booking.user?.userName ||
                                                    "Unknown User"}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                  {booking.user?.userEmail}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                  Booked on:{" "}
                                                  {new Date(
                                                    booking.bookingDate
                                                  ).toLocaleDateString()}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                Confirmed
                                              </span>
                                              {event.entryFee > 0 && (
                                                <div className="flex flex-col items-end">
                                                  <span className="text-sm font-medium text-gray-800">
                                                    ₹{event.entryFee}
                                                  </span>
                                                  <span className="text-xs text-gray-500">
                                                    {booking.paymentStatus ===
                                                    "completed"
                                                      ? "Paid"
                                                      : "Pending"}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                        </div>

                        {isCreator && (
                          <div className="flex gap-2">
                            {new Date(event.date) > new Date() && (
                              <button
                                onClick={() => openEditEventForm(event)}
                                className="p-2 text-blue-600 hover:bg-blue-100/50 rounded-lg transition-colors"
                                title="Edit Event"
                              >
                                <FiEdit className="text-lg" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteEvent(event._id)}
                              className="p-2 text-red-600 hover:bg-red-100/50 rounded-lg transition-colors"
                              title="Delete Event"
                            >
                              <FiTrash className="text-lg" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-600">
                    No events scheduled yet.
                    {isCreator && (
                      <div className="mt-4">
                        <button
                          onClick={() => setShowEventForm(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <FiPlus /> Create First Event
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Event Form Modal */}
            {showEventForm && (
              <div
                className="fixed inset-0 bg-black/20 z-20 flex items-center justify-center"
                onClick={() => {
                  setShowEventForm(false);
                  setIsEditingEvent(false);
                }}
              >
                <div
                  className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-semibold text-blue-600">
                    {isEditingEvent ? "Edit Event" : "Create New Event"}
                  </h3>

                  <input
                    type="text"
                    placeholder="Event Title"
                    value={eventData.title}
                    onChange={(e) =>
                      setEventData({ ...eventData, title: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-500"
                  />

                  <textarea
                    rows={3}
                    placeholder="Event Description"
                    value={eventData.description}
                    onChange={(e) =>
                      setEventData({
                        ...eventData,
                        description: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-500"
                  />

                  <textarea
                    rows={2}
                    placeholder="Event Purpose"
                    value={eventData.purpose}
                    onChange={(e) =>
                      setEventData({
                        ...eventData,
                        purpose: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-500"
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <input
                        type="date"
                        value={eventData.date}
                        onChange={(e) =>
                          setEventData({
                            ...eventData,
                            date: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="time"
                        value={eventData.time}
                        onChange={(e) =>
                          setEventData({
                            ...eventData,
                            time: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-1">
                      <input
                        type="time"
                        value={eventData.endTime}
                        onChange={(e) =>
                          setEventData({
                            ...eventData,
                            endTime: e.target.value,
                          })
                        }
                        placeholder="End Time"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Venue"
                    value={eventData.venue}
                    onChange={(e) =>
                      setEventData({
                        ...eventData,
                        venue: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-500"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        placeholder="Entry Fee (₹)"
                        value={eventData.entryFee}
                        onChange={(e) =>
                          setEventData({
                            ...eventData,
                            entryFee: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Total Seats"
                        value={eventData.totalSeats}
                        onChange={(e) =>
                          setEventData({
                            ...eventData,
                            totalSeats: parseInt(e.target.value) || 0,
                            availableSeats: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Event Image URL (optional)"
                    value={eventData.image}
                    onChange={(e) =>
                      setEventData({
                        ...eventData,
                        image: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-500"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowEventForm(false);
                        setIsEditingEvent(false);
                      }}
                      className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={
                        isEditingEvent ? handleEditEvent : handleCreateEvent
                      }
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {isEditingEvent ? "Update Event" : "Create Event"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Confirmation Modal */}
            {showBookingConfirmation && selectedEvent && (
              <div
                className="fixed inset-0 bg-black/20 z-20 flex items-center justify-center"
                onClick={() => {
                  setShowBookingConfirmation(false);
                  setSelectedEvent(null);
                }}
              >
                <div
                  className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-semibold text-blue-600">
                    Confirm Booking
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">
                        {selectedEvent.title}
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Date:</span>{" "}
                          {new Date(selectedEvent.date).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-medium">Time:</span>{" "}
                          {selectedEvent.time} - {selectedEvent.endTime}
                        </p>
                        <p>
                          <span className="font-medium">Venue:</span>{" "}
                          {selectedEvent.venue}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">Entry Fee:</span>
                        <span className="text-lg font-semibold text-gray-800">
                          ₹{selectedEvent.entryFee}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {selectedEvent.entryFee > 0
                          ? "The booking will be confirmed immediately."
                          : "This is a free event. No payment required."}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setShowBookingConfirmation(false);
                        setSelectedEvent(null);
                      }}
                      className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBookEvent}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupDashboard;
