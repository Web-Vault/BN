import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FiBookmark,
  FiInfo,
  FiArrowRight,
  FiUser,
  FiTag,
  FiMapPin,
  FiMail,
  FiGlobe,
} from "react-icons/fi";
import Navbar from "../../components/Navbar.js";
import config from "../../config/config.js";

const CreateChapter = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    chapterName: "",
    chapterDesc: "",
    chapterTech: "",
    chapterRegion: "",
    chapterCity: "",
    chapterLocation: "",
    chapterWebsite: "",
    chapterEmail: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [similarChapters, setSimilarChapters] = useState([]);
  const [showSimilarDialog, setShowSimilarDialog] = useState(false);
  const [confirmSimilarTech, setConfirmSimilarTech] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userID = localStorage.getItem("userId");
        const token = localStorage.getItem("token");

        if (!userID || !token) {
          console.warn(
            "User ID or token not found in localStorage. Cannot fetch user data."
          );
          // Optionally redirect to login if necessary
          // navigate('/login');
          return;
        }

        // console.log("Fetching user data for ID:", userID);

        const response = await axios.get(
          `${config.API_BASE_URL}/api/users/${userID}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // console.log("User data received:", response.data);

        let userData = null;

        // Check for nested user object (e.g., from getUserProfile or login response structure)
        if (response.data && response.data.user) {
          userData = response.data.user;
        } else if (response.data) {
          // Assume the response is the user object directly
          userData = response.data;
        }

        if (userData && (userData.userName || userData.name)) {
          setCurrentUser(userData);
          // console.log("Current user state set:", userData);
        } else {
          console.error(
            "API response did not contain valid user data:",
            response.data
          );
          toast.error("Failed to fetch user data: Invalid data format");
          setCurrentUser(null); // Ensure currentUser is null if data is invalid
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to fetch user data");
        setCurrentUser(null); // Ensure currentUser is null on error
      }
    };

    fetchCurrentUser();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.chapterName.trim()) {
      newErrors.chapterName = "Chapter name is required";
    }
    if (formData.chapterName.length > 50) {
      newErrors.chapterName = "Chapter name must be less than 50 characters";
    }
    if (!formData.chapterDesc.trim()) {
      newErrors.chapterDesc = "Chapter description is required";
    }
    if (formData.chapterDesc.length > 500) {
      newErrors.chapterDesc = "Description must be less than 500 characters";
    }
    if (!formData.chapterTech.trim()) {
      newErrors.chapterTech = "Chapter technology is required";
    }
    if (!formData.chapterRegion.trim()) {
      newErrors.chapterRegion = "Region is required";
    }
    if (!formData.chapterCity.trim()) {
      newErrors.chapterCity = "City is required";
    }
    if (!formData.chapterLocation.trim()) {
      newErrors.chapterLocation = "Chapter location is required";
    }
    if (
      formData.chapterEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.chapterEmail)
    ) {
      newErrors.chapterEmail = "Invalid email format";
    }
    if (
      formData.chapterWebsite &&
      !/^https?:\/\/.+/.test(formData.chapterWebsite)
    ) {
      newErrors.chapterWebsite = "Invalid website URL";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      // First check if a chapter with same region and technology exists
      const checkResponse = await axios.get(
        `${config.API_BASE_URL}/api/chapters/check-exists`,
        {
          params: {
            region: formData.chapterRegion,
            tech: formData.chapterTech
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (checkResponse.data.similar) {
        setSimilarChapters(checkResponse.data.chapters);
        setShowSimilarDialog(true);
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${config.API_BASE_URL}/api/chapters/create`,
        {
          ...formData,
          confirmSimilarTech
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Chapter created successfully!");
      navigate(`/chapterDashboard/${response.data._id}`);
    } catch (error) {
      console.error("Error creating chapter:", error);
      if (error.response?.data?.similar) {
        setSimilarChapters(error.response.data.chapters);
        setShowSimilarDialog(true);
      } else {
        toast.error(error.response?.data?.message || "Failed to create chapter");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSimilar = async () => {
    setConfirmSimilarTech(true);
    setShowSimilarDialog(false);
    // Retry the submission
    await handleSubmit(new Event('submit'));
  };

  const handleCancelSimilar = () => {
    setShowSimilarDialog(false);
    setConfirmSimilarTech(false);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] p-3 lg:p-8 flex items-center justify-center">
        <div className="max-w-4xl w-full bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-blue-100/50 rounded-full mb-4">
              <FiBookmark className="text-3xl text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Create New Chapter
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm">
              Start a new chapter to connect with like-minded professionals and
              grow your network
            </p>
          </div>

          {/* Creator Info & Guidelines Section */}
          {currentUser && (
            <div className="mb-8 p-6 bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Creator Info */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100/50 rounded-lg">
                  <FiUser className="text-xl text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Creator
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {currentUser.userName || currentUser.name || "N/A"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {currentUser.userEmail || currentUser.email || "N/A"}
                  </p>
                </div>
              </div>
              {/* Guidelines */}
              <div>
                <h4 className="text-gray-800 text-sm font-medium mb-3">
                  Guidelines
                </h4>
                <ul className="text-gray-600 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <FiInfo className="text-blue-600 mt-1 flex-shrink-0" />
                    <span>Keep name under 50 characters.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiInfo className="text-blue-600 mt-1 flex-shrink-0" />
                    <span>Provide a clear description (max 500 chars).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiInfo className="text-blue-600 mt-1 flex-shrink-0" />
                    <span>Specify the main technology focus.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiInfo className="text-blue-600 mt-1 flex-shrink-0" />
                    <span>Add location for members.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="p-6 bg-white/30 backdrop-blur-lg rounded-xl border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
              Chapter Details
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Chapter Name */}
              <div>
                <label
                  className="block text-gray-800 text-sm font-medium mb-2"
                  htmlFor="chapterName"
                >
                  Chapter Name
                </label>
                <div className="relative">
                  <FiBookmark className="absolute left-3 top-3.5 text-gray-500" />
                  <input
                    type="text"
                    id="chapterName"
                    name="chapterName"
                    value={formData.chapterName}
                    onChange={handleChange}
                    placeholder="Enter chapter name"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-500"
                    required
                  />
                </div>
                {errors.chapterName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.chapterName}
                  </p>
                )}
              </div>

              {/* Chapter Technology */}
              <div>
                <label
                  className="block text-gray-800 text-sm font-medium mb-2"
                  htmlFor="chapterTech"
                >
                  Chapter Technology
                </label>
                <div className="relative">
                  <FiTag className="absolute left-3 top-3.5 text-gray-500" />
                  <input
                    type="text"
                    id="chapterTech"
                    name="chapterTech"
                    value={formData.chapterTech}
                    onChange={handleChange}
                    placeholder="e.g., React, Node.js, Python"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-500"
                    required
                  />
                </div>
                {errors.chapterTech && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.chapterTech}
                  </p>
                )}
              </div>

              {/* Chapter Region */}
              <div>
                <label
                  className="block text-gray-800 text-sm font-medium mb-2"
                  htmlFor="chapterRegion"
                >
                  Region (State)
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-3.5 text-gray-500" />
                  <input
                    type="text"
                    id="chapterRegion"
                    name="chapterRegion"
                    value={formData.chapterRegion}
                    onChange={handleChange}
                    placeholder="Enter region/state"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-500"
                    required
                  />
                </div>
                {errors.chapterRegion && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.chapterRegion}
                  </p>
                )}
              </div>

              {/* Chapter City */}
              <div>
                <label
                  className="block text-gray-800 text-sm font-medium mb-2"
                  htmlFor="chapterCity"
                >
                  City
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-3.5 text-gray-500" />
                  <input
                    type="text"
                    id="chapterCity"
                    name="chapterCity"
                    value={formData.chapterCity}
                    onChange={handleChange}
                    placeholder="Enter city"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-500"
                    required
                  />
                </div>
                {errors.chapterCity && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.chapterCity}
                  </p>
                )}
              </div>

              {/* Chapter Location */}
              <div>
                <label
                  className="block text-gray-800 text-sm font-medium mb-2"
                  htmlFor="chapterLocation"
                >
                  Chapter Location
                </label>
                <div className="relative">
                  <FiMapPin className="absolute left-3 top-3.5 text-gray-500" />
                  <input
                    type="text"
                    id="chapterLocation"
                    name="chapterLocation"
                    value={formData.chapterLocation}
                    onChange={handleChange}
                    placeholder="Enter chapter location"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-500"
                    required
                  />
                </div>
                {errors.chapterLocation && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.chapterLocation}
                  </p>
                )}
              </div>

              {/* Chapter Email */}
              <div>
                <label
                  className="block text-gray-800 text-sm font-medium mb-2"
                  htmlFor="chapterEmail"
                >
                  Chapter Email (Optional)
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3.5 text-gray-500" />
                  <input
                    type="email"
                    id="chapterEmail"
                    name="chapterEmail"
                    value={formData.chapterEmail}
                    onChange={handleChange}
                    placeholder="Enter chapter email"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-500"
                  />
                </div>
                {errors.chapterEmail && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.chapterEmail}
                  </p>
                )}
              </div>

              {/* Chapter Website */}
              <div>
                <label
                  className="block text-gray-800 text-sm font-medium mb-2"
                  htmlFor="chapterWebsite"
                >
                  Chapter Website (Optional)
                </label>
                <div className="relative">
                  <FiGlobe className="absolute left-3 top-3.5 text-gray-500" />
                  <input
                    type="url"
                    id="chapterWebsite"
                    name="chapterWebsite"
                    value={formData.chapterWebsite}
                    onChange={handleChange}
                    placeholder="Enter chapter website URL"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-500"
                  />
                </div>
                {errors.chapterWebsite && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.chapterWebsite}
                  </p>
                )}
              </div>

              {/* Chapter Description */}
              <div>
                <label
                  className="block text-gray-800 text-sm font-medium mb-2"
                  htmlFor="chapterDesc"
                >
                  Chapter Description
                </label>
                <div className="relative">
                  <textarea
                    id="chapterDesc"
                    name="chapterDesc"
                    value={formData.chapterDesc}
                    onChange={handleChange}
                    placeholder="Describe the purpose and goals of your chapter"
                    rows={4}
                    className="w-full px-4 py-2.5 bg-white/50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder-gray-500"
                    required
                  />
                  <div className="flex justify-between items-center mt-1 text-gray-500 text-sm">
                    <p>{formData.chapterDesc.length}/500 characters</p>
                    {formData.chapterDesc.length >= 480 && (
                      <p className="text-red-500">
                        {500 - formData.chapterDesc.length} characters remaining
                      </p>
                    )}
                  </div>
                </div>
                {errors.chapterDesc && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.chapterDesc}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2.5 rounded-lg text-white font-semibold transition-colors ${
                    loading
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-purple-500 hover:bg-purple-600"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {loading ? (
                      "Creating..."
                    ) : (
                      <>
                        Create Chapter
                        <FiArrowRight className="text-xl" />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Similar Technology Dialog */}
        {showSimilarDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Similar Technology Found
              </h3>
              <p className="text-gray-600 mb-4">
                We found {similarChapters.length} chapter(s) in {formData.chapterRegion} with similar technology:
              </p>
              <div className="space-y-3 mb-6">
                {similarChapters.map((chapter, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <p className="font-medium text-gray-800">{chapter.name}</p>
                    <p className="text-sm text-gray-600">Technology: {chapter.tech}</p>
                  </div>
                ))}
              </div>
              <p className="text-gray-600 mb-6">
                Is your technology different from these? If yes, you can proceed with creating your chapter.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCancelSimilar}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSimilar}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Yes, My Technology is Different
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CreateChapter;
