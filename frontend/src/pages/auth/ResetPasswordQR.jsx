import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import config from "../../config/config.js";

const ResetPasswordQR = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [codes, setCodes] = useState([]);
  const [expires, setExpires] = useState(null);
  const [timer, setTimer] = useState(10);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Parse token from URL
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing token.");
      setLoading(false);
      return;
    }
    // Call backend to get codes
    fetch(`${config.API_BASE_URL}/api/users/qr-reset-init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    })
      .then(res => res.json())
      .then(data => {
        if (data.codes && data.expires) {
          setCodes(data.codes);
          setExpires(data.expires);
          setTimer(10);
        } else {
          setError(data.message || "Invalid or expired token.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Server error. Please try again later.");
        setLoading(false);
      });
  }, [token]);

  // Countdown timer
  useEffect(() => {
    if (!expires || error) return;
    if (timer <= 0) return; // Don't navigate here
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, expires, error]);

  // Navigate to verification page when timer hits 0
  useEffect(() => {
    if (timer === 0 && !error && expires) {
      navigate(`/reset-password-verify?token=${token}`, { state: { expiry: expires } });
    }
  }, [timer, error, expires, navigate, token]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white bg-opacity-20 backdrop-blur-lg p-10 rounded-xl shadow-lg w-[400px] border border-white border-opacity-30">
        <h2 className="text-2xl font-semibold text-white text-center mb-6">Password Reset Codes</h2>
        {loading ? (
          <div className="text-white text-center">Loading...</div>
        ) : error ? (
          <div className="mb-4 p-2 bg-red-500 bg-opacity-50 text-white rounded text-center">{error}</div>
        ) : (
          <>
            <div className="mb-4 text-white text-center text-lg">
              Enter one of these codes on the next page. Codes expire in:
              <span className="font-bold ml-2">{timer}s</span>
            </div>
            <div className="flex justify-center gap-6 mb-6">
              {codes.map((c, i) => (
                <div key={i} className="bg-white/80 text-2xl font-mono text-blue-700 rounded-lg px-6 py-4 shadow-md">
                  {c}
                </div>
              ))}
            </div>
            <div className="text-white text-center text-sm opacity-80">
              You will be redirected to verification shortly.
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordQR; 