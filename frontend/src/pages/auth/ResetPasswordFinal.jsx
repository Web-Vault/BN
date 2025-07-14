import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import config from "../../config/config.js";

const ResetPasswordFinal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Parse token from URL
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/users/qr-reset-final`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="bg-white bg-opacity-20 backdrop-blur-lg p-10 rounded-xl shadow-lg w-[400px] border border-white border-opacity-30 text-center">
          <h2 className="text-2xl font-semibold text-green-200 mb-6">Password Reset Successful!</h2>
          <p className="text-white mb-6">You can now log in with your new password.</p>
          <Link to="/login" className="bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 transition">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white bg-opacity-20 backdrop-blur-lg p-10 rounded-xl shadow-lg w-[400px] border border-white border-opacity-30">
        <h2 className="text-2xl font-semibold text-white text-center mb-6">Set New Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full outline-none bg-white bg-opacity-10 text-white placeholder-white p-3 rounded-md border border-white border-opacity-40"
              placeholder="Enter new password"
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label className="block text-white mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              minLength={6}
              className="w-full outline-none bg-white bg-opacity-10 text-white placeholder-white p-3 rounded-md border border-white border-opacity-40"
              placeholder="Confirm new password"
              disabled={loading}
            />
          </div>
          {error && <div className="mb-4 p-2 bg-red-500 bg-opacity-50 text-white rounded text-center">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordFinal; 