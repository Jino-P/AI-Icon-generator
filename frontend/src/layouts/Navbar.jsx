import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { HiSparkles } from "react-icons/hi";
import { FaImages, FaUser, FaSignOutAlt, FaHome, FaEdit } from "react-icons/fa";
import "../styles/Navbar.css";
import { useState } from "react";
import api from "../services/api";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [creditData, setCreditData] = useState(null);

  let user = null;
  try {
    const token = localStorage.getItem("access_token");
    user = token ? jwtDecode(token) : null;
  } catch (err) {
    console.error("Error decoding token:", err);
    localStorage.removeItem("access_token");
  }

  const currentPath = location.pathname;

  const navItems = [];

  if (user && currentPath !== "/home") {
    navItems.push({
      id: "home",
      label: "Home",
      icon: FaHome,
      action: () => navigate("/home"),
      active: currentPath === "/home",
    });
  }

  if (user && currentPath !== "/generate") {
    navItems.push({
      id: "generate",
      label: "Generate Icon",
      icon: HiSparkles,
      action: () => navigate("/generate"),
      active: currentPath === "/generate",
    });
  }

  if (user && currentPath !== "/gallery") {
    navItems.push({
      id: "gallery",
      label: "Gallery",
      icon: FaImages,
      action: () => navigate("/gallery"),
      active: currentPath === "/gallery",
    });
  }

  if (user && currentPath !== "/studio") {
    navItems.push({
      id: "studio",
      label: "Edit with AI",
      icon: FaEdit,
      action: () => navigate("/studio"),
      active: currentPath === "/studio",
    });
  }
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const fetchCreditUsage = async () => {
  try {
    const token = localStorage.getItem("access_token");

    const res = await fetch("http://localhost:8000/api/usage-summary", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error("Unauthorized or API error");
    }

    const data = await res.json()

    setCreditData(data.credits);
    alert(creditData)
    setShowCreditPopup(true);
    setShowUserMenu(false);

  } catch (err) {
    console.error("Error fetching usage:", err);
  }
};


  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img
          src="/Recode_Logo_2026.jpg"
          alt="AI Icon Generator Logo"
          className="brand-logo"
          onClick={() => navigate("/home")}
        />
      </div>

      {user && navItems.length > 0 && (
        <div className="navbar-menu">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${item.active ? "active" : ""}`}
                onClick={item.action}
                title={item.label}
              >
                <IconComponent className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="navbar-right">
        {user && (
          <div className="user-section">
            <div
              className="user-info"
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{ cursor: "pointer" }}
            >
              <FaUser className="user-icon" />
              <span className="username">{user.sub}</span>
            </div>
            {/* <button
              onClick={handleLogout}
              className="logout-btn"
              title="Logout"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button> */}
          {showUserMenu && (
            <div className="user-dropdown">
            <div className="dropdown-header">
              <p className="user-name">{user?.sub || "User"}</p>
              <p className="user-email">{user?.email || "No email available"}</p>
            </div>

            <div className="dropdown-divider" />

            <button className="dropdown-item" onClick={() => navigate("/profile")}>
              <FaUser className="icon" />
              <span>Profile</span>
            </button>

            <button className="dropdown-item" onClick={fetchCreditUsage}>
              <FaImages className="icon" />
              <span>Credits Usage</span>
            </button>

            <button className="dropdown-item logout" onClick={handleLogout}>
              <FaSignOutAlt className="icon" />
              <span>Logout</span>
            </button>
          </div>
          )}
          {showCreditPopup && (
  <div className="credit-overlay">
    <div className="credit-card">

      <div className="credit-header">
        <h3>Usage Summary</h3>
      </div>

      {creditData ? (
        <div className="credit-grid">

          <div className="credit-item">
            <span className="label">Credits Used</span>
            <span className="value">${creditData.credits_used.toFixed(4)}</span>
          </div>

          <div className="credit-item">
            <span className="label">Input Tokens</span>
            <span className="value">{creditData.tokens_input}</span>
          </div>

          <div className="credit-item">
            <span className="label">Output Tokens</span>
            <span className="value">{creditData.tokens_output}</span>
          </div>

          <div className="credit-item">
            <span className="label">Total Tokens</span>
            <span className="value">{creditData.total_tokens}</span>
          </div>

          <div className="credit-item">
            <span className="label">Images Generated</span>
            <span className="value">{creditData.images_generated}</span>
          </div>

        </div>
      ) : (
        <div className="credit-loading">Loading usage data...</div>
      )}

      <div className="credit-footer">
        <button
          className="close-btn"
          onClick={() => setShowCreditPopup(false)}
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}
          </div>
          
        )}
      </div>
    </nav>
  );
  
};

export default Navbar;
