import React, { useState, useEffect } from "react";
import {
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiGlobe,
  FiBriefcase,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar.js";
import config from "../../config/config.js";

const EditProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    userName: "",
    industry: "",
    location: "",
    mobileNumber: "",
    bio: "",
    website: "",
    birthday: "",
    isMobileVerified: false
  });
  const [businessData, setBusinessData] = useState({
    name: "",
    bio: "",
    location: "",
    businessEmail: "",
    businessContactNumber: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${config.API_BASE_URL}/api/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();

        if (response.ok) {
          setUserData({
            userName: data.user.name || "",
            industry: data.user.industry || "",
            location: data.user.location || "",
            mobileNumber: data.user.mobileNumber || "",
            bio: data.user.bio || "",
            website: data.user.website || "",
            birthday: data.user.birthday || "",
            isMobileVerified: data.user.isMobileVerified || false
          });

          if (data.business) {
            setBusinessData({
              name: data.business.name || "",
              bio: data.business.bio || "",
              location: data.business.location || "",
              businessEmail: data.business.businessEmail || "",
              businessContactNumber: data.business.businessContactNumber || "",
            });
          }
        }
      } catch (error) {
        setError("Failed to fetch profile data");
      }
    };

    fetchProfile();
  }, []);

  const handleUserChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBusinessChange = (e) => {
    setBusinessData({
      ...businessData,
      [e.target.name]: e.target.value,
    });
  };

  const hasMobileNumberChanged = (newNumber) => {
    return newNumber !== userData.mobileNumber;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedUserData = {
        ...userData,
        isMobileVerified: hasMobileNumberChanged(userData.mobileNumber) ? false : userData.isMobileVerified
      };

      const userResponse = await fetch(
        `${config.API_BASE_URL}/api/users/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(updatedUserData),
        }
      );

      if (businessData.name) {
        const businessResponse = await fetch(
          `${config.API_BASE_URL}/api/users/business`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(businessData),
          }
        );

        if (!businessResponse.ok) {
          throw new Error("Failed to update business information");
        }
      }

      if (userResponse.ok) {
        if (hasMobileNumberChanged(userData.mobileNumber)) {
          navigate("/verify-mobile");
        } else {
          navigate("/profile");
        }
      } else {
        const data = await userResponse.json();
        setError(data.message);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] px-3 lg:p-8">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-md p-6 border border-white/20">
          <h1 className="text-2xl font-semibold text-white mb-6">
            Edit Profile
          </h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* User Profile Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <FiUser className="text-purple-400" /> Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3 text-white/60" />
                    <input
                      type="text"
                      name="userName"
                      value={userData.userName}
                      onChange={handleUserChange}
                      className="w-full pl-10 px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-400 text-white placeholder-white/60"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    Industry
                  </label>
                  <div className="relative">
                    <FiBriefcase className="absolute left-3 top-3 text-white/60" />
                    <input
                      type="text"
                      name="industry"
                      value={userData.industry}
                      onChange={handleUserChange}
                      className="w-full pl-10 px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-400 text-white placeholder-white/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-3 text-white/60" />
                    <input
                      type="text"
                      name="location"
                      value={userData.location}
                      onChange={handleUserChange}
                      className="w-full pl-10 px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-400 text-white placeholder-white/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-3 text-white/60" />
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={userData.mobileNumber}
                      onChange={handleUserChange}
                      className="w-full pl-10 px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-400 text-white placeholder-white/60"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {userData.isMobileVerified ? (
                      <div className="flex items-center gap-1 text-green-400 text-sm">
                        <FiCheck className="text-green-400" />
                        <span>Mobile number verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-400 text-sm">
                        <FiAlertCircle className="text-red-400" />
                        <span>Mobile number not verified</span>
                      </div>
                    )}
                  </div>
                  {hasMobileNumberChanged(userData.mobileNumber) && (
                    <div className="mt-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <FiAlertCircle className="text-yellow-400 mt-0.5 flex-shrink-0" />
                        <div className="text-yellow-400 text-sm">
                          <p className="font-medium">New mobile number requires verification</p>
                          <p className="mt-1 text-yellow-300/80">
                            After saving changes, you will be redirected to verify your new mobile number. 
                            Your account will use the new number only after successful verification.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    Birthday
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="birthday"
                      value={userData.birthday ? new Date(userData.birthday).toISOString().split('T')[0] : ''}
                      onChange={handleUserChange}
                      className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-400 text-white placeholder-white/60"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">Bio</label>
                <div className="relative">
                  <textarea
                    name="bio"
                    value={userData.bio}
                    onChange={handleUserChange}
                    rows="4"
                    maxLength={300}
                    className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-400 text-white placeholder-white/60"
                  ></textarea>
                  <div className="flex justify-between items-center mt-1">
                    <p className={`text-sm ${userData.bio.length >= 280 ? 'text-red-400' : 'text-white/60'}`}>
                      {userData.bio.length}/300 characters
                    </p>
                    {userData.bio.length >= 280 && (
                      <p className="text-sm text-red-400">
                        {300 - userData.bio.length} characters remaining
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Website
                </label>
                <div className="relative">
                  <FiGlobe className="absolute left-3 top-3 text-white/60" />
                  <input
                    type="url"
                    name="website"
                    value={userData.website}
                    onChange={handleUserChange}
                    className="w-full pl-10 px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-400 text-white placeholder-white/60"
                  />
                </div>
              </div>
            </div>

            {/* Business Information Section */}
            {businessData.name ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FiBriefcase className="text-purple-400" /> Business
                  Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">
                      Business Name
                    </label>
                    <div className="relative">
                      <FiBriefcase className="absolute left-3 top-3 text-white/60" />
                      <input
                        type="text"
                        name="name"
                        value={businessData.name}
                        onChange={handleBusinessChange}
                        className="w-full pl-10 px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-400 text-white placeholder-white/60"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm mb-2">
                      Business Location
                    </label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-3 text-white/60" />
                      <input
                        type="text"
                        name="location"
                        value={businessData.location}
                        onChange={handleBusinessChange}
                        className="w-full pl-10 px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-400 text-white placeholder-white/60"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm mb-2">
                      Business Email
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-3 text-white/60" />
                      <input
                        type="email"
                        name="businessEmail"
                        value={businessData.businessEmail}
                        onChange={handleBusinessChange}
                        className="w-full pl-10 px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-400 text-white placeholder-white/60"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm mb-2">
                      Business Contact Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-3 text-white/60" />
                      <input
                        type="tel"
                        name="businessContactNumber"
                        value={businessData.businessContactNumber}
                        onChange={handleBusinessChange}
                        className="w-full pl-10 px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-400 text-white placeholder-white/60"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    Business Description
                  </label>
                  <div className="relative">
                    <textarea
                      name="bio"
                      value={businessData.bio}
                      onChange={handleBusinessChange}
                      rows="4"
                      maxLength={300}
                      className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-400 text-white placeholder-white/60"
                      required
                    ></textarea>
                    <div className="flex justify-between items-center mt-1">
                      <p className={`text-sm ${businessData.bio.length >= 280 ? 'text-red-400' : 'text-white/60'}`}>
                        {businessData.bio.length}/300 characters
                      </p>
                      {businessData.bio.length >= 280 && (
                        <p className="text-sm text-red-400">
                          {300 - businessData.bio.length} characters remaining
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <FiBriefcase className="text-purple-400" /> Business
                  Information
                </h2>
                <div className="bg-white/10 p-6 rounded-lg border border-white/20">
                  <p className="text-white/80 mb-4">
                    You haven't added any business information yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/add-business-info")}
                    className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2"
                  >
                    <FiBriefcase /> Add Business Information
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="px-6 py-2 border border-white/30 rounded-lg text-white hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
