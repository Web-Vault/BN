import React, { useState } from "react";
import config from "../../config/config.js";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      // TODO: Update endpoint if needed
      const response = await fetch(`${config.API_BASE_URL}/api/users/forgot-password-qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || "If this email exists, a reset link has been sent.");
      } else {
        setError(data.message || "Failed to send reset email.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white bg-opacity-20 backdrop-blur-lg p-10 rounded-xl shadow-lg w-[400px] border border-white border-opacity-30">
        <h2 className="text-2xl font-semibold text-white text-center mb-6">Forgot Password</h2>
        {message && <div className="mb-4 p-2 bg-green-500 bg-opacity-50 text-white rounded text-center">{message}</div>}
        {error && <div className="mb-4 p-2 bg-red-500 bg-opacity-50 text-white rounded text-center">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full outline-none bg-white bg-opacity-10 text-white placeholder-white p-3 rounded-md border border-white border-opacity-40"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
