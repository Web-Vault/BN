import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import Onboarding from "./pages/auth/onboarding";
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
      </Routes>
    </Router>
  );
}

export default App;
