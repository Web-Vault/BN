import { useState, useEffect } from "react";
import {
  FiActivity,
  FiUser,
  FiPlus,
  FiStar,
  FiClock,
  FiCheckCircle,
  FiType,
  // FiUserCheck,
} from "react-icons/fi";
import Navbar from "../../components/Navbar";
import axios from "axios";

const ActivityPage = () => {
  const [activeTab, setActiveTab] = useState("system");
  const [userActivities, setUserActivities] = useState([]);
  const [showForm, setShowForm] = useState(false); // Toggle form visibility
  const [newActivity, setNewActivity] = useState({
    content: "",
    type: "Others",
    typeContent: "",
    date: "",
    rating: 0,
  });

  const [activities, setActivities] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/api/activity/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setActivities(response.data); // Set fetched activity logs
        console.log("activities: ", activities);
      } catch (err) {
        console.error("❌ Error fetching activities:", err);
        setError("Failed to load activity history");
      }
    };
    
    fetchActivities();
  }, [activities]);
  
  console.log("error: ",error);
  
  useEffect(() => {
    const fetchUserActivities = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/activity/userActivity",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserActivities(response.data);
        console.log("📥 User activities:", response.data);
      } catch (err) {
        console.error("❌ Error fetching user activities:", err);
      }
    };

    fetchUserActivities();
  }, []);

  // Handle adding new user activity
  const handleAddActivity = async () => {
    try {
      const token = localStorage.getItem("token");

      const payload = {
        content: newActivity.content,
        type: newActivity.type,
        typeContent: newActivity.typeContent,
        date: newActivity.date,
        rating: newActivity.rating,
      };

      const response = await axios.post(
        "http://localhost:5000/api/activity/userActivity",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update UI
      setShowForm(false);
      setNewActivity({
        content: "",
        type: "Others",
        typeContent: "",
        date: "",
        rating: 0,
      });

      setUserActivities((prev) => [response.data, ...prev]);
    } catch (err) {
      console.error("❌ Error submitting activity:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] p-3 lg:p-8">
        <div className="max-w-7xl mx-auto bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30">
          {/* Tabs Navigation */}
          <div className="border-b border-white/20">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("system")}
                className={`py-4 px-1 border-b-2 font-semibold flex items-center gap-2 ${
                  activeTab === "system"
                    ? "text-blue-600 border-blue-500"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                <FiActivity className="text-lg" /> System Activity
              </button>
              <button
                onClick={() => setActiveTab("user")}
                className={`py-4 px-1 border-b-2 font-semibold flex items-center gap-2 ${
                  activeTab === "user"
                    ? "text-blue-600 border-blue-500"
                    : "text-gray-600 hover:text-blue-500"
                }`}
              >
                <FiUser className="text-lg" /> User Activity
              </button>
            </nav>
          </div>

          {/* System Activity Tab */}
          {activeTab === "system" && (
            <div className="p-2 lg:p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2 text-blue-600">
                <FiActivity /> System Activities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activities.map((activity) => (
                  <div
                    key={activity._id}
                    className="bg-white/30 backdrop-blur-sm py-4 px-2 rounded-lg border border-white/20 hover:bg-white/50 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="pr-1 bg-blue-100/50 rounded-lg">
                        <FiCheckCircle className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-600 flex items-center gap-2">
                          <FiClock className="text-blue-600" />{" "}
                          {activity.createdAt}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Activity Tab */}
          {activeTab === "user" && (
            <div className="p-2 lg:p-8">
              <h2 className="py-4 text-2xl font-semibold mb-6 flex items-center gap-2 text-blue-600">
                <FiUser /> User Activities
              </h2>

              {/* Add Activity Button */}
              <div className="mb-8">
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
                >
                  <FiPlus /> {showForm ? "Hide Form" : "Add New Activity"}
                </button>
              </div>

              {/* Add Activity Form (Toggleable) */}
              {showForm && (
                <div
                  className="fixed inset-0 bg-black/10 z-10 pt-5"
                  onClick={() => setShowForm(false)}
                >
                  <div
                    className="mt-[25%] absolute w-full lg:w-max lg:mt-[110px] lg:top-1/2 lg:left-1/2 lg:-translate-x-[110%] lg:-translate-y-1/2 bg-white/80  p-6 rounded-xl border border-white/20 shadow-xl z-20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="space-y-4 w-full max-w-md">
                      <h3 className="text-lg font-semibold mb-2 text-blue-600">
                        Add New Activity
                      </h3>

                      <textarea
                        value={newActivity.content}
                        onChange={(e) =>
                          setNewActivity({
                            ...newActivity,
                            content: e.target.value,
                          })
                        }
                        placeholder={
                          newActivity.type === "Referral"
                            ? "Enter Referring info (e.g., User data, content, etc.)"
                            : "Enter activity details (e.g., Met user123 at my office)"
                        }
                        className="w-full p-3 rounded-lg border border-white/20 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />

                      <div className="flex items-center gap-4">
                        <label className="text-gray-600">Initiated By:</label>
                        <select
                          value={newActivity.type}
                          onChange={(e) =>
                            setNewActivity({
                              ...newActivity,
                              type: e.target.value,
                            })
                          }
                          className="p-2 rounded-lg border border-white/20 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Others">Others</option>
                          <option value="Referral">Referral</option>
                          <option value="One-To-One">One-to-One Meeting</option>
                        </select>
                      </div>

                      {(newActivity.type === "Referral" ||
                        newActivity.type === "One-To-One") && (
                        <input
                          type="text"
                          value={newActivity.typeContent}
                          onChange={(e) =>
                            setNewActivity({
                              ...newActivity,
                              typeContent: e.target.value,
                            })
                          }
                          placeholder={
                            newActivity.type === "Referral"
                              ? "Enter referred user"
                              : "Enter person you met"
                          }
                          className="w-full p-3 rounded-lg border border-white/20 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}

                      <input
                        type="date"
                        value={newActivity.date}
                        onChange={(e) =>
                          setNewActivity({
                            ...newActivity,
                            date: e.target.value,
                          })
                        }
                        className="w-full p-3 rounded-lg border border-white/20 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <div className="flex items-center gap-4">
                        <label className="text-gray-600">Rate Activity:</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() =>
                                setNewActivity({ ...newActivity, rating: star })
                              }
                              className={`p-1.5 rounded-lg ${
                                newActivity.rating >= star
                                  ? "bg-blue-100/80 text-blue-600"
                                  : "bg-white/90 text-gray-600"
                              }`}
                            >
                              <FiStar className="text-lg" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={handleAddActivity}
                        className="w-full px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                      >
                        Add Activity
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* User Activities List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="bg-white/30 backdrop-blur-sm p-4 rounded-lg border border-white/20 hover:bg-white/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">
                          {activity.content}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <FiClock className="text-blue-600" />{" "}
                          {activity.date?.slice(0, 10)}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <FiType className="text-blue-600" /> {activity.type}
                        </p>
                        {activity.typeContent && (
                          <p className="text-sm text-gray-600">
                            Related To: {activity.typeContent}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            className={`text-lg ${
                              activity.rating >= star
                                ? "text-blue-600"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ActivityPage;
