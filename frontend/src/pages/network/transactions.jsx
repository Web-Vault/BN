import { useState, useEffect } from "react";
import {
  FiArrowUp,
  FiArrowDown,
  FiFilter,
  FiDollarSign,
  FiCalendar,
  FiUsers,
  FiTrendingUp,
  FiTrendingDown,
} from "react-icons/fi";
import Navbar from "../../components/Navbar.js";
import config from "../../config/config.js";
import axios from "axios";

const TransactionsPage = () => {
  const [activeTab, setActiveTab] = useState("received");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("overall");
  const [transactions, setTransactions] = useState({ received: [], sent: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSeeker, setIsSeeker] = useState(false);
  const [userMembership, setUserMembership] = useState(null);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalSpending: 0,
    netAmount: 0,
    selectedPeriod: {
      earnings: 0,
      spending: 0,
      netAmount: 0
    }
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Get user profile to check if user is seeker and membership
        const userResponse = await axios.get(
          `${config.API_BASE_URL}/api/users/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setIsSeeker(userResponse.data.user.isSeeker);
        setUserMembership(userResponse.data.user.membership);

        const isEnterpriseMember = userResponse.data.user.membership && 
                                 userResponse.data.user.membership.tier === "Enterprise";

        // For Enterprise members, fetch both requests and investments
        let requestsData = [];
        let investmentsData = [];

        if (isEnterpriseMember) {
          // Fetch both funding requests and investments for Enterprise members
          const [requestsResponse, investmentsResponse] = await Promise.all([
            axios.get(`${config.API_BASE_URL}/api/investments/my-requests`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${config.API_BASE_URL}/api/investments/my-investments`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          ]);
          requestsData = requestsResponse.data;
          investmentsData = investmentsResponse.data;
        } else if (userResponse.data.user.isSeeker) {
          // For seekers, only fetch funding requests
          const requestsResponse = await axios.get(
            `${config.API_BASE_URL}/api/investments/my-requests`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          requestsData = requestsResponse.data;
        } else {
          // For regular investors, only fetch investments
          const investmentsResponse = await axios.get(
            `${config.API_BASE_URL}/api/investments/my-investments`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          investmentsData = investmentsResponse.data;
        }

        // Process transactions
        const processedTransactions = {
          sent: [], // Investments made
          received: [], // Investments received or returns received
        };

        // Process funding requests (for seekers and Enterprise members)
        requestsData.forEach((request) => {
          request.investors.forEach((investor) => {
            processedTransactions.received.push({
              id: `${request._id}-${investor.user._id}`,
              type: "investment",
              partner: investor.user.userName,
              amount: `+$${investor.amount}`,
              date: new Date(request.createdAt).toISOString().split("T")[0],
              description: `Investment received for ${request.title}`,
              status: request.status,
            });
          });
        });

        // Process investments made (for investors and Enterprise members)
        investmentsData.forEach((investment) => {
          const userInvestment = investment.investors.find(
            (inv) => inv.user === localStorage.getItem("userId")
          );
          if (userInvestment) {
            processedTransactions.sent.push({
              id: investment._id,
              type: "investment",
              partner: investment.title,
              amount: `-$${userInvestment.amount}`,
              date: new Date(investment.createdAt).toISOString().split("T")[0],
              description: `Investment in ${investment.title}`,
              status: investment.status,
            });
          }
        });

        // Fetch withdrawals for the user
        const withdrawalsResponse = await axios.get(
          `${config.API_BASE_URL}/api/investments/withdrawals`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch referral earnings
        const referralsResponse = await axios.get(
          `${config.API_BASE_URL}/api/referrals/earnings`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Add returns as received transactions if any
        if (withdrawalsResponse.data && withdrawalsResponse.data.length > 0) {
          withdrawalsResponse.data
            .filter(withdrawal => withdrawal.investor._id === localStorage.getItem("userId")) // Only show withdrawals for current user
            .forEach((withdrawal) => {
              if (withdrawal.investment) {
                processedTransactions.received.push({
                  id: `${withdrawal.investment._id}-returns-${withdrawal._id}`,
                  type: "interest",
                  partner: withdrawal.investment.title,
                  amount: `+$${withdrawal.amount}`,
                  date: new Date(withdrawal.updatedAt)
                    .toISOString()
                    .split("T")[0],
                  description: `Returns from ${withdrawal.investment.title}`,
                  status: withdrawal.status,
                });
              }
            });
        }

        // Process referral earnings
        if (referralsResponse.data && referralsResponse.data.length > 0) {
          referralsResponse.data.forEach((referral) => {
            // Get the completion date, ensuring it's valid
            const completionDate = referral.completedAt
              ? new Date(referral.completedAt)
              : new Date();

            processedTransactions.received.push({
              id: `referral-${referral._id}`,
              type: "referral",
              partner: referral.referredUser.userName,
              amount: `+$${referral.amount}`,
              date: completionDate.toISOString().split("T")[0],
              description: `Referral bonus from ${referral.referredUser.userName}`,
              status: "completed"
            });
          });
        }

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

  // Calculate stats whenever transactions change
  useEffect(() => {
    const calculateStats = () => {
      // Calculate overall stats
      const earnings = transactions.received.reduce((sum, transaction) => {
        const amount = parseFloat(
          transaction.amount.replace("$", "").replace("+", "")
        );
        return sum + amount;
      }, 0);

      const spending = transactions.sent.reduce((sum, transaction) => {
        const amount = parseFloat(
          transaction.amount.replace("$", "").replace("-", "")
        );
        return sum + amount;
      }, 0);

      // Calculate selected period stats
      const { start, end } = getDateRange(dateFilter);
      const selectedPeriodTransactions = {
        received: transactions.received.filter(transaction => {
          if (dateFilter === "overall") return false;
          const transactionDate = new Date(transaction.date);
          return transactionDate >= start && transactionDate <= end;
        }),
        sent: transactions.sent.filter(transaction => {
          if (dateFilter === "overall") return false;
          const transactionDate = new Date(transaction.date);
          return transactionDate >= start && transactionDate <= end;
        })
      };

      const selectedEarnings = selectedPeriodTransactions.received.reduce((sum, transaction) => {
        const amount = parseFloat(
          transaction.amount.replace("$", "").replace("+", "")
        );
        return sum + amount;
      }, 0);

      const selectedSpending = selectedPeriodTransactions.sent.reduce((sum, transaction) => {
        const amount = parseFloat(
          transaction.amount.replace("$", "").replace("-", "")
        );
        return sum + amount;
      }, 0);

      setStats({
        totalEarnings: earnings,
        totalSpending: spending,
        netAmount: earnings - spending,
        selectedPeriod: {
          earnings: selectedEarnings,
          spending: selectedSpending,
          netAmount: selectedEarnings - selectedSpending
        }
      });
    };

    calculateStats();
  }, [transactions, dateFilter]);

  const getDateRange = (filter) => {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    
    switch (filter) {
      case "today":
        return { start: startOfDay, end: now };
      
      case "thisWeek":
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
        return { start: startOfWeek, end: now };
      
      case "lastWeek":
        const lastWeekStart = new Date(startOfDay);
        lastWeekStart.setDate(startOfDay.getDate() - startOfDay.getDay() - 7);
        const lastWeekEnd = new Date(startOfDay);
        lastWeekEnd.setDate(startOfDay.getDate() - startOfDay.getDay() - 1);
        return { start: lastWeekStart, end: lastWeekEnd };
      
      case "thisMonth":
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: startOfMonth, end: now };
      
      case "lastMonth":
        const lastMonthStart = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          1
        );
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        return { start: lastMonthStart, end: lastMonthEnd };
      
      case "overall":
      default:
        return { start: null, end: null };
    }
  };


  const transactionTypes = [
    { value: "all", label: "All Transactions" },
    { value: "investment", label: "Investments" },
    { value: "interest", label: "Returns" },
    { value: "referral", label: "Referral Bonus" },
    { value: "funding_request", label: "Funding Requests" },
  ];

  const dateFilters = [
    { value: "overall", label: "Overall" },
    { value: "today", label: "Today" },
    { value: "thisWeek", label: "This Week" },
    { value: "lastWeek", label: "Last Week" },
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
  ];

  const getTypeBadge = (type) => {
    const typeStyles = {
      investment: "bg-purple-100/50 text-purple-700",
      interest: "bg-green-100/50 text-green-700",
      funding_request: "bg-blue-100/50 text-blue-700",
      referral: "bg-orange-100/50 text-orange-700",
    };

    const typeLabels = {
      investment: "Investment",
      interest: "Returns",
      funding_request: "Funding Request",
      referral: "Referral Bonus",
    };

    return (
      <span className={`px-3 py-1 rounded-md text-sm ${typeStyles[type]}`}>
        {typeLabels[type]}
      </span>
    );
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "referral":
        return <FiUsers className="text-xl" />;
      case "investment":
        return activeTab === "received" ? (
          <FiArrowDown className="text-xl" />
        ) : (
          <FiArrowUp className="text-xl" />
        );
      case "interest":
        return <FiArrowDown className="text-xl" />;
      default:
        return activeTab === "received" ? (
          <FiArrowDown className="text-xl" />
        ) : (
          <FiArrowUp className="text-xl" />
        );
    }
  };

  const getIconBackground = (type) => {
    switch (type) {
      case "referral":
        return "bg-orange-100/50 text-orange-600";
      case "investment":
        return activeTab === "received"
          ? "bg-green-100/50 text-green-600"
          : "bg-red-100/50 text-red-600";
      case "interest":
        return "bg-green-100/50 text-green-600";
      default:
        return activeTab === "received"
          ? "bg-green-100/50 text-green-600"
          : "bg-red-100/50 text-red-600";
    }
  };

  const filteredTransactions = transactions[activeTab]
    .filter((transaction) =>
    selectedFilter === "all" ? true : transaction.type === selectedFilter
    )
    .filter((transaction) => {
      if (dateFilter === "overall") return true;
      const { start, end } = getDateRange(dateFilter);
      const transactionDate = new Date(transaction.date);
      return transactionDate >= start && transactionDate <= end;
    });

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
            {/* Stats Section */}
            <div className="space-y-6">
              {/* Overall Stats */}
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Total Earnings */}
                  <div className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Total Earnings
                      </h3>
                      <div className="p-2 bg-green-100/50 rounded-lg">
                        <FiTrendingUp className="text-2xl text-green-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-green-600">
                      ${stats.totalEarnings.toFixed(2)}
                    </p>
                    {dateFilter !== "overall" && (
                      <p className="text-lg text-green-600 mt-1">
                        {dateFilters.find(f => f.value === dateFilter)?.label}: ${stats.selectedPeriod.earnings.toFixed(2)}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-2">
                      From investments, returns, and referrals
                    </p>
                  </div>

                  {/* Total Spending */}
                  <div className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Total Spending
                      </h3>
                      <div className="p-2 bg-red-100/50 rounded-lg">
                        <FiTrendingDown className="text-2xl text-red-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-red-600">
                      ${stats.totalSpending.toFixed(2)}
                    </p>
                    {dateFilter !== "overall" && (
                      <p className="text-lg text-gray-600 mt-1">
                        {dateFilters.find(f => f.value === dateFilter)?.label}: ${stats.selectedPeriod.spending.toFixed(2)}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-2">
                      On investments and other transactions
                    </p>
                  </div>

                  {/* Net Amount */}
                  <div className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Net Amount
                      </h3>
                      <div
                        className={`p-2 rounded-lg ${
                          stats.netAmount >= 0 ? "bg-green-100/50" : "bg-red-100/50"
                        }`}
                      >
                        {stats.netAmount >= 0 ? (
                          <FiTrendingUp className="text-2xl text-green-600" />
                        ) : (
                          <FiTrendingDown className="text-2xl text-red-600" />
                        )}
                      </div>
                    </div>
                    <p
                      className={`text-3xl font-bold ${
                        stats.netAmount >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      ${Math.abs(stats.netAmount).toFixed(2)}
                    </p>
                    {dateFilter !== "overall" && (
                      <p className={`text-lg mt-1 ${
                        stats.selectedPeriod.netAmount >= 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {dateFilters.find(f => f.value === dateFilter)?.label}: ${Math.abs(stats.selectedPeriod.netAmount).toFixed(2)}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-2">
                      {stats.netAmount >= 0 ? "Net profit" : "Net loss"}
                    </p>
                  </div>
                </div>
              </div>

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
                    <FiArrowDown className="text-lg" />{" "}
                    {isSeeker || userMembership?.tier === "Enterprise" 
                      ? "Investments Received" 
                      : "Returns Received"}
                  </button>
                </nav>
              </div>
            </div>
            </div>

            {/* Date Filter and Type Filter Section */}
            <div className="mt-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Date Filters */}
              <div className="flex flex-wrap gap-2">
                {dateFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setDateFilter(filter.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      dateFilter === filter.value
                        ? "bg-blue-600 text-white"
                        : "bg-white/30 text-gray-700 hover:bg-white/50"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Type Filter Dropdown */}
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
            </div>

            {/* Transaction Count */}
            <div className="text-sm text-gray-600 mb-6">
              Showing {filteredTransactions.length} transactions
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
                            className={`p-2 rounded-lg ${getIconBackground(
                              transaction.type
                            )}`}
                          >
                            {getTransactionIcon(transaction.type)}
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
                          <span
                            className={`px-3 py-1 rounded-md text-sm ${
                            transaction.status === "completed" 
                              ? "bg-green-100/50 text-green-700"
                              : transaction.status === "pending"
                              ? "bg-yellow-100/50 text-yellow-700"
                              : "bg-red-100/50 text-red-700"
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div
                        className={`text-xl font-semibold ${
                          activeTab === "received" ||
                          transaction.type === "referral"
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
