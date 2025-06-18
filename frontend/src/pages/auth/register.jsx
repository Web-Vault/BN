import React, { useState, useEffect } from "react";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import config from "../../config/config.js";

const Register = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistrationEnabled, setIsRegistrationEnabled] = useState(true);

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}/api/settings/registration`);
        const data = await response.json();
        setIsRegistrationEnabled(data.allowUserRegistration);
      } catch (error) {
        console.error("Error checking registration status:", error);
        // If there's an error, default to allowing registration
        setIsRegistrationEnabled(true);
      }
    };
    checkRegistrationStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isRegistrationEnabled) {
      setError("New user registration is currently disabled. Please try again later.");
      return;
    }
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName,
          userEmail: email,
          userPassword: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Registration successful, redirecting to verification...");

        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id);

        // Redirect to verification page with email
        navigate("/verify-otp", { 
          state: { 
            email: email,
            message: "Please check your email for the verification code."
          }
        });
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isRegistrationEnabled) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="bg-white/10 backdrop-blur-xl p-12 rounded-2xl shadow-2xl w-[480px] border border-white/20">
          <div className="flex flex-col items-center space-y-6">
            <div className="p-4 bg-red-500/20 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white text-center">
              Registration Disabled
            </h2>
            <p className="text-white/80 text-center text-lg">
              New user registration is currently disabled. Please try again later.
            </p>
            <Link
              to="/login"
              className="w-full bg-indigo-500 text-white py-4 rounded-xl text-center font-medium hover:bg-indigo-600 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      {/* Register Form Container with Glass Effect */}
      <div className="bg-white bg-opacity-20 backdrop-blur-lg p-10 rounded-xl shadow-lg w-[450px] border border-white border-opacity-30">
        <h2 className="text-2xl font-semibold text-white text-center mb-6">
          Create an Account
        </h2>

        {error && (
          <div className="mb-4 p-2 bg-red-500 bg-opacity-50 text-white rounded text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name Input */}
          <div className="mb-4">
            <label className="block text-white mb-1">Full Name</label>
            <div className="flex items-center border border-white border-opacity-40 rounded-md p-2 bg-white bg-opacity-10">
              <FaUser className="text-white mx-2" />
              <input
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="w-full outline-none bg-transparent text-white placeholder-white"
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-white mb-1">Email</label>
            <div className="flex items-center border border-white border-opacity-40 rounded-md p-2 bg-white bg-opacity-10">
              <FaEnvelope className="text-white mx-2" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full outline-none bg-transparent text-white placeholder-white"
              />
            </div>
          </div>

          {/* Password & Confirm Password (Side by Side) */}
          <div className="flex gap-4 mb-4">
            {/* Password Input */}
            <div className="w-1/2">
              <label className="block text-white mb-1">Password</label>
              <div className="flex items-center border border-white border-opacity-40 rounded-md p-2 bg-white bg-opacity-10">
                <FaLock className="text-white mx-2" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full outline-none bg-transparent text-white placeholder-white"
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="w-1/2">
              <label className="block text-white mb-1">Confirm</label>
              <div className="flex items-center border border-white border-opacity-40 rounded-md p-2 bg-white bg-opacity-10">
                <FaLock className="text-white mx-2" />
                <input
                  type="password"
                  placeholder="Confirm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full outline-none bg-transparent text-white placeholder-white"
                />
              </div>
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-white border-opacity-40" />
          <span className="mx-2 text-white">OR</span>
          <hr className="flex-grow border-white border-opacity-40" />
        </div>

        {/* Social Login */}
        <button className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition mb-2">
          Sign up with Google
        </button>

        {/* Login Link */}
        <p className="text-sm text-center mt-4 text-white">
          Already have an account?{" "}
          <Link to="/login" className="text-white underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
