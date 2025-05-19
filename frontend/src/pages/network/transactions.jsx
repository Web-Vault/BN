import { useState } from "react";
import {
  FiArrowUp,
  FiArrowDown,
  FiFilter,
  FiDollarSign,
  FiCalendar,
} from "react-icons/fi";
import Navbar from "../../components/Navbar";

const TransactionsPage = () => {
  const [activeTab, setActiveTab] = useState("received");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Mock transactions data
  const transactions = {
    received: [
      {
        id: 1,
        type: "investment",
        partner: "Tech Ventures Inc.",
        amount: "+$5,000",
        date: "2023-10-05",
        description: "Series A investment returns",
      },
      {
        id: 2,
        type: "interest",
        partner: "Green Energy Fund",
        amount: "+$1,200",
        date: "2023-10-04",
        description: "Monthly interest payment",
      },
      {
        id: 3,
        type: "funding",
        partner: "StartupHub Investors",
        amount: "+$50,000",
        date: "2023-10-03",
        description: "Seed funding received",
      },
    ],
    sent: [
      {
        id: 4,
        type: "investment",
        partner: "AI Startup Co.",
        amount: "-$25,000",
        date: "2023-10-02",
        description: "Equity investment",
      },
      {
        id: 5,
        type: "lended",
        partner: "John Smith",
        amount: "-$10,000",
        date: "2023-10-01",
        description: "Business loan provided",
      },
      {
        id: 6,
        type: "service",
        partner: "Cloud Solutions Ltd.",
        amount: "-$2,500",
        date: "2023-09-30",
        description: "Cloud infrastructure payment",
      },
    ],
  };

  const transactionTypes = [
    { value: "all", label: "All Transactions" },
    { value: "investment", label: "Investments" },
    { value: "lended", label: "Lended Money" },
    { value: "interest", label: "Interest Received" },
    { value: "funding", label: "Funding Received" },
    { value: "service", label: "Service Payments" },
  ];

  const getTypeBadge = (type) => {
    const typeStyles = {
      investment: "bg-purple-100/50 text-purple-700",
      lended: "bg-orange-100/50 text-orange-700",
      interest: "bg-green-100/50 text-green-700",
      funding: "bg-blue-100/50 text-blue-700",
      service: "bg-red-100/50 text-red-700",
    };

    const typeLabels = {
      investment: "Investment",
      lended: "Money Lent",
      interest: "Interest",
      funding: "Funding",
      service: "Service",
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
                  <button
                    onClick={() => setActiveTab("sent")}
                    className={`py-4 px-1 border-b-2 font-medium flex items-center gap-2 ${
                      activeTab === "sent"
                        ? "text-blue-600 border-blue-500"
                        : "text-gray-600 hover:text-blue-500"
                    }`}
                  >
                    <FiArrowUp className="text-lg" /> Sent
                  </button>
                  <button
                    onClick={() => setActiveTab("received")}
                    className={`py-4 px-1 border-b-2 font-medium flex items-center gap-2 ${
                      activeTab === "received"
                        ? "text-blue-600 border-blue-500"
                        : "text-gray-600 hover:text-blue-500"
                    }`}
                  >
                    <FiArrowDown className="text-lg" /> Received
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
              {filteredTransactions.map((transaction) => (
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TransactionsPage;
