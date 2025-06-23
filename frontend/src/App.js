import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import axios from "axios";
import config from "./config/config.js";
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
import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Settings from "./pages/admin/Settings";
import WebsiteSettings from "./pages/admin/WebsiteSettings";
import UserManagement from "./pages/admin/UserManagement";
import ChapterManagement from "./pages/admin/ChapterManagement";
import CommunityManagement from "./pages/admin/CommunityManagement";
import UserDetails from './pages/admin/UserDetails';
import ChapterDetails from './pages/admin/ChapterDetails';
import MembershipManagement from './pages/admin/MembershipManagement';
import MaintenancePage from "./pages/utility/MaintenancePage";
import { MaintenanceRoute } from "./middleware/maintenanceMiddleware";
import TwoFactorSetup from './pages/admin/TwoFactorSetup';

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

        console.log("Checking user status...", { token, userId, onboardingCompleted });

        // If no token or userId, go directly to landing page
        if (!token || !userId) {
          console.log("No token or userId found, redirecting to landing page");
          setInitialRoute("/");
          setIsLoading(false);
          return;
        }

        // First check if user is admin
        try {
          console.log("Checking if user is admin...");
          const userResponse = await axios.get(
            `${config.API_BASE_URL}/api/users/profile`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          console.log("User profile response:", userResponse.data);

          if (userResponse.data.user.isAdmin) {
            console.log("User is admin, redirecting to admin panel");
            setInitialRoute("/admin");
            setIsLoading(false);
            return;
          } else {
            console.log("User is not admin, continuing with normal flow");
          }
        } catch (error) {
          console.error("Error checking user status:", error);
          // If there's an error checking user status, continue with normal flow
        }

        // If not admin, check membership status
        try {
          console.log("Checking membership status...");
          const membershipResponse = await axios.get(
            `${config.API_BASE_URL}/api/membership/verify`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          console.log("Membership response:", membershipResponse.data);

          if (membershipResponse.data.hasActiveMembership) {
            // User has active membership, check onboarding
            if (onboardingCompleted === "true") {
              console.log("Onboarding completed, redirecting to profile");
              setInitialRoute("/profile");
            } else {
              console.log("Onboarding not completed, redirecting to onboarding");
              setInitialRoute("/onboarding");
            }
          } else {
            console.log("No active membership, redirecting to landing page");
            toast.error(membershipResponse.data.message || 'Membership expired or not found');
            // Clear any existing membership data
            localStorage.removeItem('membershipId');
            localStorage.removeItem('membershipTier');
            setInitialRoute("/");
          }
        } catch (error) {
          console.error("Error checking membership:", error);
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
          <MaintenanceRoute>
            {initialRoute === "/" ? (
              <LandingPage />
            ) : (
              <Navigate to={initialRoute} replace />
            )}
          </MaintenanceRoute>
        } />
        <Route path="/login" element={
          <MaintenanceRoute>
            <Login />
          </MaintenanceRoute>
        } />
        <Route path="/register" element={
          <MaintenanceRoute>
            <Register />
          </MaintenanceRoute>
        } />
        <Route path="/maintenance" element={<MaintenancePage />} />

        {/* Protected Routes */}
        <Route path="/onboarding" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />
        <Route path="/profile" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />
        <Route path="/verify-otp" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <VerifyOTP />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />
        <Route path="/verify-mobile" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <VerifyMobile />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />
        <Route path="/activity" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <ActivityPage />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />
        <Route path="/people" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <ConnectPage />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />
        <Route path="/chapter" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <GroupsPage />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />
        <Route path="/chapter/create" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <CreateChapter />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />
        <Route path="/chapterDashboard/:chapterId" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <GroupDashboard />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />
        <Route path="/userProfile/:id" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <GeneralProfile />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />
        <Route path="/referrals" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <ReferralsPage />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />
        <Route path="/myTransactions" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />
        <Route path="/create-investment" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <CreateInvestment />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />
        <Route path="/add-business-info" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <AddBusinessInfo />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />
        <Route path="/edit-profile" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />
        <Route path="/withdrawal-requests" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <WithdrawalRequests />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />
        <Route path="/community" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <CommunityPage />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />
        <Route path="/post/:postId" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <SinglePost />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />
        <Route path="/reports/platform" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <PlatformReport />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />
        <Route path="/membership/upgrade" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <UpgradePage />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />
        <Route path="/about" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <AboutPlatformPage />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />
        <Route path="/commonIssues" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <HelpCenterPage />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />
        <Route path="/support" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <SupportPage />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />
        <Route path="/terms-and-conditions" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <TermsAndConditionsPage />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />
        <Route path="/privacy-policy" element={
          <MaintenanceRoute>
            <ProtectedRoute>
              <PrivacyPolicyPage />
            </ProtectedRoute>
          </MaintenanceRoute>
        } />

        {/* Admin Routes - These don't need MaintenanceRoute wrapper */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:userId"
          element={
            <ProtectedRoute>
              <UserDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/chapters"
          element={
            <ProtectedRoute>
              <ChapterManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/chapters/:chapterId"
          element={
            <ProtectedRoute>
              <ChapterDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/posts"
          element={
            <ProtectedRoute>
              <CommunityManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/memberships"
          element={
            <ProtectedRoute>
              <MembershipManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/website-settings"
          element={
            <ProtectedRoute>
              <WebsiteSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/twofactor"
          element={
            <ProtectedRoute>
              <TwoFactorSetup />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
