import React, { useState } from "react";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    
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
      const response = await fetch("http://localhost:5000/api/users/register", {
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
        localStorage.setItem("onBoardingCompleted", "false");

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
