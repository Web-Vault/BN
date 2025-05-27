import { useState, useEffect } from "react";
import {
  FiArrowUp,
  FiArrowDown,
  FiFilter,
  FiDollarSign,
  FiCalendar,
} from "react-icons/fi";
import Navbar from "../../components/Navbar";
import axios from "axios";

const TransactionsPage = () => {
  const [activeTab, setActiveTab] = useState("received");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [transactions, setTransactions] = useState({ received: [], sent: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSeeker, setIsSeeker] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Get user profile to check if user is seeker
        const userResponse = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setIsSeeker(userResponse.data.user.isSeeker);

        // Fetch investments based on user type
        const response = await axios.get(
          userResponse.data.user.isSeeker 
            ? "http://localhost:5000/api/investments/my-requests"
            : "http://localhost:5000/api/investments/my-investments",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch withdrawals for the user
        const withdrawalsResponse = await axios.get(
          "http://localhost:5000/api/investments/withdrawals",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Process investments into transactions
        const processedTransactions = {
          sent: [], // Investments made (for investors) or funding requests created (for seekers)
          received: [], // Returns received (for investors) or investments received (for seekers)
        };

        response.data.forEach((investment) => {
          if (userResponse.data.user.isSeeker) {
            // For seekers: Add each investment as a received transaction
            investment.investors.forEach(investor => {
              processedTransactions.received.push({
                id: `${investment._id}-${investor.user._id}`,
                type: "investment",
                partner: investor.user.userName,
                amount: `+$${investor.amount}`,
                date: new Date(investment.createdAt).toISOString().split('T')[0],
                description: `Investment received for ${investment.title}`,
                status: investment.status
              });
            });
          } else {
            // For investors: Add investment as a sent transaction
            const userInvestment = investment.investors.find(inv => inv.user === localStorage.getItem("userId"));
            if (userInvestment) {
              processedTransactions.sent.push({
                id: investment._id,
                type: "investment",
                partner: investment.title,
                amount: `-$${userInvestment.amount}`,
                date: new Date(investment.createdAt).toISOString().split('T')[0],
                description: `Investment in ${investment.title}`,
                status: investment.status
              });

              // Add returns as received transactions if any
              if (investment.returns > 0) {
                // Find successful withdrawals for this investment
                const successfulWithdrawals = withdrawalsResponse.data.filter(
                  withdrawal => 
                    withdrawal.investment && 
                    withdrawal.investment._id === investment._id && 
                    withdrawal.status === "completed"
                );

                // Only add returns that have been successfully withdrawn
                if (successfulWithdrawals.length > 0) {
                  successfulWithdrawals.forEach(withdrawal => {
                    if (withdrawal.investment) {  // Additional safety check
                      processedTransactions.received.push({
                        id: `${investment._id}-returns-${withdrawal._id}`,
                        type: "interest",
                        partner: investment.title,
                        amount: `+$${withdrawal.amount}`,
                        date: new Date(withdrawal.updatedAt).toISOString().split('T')[0],
                        description: `Returns from ${investment.title}`,
                        status: withdrawal.status
                      });
                    }
                  });
                }
              }
            }
          }
        });

        setTransactions(processedTransactions);
        console.log("Transactions: ", processedTransactions);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to load transactions");
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const transactionTypes = [
    { value: "all", label: "All Transactions" },
    { value: "investment", label: "Investments" },
    { value: "interest", label: "Returns" },
    { value: "funding_request", label: "Funding Requests" },
  ];

  const getTypeBadge = (type) => {
    const typeStyles = {
      investment: "bg-purple-100/50 text-purple-700",
      interest: "bg-green-100/50 text-green-700",
      funding_request: "bg-blue-100/50 text-blue-700",
    };

    const typeLabels = {
      investment: "Investment",
      interest: "Returns",
      funding_request: "Funding Request",
    };

    return (
      <span className={`px-3 py-1 rounded-md text-sm ${typeStyles[type]}`}>
        {typeLabels[type]}
      </span>
    );
  };

  const filteredTransactions = transactions[activeTab].filter((transaction) =>
    selectedFilter === "all" ? true : transaction.type === selectedFilter
  );

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

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] p-3 lg:p-8">
          <div className="max-w-7xl mx-auto bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
            <div className="text-red-500 text-center">{error}</div>
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
            {/* Header and Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h2 className="text-2xl font-semibold mb-4 md:mb-0 flex items-center gap-2 text-blue-600">
                <FiDollarSign className="text-lg" /> Transaction History
              </h2>

              {/* Tabs Navigation */}
              <div className="border-b border-white/20">
                <nav className="flex space-x-8">
                  {!isSeeker && (
                    <button
                      onClick={() => setActiveTab("sent")}
                      className={`py-4 px-1 border-b-2 font-medium flex items-center gap-2 ${
                        activeTab === "sent"
                          ? "text-blue-600 border-blue-500"
                          : "text-gray-600 hover:text-blue-500"
                      }`}
                    >
                      <FiArrowUp className="text-lg" /> Investments Made
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab("received")}
                    className={`py-4 px-1 border-b-2 font-medium flex items-center gap-2 ${
                      activeTab === "received"
                        ? "text-blue-600 border-blue-500"
                        : "text-gray-600 hover:text-blue-500"
                    }`}
                  >
                    <FiArrowDown className="text-lg" /> {isSeeker ? "Investments Received" : "Returns Received"}
                  </button>
                </nav>
              </div>
            </div>

            {/* Filter Section */}
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-64">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="w-full appearance-none bg-white/50 backdrop-blur-lg px-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {transactionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
              </div>
              <div className="text-sm text-gray-600">
                Showing {filteredTransactions.length} transactions
              </div>
            </div>

            {/* Transactions List */}
            <div className="grid grid-cols-1 gap-4">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6 transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      {/* Transaction Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div
                            className={`p-2 rounded-lg ${
                              activeTab === "received"
                                ? "bg-green-100/50 text-green-600"
                                : "bg-red-100/50 text-red-600"
                            }`}
                          >
                            {activeTab === "received" ? (
                              <FiArrowDown className="text-xl" />
                            ) : (
                              <FiArrowUp className="text-xl" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {transaction.partner}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {transaction.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FiCalendar className="text-blue-600" />{" "}
                            {transaction.date}
                          </div>
                          {getTypeBadge(transaction.type)}
                          <span className={`px-3 py-1 rounded-md text-sm ${
                            transaction.status === "completed" 
                              ? "bg-green-100/50 text-green-700"
                              : transaction.status === "pending"
                              ? "bg-yellow-100/50 text-yellow-700"
                              : "bg-red-100/50 text-red-700"
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div
                        className={`text-xl font-semibold ${
                          activeTab === "received"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.amount}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-600">
                  No transactions found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TransactionsPage;
