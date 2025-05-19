import { useState } from "react";
import { FiSend, FiInbox, FiClock, FiCheck, FiX } from "react-icons/fi";
import Navbar from "../../components/Navbar";

const ReferralsPage = () => {
  const [activeTab, setActiveTab] = useState("sent");
  const [receivedReferrals, setReceivedReferrals] = useState([
    {
      id: 1,
      sender: "John Doe",
      content: "Would like to refer you for a senior developer position at Tech Corp.",
      date: "2023-10-05 03:45 PM",
      status: "pending",
    },
    {
      id: 2,
      sender: "Jane Smith",
      content: "Recommendation for team lead role in the FinTech project",
      date: "2023-10-04 01:20 PM",
      status: "pending",
    },
  ]);

  const [sentReferrals] = useState([
    {
      id: 1,
      recipient: "Mike Johnson",
      content: "Referred for cloud architect position at Cloud Solutions Inc.",
      date: "2023-10-03 11:15 AM",
      status: "accepted",
    },
    {
      id: 2,
      recipient: "Emily Davis",
      content: "Suggested for product manager role at StartupHub",
      date: "2023-10-02 09:30 AM",
      status: "rejected",
    },
  ]);

  const handleReferralResponse = (id, action) => {
    setReceivedReferrals(receivedReferrals.map(ref => 
      ref.id === id ? { ...ref, status: action } : ref
    ));
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-100/50 text-yellow-700",
      accepted: "bg-green-100/50 text-green-700",
      rejected: "bg-red-100/50 text-red-700",
    };
    return (
      <span className={`px-3 py-1 rounded-md text-sm ${statusStyles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] p-3 lg:p-8">
        <div className="max-w-7xl mx-auto bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30">
          <div className="p-3 lg:p-8">
            {/* Tabs Navigation */}
            <div className="border-b border-white/20 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("sent")}
                  className={`py-4 px-1 border-b-2 font-medium flex items-center gap-2 ${
                    activeTab === "sent"
                      ? "text-blue-600 border-blue-500"
                      : "text-gray-600 hover:text-blue-500"
                  }`}
                >
                  <FiSend className="text-lg" /> Sent Referrals
                </button>
                <button
                  onClick={() => setActiveTab("received")}
                  className={`py-4 px-1 border-b-2 font-medium flex items-center gap-2 ${
                    activeTab === "received"
                      ? "text-blue-600 border-blue-500"
                      : "text-gray-600 hover:text-blue-500"
                  }`}
                >
                  <FiInbox className="text-lg" /> Received Referrals
                </button>
              </nav>
            </div>

            {/* Sent Referrals Tab */}
            {activeTab === "sent" && (
              <div className="lg:grid grid-cols-3 gap-6 ">
                {sentReferrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 my-2 p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">{referral.recipient}</h3>
                        <p className="text-gray-600 mt-2">{referral.content}</p>
                        <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
                          <FiClock className="text-blue-600" /> {referral.date}
                        </div>
                      </div>
                      {getStatusBadge(referral.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Received Referrals Tab */}
            {activeTab === "received" && (
              <div className="lg:grid grid-cols-2 gap-6">
                {receivedReferrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 my-2 p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">{referral.sender}</h3>
                        <p className="text-gray-600 mt-2">{referral.content}</p>
                        <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
                          <FiClock className="text-blue-600" /> {referral.date}
                        </div>
                      </div>
                      {referral.status === "pending" ? (
                        <div className="lg:flex gap-2">
                          <button
                            onClick={() => handleReferralResponse(referral.id, "accepted")}
                            className="p-2 bg-green-100/50 text-green-600 rounded-lg hover:bg-green-200/50 transition-colors"
                          >
                            <FiCheck className="text-lg" />
                          </button>
                          <button
                            onClick={() => handleReferralResponse(referral.id, "rejected")}
                            className="mt-2 p-2 bg-red-100/50 text-red-600 rounded-lg hover:bg-red-200/50 transition-colors"
                          >
                            <FiX className="text-lg" />
                          </button>
                        </div>
                      ) : (
                        getStatusBadge(referral.status)
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReferralsPage;