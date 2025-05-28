import { useState, useEffect } from "react";
import {
  FiClock,
  FiCopy,
  FiShare2,
} from "react-icons/fi";
import Navbar from "../../components/Navbar";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ReferralsPage = () => {
  const [referrals, setReferrals] = useState({
    stats: {
      totalReferrals: 0,
      completedReferrals: 0,
      pendingReferrals: 0,
      totalEarnings: 0,
      referralCode: "",
    },
    referrals: [],
  });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to view referrals");
        return;
      }

      console.log("🔹 Sending request with token:", token);
      const { data } = await axios.get(
        "http://localhost:5000/api/referrals/my-referrals",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("✅ Received data:", data);
      setReferrals(data);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching referrals:", error);
      if (error.response?.status === 401) {
        toast.error("Please login to view referrals");
      } else {
        toast.error("Failed to load referrals");
      }
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referrals.stats.referralCode);
    toast.success("Referral code copied to clipboard!");
  };

  const shareReferral = () => {
    const shareText = `Join using my referral code: ${referrals.stats.referralCode}`;
    if (navigator.share) {
      navigator
        .share({
          title: "Join with my referral code",
          text: shareText,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Referral link copied to clipboard!");
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-100/50 text-yellow-700",
      completed: "bg-green-100/50 text-green-700",
      expired: "bg-red-100/50 text-red-700",
    };
    return (
      <span className={`px-3 py-1 rounded-md text-sm ${statusStyles[status]}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] p-3 lg:p-8">
          <div className="max-w-7xl mx-auto bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] p-3 lg:p-8">
        <div className="max-w-7xl mx-auto bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30">
          <div className="p-3 lg:p-8">
            {/* Stats Section */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/30 backdrop-blur-lg rounded-xl p-4">
                <h3 className="text-sm text-gray-600">Total Referrals</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {referrals.stats.totalReferrals}
                </p>
              </div>
              <div className="bg-white/30 backdrop-blur-lg rounded-xl p-4">
                <h3 className="text-sm text-gray-600">Completed</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {referrals.stats.completedReferrals}
                </p>
              </div>
              <div className="bg-white/30 backdrop-blur-lg rounded-xl p-4">
                <h3 className="text-sm text-gray-600">Pending</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {referrals.stats.pendingReferrals}
                </p>
              </div>
              <div className="bg-white/30 backdrop-blur-lg rounded-xl p-4">
                <h3 className="text-sm text-gray-600">Total Earnings</h3>
                <p className="text-2xl font-bold text-gray-800">
                  ${referrals.stats.totalEarnings}
                </p>
              </div>
            </div>

            {/* Referral Code Section */}
            <div className="mb-8 bg-white/30 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Your Referral Code
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-white/50 rounded-lg p-3 text-center font-mono text-lg">
                  {referrals.stats.referralCode}
                </div>
                <button
                  onClick={copyReferralCode}
                  className="p-3 bg-blue-100/50 text-blue-600 rounded-lg hover:bg-blue-200/50 transition-colors"
                >
                  <FiCopy className="text-xl" />
                </button>
                <button
                  onClick={shareReferral}
                  className="p-3 bg-green-100/50 text-green-600 rounded-lg hover:bg-green-200/50 transition-colors"
                >
                  <FiShare2 className="text-xl" />
                </button>
              </div>
            </div>

            {/* Referrals List */}
            <div className="space-y-4">
              {referrals.referrals.map((referral) => (
                <div
                  key={referral._id}
                  className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span
                        onClick={() => {
                          navigate(`/userProfile/${referral.referredUser._id}`);
                        }}
                        className="d-block font-semibold text-gray-800 pb-2 relative cursor-pointer after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-gray-400 after:transition-all after:duration-300 hover:after:w-full rounded-full"
                      >
                        {referral.referredUser.userName}
                      </span>
                      <p className="text-gray-600 mt-2">
                        Reward:{" "}
                        {referral.rewardType === "percentage"
                          ? `${referral.rewardValue}%`
                          : `$${referral.rewardValue}`}
                        {referral.rewardAmount > 0 &&
                          ` ($${referral.rewardAmount})`}
                      </p>
                      <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
                        <FiClock className="text-blue-600" />
                        {referral.completedAt
                          ? `Completed: ${formatDate(referral.completedAt)}`
                          : `Expires: ${formatDate(referral.expiresAt)}`}
                      </div>
                    </div>
                    {getStatusBadge(referral.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReferralsPage;
