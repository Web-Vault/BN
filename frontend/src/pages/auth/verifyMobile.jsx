import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiPhone, FiAlertCircle } from "react-icons/fi";
import Navbar from "../../components/Navbar.js";
import config from "../../config/config.js";

const VerifyMobile = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const [mobileNumber, setMobileNumber] = useState("");
  const [initialOTPSent, setInitialOTPSent] = useState(false);

  useEffect(() => {
    // Fetch mobile number and send initial OTP
    const initializeVerification = async () => {
      try {
        // First fetch the mobile number
        const response = await fetch(`${config.API_BASE_URL}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        
        if (response.ok && data.user.mobileNumber) {
          setMobileNumber(data.user.mobileNumber);
          
          // Send initial OTP only if not already sent
          if (!initialOTPSent) {
            const otpResponse = await fetch(`${config.API_BASE_URL}/api/users/resend-mobile-otp`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
            
            const otpData = await otpResponse.json();
            if (!otpResponse.ok) {
              setError(otpData.message || "Failed to send OTP");
            } else {
              setInitialOTPSent(true);
            }
          }
        } else {
          setError("Failed to fetch mobile number");
        }
      } catch (error) {
        setError("An error occurred while initializing verification");
      }
    };

    initializeVerification();

    // Start countdown timer
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [initialOTPSent]); // Add initialOTPSent to dependency array

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/users/verify-mobile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/profile", { 
          state: { 
            message: "Mobile number verified successfully!" 
          }
        });
      } else {
        setError(data.message || "Verification failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/users/resend-mobile-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTimer(600); // Reset timer to 10 minutes
        setError("New OTP sent successfully!");
      } else {
        setError(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] px-3 lg:p-8">
      <Navbar />
      <div className="max-w-md mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-md p-6 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Verify Your Mobile Number
          </h2>

          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-2 text-white/80 mb-2">
              <FiPhone className="text-purple-400" />
              <span>{mobileNumber}</span>
            </div>
            <p className="text-sm text-white/60">
              We've sent a verification code to your mobile number
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400"
                maxLength={6}
                required
              />
            </div>

            {error && (
              <div className="bg-red-100/50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                <FiAlertCircle />
                {error}
              </div>
            )}

            <div className="text-white/80 text-center text-sm">
              Time remaining: {formatTime(timer)}
            </div>

            <button
              type="submit"
              disabled={loading || timer === 0}
              className={`w-full py-3 rounded-lg text-white font-semibold ${
                loading || timer === 0
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-purple-500 hover:bg-purple-600"
              }`}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading || timer > 0}
                className={`text-white/80 underline ${
                  loading || timer > 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:text-white"
                }`}
              >
                Resend OTP
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyMobile; 