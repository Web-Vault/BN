import React, { useState } from "react";
import { FaGoogle } from "react-icons/fa"; // Import icons
import { Link, useNavigate } from "react-router-dom";
import config from "../../config/config.js";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // const gotoOnboarding = () => {
  //   localStorage.removeItem("onboardingCompleted");
  //   navigate("/onboarding");
  // };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Login successful:", data);
        console.log("data.user: ", data.user);

        // Store token & user ID in localStorage
        localStorage.setItem("token", data.user.token);
        localStorage.setItem("userId", data.user.id);
        
        // Check onboarding status from user data
        if (data.user.onboardingStatus && data.user.onboardingStatus.isCompleted) {
          navigate("/profile");
        } else {
          navigate("/onboarding");
        }
      } else {
        console.error("❌ Login failed:", data.message);
        alert(data.message);
      }
    } catch (error) {
      console.error("❌ Error logging in:", error);
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center relative">
      {/* Background Blur Effect */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-md opacity-30"
        style={{
          backgroundImage:
            "url('https://source.unsplash.com/1600x900/?business,technology')",
        }}
      ></div>

      {/* Login Box */}
      <div className="relative bg-white/10 backdrop-blur-lg p-8 rounded-lg shadow-xl w-[380px] border border-white/20">
        <h2 className="text-2xl font-semibold text-white text-center mb-6">
          Welcome Back
        </h2>

        {/* Email Input */}
        <div className="mb-4">
          <label className="block text-white/80 text-sm">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="w-full p-3 mt-1 bg-white/20 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-white/60"
          />
        </div>

        {/* Password Input */}
        <div className="mb-4">
          <label className="block text-white/80 text-sm">Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="w-full p-3 mt-1 bg-white/20 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-white/60"
          />
        </div>

        {/* Forgot Password & Signup Links */}
        <div className="flex justify-between text-xs mb-4">
          <a href="/" className="text-white/70 hover:text-white transition">
            Forgot Password?
          </a>
          <Link
            to="/register"
            className="text-white/70 hover:text-white transition"
          >
            Sign Up
          </Link>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-purple-500 text-white p-3 rounded-md font-semibold hover:bg-purple-600 transition"
        >
          Login
        </button>
        <br />
        {/* <br /> */}
        {/* <button
          onClick={gotoOnboarding}
          className="w-full bg-purple-500 text-white p-3 rounded-md font-semibold hover:bg-purple-600 transition"
        >
          Go to Onboarding
        </button> */}

        {/* Divider */}
        <div className="flex items-center my-5">
          <hr className="flex-grow border-white/30" />
          <span className="mx-3 text-white/70 text-sm">OR</span>
          <hr className="flex-grow border-white/30" />
        </div>

        {/* Social Login */}
        <button className="w-full bg-red-500 text-white p-3 rounded-md hover:bg-red-600 transition mb-3 flex items-center justify-center gap-2">
          <FaGoogle className="text-lg" />
          Login with Google
        </button>
        {/* <button className="w-full bg-blue-700 text-white p-3 rounded-md hover:bg-blue-800 transition flex items-center justify-center gap-2">
          <FaFacebookF className="text-lg" />
          Login with Facebook
        </button> */}
      </div>
    </div>
  );
};

export default Login;
