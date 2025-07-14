import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import config from "../../config/config.js";

const ResetPasswordVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(null);
  const [expired, setExpired] = useState(false);

  // Parse token from URL
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  // Get expiry from navigation state
  const expiry = location.state?.expiry;

  // Set up timer based on expiry
  useEffect(() => {
    if (!expiry) {
      setError("Code expiry information missing. Please restart the reset process.");
      setExpired(true);
      return;
    }
    const secondsLeft = Math.ceil((expiry - Date.now()) / 1000);
    setTimer(secondsLeft > 0 ? secondsLeft : 0);
  }, [expiry]);

  // Countdown timer
  useEffect(() => {
    if (timer === null || expired) return;
    if (timer <= 0) {
      setExpired(true);
      setError("Code expired. Please request a new reset.");
      return;
    }
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(interval);
          setExpired(true);
          setError("Code expired. Please request a new reset.");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, expired]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/users/qr-reset-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, code })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        navigate(`/reset-password-final?token=${token}`);
      } else {
        setError(data.message || "Invalid or expired code.");
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white bg-opacity-20 backdrop-blur-lg p-10 rounded-xl shadow-lg w-[400px] border border-white border-opacity-30">
        <h2 className="text-2xl font-semibold text-white text-center mb-6">Verify Reset Code</h2>
        {timer !== null && !expired && (
          <div className="mb-4 text-white text-center text-lg">
            Code expires in: <span className="font-bold">{timer}s</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white mb-1">Enter one of the codes you saw earlier</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              required
              maxLength={6}
              pattern="[0-9]{6}"
              className="w-full outline-none bg-white bg-opacity-10 text-white placeholder-white p-3 rounded-md border border-white border-opacity-40 text-center text-lg tracking-widest"
              placeholder="123456"
              autoFocus
              disabled={loading || expired}
            />
          </div>
          {error && <div className="mb-4 p-2 bg-red-500 bg-opacity-50 text-white rounded text-center">{error}</div>}
          <button
            type="submit"
            disabled={loading || expired}
            className={`w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition ${loading || expired ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordVerify; 