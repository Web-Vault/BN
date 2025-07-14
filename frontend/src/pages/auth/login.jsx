import React, { useState, useEffect } from "react";
import { FaGoogle } from "react-icons/fa"; // Import icons
import { Link, useNavigate } from "react-router-dom";
import config from "../../config/config.js";
import { toast } from 'react-hot-toast';

const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes in ms

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showBanModal, setShowBanModal] = useState(false);
  const [banDetails, setBanDetails] = useState(null);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [allowedAttempts, setAllowedAttempts] = useState(5);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [loginError, setLoginError] = useState("");
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingPassword, setPendingPassword] = useState('');
  const [twoFAError, setTwoFAError] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // const gotoOnboarding = () => {
  //   localStorage.removeItem("onboardingCompleted");
  //   navigate("/onboarding");
  // };

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}/api/settings/maintenance`);
        const data = await response.json();
        // console.log("checkMaintenacne: ", data);
        setIsMaintenance(data.maintenanceMode);
      } catch (error) {
        console.error("Error checking maintenance mode:", error);
      }
    };
    checkMaintenance();
  }, []);
  
  useEffect(() => {
    const fetchLoginAttempts = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}/api/settings/login-attempts`);
        const data = await response.json();
        // console.log("fetchAttempts: ", data);
        const attempts = parseInt(data.loginAttempts || "5", 10);
        setAllowedAttempts(attempts);
        setRemainingAttempts(attempts);
      } catch (error) {
        console.error("Error fetching login attempts setting:", error);
      }
    };
    fetchLoginAttempts();
  }, []);

  useEffect(() => {
    if (!email) return;
    const key = `login_attempts_${email}`;
    const lockKey = `login_lockout_${email}`;
    const attempts = parseInt(localStorage.getItem(key) || "0", 10);
    setRemainingAttempts(allowedAttempts - attempts);
    const lockout = parseInt(localStorage.getItem(lockKey) || "0", 10);
    if (lockout && lockout > Date.now()) {
      setLockoutUntil(lockout);
      setLockoutTimer(Math.ceil((lockout - Date.now()) / 1000));
    } else {
      setLockoutUntil(null);
      setLockoutTimer(0);
    }
  }, [email, allowedAttempts]);

  useEffect(() => {
    if (!lockoutUntil) return;
    const interval = setInterval(() => {
      const now = Date.now();
      if (lockoutUntil > now) {
        setLockoutTimer(Math.ceil((lockoutUntil - now) / 1000));
      } else {
        setLockoutUntil(null);
        setLockoutTimer(0);
        if (email) {
          localStorage.removeItem(`login_attempts_${email}`);
          localStorage.removeItem(`login_lockout_${email}`);
          setRemainingAttempts(allowedAttempts);
        }
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil, email, allowedAttempts]);

  const handleLogin = async () => {
    setLoginError("");
    if (lockoutUntil && lockoutUntil > Date.now()) return;
    setLoginLoading(true); // Start loading
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
        // 2FA required for admin
        if (data.twoFactorRequired) {
          setShow2FAModal(true);
          setPendingEmail(email);
          setPendingPassword(password);
          return;
        }
        localStorage.removeItem(`login_attempts_${email}`);
        localStorage.removeItem(`login_lockout_${email}`);
        setRemainingAttempts(allowedAttempts);
        localStorage.setItem("token", data.user.token);
        localStorage.setItem("userId", data.user.id);
        if (data.redirectTo === '/admin-panel') {
            navigate('/admin');
            return;
        }
        if (isMaintenance) {
          navigate('/maintenance');
          return;
        }
        if (data.user.onboardingStatus && data.user.onboardingStatus.isCompleted) {
          navigate("/profile");
        } else {
          navigate("/onboarding");
        }
      } else if (response.status === 403 && data.message === "Account is banned") {
        setBanDetails(data.banDetails);
        setShowBanModal(true);
      } else {
        // Failed login: increment attempts
        const key = `login_attempts_${email}`;
        const lockKey = `login_lockout_${email}`;
        let attempts = parseInt(localStorage.getItem(key) || "0", 10) + 1;
        localStorage.setItem(key, attempts);
        if (attempts >= allowedAttempts) {
          const lockout = Date.now() + LOCKOUT_DURATION;
          localStorage.setItem(lockKey, lockout);
          setLockoutUntil(lockout);
          setLockoutTimer(Math.ceil(LOCKOUT_DURATION / 1000));
          setLoginError(`Account locked. Try again in 5 minutes.`);
        } else {
          setRemainingAttempts(allowedAttempts - attempts);
          setLoginError(`Invalid email or password. Attempts left: ${allowedAttempts - attempts}`);
        }
      }
    } catch (error) {
      console.error("❌ Error logging in:", error);
      setLoginError("An error occurred while logging in");
    } finally {
      setLoginLoading(false); // Stop loading
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setTwoFAError('');
    setTwoFALoading(true);
    try {
      const res = await fetch(`${config.API_BASE_URL}/api/admin/2fa/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, code: twoFACode })
      });
      const data = await res.json();
      console.log('2FA login response:', res.status, data); // Debug log
      if (res.ok && data.success) {
        console.log('2FA login success, storing token:', data.user.token);
        localStorage.setItem("token", data.user.token);
        localStorage.setItem("userId", data.user.id);
        setShow2FAModal(false);
        setTwoFACode('');
        setPendingEmail('');
        setPendingPassword('');
        toast.success('2FA verified!');
        if (data.redirectTo === '/admin-panel') {
          navigate('/admin');
          return;
        }
        if (isMaintenance) {
          navigate('/maintenance');
          return;
        }
        if (data.user.onboardingStatus && data.user.onboardingStatus.isCompleted) {
          navigate("/profile");
        } else {
          navigate("/onboarding");
        }
      } else {
        setTwoFAError(data.message || 'Invalid 2FA code');
      }
    } catch (err) {
      console.error('2FA frontend error:', err);
      setTwoFAError('Error verifying 2FA code');
    } finally {
      setTwoFALoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "indefinitely";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

      {/* Login Box or Lockout Timer */}
      <div className="relative bg-white/10 backdrop-blur-lg p-8 rounded-lg shadow-xl w-[380px] border border-white/20">
        {lockoutUntil && lockoutUntil > Date.now() ? (
          <div className="flex flex-col items-center justify-center h-64">
            <h2 className="text-2xl font-semibold text-red-600 text-center mb-4">
              Account Locked
            </h2>
            <p className="text-white text-lg mb-2">Too many failed login attempts.</p>
            <p className="text-white text-md mb-4">Try again in <span className="font-bold">{lockoutTimer}</span> seconds.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-white text-center mb-6">
              Welcome Back
            </h2>
            {loginError && (
              <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">
                {loginError}
              </div>
            )}
            {/* Email Input */}
            <div className="mb-4">
              <label className="block text-white/80 text-sm">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="w-full p-3 mt-1 bg-white/20 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-white/60"
                disabled={!!lockoutUntil}
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
                disabled={!!lockoutUntil}
              />
            </div>
            {/* Remaining Attempts */}
            {remainingAttempts < allowedAttempts && !lockoutUntil && (
              <div className="text-yellow-200 text-sm mb-2 text-center">
                Attempts left: {remainingAttempts}
              </div>
            )}
            {/* Forgot Password & Signup Links */}
            <div className="flex justify-between text-xs mb-4">
              <Link to="/forgotpassword" className="text-white/70 hover:text-white transition">
                Forgot Password?
              </Link>
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
              disabled={!!lockoutUntil || loginLoading}
            >
              {loginLoading ? "Loading..." : "Login"}
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
          </>
        )}
      </div>

      {/* Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Account Banned</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                <span className="font-semibold">Reason:</span> {banDetails?.reason || 'No reason provided'}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Banned by:</span> {banDetails?.adminId?.userName || 'Admin'}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Ban Start Date:</span> {banDetails?.startDate ? new Date(banDetails.startDate).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                  timeZone: 'UTC'
                }) : 'N/A'}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Ban End Date:</span> {banDetails?.endDate ? new Date(banDetails.endDate).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                  timeZone: 'UTC'
                }) : 'Indefinite'}
              </p>
              <p className="text-gray-600 text-sm mt-4">
                If you believe this is a mistake, please contact our support team at support@businessnetwork.com
              </p>
            </div>
            <button
              onClick={() => setShowBanModal(false)}
              className="mt-6 w-full bg-gray-200 text-gray-800 p-3 rounded-md font-semibold hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {show2FAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">Two-Factor Authentication</h2>
            <p className="text-gray-600 text-center mb-4">Enter the 6-digit code from your authenticator app.</p>
            <form onSubmit={handle2FASubmit} className="space-y-4">
              <input
                type="text"
                value={twoFACode}
                onChange={e => setTwoFACode(e.target.value)}
                maxLength={6}
                pattern="[0-9]{6}"
                required
                className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-center text-lg tracking-widest"
                placeholder="123456"
                autoFocus
              />
              {twoFAError && <div className="text-red-600 text-sm text-center">{twoFAError}</div>}
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
                disabled={twoFALoading}
              >
                {twoFALoading ? 'Verifying...' : 'Verify'}
              </button>
              <button
                type="button"
                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md border border-gray-300 mt-2"
                onClick={() => { setShow2FAModal(false); setTwoFACode(''); setTwoFAError(''); }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
