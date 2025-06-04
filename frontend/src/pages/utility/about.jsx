import { useState } from "react";
import {
  FiInfo,
  FiUsers,
  FiDollarSign,
  FiActivity,
  FiLink,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";
import Navbar from "../../components/Navbar.js";

const AboutPlatformPage = () => {
  const [openSection, setOpenSection] = useState(null);

  const platformData = {
    introduction: {
      title: "Welcome to Business Network Pro",
      content:
        "A comprehensive platform connecting entrepreneurs, investors, and professionals to collaborate, grow businesses, and manage investments efficiently.",
    },
    features: [
      {
        icon: <FiUsers className="text-3xl" />,
        title: "Networking Hub",
        content:
          "Connect with industry professionals, potential partners, and investors worldwide",
      },
      {
        icon: <FiDollarSign className="text-3xl" />,
        title: "Investment Management",
        content:
          "Manage funding requests, investments, and financial tracking in one place",
      },
      {
        icon: <FiActivity className="text-3xl" />,
        title: "Business Collaboration",
        content:
          "Find collaborators, form teams, and manage joint ventures effectively",
      },
    ],
    benefits: [
      "Secure transaction management system",
      "Real-time market insights and analytics",
      "Compliance with financial regulations",
      "Integrated communication tools",
      "Customizable business profiles",
      "24/7 platform support",
    ],
    modules: {
      core: [
        {
          name: "Profile Dashboard",
          purpose: "Central hub for personal and business information",
        },
        {
          name: "Connection Management",
          purpose: "Network building and relationship tracking",
        },
        {
          name: "Investment Portal",
          purpose: "Funding requests and investment opportunities",
        },
        {
          name: "Transaction History",
          purpose: "Financial tracking and reporting",
        },
        {
          name: "Group Collaboration",
          purpose: "Team-based project management",
        },
        { name: "Analytics Suite", purpose: "Business performance insights" },
      ],
    },
    faqs: [
      {
        question: "How do I get started?",
        answer:
          "Create your profile, complete verification, and start connecting with relevant professionals",
      },
      {
        question: "Is my financial data secure?",
        answer:
          "We use bank-grade encryption and regular security audits to protect your information",
      },
      {
        question: "Can I manage multiple businesses?",
        answer:
          "No, you cannot create or manage multiple business profiles under one account",
      },
    ],
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] p-3 lg:p-8">
        <div className="max-w-7xl mx-auto bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30">
          <div className="p-3 lg:p-8">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="inline-block p-4 bg-blue-100/50 rounded-full mb-6">
                <FiInfo className="text-4xl text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                {platformData.introduction.title}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {platformData.introduction.content}
              </p>
            </div>

            {/* Key Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {platformData.features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="text-blue-600 mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.content}</p>
                </div>
              ))}
            </div>

            {/* Platform Benefits */}
            <div className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-8 mb-16">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <FiCheckCircle className="text-blue-600" /> Key Benefits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platformData.benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 hover:bg-white/20 rounded-lg"
                  >
                    <FiArrowRight className="text-blue-600 flex-shrink-0" />
                    <span className="text-gray-600">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Modules */}
            <div className="mb-16">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <FiLink className="text-blue-600" /> Platform Modules
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {platformData.modules.core.map((module, index) => (
                  <div
                    key={index}
                    className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-4"
                  >
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {module.name}
                    </h3>
                    <p className="text-sm text-gray-600">{module.purpose}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage Guide */}
            <div className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-8 mb-16">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <FiActivity className="text-blue-600" /> How to Use
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="text-2xl font-bold text-blue-600">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Create Your Profile
                    </h3>
                    <p className="text-gray-600">
                      Complete your personal and business profiles with relevant
                      details
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-2xl font-bold text-blue-600">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Build Connections
                    </h3>
                    <p className="text-gray-600">
                      Search and connect with relevant professionals in your
                      industry
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-2xl font-bold text-blue-600">3</div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Engage & Collaborate
                    </h3>
                    <p className="text-gray-600">
                      Use investment tools, group features, and transaction
                      management
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <FiInfo className="text-blue-600" /> Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {platformData.faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-4 cursor-pointer hover:bg-white/40"
                    onClick={() =>
                      setOpenSection(openSection === index ? null : index)
                    }
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">
                        {faq.question}
                      </h3>
                      <FiArrowRight
                        className={`transform transition-transform ${
                          openSection === index ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                    {openSection === index && (
                      <p className="mt-2 text-gray-600">{faq.answer}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPlatformPage;
