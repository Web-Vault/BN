import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiTrendingUp, FiCheck, FiClock, FiShield, FiAward } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-hot-toast";
import Navbar from "../../components/Navbar.js";
import config from "../../config/config.js";

const MEMBERSHIP_PRICES = {
  Basic: 99,
  Professional: 299,
};

const MEMBERSHIP_DURATIONS = {
  Basic: 1, // 1 month
  Professional: 6, // 6 months
};

const MEMBERSHIP_FEATURES = {
  Professional: [
    "Enhanced networking features",
    "Priority event access",
    "Advanced profile visibility",
    "Unlimited chapter access",
    "Priority support",
    "Analytics dashboard"
  ]
};

const UpgradePage = () => {
  const navigate = useNavigate();
  const [currentMembership, setCurrentMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [nextTier, setNextTier] = useState(null);
  const [upgradeAmount, setUpgradeAmount] = useState(0);

  useEffect(() => {
    const fetchMembershipDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${config.API_BASE_URL}/api/membership/verify`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const membership = response.data.membership;
        // console.log("Current membership:", membership);
        setCurrentMembership(membership);

        // Only handle Basic to Professional upgrade
        if (membership.tier === "Basic") {
          setNextTier("Professional");
          // Calculate upgrade amount for Basic to Professional
          const fullUpgradeAmount = Math.round(MEMBERSHIP_PRICES.Professional - MEMBERSHIP_PRICES.Basic);
          // console.log("Full upgrade amount:", fullUpgradeAmount);
          setUpgradeAmount(fullUpgradeAmount);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching membership details:", error);
        toast.error("Failed to load membership details");
        setLoading(false);
      }
    };

    fetchMembershipDetails();
  }, []);

  const handleUpgrade = async () => {
    if (!nextTier) {
      toast.error("No upgrade option available");
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${config.API_BASE_URL}/api/membership/purchase`,
        {
          tier: nextTier,
          paymentDetails: {
            amount: upgradeAmount,
            currency: "USD",
            paymentMethod: "credit_card",
            transactionId: `UPG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            paymentDate: new Date().toISOString(),
            isUpgrade: true,
            previousTier: currentMembership.tier,
            description: `Upgrade from ${currentMembership.tier} to ${nextTier} membership`
          }
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        toast.success("Membership upgraded successfully!");
        // Update local storage with new membership tier
        localStorage.setItem('membershipTier', nextTier);
        navigate("/profile");
      }
    } catch (error) {
      console.error("Error upgrading membership:", error);
      const errorMessage = error.response?.data?.message || "Failed to upgrade membership";
      console.error("Error details:", error.response?.data);
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] p-3 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-8 text-center">
              Loading membership details...
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!nextTier) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] p-3 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-lg rounded-xl p-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                No Upgrade Available
              </h2>
              <p className="text-gray-600 mb-6">
                You already have the highest tier membership.
              </p>
              <button
                onClick={() => navigate("/profile")}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                Back to Profile
              </button>
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
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FiTrendingUp className="text-blue-500" />
              Upgrade Your Membership
            </h2>

            {/* Current Membership */}
            <div className="mb-8 p-6 bg-white/50 rounded-xl border border-white/20">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Current Membership
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-semibold text-gray-800">
                    {currentMembership.tier}
                  </span>
                  <p className="text-gray-600 mt-1">
                    Expires on {new Date(currentMembership.expiryDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-600">Monthly Value</span>
                  <p className="text-xl font-semibold text-gray-800">
                    ${MEMBERSHIP_PRICES[currentMembership.tier]}
                  </p>
                </div>
              </div>
            </div>

            {/* Upgrade Option */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Upgrade to {nextTier}
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="space-y-4">
                    {MEMBERSHIP_FEATURES[nextTier].map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white/80 rounded-xl p-6 border border-white/20">
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-gray-600">Upgrade Amount</span>
                      <p className="text-3xl font-bold text-gray-800">
                        ${upgradeAmount}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Pro-rated for remaining duration
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">New Duration</span>
                      <p className="text-lg font-semibold text-gray-800">
                        {MEMBERSHIP_DURATIONS[nextTier]} months
                      </p>
                    </div>
                    <button
                      onClick={handleUpgrade}
                      disabled={processing}
                      className={`w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 ${
                        processing ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {processing ? "Processing..." : "Upgrade Now"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                • Your membership will be upgraded immediately after successful payment
              </p>
              <p className="mb-2">
                • The upgrade amount is pro-rated based on your remaining membership duration
              </p>
              <p>
                • You'll get access to all {nextTier} tier features upon upgrade
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpgradePage; 