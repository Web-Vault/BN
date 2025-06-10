import {
  FiFileText,
  FiUser,
  FiDollarSign,
  FiAlertCircle,
  FiArrowRight,
  FiLock,
  FiGlobe,
  FiInfo,
  FiClock,
  FiSettings,
  FiRefreshCw,
  FiEye,
  FiDownload,
  FiTrash2,
} from "react-icons/fi";
import Navbar from "../../components/Navbar";

const TermsAndConditionsPage = () => {
  const termsData = {
    lastUpdated: "2024-03-20",
    version: "2.1.0",
    sections: [
      {
        title: "Acceptance of Terms",
        icon: <FiFileText className="text-3xl" />,
        content: [
          {
            subtitle: "Agreement to Terms",
            description: "By accessing or using our platform, you agree to be bound by these Terms and Conditions.",
            details: [
              {
                text: "By accessing or using our platform, you agree to be bound by these Terms",
                description: "Your use of the platform constitutes acceptance of these terms."
              },
              {
                text: "You must be at least 18 years old to use our services",
                description: "Age verification is required for all users."
              },
              {
                text: "You must provide accurate and complete information",
                description: "False or misleading information may result in account termination."
              },
              {
                text: "You are responsible for maintaining the security of your account",
                description: "Keep your login credentials secure and confidential."
              },
              {
                text: "You agree to comply with all applicable laws and regulations",
                description: "Users must follow local, national, and international laws."
              }
            ]
          }
        ]
      },
      {
        title: "User Accounts",
        icon: <FiUser className="text-3xl" />,
        content: [
          {
            subtitle: "Account Requirements",
            description: "To use our platform, you must meet certain account requirements.",
            details: [
              {
                text: "One account per individual or business entity",
                description: "Each user is allowed only one active account."
              },
              {
                text: "Valid email address and phone number required",
                description: "A valid email address and phone number are mandatory."
              },
              {
                text: "Complete and accurate profile information",
                description: "Your profile must contain accurate and up-to-date information."
              },
              {
                text: "Regular account activity monitoring",
                description: "We monitor account activity to ensure compliance."
              },
              {
                text: "Compliance with account security measures",
                description: "Users must follow our security guidelines."
              }
            ]
          },
          {
            subtitle: "Account Restrictions",
            description: "To maintain platform integrity, certain restrictions apply.",
            details: [
              {
                text: "No sharing of account credentials",
                description: "Account credentials must be kept confidential."
              },
              {
                text: "No automated account creation",
                description: "Creating accounts through automated means is not allowed."
              },
              {
                text: "No impersonation of other users",
                description: "Impersonating other users is strictly prohibited."
              },
              {
                text: "No unauthorized access attempts",
                description: "Attempting to access other users' accounts is prohibited."
              },
              {
                text: "No account trading or selling",
                description: "Accounts cannot be transferred, sold, or traded."
              }
            ]
          }
        ]
      },
      {
        title: "Financial Terms",
        icon: <FiDollarSign className="text-3xl" />,
        content: [
          {
            subtitle: "Payment Terms",
            description: "Our payment terms outline the financial obligations.",
            details: [
              {
                text: "All fees are non-refundable unless specified",
                description: "Fees paid for our services are generally non-refundable."
              },
              {
                text: "Payment processing fees may apply",
                description: "Additional fees may be charged for payment processing."
              },
              {
                text: "Currency conversion rates may vary",
                description: "For international transactions, rates are subject to market fluctuations."
              },
              {
                text: "Subscription billing cycles are fixed",
                description: "Subscription fees are charged in advance for the entire cycle."
              },
              {
                text: "Late payment penalties may apply",
                description: "Late payments may incur additional fees or penalties."
              }
            ]
          },
          {
            subtitle: "Transaction Rules",
            description: "All transactions must comply with our rules.",
            details: [
              {
                text: "All transactions must be legitimate",
                description: "All transactions must be for legitimate business purposes."
              },
              {
                text: "No fraudulent or suspicious activities",
                description: "Users must not engage in any fraudulent activities."
              },
              {
                text: "Compliance with financial regulations",
                description: "All transactions must comply with applicable regulations."
              },
              {
                text: "Transaction limits may apply",
                description: "Limits may be imposed based on account type and verification."
              },
              {
                text: "Verification may be required",
                description: "Additional verification may be required for certain transactions."
              }
            ]
          }
        ]
      },
      {
        title: "Platform Usage",
        icon: <FiGlobe className="text-3xl" />,
        content: [
          {
            subtitle: "Acceptable Use",
            description: "Our platform is designed for professional activities.",
            details: [
              {
                text: "Professional and business-related activities only",
                description: "The platform is intended for professional networking."
              },
              {
                text: "No spam or unsolicited communications",
                description: "Users must not send unsolicited messages."
              },
              {
                text: "No harassment or abusive behavior",
                description: "Harassment or abusive behavior is strictly prohibited."
              },
              {
                text: "No unauthorized data collection",
                description: "Collecting data without permission is prohibited."
              },
              {
                text: "No service disruption attempts",
                description: "Users must not disrupt platform services."
              }
            ]
          },
          {
            subtitle: "Content Guidelines",
            description: "All content must comply with our guidelines.",
            details: [
              {
                text: "No illegal or prohibited content",
                description: "Content must not violate any laws or regulations."
              },
              {
                text: "No copyright infringement",
                description: "Users must respect intellectual property rights."
              },
              {
                text: "No false or misleading information",
                description: "Content must be accurate and truthful."
              },
              {
                text: "No inappropriate or offensive material",
                description: "Content must be professional and appropriate."
              },
              {
                text: "No unauthorized commercial content",
                description: "Commercial content must be authorized."
              }
            ]
          }
        ]
      },
      {
        title: "Intellectual Property",
        icon: <FiLock className="text-3xl" />,
        content: [
          {
            subtitle: "Platform Rights",
            description: "We maintain certain rights over our platform.",
            details: [
              {
                text: "All platform content is protected by copyright",
                description: "Content is protected by copyright laws."
              },
              {
                text: "Trademarks and logos are registered",
                description: "Our trademarks and logos are protected."
              },
              {
                text: "Software and code are proprietary",
                description: "Our software and code are protected."
              },
              {
                text: "Design elements are protected",
                description: "Design elements are protected by copyright."
              },
              {
                text: "User content licensing terms",
                description: "Users grant us a license to use their content."
              }
            ]
          },
          {
            subtitle: "User Rights",
            description: "Users maintain certain rights over their content.",
            details: [
              {
                text: "Retain ownership of your content",
                description: "Users retain ownership of their original content."
              },
              {
                text: "Grant limited license to the platform",
                description: "Users grant us a non-exclusive license."
              },
              {
                text: "Protection of your intellectual property",
                description: "We respect users' intellectual property rights."
              },
              {
                text: "Reporting of infringement",
                description: "Users can report intellectual property violations."
              },
              {
                text: "Content removal rights",
                description: "Users can request removal of their content."
              }
            ]
          }
        ]
      },
      {
        title: "Termination",
        icon: <FiAlertCircle className="text-3xl" />,
        content: [
          {
            subtitle: "Account Termination",
            description: "We reserve the right to terminate accounts.",
            details: [
              {
                text: "Violation of terms may result in termination",
                description: "Accounts may be terminated for violations."
              },
              {
                text: "Suspension of account access",
                description: "We may suspend accounts pending investigation."
              },
              {
                text: "Permanent account deletion",
                description: "Serious violations may result in permanent deletion."
              },
              {
                text: "Data retention policies",
                description: "We retain certain data after termination."
              },
              {
                text: "Appeal process for termination",
                description: "Users may appeal termination decisions."
              }
            ]
          }
        ]
      }
    ]
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
                <FiFileText className="text-3xl sm:text-4xl text-blue-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
                Terms and Conditions
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-gray-600">
                <div className="flex items-center gap-2 bg-white/30 px-3 sm:px-4 py-2 rounded-full w-full sm:w-auto">
                  <FiClock className="text-blue-600" />
                  <span className="text-sm sm:text-base">Last updated: {termsData.lastUpdated}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/30 px-3 sm:px-4 py-2 rounded-full w-full sm:w-auto">
                  <FiInfo className="text-blue-600" />
                  <span className="text-sm sm:text-base">Version: {termsData.version}</span>
                </div>
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-6 sm:space-y-12">
              {termsData.sections.map((section, index) => (
                <div
                  key={index}
                  className="bg-white/30 backdrop-blur-lg rounded-lg sm:rounded-xl border border-white/20 p-4 sm:p-6 lg:p-8"
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="text-blue-600">
                      {section.icon}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                      {section.title}
                    </h2>
                  </div>

                  <div className="space-y-6 sm:space-y-8">
                    {section.content.map((content, contentIndex) => (
                      <div key={contentIndex} className="space-y-3 sm:space-y-4">
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
                                  {detailIndex === 0 && <FiEye className="text-blue-600" />}
                                  {detailIndex === 1 && <FiSettings className="text-blue-600" />}
                                  {detailIndex === 2 && <FiDownload className="text-blue-600" />}
                                  {detailIndex === 3 && <FiTrash2 className="text-blue-600" />}
                                  {detailIndex === 4 && <FiRefreshCw className="text-blue-600" />}
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
                    These terms and conditions may be updated periodically. We encourage you to review them regularly to stay informed about your rights and responsibilities. For any questions or concerns about these terms, please contact our support team.
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

export default TermsAndConditionsPage;