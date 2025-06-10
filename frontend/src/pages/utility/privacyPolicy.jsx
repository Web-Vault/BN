import {
  FiShield,
  FiLock,
  FiUser,
  FiDatabase,
  FiGlobe,
  FiMail,
  FiAlertCircle,
  FiArrowRight,
  FiInfo,
  FiClock,
  FiSettings,
  FiEye,
  FiDownload,
  FiTrash2,
  FiRefreshCw,
} from "react-icons/fi";
import Navbar from "../../components/Navbar";

const PrivacyPolicyPage = () => {
  const privacyData = {
    lastUpdated: "2024-03-20",
    version: "2.1.0",
    sections: [
      {
        title: "Information We Collect",
        icon: <FiDatabase className="text-3xl" />,
        content: [
          {
            subtitle: "Personal Information",
            description:
              "We collect information that you provide directly to us when using our platform.",
            details: [
              {
                text: "Name, email address, and contact information",
                description:
                  "Basic information required for account creation and communication",
              },
              {
                text: "Business details and professional information",
                description:
                  "Company name, position, industry, and business objectives",
              },
              {
                text: "Profile information and preferences",
                description:
                  "Profile pictures, bios, and user preferences for personalized experience",
              },
              {
                text: "Payment and transaction data",
                description:
                  "Secure payment information and transaction history for financial operations",
              },
              {
                text: "Communication history and preferences",
                description:
                  "Messages, notifications, and communication preferences",
              },
            ],
          },
          {
            subtitle: "Usage Information",
            description:
              "We automatically collect certain information about your interaction with our platform.",
            details: [
              {
                text: "Log data and device information",
                description:
                  "IP addresses, browser type, operating system, and device identifiers",
              },
              {
                text: "IP address and location data",
                description:
                  "Geographic location for security and service optimization",
              },
              {
                text: "Browser type and settings",
                description:
                  "Browser preferences and settings for optimal user experience",
              },
              {
                text: "Interaction with our services",
                description:
                  "Pages visited, features used, and time spent on platform",
              },
              {
                text: "Performance and error data",
                description:
                  "Technical data to improve service reliability and performance",
              },
            ],
          },
        ],
      },
      {
        title: "How We Use Your Information",
        icon: <FiUser className="text-3xl" />,
        content: [
          {
            subtitle: "Service Provision",
            description:
              "We use your information to provide and improve our services.",
            details: [
              {
                text: "Provide and maintain our services",
                description: "Ensure platform functionality and user support",
              },
              {
                text: "Process transactions and payments",
                description:
                  "Handle financial operations securely and efficiently",
              },
              {
                text: "Send notifications and updates",
                description:
                  "Keep you informed about important changes and opportunities",
              },
              {
                text: "Manage user accounts and preferences",
                description: "Maintain your account settings and preferences",
              },
              {
                text: "Facilitate business networking",
                description:
                  "Connect you with relevant professionals and opportunities",
              },
            ],
          },
          {
            subtitle: "Improvement and Security",
            description:
              "We continuously work to enhance our platform's security and user experience.",
            details: [
              {
                text: "Enhance user experience",
                description:
                  "Analyze usage patterns to improve platform features",
              },
              {
                text: "Monitor and prevent fraud",
                description:
                  "Protect users from fraudulent activities and security threats",
              },
              {
                text: "Analyze usage patterns",
                description: "Understand how users interact with our platform",
              },
              {
                text: "Maintain service security",
                description: "Implement and update security measures",
              },
              {
                text: "Develop new features",
                description: "Create innovative solutions based on user needs",
              },
            ],
          },
        ],
      },
      {
        title: "Data Protection",
        icon: <FiShield className="text-3xl" />,
        content: [
          {
            subtitle: "Security Measures",
            description:
              "We implement robust security measures to protect your data.",
            details: [
              {
                text: "Encryption of sensitive data",
                description:
                  "Advanced encryption for all sensitive information",
              },
              {
                text: "Regular security audits",
                description:
                  "Continuous monitoring and assessment of security measures",
              },
              {
                text: "Access control and authentication",
                description:
                  "Multi-factor authentication and role-based access control",
              },
              {
                text: "Secure data storage",
                description:
                  "Industry-standard data storage and backup systems",
              },
              {
                text: "Regular backups",
                description: "Automated backup systems to prevent data loss",
              },
            ],
          },
          {
            subtitle: "Data Retention",
            description:
              "We maintain clear policies for data retention and deletion.",
            details: [
              {
                text: "Retention periods based on data type",
                description:
                  "Different retention periods for various types of data",
              },
              {
                text: "Automatic deletion of inactive accounts",
                description:
                  "Removal of unused accounts after specified periods",
              },
              {
                text: "Data archiving policies",
                description: "Secure archiving of historical data",
              },
              {
                text: "User data export options",
                description: "Easy export of your personal data",
              },
              {
                text: "Account deletion procedures",
                description: "Clear process for account and data deletion",
              },
            ],
          },
        ],
      },
      {
        title: "Your Rights",
        icon: <FiLock className="text-3xl" />,
        content: [
          {
            subtitle: "User Control",
            description: "You have complete control over your personal data.",
            details: [
              {
                text: "Access your personal data",
                description: "View and download your personal information",
              },
              {
                text: "Correct inaccurate information",
                description: "Update or modify your personal details",
              },
              {
                text: "Request data deletion",
                description: "Remove your data from our systems",
              },
              {
                text: "Export your data",
                description: "Download your data in standard formats",
              },
              {
                text: "Opt-out of communications",
                description: "Control your communication preferences",
              },
            ],
          },
          {
            subtitle: "Privacy Settings",
            description:
              "Customize your privacy preferences to suit your needs.",
            details: [
              {
                text: "Manage privacy preferences",
                description: "Control who can see your information",
              },
              {
                text: "Control data sharing",
                description: "Choose what information is shared",
              },
              {
                text: "Set communication preferences",
                description: "Manage how we contact you",
              },
              {
                text: "Manage cookie settings",
                description: "Control cookie usage and tracking",
              },
              {
                text: "Update account settings",
                description: "Modify your account preferences",
              },
            ],
          },
        ],
      },
      {
        title: "International Data Transfers",
        icon: <FiGlobe className="text-3xl" />,
        content: [
          {
            subtitle: "Data Transfer",
            description: "We ensure secure international data transfers.",
            details: [
              {
                text: "Cross-border data transfers",
                description:
                  "Secure transfer of data across international borders",
              },
              {
                text: "Compliance with regulations",
                description: "Adherence to international data protection laws",
              },
              {
                text: "Data protection standards",
                description:
                  "Implementation of global data protection standards",
              },
              {
                text: "International privacy laws",
                description:
                  "Compliance with various international privacy regulations",
              },
              {
                text: "Transfer mechanisms",
                description: "Secure methods for international data transfer",
              },
            ],
          },
        ],
      },
      {
        title: "Contact Information",
        icon: <FiMail className="text-3xl" />,
        content: [
          {
            subtitle: "Privacy Inquiries",
            description: "Our dedicated privacy team is here to help you.",
            details: [
              {
                text: "Email: privacy@businessnetwork.com",
                description: "Primary contact for privacy-related inquiries",
              },
              {
                text: "Phone: +1 (800) 555-1234",
                description: "24/7 support for urgent privacy concerns",
              },
              {
                text: "Address: 123 Business Street, Suite 100",
                description: "Our physical location for formal communications",
              },
              {
                text: "Response time: Within 48 hours",
                description: "Standard response time for privacy inquiries",
              },
              {
                text: "Office hours: Mon-Fri, 9AM-6PM GMT",
                description: "Regular business hours for privacy support",
              },
            ],
          },
        ],
      },
    ],
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] p-3 lg:p-8">
        <div className="max-w-7xl mx-auto bg-white/50 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-xl border border-white/30">
          <div className="p-3 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-block p-3 sm:p-4 bg-blue-100/50 rounded-full mb-4 sm:mb-6">
                <FiShield className="text-3xl sm:text-4xl text-blue-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
                Privacy Policy
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-gray-600">
                <div className="flex items-center gap-2 bg-white/30 px-3 sm:px-4 py-2 rounded-full w-full sm:w-auto">
                  <FiClock className="text-blue-600" />
                  <span className="text-sm sm:text-base">
                    Last updated: {privacyData.lastUpdated}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/30 px-3 sm:px-4 py-2 rounded-full w-full sm:w-auto">
                  <FiInfo className="text-blue-600" />
                  <span className="text-sm sm:text-base">
                    Version: {privacyData.version}
                  </span>
                </div>
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-6 sm:space-y-12">
              {privacyData.sections.map((section, index) => (
                <div
                  key={index}
                  className="bg-white/30 backdrop-blur-lg rounded-lg sm:rounded-xl border border-white/20 p-4 sm:p-6 lg:p-8"
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="text-blue-600">{section.icon}</div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                      {section.title}
                    </h2>
                  </div>

                  <div className="space-y-6 sm:space-y-8">
                    {section.content.map((content, contentIndex) => (
                      <div
                        key={contentIndex}
                        className="space-y-3 sm:space-y-4"
                      >
                        <div className="flex items-start gap-2 sm:gap-3">
                          <FiArrowRight className="text-blue-600 mt-1 flex-shrink-0" />
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                              {content.subtitle}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">
                              {content.description}
                            </p>
                          </div>
                        </div>
                        <div className="ml-5 sm:ml-7 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                          {content.details.map((detail, detailIndex) => (
                            <div
                              key={detailIndex}
                              className="bg-white/50 rounded-lg p-3 sm:p-4 hover:bg-white/70 transition-colors"
                            >
                              <div className="flex items-start gap-2 sm:gap-3">
                                <div className="mt-1">
                                  {detailIndex === 0 && (
                                    <FiEye className="text-blue-600" />
                                  )}
                                  {detailIndex === 1 && (
                                    <FiSettings className="text-blue-600" />
                                  )}
                                  {detailIndex === 2 && (
                                    <FiDownload className="text-blue-600" />
                                  )}
                                  {detailIndex === 3 && (
                                    <FiTrash2 className="text-blue-600" />
                                  )}
                                  {detailIndex === 4 && (
                                    <FiRefreshCw className="text-blue-600" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm sm:text-base font-medium text-gray-800">
                                    {detail.text}
                                  </p>
                                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                    {detail.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Information */}
            <div className="mt-8 sm:mt-12 bg-blue-50/30 backdrop-blur-lg rounded-lg sm:rounded-xl border border-blue-200/30 p-4 sm:p-6 lg:p-8">
              <div className="flex items-start gap-3 sm:gap-4">
                <FiAlertCircle className="text-xl sm:text-2xl text-blue-600 mt-1" />
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                    Important Notice
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    This privacy policy may be updated periodically. We
                    encourage you to review it regularly to stay informed about
                    how we protect your information. For any questions or
                    concerns about our privacy practices, please contact our
                    privacy team.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;
