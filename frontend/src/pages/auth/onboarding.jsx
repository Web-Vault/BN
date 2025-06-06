import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logActivity from "../utility/logActivity.js";
import config from "../../config/config.js";

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    contactNumber: "",
    bio: "",
    location: "",
    industry: "",
    seeker: false,
    wantsBusiness: null,
    businessName: "",
    businessDescription: "",
    businessLocation: "",
    businessYear: "",
    businessPhone: "",
    businessEmail: "",
    referralCode: "",
    birthday: "",
    address: {
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  // const handleSubmit = () => {
    console.log("Final Data Submitted:", formData);
  //   localStorage.setItem("onboardingCompleted", "true");
  //   navigate("/profile");
  // };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");

      // Convert boolean values to 1
      const submitData = {
        ...formData,
        seeker: formData.seeker ? 1 : 0,
        wantsBusiness: formData.wantsBusiness ? 1 : 0,
        isAccountVerified: 1,
        isMobileVerified: 1,
        verificationFlag: 1,
        onboardingStatus: {
          isCompleted: true,
          completedSteps: [
            { step: 'profile', completedAt: new Date() },
            { step: 'verification', completedAt: new Date() },
            { step: 'preferences', completedAt: new Date() }
          ],
          lastUpdated: new Date()
        }
      };

      const response = await fetch(
        `${config.API_BASE_URL}/api/users/onboarding`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(submitData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Onboarding successful:", data);
        // localStorage.setItem("onBoardingCompleted", "true");

        await logActivity({
          activityType: "account",
          action: "Onboarding Completed.",
        });

        navigate("/profile");
      } else {
        console.error("❌ Error:", data.message);
      }
    } catch (error) {
      console.error("❌ Request failed:", error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-700">
      <div className="w-full lg:w-3/4 lg:h-[85vh] bg-white bg-opacity-20 backdrop-blur-lg shadow-xl rounded-lg lg:flex overflow-hidden">
        {/* Left Side - Form Section */}
        <div className="w-full p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-white mb-6">Onboarding</h2>

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="animate-fade-in">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-3 bg-white bg-opacity-30 border border-white rounded-lg mb-3 text-white placeholder-gray-200 focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="contactNumber"
                placeholder="Contact Number"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full p-3 bg-white bg-opacity-30 border border-white rounded-lg mb-3 text-white placeholder-gray-200 focus:ring-2 focus:ring-blue-400"
              />
              <span className="text-yellow-400 text-sm mb-5 mt-[-10px] block">Note: Your contact number will need to be verified after successful login.</span>
              <textarea
                name="bio"
                placeholder="Tell us about yourself"
                value={formData.bio}
                onChange={handleChange}
                className="w-full p-3 bg-white bg-opacity-30 border border-white rounded-lg mb-3 text-white placeholder-gray-200 focus:ring-2 focus:ring-blue-400"
              />
              <button
                className="bg-blue-600 text-white w-full py-3 rounded-lg hover:bg-blue-700"
                onClick={nextStep}
              >
                Next
              </button>
            </div>
          )}

          {/* Add new step for birthday after personal info */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-white mb-6">Tell us about yourself</h3>
              <input
                type="date"
                name="birthday"
                placeholder="Birthday"
                value={formData.birthday}
                onChange={handleChange}
                className="w-full p-3 bg-white bg-opacity-30 border border-white rounded-lg mb-3 text-white placeholder-gray-200 focus:ring-2 focus:ring-blue-400"
              />
              <div className="flex justify-between">
                <button
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg"
                  onClick={prevStep}
                >
                  Back
                </button>
                <button
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  onClick={nextStep}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Add new step for address after birthday */}
          {step === 3 && (
            <div className="animate-fade-in">
              <input
                type="text"
                name="address.city"
                placeholder="City"
                value={formData.address.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value },
                  })
                }
                className="w-full p-3 bg-white bg-opacity-30 border border-white rounded-lg mb-3 text-white placeholder-gray-200 focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="address.state"
                placeholder="State/Province"
                value={formData.address.state}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, state: e.target.value },
                  })
                }
                className="w-full p-3 bg-white bg-opacity-30 border border-white rounded-lg mb-3 text-white placeholder-gray-200 focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="address.country"
                placeholder="Country"
                value={formData.address.country}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, country: e.target.value },
                  })
                }
                className="w-full p-3 bg-white bg-opacity-30 border border-white rounded-lg mb-3 text-white placeholder-gray-200 focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                name="address.zipCode"
                placeholder="ZIP/Postal Code"
                value={formData.address.zipCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, zipCode: e.target.value },
                  })
                }
                className="w-full p-3 bg-white bg-opacity-30 border border-white rounded-lg mb-3 text-white placeholder-gray-200 focus:ring-2 focus:ring-blue-400"
              />
              <div className="flex justify-between">
                <button
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg"
                  onClick={prevStep}
                >
                  Back
                </button>
                <button
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  onClick={nextStep}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Referral Code */}
          {step === 4 && (
            <div className="animate-fade-in">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-2">
                  Have a referral code?
                </h3>
                <p className="text-white/70 mb-4">
                  Enter it below to get started with your referral benefits.
                </p>
                <input
                  type="text"
                  name="referralCode"
                  placeholder="Enter referral code (optional)"
                  value={formData.referralCode}
                  onChange={handleChange}
                  className="w-full p-3 bg-white bg-opacity-30 border border-white rounded-lg mb-3 text-white placeholder-gray-200 focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="flex justify-between">
                <button
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg"
                  onClick={prevStep}
                >
                  Back
                </button>
                <button
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  onClick={nextStep}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Location */}
          {step === 5 && (
            <div className="animate-fade-in">
              <input
                type="text"
                name="location"
                placeholder="Your Location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-3 bg-white bg-opacity-30 border border-white rounded-lg mb-3 text-white placeholder-gray-200 focus:ring-2 focus:ring-blue-400"
              />
              <div className="flex justify-between">
                <button
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg"
                  onClick={prevStep}
                >
                  Back
                </button>
                <button
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  onClick={nextStep}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Industry Selection */}
          {step === 6 && (
            <div className="animate-fade-in">
              <input
                type="text"
                name="industry"
                placeholder="Industry (e.g., Tech, Healthcare)"
                value={formData.industry}
                onChange={handleChange}
                className="w-full p-3 bg-white bg-opacity-30 border border-white rounded-lg mb-3 text-white placeholder-gray-200 focus:ring-2 focus:ring-blue-400"
              />
              <div className="flex justify-between">
                <button
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg"
                  onClick={prevStep}
                >
                  Back
                </button>
                <button
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  onClick={nextStep}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 7: Seeker/Giver */}
          {step === 7 && (
            <div className="animate-fade-in">
              <p className="text-lg font-medium text-white mb-3">
                Are you a seeker ?
              </p>
              <div className="lg:flex lg:justify-between gap-3">
                <button
                  className="bg-red-500 w-full text-white py-3 my-2 rounded-lg hover:bg-red-600"
                  onClick={() => {
                    setFormData({ ...formData, seeker: false });
                    nextStep();
                  }}
                >
                  No, i am giver
                </button>
                <button
                  className="bg-green-500 w-full text-white px-6 py-3 rounded-lg hover:bg-green-600"
                  onClick={() => {
                    setFormData({ ...formData, seeker: true });
                    nextStep();
                  }}
                >
                  Yes, i seek for money
                </button>
              </div>
            </div>
          )}

          {/* Step 8: Ask if User Wants Business Details */}
          {step === 8 && (
            <div className="animate-fade-in">
              <p className="text-lg font-medium text-white mb-3">
                Do you want to add business details?
              </p>
              <div className="lg:flex lg:justify-between gap-3">
                <button
                  className="bg-red-500 w-full text-white py-3 my-2 rounded-lg hover:bg-red-600"
                  onClick={handleSubmit}
                >
                  No, Finish Now
                </button>
                <button
                  className="bg-green-500 w-full text-white px-6 py-3 rounded-lg hover:bg-green-600"
                  onClick={() => {
                    setFormData({ ...formData, wantsBusiness: true });
                    nextStep();
                  }}
                >
                  Yes, Add Business
                </button>
              </div>
            </div>
          )}

          {/* Step 9: Business Basic Info */}
          {step === 9 && formData.wantsBusiness && (
            <div className="animate-fade-in">
              <input
                type="text"
                name="businessName"
                placeholder="Business Name"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full p-3 bg-white bg-opacity-30 border border-white rounded-lg mb-3 text-white placeholder-gray-200 focus:ring-2 focus:ring-blue-400"
              />
              <textarea
                name="businessDescription"
                placeholder="Business Description"
                value={formData.businessDescription}
                onChange={handleChange}
                className="w-full p-3 bg-white bg-opacity-30 border border-white rounded-lg mb-3 text-white placeholder-gray-200 focus:ring-2 focus:ring-blue-400"
              />
              <button
                className="bg-blue-600 text-white w-full py-3 rounded-lg hover:bg-blue-700"
                onClick={nextStep}
              >
                Next
              </button>
            </div>
          )}

          {/* Step 10: Business Location */}
          {step === 10 && (
            <div className="animate-fade-in">
              <input
                type="text"
                name="businessLocation"
                placeholder="Business Location"
                value={formData.businessLocation}
                onChange={handleChange}
                className="w-full p-3 bg-white bg-opacity-30 border border-white rounded-lg mb-3 text-white placeholder-gray-200 focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="datetime-local"
                name="businessYear"
                placeholder="Established year"
                value={formData.businessYear}
                onChange={handleChange}
                className="w-full p-3 bg-white bg-opacity-30 border border-white rounded-lg mb-3 text-white placeholder-gray-200 focus:ring-2 focus:ring-blue-400"
              />
              <button
                className="bg-blue-600 text-white w-full py-3 rounded-lg hover:bg-blue-700"
                onClick={nextStep}
              >
                Next
              </button>
            </div>
          )}

          {/* Step 11: Business Contact Details */}
          {step === 11 && formData.wantsBusiness && (
            <div className="animate-fade-in">
              <input
                type="text"
                name="businessPhone"
                placeholder="Business Contact Number"
                value={formData.businessPhone}
                onChange={handleChange}
                className="w-full p-3 bg-white bg-opacity-30 border border-white rounded-lg mb-3 text-white placeholder-gray-200 focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="email"
                name="businessEmail"
                placeholder="Business Email"
                value={formData.businessEmail}
                onChange={handleChange}
                className="w-full p-3 bg-white bg-opacity-30 border border-white rounded-lg mb-3 text-white placeholder-gray-200 focus:ring-2 focus:ring-blue-400"
              />
              <button
                className="bg-green-600 text-white w-full py-3 rounded-lg hover:bg-green-700"
                onClick={handleSubmit}
              >
                Finish and go to Profile
              </button>
            </div>
          )}
        </div>

        {/* Right Side - Branding Section */}
        <div className="w-full bg-blue-700 text-white flex flex-col items-center justify-center p-10 rounded-r-lg">
          <h1 className="text-4xl font-extrabold mb-4">
            Welcome to Our Community!
          </h1>
          <p className="text-lg text-center max-w-md">
            Let's build something amazing together.
          </p>
          <img
            src="https://source.unsplash.com/400x300/?team,success"
            alt="Onboarding Illustration"
            className="lg:mt-6 mb-4 rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
