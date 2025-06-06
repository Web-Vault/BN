import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiTrendingUp, FiShield, FiCheckCircle, FiX, FiArrowRight, FiGlobe, FiTarget, FiBarChart2 } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import config from '../../config/config.js';
const LandingPage = () => {
  const navigate = useNavigate();
  const [membershipId, setMembershipId] = useState('');
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');

  const features = [
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: 'Global Professional Network',
      description: 'Connect with verified professionals, investors, and entrepreneurs from around the world. Build meaningful relationships and expand your business network.',
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: 'Investment Ecosystem',
      description: 'Access curated investment opportunities, manage your portfolio, and participate in exclusive funding rounds. Get real-time market insights and expert analysis.',
    },
    {
      icon: <FiShield className="w-8 h-8" />,
      title: 'Secure & Verified Platform',
      description: 'Enterprise-grade security with end-to-end encryption. All members undergo thorough verification to ensure a trusted and professional environment.',
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: 'Chapter-Based Community',
      description: 'Join specialized chapters based on industry, interests, or location. Collaborate on projects, share knowledge, and grow together with like-minded professionals.',
    },
  ];

  const platformModules = [
    {
      title: 'Investment Management',
      features: [
        'Portfolio tracking and analytics',
        'Investment opportunity discovery',
        'Due diligence tools',
        'Automated returns calculation',
        'Secure transaction processing'
      ]
    },
    {
      title: 'Professional Networking',
      features: [
        'Smart matching algorithm',
        'Professional profile management',
        'Direct messaging system',
        'Event and meeting scheduling',
        'Referral program'
      ]
    },
    {
      title: 'Community & Collaboration',
      features: [
        'Industry-specific chapters',
        'Knowledge sharing forums',
        'Project collaboration tools',
        'Community events and webinars',
        'Expert mentorship program'
      ]
    },
    {
      title: 'Business Tools',
      features: [
        'Business profile management',
        'Investment pitch creation',
        'Document sharing and storage',
        'Analytics and reporting',
        'Team collaboration features'
      ]
    }
  ];

  const membershipTiers = [
    {
      name: 'Basic',
      price: '$99/month',
      features: [
        'Access to basic networking features',
        'View investment opportunities',
        'Join up to 2 chapters',
        'Basic profile visibility',
        'Community forum access'
      ]
    },
    {
      name: 'Professional',
      price: '$299/3 months',
      features: [
        'All Basic features',
        'Priority investment opportunities',
        'Join unlimited chapters',
        'Enhanced profile visibility',
        'Advanced networking tools',
        'Priority support',
        'Analytics dashboard'
      ]
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: [
        'All Professional features',
        'Custom chapter creation',
        'Dedicated account manager',
        'API access',
        'Custom integration support',
        'Team management tools',
        'Advanced analytics'
      ]
    }
  ];

  const stats = [
    { label: 'Active Members', value: '10,000+' },
    { label: 'Investment Deals', value: '500+' },
    { label: 'Success Rate', value: '95%' },
    { label: 'Global Reach', value: '50+ Countries' },
    { label: 'Active Chapters', value: '100+' },
    { label: 'Total Investments', value: '$50M+' }
  ];

  const testimonials = [
    {
      name: 'John Doe',
      role: 'Investment Professional',
      company: 'Global Ventures',
      text: 'BN has transformed how I connect with potential investors and opportunities. The platform\'s verification system and curated investment opportunities have significantly improved my deal flow.',
      image: 'https://source.unsplash.com/random/100x100?portrait=1'
    },
    {
      name: 'Jane Smith',
      role: 'Tech Entrepreneur',
      company: 'InnovateX',
      text: 'The platform provided me with invaluable networking opportunities and insights. Through BN, I found the right investors for my startup and connected with mentors who guided me through crucial growth phases.',
      image: 'https://source.unsplash.com/random/100x100?portrait=2'
    },
    {
      name: 'Michael Chen',
      role: 'Chapter Leader',
      company: 'Tech Innovators Chapter',
      text: 'Leading a chapter on BN has been incredibly rewarding. The platform\'s tools make it easy to organize events, manage members, and facilitate meaningful connections within our community.',
      image: 'https://source.unsplash.com/random/100x100?portrait=3'
    }
  ];

  const heroFeatures = [
    {
      icon: <FiGlobe className="w-6 h-6" />,
      text: "Global Network",
      description: "Connect with professionals from 50+ countries"
    },
    {
      icon: <FiTarget className="w-6 h-6" />,
      text: "Verified Members",
      description: "Trusted community of professionals"
    },
    {
      icon: <FiBarChart2 className="w-6 h-6" />,
      text: "Smart Matching",
      description: "AI-powered connection recommendations"
    }
  ];

  const handleMembershipVerification = async () => {
    try {
      setIsProcessing(true);
      setVerificationError('');

      const response = await fetch(`${config.API_BASE_URL}/api/membership/verify-id`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ membershipId }),
      });
      
      const data = await response.json();

      if (response.ok) {
        // If membership is valid, store the token and redirect to login
        if (data.isValid) {
          toast.success('Membership verified successfully!');
          setShowVerificationDialog(false);
          navigate('/login', { 
            state: { 
              verifiedMembership: true,
              membershipId: membershipId
            }
          });
        } else {
          setVerificationError(data.message || 'Invalid membership ID');
        }
      } else {
        setVerificationError(data.message || 'Error verifying membership. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying membership:', error);
      setVerificationError('Error verifying membership. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePurchaseMembership = (tier) => {
    setSelectedTier(tier);
    setShowPurchaseDialog(true);
    setPurchaseError('');
  };

  const handlePurchaseConfirm = async () => {
    if (!selectedTier) {
      setPurchaseError('Please select a membership tier');
      return;
    }

    setIsProcessing(true);
    setPurchaseError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { from: '/', tier: selectedTier } });
        return;
      }

      const response = await axios.post(`${config.API_BASE_URL}/api/membership/purchase`, {
        tier: selectedTier,
        paymentDetails: {
          amount: selectedTier === 'Basic' ? 99 : selectedTier === 'Professional' ? 299 : 999,
          currency: 'USD',
          paymentMethod: 'credit_card',
          transactionId: 'MOCK-' + Date.now(),
          paymentDate: new Date()
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Check if the response indicates success
      if (response.status === 200) {
        toast.success('Membership purchased successfully!');
        // Close dialog and reset states before navigation
        setShowPurchaseDialog(false);
        setSelectedTier(null);
        setPurchaseError('');
        // Add a small delay before navigation to ensure state updates are complete
        setTimeout(() => {
          navigate('/profile');
        }, 100);
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Error purchasing membership:', error);
      // Only show error if it's not a successful purchase
      if (error.response?.status !== 200) {
        const errorMessage = error.response?.data?.message || 'Error purchasing membership. Please try again.';
        setPurchaseError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      {/* Enhanced Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute w-[500px] h-[500px] bg-blue-500/20 blur-[180px] rounded-full -top-20 -left-20 animate-pulse"></div>
          <div className="absolute w-[400px] h-[400px] bg-purple-500/20 blur-[160px] rounded-full -bottom-20 -right-20 animate-pulse"></div>
          <div className="absolute w-[300px] h-[300px] bg-indigo-500/20 blur-[140px] rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-white/10 backdrop-blur-sm rounded-lg"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
            >
              <span className="text-white/90 text-sm font-medium">Welcome to the Future of Professional Networking</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Transform Your Professional
              <span className="block text-blue-300 mt-2">Network & Investment Journey</span>
            </h1>

            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto lg:mx-0">
              Join BN's exclusive ecosystem where professionals, investors, and entrepreneurs connect, collaborate, and create opportunities together.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowVerificationDialog(true)}
                className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2 group"
              >
                Verify Membership
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePurchaseMembership('Basic')}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-all duration-300 border border-white/20 flex items-center justify-center gap-2"
              >
                Purchase Membership
              </motion.button>
            </div>

            {/* Quick Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {heroFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20"
                >
                  <div className="text-blue-300 mb-2">{feature.icon}</div>
                  <div className="text-white font-medium">{feature.text}</div>
                  <div className="text-white/60 text-sm">{feature.description}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Visual Element */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-xl">
              {/* Network Visualization */}
              <div className="relative w-full aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl"></div>
                {/* Animated Network Nodes */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute bg-white rounded-full"
                    style={{
                      width: Math.random() * 20 + 10,
                      height: Math.random() * 20 + 10,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full">
                  {[...Array(8)].map((_, i) => (
                    <motion.line
                      key={i}
                      x1={`${Math.random() * 100}%`}
                      y1={`${Math.random() * 100}%`}
                      x2={`${Math.random() * 100}%`}
                      y2={`${Math.random() * 100}%`}
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="1"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.5 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  ))}
                </svg>
              </div>

              {/* Stats Overlay */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] bg-white/10 backdrop-blur-lg p-4 rounded-xl border border-white/20 shadow-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">10K+</div>
                    <div className="text-white/60 text-sm">Active Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">500+</div>
                    <div className="text-white/60 text-sm">Deals Closed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">50+</div>
                    <div className="text-white/60 text-sm">Countries</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-white/60 text-sm">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 h-2 bg-white/60 rounded-full mt-2"
              />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Platform Overview Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full -left-20 top-1/4"></div>
          <div className="absolute w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full -right-20 bottom-1/4"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
            >
              <span className="text-white/90 text-sm font-medium">Platform Overview</span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              The Complete Professional Network
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              BN is more than just a networking platform. It's a comprehensive ecosystem designed for professionals, investors, and entrepreneurs to connect, collaborate, and grow together.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "For Investors",
                icon: <FiTrendingUp className="w-8 h-8 text-blue-300" />,
                features: [
                  "Access curated investment opportunities with detailed due diligence reports",
                  "Connect with verified entrepreneurs and startups",
                  "Track and manage your investment portfolio",
                  "Real-time market insights and analytics"
                ]
              },
              {
                title: "For Entrepreneurs",
                icon: <FiUsers className="w-8 h-8 text-blue-300" />,
                features: [
                  "Showcase your business to verified investors",
                  "Access mentorship and guidance from industry experts",
                  "Join industry-specific chapters for networking and growth",
                  "Create and manage investment pitches"
                ]
              }
            ].map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className="bg-white/10 backdrop-blur-lg p-8 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  {card.icon}
                  <h3 className="text-2xl font-semibold text-white">{card.title}</h3>
                </div>
                <ul className="space-y-4">
                  {card.features.map((feature, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <FiCheckCircle className="text-blue-300 w-5 h-5 mt-1 flex-shrink-0" />
                      <span className="text-white/80">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 bg-white/5 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -right-40 top-0"></div>
          <div className="absolute w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full -left-40 bottom-0"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
            >
              <span className="text-white/90 text-sm font-medium">Key Features</span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Why Choose <span className="text-blue-300">BN</span>?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="text-blue-300 mb-4 transform transition-transform duration-300"
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Modules Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full left-1/4 top-0"></div>
          <div className="absolute w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full right-1/4 bottom-0"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
            >
              <span className="text-white/90 text-sm font-medium">Platform Modules</span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Comprehensive Platform Modules
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {platformModules.map((module, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300"
              >
                <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-blue-300 transition-colors duration-300">
                  {module.title}
                </h3>
                <ul className="space-y-3">
                  {module.features.map((feature, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      className="flex items-start gap-2"
                    >
                      <FiCheckCircle className="text-blue-300 w-4 h-4 mt-1 flex-shrink-0" />
                      <span className="text-white/70 text-sm group-hover:text-white/90 transition-colors duration-300">
                        {feature}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4 bg-white/5 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -left-40 top-0"></div>
          <div className="absolute w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full -right-40 bottom-0"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
            >
              <span className="text-white/90 text-sm font-medium">Platform Statistics</span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Growing Global Network
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300 text-center"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-bold text-blue-300 mb-2"
                >
                  {stat.value}
                </motion.div>
                <div className="text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Tiers Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full -right-20 top-1/4"></div>
          <div className="absolute w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full -left-20 bottom-1/4"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
            >
              <span className="text-white/90 text-sm font-medium">Membership Options</span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Choose Your Membership Tier
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Select the perfect membership tier that aligns with your professional goals and networking needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {membershipTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`relative bg-white/10 backdrop-blur-lg p-8 rounded-xl border ${
                  tier.name === 'Professional'
                    ? 'border-blue-400 shadow-lg shadow-blue-500/20'
                    : 'border-white/20 hover:border-white/30'
                } transition-all duration-300`}
              >
                {tier.name === 'Professional' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-blue-500 rounded-full text-white text-sm font-medium"
                  >
                    Most Popular
                  </motion.div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="text-3xl font-bold text-blue-300">{tier.price}</div>
                </div>
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <FiCheckCircle className="text-blue-300 w-5 h-5 mt-1 flex-shrink-0" />
                      <span className="text-white/80">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePurchaseMembership(tier.name)}
                  className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
                    tier.name === 'Professional'
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  Get Started
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-20 px-4 bg-white/5 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -left-40 top-0"></div>
          <div className="absolute w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full -right-40 bottom-0"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
            >
              <span className="text-white/90 text-sm font-medium">Success Stories</span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              What Our Members Say
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-white/60 text-sm">{testimonial.role}</div>
                    <div className="text-blue-300 text-sm">{testimonial.company}</div>
                  </div>
                </div>
                <p className="text-white/80 italic">"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Section */}
      <section className="py-20 px-4 bg-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Join <span className="text-blue-300">BN</span> Today
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Get access to exclusive networking opportunities and investment deals
          </p>
          <button
            onClick={() => handlePurchaseMembership('Basic')}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-colors duration-300 shadow-lg hover:shadow-blue-500/50"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Membership Verification Dialog */}
      {showVerificationDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Verify Your Membership</h3>
              <button
                onClick={() => setShowVerificationDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            {verificationError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
                {verificationError}
              </div>
            )}
            <input
              type="text"
              placeholder="Enter your membership ID"
              value={membershipId}
              onChange={(e) => setMembershipId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowVerificationDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleMembershipVerification}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
              >
                Verify
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Membership Purchase Dialog */}
      {showPurchaseDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Purchase Membership</h3>
              <button
                onClick={() => {
                  setShowPurchaseDialog(false);
                  setSelectedTier(null);
                  setPurchaseError('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {purchaseError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
                {purchaseError}
              </div>
            )}

            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-800 mb-4">Select Membership Tier</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {membershipTiers.map((tier) => (
                  <div
                    key={tier.name}
                    onClick={() => setSelectedTier(tier.name)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedTier === tier.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <h5 className="font-semibold text-gray-800">{tier.name}</h5>
                    <p className="text-blue-600 font-bold my-2">{tier.price}</p>
                    <ul className="text-sm text-gray-600 space-y-2">
                      {tier.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <FiCheckCircle className="text-blue-500 w-4 h-4" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-800 mb-4">Membership Benefits</h4>
              <div className="space-y-3">
                {[
                  'Access to exclusive investment opportunities',
                  'Global professional networking',
                  'Market insights and analysis',
                  'Priority support and assistance',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <FiCheckCircle className="text-blue-500 w-5 h-5" />
                    <span className="text-gray-600">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowPurchaseDialog(false);
                  setSelectedTier(null);
                  setPurchaseError('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handlePurchaseConfirm}
                disabled={isProcessing || !selectedTier}
                className={`px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors duration-300 ${
                  isProcessing || !selectedTier
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-blue-600'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Proceed to Payment'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LandingPage; 