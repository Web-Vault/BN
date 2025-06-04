import React, { useState } from "react";
import { FiMapPin, FiMail, FiPhone, FiBriefcase } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar.js";
import config from "../../config/config.js";

const AddBusinessInfo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    businessEmail: "",
    businessContactNumber: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/users/business/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/profile");
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Failed to add business information");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] px-3 lg:p-8">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-md p-6 border border-white/20">
          <h1 className="text-2xl font-semibold text-white mb-6">
            Add Business Information
          </h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-400 text-white placeholder-white/60"
                    required
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
                    value={formData.location}
                    onChange={handleChange}
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
                    value={formData.businessEmail}
                    onChange={handleChange}
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
                    value={formData.businessContactNumber}
                    onChange={handleChange}
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
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  maxLength={300}
                  className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-400 text-white placeholder-white/60"
                  required
                ></textarea>
                <div className="flex justify-between items-center mt-1">
                  <p className={`text-sm ${formData.bio.length >= 280 ? 'text-red-400' : 'text-white/60'}`}>
                    {formData.bio.length}/300 characters
                  </p>
                  {formData.bio.length >= 280 && (
                    <p className="text-sm text-red-400">
                      {300 - formData.bio.length} characters remaining
                    </p>
                  )}
                </div>
              </div>
            </div>

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
                Save Business Information
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBusinessInfo; 