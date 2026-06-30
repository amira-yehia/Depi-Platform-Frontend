import { Navigate, Route, Routes } from "react-router-dom";
import ProfilePage from "./pages/ProfilePage";
import AppLayout from "./components/AppLayout";
import LandingPage from "./pages/LandingPage";
import SignUpPage from "./pages/SignUpPage";
import SignInPage from "./pages/SignInPage";
import DashboardPage from "./pages/DashboardPage";
import ContractsMilestonesPage from "./pages/ContractsMilestonesPage";
import Messages from "./pages/Messages.jsx";
import NoSidebarLayout from "./components/NoSidebarLayout";
import FindProjectsPage from "./pages/FindProjectsPage";
import MarketplacePage from "./pages/MarketplacePage";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";
import ProposalsPage from "./pages/ProposalsPage";
import PageTransition from "./components/PageTransition";
import ChangePassword from "./pages/ChangePassword";
import FeaturedPortfolioPage from "./pages/FeaturedPortfolioPage.jsx";
function wt(page) {
  return <PageTransition>{page}</PageTransition>;
}

function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={wt(<LandingPage />)} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={wt(<SignUpPage />)} />

      {/* App pages with sidebar */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={wt(<DashboardPage />)} />
        <Route path="/contracts" element={wt(<ContractsMilestonesPage />)} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/marketplace" element={wt(<MarketplacePage />)} />
        <Route path="/proposals" element={wt(<ProposalsPage />)} />
        <Route path="/change-password" element={wt(<ChangePassword />)} />
      </Route>

      {/* Pages without sidebar */}
      <Route element={<NoSidebarLayout />}>
        <Route path="/projects" element={wt(<FindProjectsPage />)} />
        <Route
          path="/projects/:projectId"
          element={wt(<ProjectDetailsPage />)}
        />
        <Route path="/profile" element={wt(<ProfilePage />)} />
        <Route path="/profile/:userId" element={wt(<ProfilePage />)} />
      </Route>

      {/* Fallback */}
      <Route
        path="/featured-portfolio"
        element={wt(<FeaturedPortfolioPage />)}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
