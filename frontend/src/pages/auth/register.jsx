import React, { useState } from "react";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import logActivity from "../utility/logActivity.js";

const Register = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName, // From Full Name input
          userEmail: email,
          userPassword: password,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        console.log("✅ Registration successful:", data);

        // Store token in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("onBoardingCompleted", "false");

        await logActivity({
          activityType: "account",
          action: "Account created.",
          tokenOverride: data.token, // ✅ use directly from response
        });

        // Navigate to login page
        navigate("/login");
      } else {
        setError(data.message);
        console.log(error);
      }

      if (!response.ok) {
        console.log("Backend error details:", data); // 👈 Log the error message
        setError(data.message || "Registration failed");
        return;
      }
    } catch (error) {
      console.error("❌ Registration failed:", error);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      {/* Register Form Container with Glass Effect */}
      <div className="bg-white bg-opacity-20 backdrop-blur-lg p-10 rounded-xl shadow-lg w-[450px] border border-white border-opacity-30">
        <h2 className="text-2xl font-semibold text-white text-center mb-6">
          Create an Account
        </h2>

        {/* Full Name Input */}
        <div className="mb-4">
          <label className="block text-white mb-1">Full Name</label>
          <div className="flex items-center border border-white border-opacity-40 rounded-md p-2 bg-white bg-opacity-10">
            <FaUser className="text-white mx-2" />
            <input
              type="text"
              placeholder="Enter your name"
              onChange={(e) => setUserName(e.target.value)} // Add this
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
              className="w-full outline-none bg-transparent text-white placeholder-white"
              onChange={(e) => setEmail(e.target.value)}
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
                className="w-full outline-none bg-transparent text-white placeholder-white"
                onChange={(e) => setPassword(e.target.value)}
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
                className="w-full outline-none bg-transparent text-white placeholder-white"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Register Button */}
        <button
          onClick={handleRegister}
          className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition"
        >
          Register
        </button>

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
