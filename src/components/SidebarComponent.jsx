import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { authService, clearTokens } from "../services/api";
import ChangePassword from "../pages/ChangePassword";

const sidebarLinks = [
  { label: "Dashboard",     icon: "fa-solid fa-chart-pie",          to: "/dashboard" },
  { label: "Marketplace",   icon: "fa-solid fa-bag-shopping",        to: "/marketplace" },
  { label: "Find Jobs",     icon: "fa-solid fa-magnifying-glass",    to: "/projects" },
  { label: "Proposals",     icon: "fa-solid fa-file-lines",          to: "/proposals" },
  { label: "Contracts",     icon: "fa-solid fa-file-contract",       to: "/contracts" },
  { label: "Messages",      icon: "fa-solid fa-envelope",            to: "/messages" },
  { label: "Profile",       icon: "fa-solid fa-user",                to: "/profile" },
];

function SidebarComponent() {
  const [changePassOpen, setChangePassOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout(e) {
    e.preventDefault();
    try {
      await authService.logout();
    } catch {
      clearTokens();
    }
    navigate("/signin");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <NavLink to="/dashboard" aria-label="Go to dashboard">
          <img src="/images/logo.png" alt="NextHire logo" className="sidebar-logo" />
        </NavLink>
      </div>

      <nav className="sidebar-content" aria-label="Dashboard navigation">
        <div className="sidebar-nav">
          {sidebarLinks.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) => `sidebar-nav-link ${isActive ? "active" : ""}`}
            >
              <i className={item.icon} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-nav-link"
          onClick={() => setChangePassOpen(true)}
        >
          <i className="fa-solid fa-key" aria-hidden="true" />
          <span>Change Password</span>
        </button>
        <button
          type="button"
          className="sidebar-nav-link"
          onClick={handleLogout}
        >
          <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true" />
          <span>Log Out</span>
        </button>
      </div>

      {changePassOpen && (
        <ChangePassword isOpen={changePassOpen} onClose={() => setChangePassOpen(false)} />
      )}
    </aside>
  );
}

export default SidebarComponent;
