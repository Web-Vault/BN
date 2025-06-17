import { useState } from "react";
import {
  FiHeadphones,
  FiMail,
  FiPhone,
  FiAlertCircle,
  FiMessageSquare,
  FiBookOpen,
  FiUsers,
  FiCheckCircle,
} from "react-icons/fi";
import Navbar from "../../components/Navbar";
import { Link } from "react-router-dom";

const SupportPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    // console.log(formData);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const commonIssues = [
    {
      icon: <FiAlertCircle className="text-xl" />,
      title: "Password Reset",
      solution: "Use the 'Forgot Password' link on login page",
      link: "/reset-password",
    },
    {
      icon: <FiAlertCircle className="text-xl" />,
      title: "Transaction Issues",
      solution: "Check transaction status in your dashboard",
      link: "/transactions",
    },
    {
      icon: <FiAlertCircle className="text-xl" />,
      title: "Connection Problems",
      solution: "Verify network status below",
      link: "#network-status",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 pt-[110px] lg:pt-[110px] p-3 lg:p-8">
        <div className="max-w-7xl mx-auto bg-white/50 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30">
          <div className="p-2 lg:p-8">
            {/* Page Header */}
            <div className="text-center mb-12">
              <div className="inline-block p-4 bg-blue-100/50 rounded-full mb-6">
                <FiHeadphones className="text-4xl text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                How Can We Help You?
              </h1>
              <p className="text-gray-600">
                Get instant support through multiple channels
              </p>
            </div>

            {/* Support Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Contact Card */}
              <div className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <div className="text-blue-600 mb-4">
                  <FiMail className="text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Email Support
                </h3>
                <p className="text-gray-600 mb-4">
                  Direct contact with our support team
                </p>
                <div className="space-y-2">
                  <p>
                    General Inquiries:{" "}
                    <a
                      href="mailto:support@businessnetwork.com"
                      className="text-blue-600"
                    >
                      support@businessnetwork.com
                    </a>
                  </p>
                  <p>
                    Technical Support:{" "}
                    <a
                      href="mailto:tech@businessnetwork.com"
                      className="text-blue-600"
                    >
                      tech@businessnetwork.com
                    </a>
                  </p>
                  <p className="text-sm text-gray-500">
                    Response time: 24-48 hours
                  </p>
                </div>
              </div>

              {/* Phone Card */}
              <div className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <div className="text-blue-600 mb-4">
                  <FiPhone className="text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Phone Support
                </h3>
                <p className="text-gray-600 mb-4">
                  Immediate assistance through call
                </p>
                <div className="space-y-2">
                  <p>
                    US:{" "}
                    <a href="tel:+18005551234" className="text-blue-600">
                      +1 (800) 555-1234
                    </a>
                  </p>
                  <p>
                    International:{" "}
                    <a href="tel:+442045555555" className="text-blue-600">
                      +44 20 4555 5555
                    </a>
                  </p>
                  <p className="text-sm text-gray-500">
                    Mon-Fri: 9AM - 8PM (GMT)
                  </p>
                </div>
              </div>

              {/* Knowledge Base Card */}
              <div className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <div className="text-blue-600 mb-4">
                  <FiBookOpen className="text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Knowledge Base
                </h3>
                <p className="text-gray-600 mb-4">
                  Find answers in our documentation
                </p>
                <div className="space-y-2">
                  <Link to="/guides" className="block text-blue-600">
                    User Guides →
                  </Link>
                  <Link to="/faq" className="block text-blue-600">
                    FAQ Section →
                  </Link>
                  <Link to="/video-tutorials" className="block text-blue-600">
                    Video Tutorials →
                  </Link>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-green-100/30 backdrop-blur-lg rounded-xl border border-green-200/30 p-6 mb-12 flex items-center gap-4">
              <FiCheckCircle className="text-2xl text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-800">
                  All Systems Operational
                </h3>
                <p className="text-sm text-gray-600">
                  Last updated: 5 minutes ago
                </p>
              </div>
            </div>

            {/* Common Issues */}
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <FiAlertCircle className="text-blue-600" /> Common Issues
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {commonIssues.map((issue, index) => (
                  <a
                    key={index}
                    href="/commonIssues"
                    className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-blue-600 mt-1">{issue.icon}</div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">
                          {issue.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {issue.solution}
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <div className="h-screen w-full flex items-center justify-center relative">
              
              {/* Contact Form Box */}
              <div className="relative bg-white/70 p-4 lg:p-8 rounded-lg shadow-xl w-full lg:w-[70%] max-w-2xl border border-white/20">
                <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6 flex items-center justify-center gap-2">
                  <FiMessageSquare className="text-gray-800" /> Contact Us
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray/80 text-sm mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full p-3 bg-gray/20 border border-gray/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray placeholder-gray/60"
                        required
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray/80 text-sm mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full p-3 bg-gray/20 border border-gray/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray placeholder-gray/60"
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray/80 text-sm mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      className="w-full p-3 bg-gray/20 border border-gray/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray placeholder-gray/60"
                      required
                      placeholder="Enter subject"
                    />
                  </div>

                  <div>
                    <label className="block text-gray/80 text-sm mb-2">
                      Message
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      rows="5"
                      className="w-full p-3 bg-gray/20 border border-gray/30 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray placeholder-gray/60"
                      required
                      placeholder="Enter your message"
                    ></textarea>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-[11px] lg:text-sm text-black/70">
                      Average response time: 6 hours
                      <br />
                      We never share your personal information
                    </p>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md shadow-lg hover:shadow-xl transition-shadow"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Additional Support */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiUsers className="text-blue-600" /> Community Support
                </h3>
                <div className="space-y-2">
                  <Link href="/forum" className="block text-blue-600">
                    User Forum →
                  </Link>
                  <Link href="/blog" className="block text-blue-600">
                    Community Blog →
                  </Link>
                  <Link href="/social" className="block text-blue-600">
                    Social Media Groups →
                  </Link>
                </div>
              </div>

              <div className="bg-white/30 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiAlertCircle className="text-blue-600" /> Emergency Contact
                </h3>
                <p className="text-gray-600 mb-2">
                  For critical security issues:
                </p>
                <div className="space-y-2">
                  <p>
                    24/7 Security Hotline:{" "}
                    <a href="tel:+18005551234" className="text-blue-600">
                      +1 (800) 555-6789
                    </a>
                  </p>
                  <p>
                    Encrypted Email:{" "}
                    <a
                      href="mailto:security@businessnetwork.com"
                      className="text-blue-600"
                    >
                      security@businessnetwork.com
                    </a>
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

export default SupportPage;
