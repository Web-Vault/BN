import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar.js";
import config from "../../config/config.js";
import { FiChevronDown, FiCheck, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

const WithdrawalRequests = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fundingRequests, setFundingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchFundingRequests();
    fetchWithdrawalRequests();
  }, []);
 
  const fetchFundingRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔍 Fetching funding requests...");
      const response = await axios.get(
        `${config.API_BASE_URL}/api/investments/my-requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("✅ Funding requests received:", response.data);
      setFundingRequests(response.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching funding requests:", err);
      setError("Failed to fetch funding requests");
      setLoading(false);
    }
  };

  const fetchWithdrawalRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("🔍 Fetching withdrawal requests");
      const response = await axios.get(
        `${config.API_BASE_URL}/api/investments/withdrawals`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("✅ Withdrawal requests received:", response.data);
      setWithdrawalRequests(response.data);
      if (selectedRequest) {
        const filtered = response.data.filter(
          (withdrawal) => withdrawal.investment && withdrawal.investment._id === selectedRequest._id
        );
        setFilteredWithdrawals(filtered);
      }
    } catch (err) {
      console.error("❌ Error fetching withdrawal requests:", err);
      setError("Failed to fetch withdrawal requests");
    }
  };

  const handleRequestSelect = (request) => {
    console.log("🔍 Selected funding request:", request);
    setSelectedRequest(request);
    const filtered = withdrawalRequests.filter(
      (withdrawal) => withdrawal.investment && withdrawal.investment._id === request._id
    );
    setFilteredWithdrawals(filtered);
    setIsDropdownOpen(false);
  };

  const handleApproveWithdrawal = async (withdrawalId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${config.API_BASE_URL}/api/investments/withdrawals/${withdrawalId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Withdrawal request approved successfully");
      // Refresh withdrawal requests
      fetchWithdrawalRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve withdrawal");
    }
  };

  const handleRejectWithdrawal = async (withdrawalId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${config.API_BASE_URL}/api/investments/withdrawals/${withdrawalId}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Withdrawal request rejected");
      // Refresh withdrawal requests
      fetchWithdrawalRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject withdrawal");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 p-3 lg:p-8">
        <div className="max-w-4xl mt-[110px] mx-auto bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Withdrawal Requests
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Funding Request Dropdown */}
          <div className="relative mb-6">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-gray-800"
            >
              <span>
                {selectedRequest
                  ? selectedRequest.title
                  : "Select a funding request"}
              </span>
              <FiChevronDown
                className={`transform transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
                {fundingRequests.map((request) => (
                  <button
                    key={request._id}
                    onClick={() => handleRequestSelect(request)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    {request.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Withdrawal Requests List */}
          {selectedRequest && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Withdrawal Requests for: {selectedRequest.title}
              </h3>

              {filteredWithdrawals.length === 0 ? (
                <p className="text-gray-600">No withdrawal requests found</p>
              ) : (
                filteredWithdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal._id}
                    className="bg-white/30 backdrop-blur-sm p-4 rounded-lg border border-white/20"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800">
                          Amount: ${withdrawal.amount}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Requested by: {withdrawal.investor?.userName || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Date: {new Date(withdrawal.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          Status:{" "}
                          <span
                            className={`font-medium ${
                              withdrawal.status === "pending"
                                ? "text-yellow-600"
                                : withdrawal.status === "processing"
                                ? "text-blue-600"
                                : withdrawal.status === "completed"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {withdrawal.status.charAt(0).toUpperCase() +
                              withdrawal.status.slice(1)}
                          </span>
                        </p>
                        <div className="mt-2 text-sm text-gray-600">
                          <p>Bank Details:</p>
                          <p>Bank: {withdrawal.bankDetails?.bankName || "N/A"}</p>
                          <p>Account: {withdrawal.bankDetails?.accountNumber || "N/A"}</p>
                          <p>Name: {withdrawal.bankDetails?.accountHolderName || "N/A"}</p>
                          <p>IFSC: {withdrawal.bankDetails?.ifscCode || "N/A"}</p>
                        </div>
                      </div>

                      {withdrawal.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveWithdrawal(withdrawal._id)}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            <FiCheck />
                          </button>
                          <button
                            onClick={() => handleRejectWithdrawal(withdrawal._id)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <FiX />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WithdrawalRequests;
