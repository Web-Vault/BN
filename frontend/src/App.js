import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import Onboarding from "./pages/auth/onboarding";
import VerifyOTP from "./pages/auth/verifyOTP";
import VerifyMobile from "./pages/auth/verifyMobile";
import Profile from "./pages/profiles/userProfile";
import ActivityPage from "./pages/utility/activity";
import ConnectPage from "./pages/network/connectGlobal";
import GroupsPage from "./pages/chapters/chapterList";
import GroupDashboard from "./pages/chapters/myCreation";
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

function App() {

  const isFirstTimeUser = localStorage.getItem("onboardingCompleted") !== "true";

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/onboarding"
          element={isFirstTimeUser ? <Onboarding /> : <Navigate to="/profile" />}
        />

        <Route path="/" element={<Profile />} />
        <Route path="/profile" element={<Profile />} />
        
        <Route path="/activity" element={<ActivityPage />} />

        <Route path="/people" element={<ConnectPage />} />

        <Route path="/chapter" element={<GroupsPage />} />

        <Route path="/chapterDashboard/:chapterId" element={<GroupDashboard />} /> 
        
        <Route path="/userProfile/:id" element={<GeneralProfile />} />
       
        <Route path="/referrals" element={<ReferralsPage />} />
        
        <Route path="/myTransactions" element={<TransactionsPage />} />

        <Route path="/about" element={<AboutPlatformPage />} />

        <Route path="/support" element={<SupportPage />} />
        
        <Route path="/commonIssues" element={<HelpCenterPage />} />

        <Route path="/create-investment" element={<CreateInvestment />} />

        <Route path="/add-business-info" element={<AddBusinessInfo />} />

        <Route path="/edit-profile" element={<EditProfile />} />

        <Route path="/withdrawal-requests" element={<WithdrawalRequests />} />

        <Route path="/verify-otp" element={<VerifyOTP />} />
        
        <Route path="/verify-mobile" element={<VerifyMobile />} />

        <Route path="/community" element={<CommunityPage />} /> 

        <Route path="/post/:postId" element={<SinglePost />} />
      </Routes>
    </Router>
  );
}

export default App;
