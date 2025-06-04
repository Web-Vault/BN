import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import axios from "axios";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import Onboarding from "./pages/auth/onboarding";
import VerifyOTP from "./pages/auth/verifyOTP";
import VerifyMobile from "./pages/auth/verifyMobile";
import ActivityPage from "./pages/utility/activity";
import ConnectPage from "./pages/network/connectGlobal";
import GroupsPage from "./pages/chapters/chapterList";
import GroupDashboard from "./pages/chapters/myCreation";
import CreateChapter from "./pages/chapters/createChapter";
import GeneralProfile from "./pages/profiles/generalProfilePage";
import ReferralsPage from "./pages/network/referrals";
import TransactionsPage from "./pages/network/transactions";
import AboutPlatformPage from "./pages/utility/about";
import SupportPage from "./pages/utility/supportTeam";
import HelpCenterPage from "./pages/utility/commonIssue";
import CreateInvestment from "./pages/investments/CreateInvestment";
import AddBusinessInfo from "./pages/profiles/addBusinessInfo";
import EditProfile from "./pages/profiles/editProfile";
import WithdrawalRequests from "./pages/investments/withdrawalRequests";
import CommunityPage from "./pages/community/communityPage";
import SinglePost from "./pages/community/SinglePost";
import TermsAndConditionsPage from "./pages/utility/termsAndConditions";
import PrivacyPolicyPage from "./pages/utility/privacyPolicy";
import PlatformReport from "./pages/reports/PlatformReport";
import LandingPage from "./pages/landing/LandingPage";
import toast from 'react-hot-toast';
import UserProfile from "./pages/profiles/userProfile";
import UpgradePage from "./pages/membership/upgrade.jsx";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  if (!token || !userId) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        const onboardingCompleted = localStorage.getItem("onBoardingCompleted");

        // If no token or userId, go directly to landing page
        if (!token || !userId) {
          console.log("No token or userId found, redirecting to landing page");
          setInitialRoute("/");
          setIsLoading(false);
          return;
        }

        // Check membership status
        try {
          const membershipResponse = await axios.get(
            "http://localhost:5000/api/membership/verify",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          console.log("Membership response:", membershipResponse.data);

          if (membershipResponse.data.hasActiveMembership) {
            // User has active membership, check onboarding
            if (onboardingCompleted === "true") {
              console.log("Onboarding completed, redirecting to dashboard");
              setInitialRoute("/profile");
            } else {
              console.log("Onboarding not completed, redirecting to onboarding");
              setInitialRoute("/onboarding");
            }
          } else {
            // No active membership or expired, redirect to landing page
            console.log("No active membership or expired, redirecting to landing page");
            toast.error(membershipResponse.data.message || 'Membership expired or not found');
            // Clear any existing membership data
            localStorage.removeItem('membershipId');
            localStorage.removeItem('membershipTier');
            setInitialRoute("/");
          }
        } catch (error) {
          console.error("Error checking membership:", error);
          // If there's an error checking membership, redirect to landing page
          toast.error("Error checking membership status");
          setInitialRoute("/");
        }
      } catch (error) {
        console.error("Error in checkUserStatus:", error);
        setError(error.message);
        setInitialRoute("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          initialRoute === "/" ? (
            <LandingPage />
          ) : (
            <Navigate to={initialRoute} replace />
          )
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* <Route path="/forgot-password" element={<ForgotPasswordPage />} /> */}
        {/* <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> */}

        {/* Protected Routes */}
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <ActivityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/people"
          element={
            <ProtectedRoute>
              <ConnectPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chapter"
          element={
            <ProtectedRoute>
              <GroupsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chapter/create"
          element={
            <ProtectedRoute>
              <CreateChapter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chapterDashboard/:chapterId"
          element={
            <ProtectedRoute>
              <GroupDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/userProfile/:id"
          element={
            <ProtectedRoute>
              <GeneralProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/referrals"
          element={
            <ProtectedRoute>
              <ReferralsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/myTransactions"
          element={
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-investment"
          element={
            <ProtectedRoute>
              <CreateInvestment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-business-info"
          element={
            <ProtectedRoute>
              <AddBusinessInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/withdrawal-requests"
          element={
            <ProtectedRoute>
              <WithdrawalRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <CommunityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post/:postId"
          element={
            <ProtectedRoute>
              <SinglePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/platform"
          element={
            <ProtectedRoute>
              <PlatformReport />
            </ProtectedRoute>
          }
        />

        {/* Public utility routes */}
        <Route path="/about" element={<AboutPlatformPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/commonIssues" element={<HelpCenterPage />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

        {/* Verification routes */}
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/verify-mobile" element={<VerifyMobile />} />

        {/* New route for membership upgrade */}
        <Route
          path="/membership/upgrade"
          element={
            <ProtectedRoute>
              <UpgradePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
