import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyOTP = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [otp, setOtp] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(600); // 10 minutes in seconds

    useEffect(() => {
        // Get email from location state
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            // If no email in state, redirect to register
            navigate("/register");
        }

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
    }, [location.state, navigate]);

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
            const response = await fetch("http://localhost:5000/api/users/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and redirect to login
                localStorage.setItem("token", data.token);
                navigate("/login", { 
                    state: { 
                        message: "Email verified successfully. Please login." 
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
            const response = await fetch("http://localhost:5000/api/users/resend-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-700">
            <div className="bg-white bg-opacity-20 backdrop-blur-lg p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">Verify Your Email</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white mb-2">Enter OTP</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            className="w-full p-3 bg-white bg-opacity-30 border border-white rounded-lg text-white placeholder-gray-200 focus:ring-2 focus:ring-blue-400"
                            maxLength={6}
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">{error}</div>
                    )}

                    <div className="text-white text-center">
                        Time remaining: {formatTime(timer)}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || timer === 0}
                        className={`w-full py-3 rounded-lg text-white font-semibold ${
                            loading || timer === 0
                                ? "bg-gray-500 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={loading || timer > 0}
                            className={`text-white underline ${
                                loading || timer > 0
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:text-blue-200"
                            }`}
                        >
                            Resend OTP
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VerifyOTP; 