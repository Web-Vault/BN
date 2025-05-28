import { useState } from "react";
import {
  FiSearch,
  FiAlertCircle,
  FiTool,
  FiUser,
  FiDollarSign,
  FiLock,
  FiArrowRight,
} from "react-icons/fi";
import Navbar from "../../components/Navbar";

const HelpCenterPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedArticle, setExpandedArticle] = useState(null);

  const categories = [
    { id: "account", name: "Account Issues", icon: <FiUser /> },
    { id: "transactions", name: "Transactions", icon: <FiDollarSign /> },
    { id: "security", name: "Security", icon: <FiLock /> },
    { id: "connections", name: "Connections", icon: <FiTool /> },
    { id: "general", name: "General", icon: <FiAlertCircle /> },
  ];

  const articles = [
    {
      id: 1,
      title: "How to Reset Your Password",
      category: "account",
      content: `
        <ol class="list-decimal pl-6 space-y-2">
          <li>Go to the login page and click "Forgot Password"</li>
          <li>Enter your registered email address</li>
          <li>Check your email for the reset link</li>
          <li>Create a new strong password</li>
          <li>Confirm the password change</li>
        </ol>
      `,
      excerpt: "Step-by-step guide to resetting your account password",
      lastUpdated: "2023-10-15",
    },
    {
      id: 2,
      title: "Resolving Failed Transactions",
      category: "transactions",
      content: `
        <div class="space-y-4">
          <p class="font-semibold">Common reasons for failed transactions:</p>
          <ul class="list-disc pl-6 space-y-2">
            <li>Insufficient account balance</li>
            <li>Expired payment method</li>
            <li>Network connectivity issues</li>
            <li>Security verification failures</li>
          </ul>
          <p class="pt-4">Try these solutions in order:</p>
          <ol class="list-decimal pl-6 space-y-2">
            <li>Check your payment method validity</li>
            <li>Verify available balance</li>
            <li>Refresh the page and try again</li>
            <li>Contact support if issue persists</li>
          </ol>
        </div>
      `,
      excerpt: "Troubleshooting guide for transaction failures",
      lastUpdated: "2023-10-14",
    },
    {
      id: 3,
      title: "Two-Factor Authentication Setup",
      category: "security",
      content: `
        <div class="space-y-4">
          <p>Enhance your account security with these steps:</p>
          <ol class="list-decimal pl-6 space-y-2">
            <li>Go to Account Settings > Security</li>
            <li>Select "Enable 2FA"</li>
            <li>Choose authentication method (SMS or Authenticator App)</li>
            <li>Follow the on-screen instructions</li>
            <li>Save backup codes securely</li>
          </ol>
          <div class="bg-blue-50/30 p-4 rounded-lg mt-4">
            <p class="text-sm text-blue-600">💡 Pro Tip: Use an authenticator app for better security</p>
          </div>
        </div>
      `,
      excerpt: "Complete guide to setting up 2FA protection",
      lastUpdated: "2023-10-13",
    },
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] p-3 lg:p-8">
        <div className="max-w-7xl mx-auto bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30">
          <div className="p-4 lg:p-8">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Help Center
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Find solutions to common issues, troubleshooting guides, and
                best practice recommendations
              </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-8 space-y-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="w-full p-4 pl-12 rounded-lg border border-white/20 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    selectedCategory === "all"
                      ? "bg-blue-100/50 text-blue-600"
                      : "bg-white/50 text-gray-600 hover:bg-white/70"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? "bg-blue-100/50 text-blue-600"
                        : "bg-white/50 text-gray-600 hover:bg-white/70"
                    }`}
                  >
                    {category.icon}
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 gap-6">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() =>
                    setExpandedArticle(
                      expandedArticle === article.id ? null : article.id
                    )
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 mb-4">{article.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="bg-blue-100/50 px-3 py-1 rounded-full">
                          {
                            categories.find((c) => c.id === article.category)
                              ?.name
                          }
                        </span>
                        <span>Last updated: {article.lastUpdated}</span>
                      </div>
                    </div>
                    <FiArrowRight
                      className={`transform transition-transform ${
                        expandedArticle === article.id ? "rotate-90" : ""
                      } text-gray-600 mt-2`}
                    />
                  </div>

                  {expandedArticle === article.id && (
                    <div
                      className="mt-6 pt-6 border-t border-white/20 text-gray-600"
                      dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-block p-4 bg-blue-100/50 rounded-full mb-4">
                  <FiAlertCircle className="text-3xl text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No articles found
                </h3>
                <p className="text-gray-600">
                  Try different search terms or browse through categories
                </p>
              </div>
            )}

            {/* Additional Help */}
            <div className="mt-12 bg-blue-50/30 backdrop-blur-lg rounded-xl border border-blue-200/30 p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Still need help?
              </h3>
              <p className="text-gray-600 mb-6">
                Our support team is ready to assist you with any questions
              </p>
              <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpCenterPage;
