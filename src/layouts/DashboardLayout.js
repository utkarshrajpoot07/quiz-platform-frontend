import React, { useState, useEffect, useContext } from "react";
import axiosClient from "../api/axiosClient";
import { jwtDecode } from "jwt-decode";
import "./DashboardLayout.css";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaChartPie, FaClipboardList, FaTrophy, FaBook, FaUser, FaBars } from "react-icons/fa";

// ── AuthContext ─────────────────────────────────────────────
import { AuthContext }                from "../context/AuthContext";

// ── SearchContext ───────────────────────────────────────────
import { SearchProvider, useSearch } from "../context/SearchContext";

/* ═════════════════════════════════════════════
   INNER — consumes SearchContext + AuthContext
═════════════════════════════════════════════ */

const DashboardLayoutInner = () => {

  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [collapsed,    setCollapsed]    = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ✅ BUG FIX 1 — AuthContext se name aur logout lo
  const { name, logout }          = useContext(AuthContext);
  const { searchTerm, setSearchTerm } = useSearch();

  const location = useLocation();
  const navigate = useNavigate();

  // ✅ BUG FIX 2 — Dynamic avatar letter from name
  const avatarLetter = name?.charAt(0)?.toUpperCase() || "S";

  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const userId = decoded.UserId || decoded.userId || decoded.sub || "";
      if (userId) {
        axiosClient.get(`/User/${userId}`)
          .then(res => {
            if (res.data.success && res.data.data.profilePicture) {
              setProfilePic(`http://${window.location.hostname}:5273${res.data.data.profilePicture}`);
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  /* ── CLOSE SIDEBAR ON MOBILE ── */

  const closeSidebar = () => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  /* ── DROPDOWN OUTSIDE CLICK ── */

  useEffect(() => {
    const handleClick = (e) => {
      if (
        !e.target.closest(".profile-dropdown") &&
        !e.target.closest(".profile-circle")
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  /* ── CLEAR SEARCH ON ROUTE CHANGE ── */

  useEffect(() => {
    setSearchTerm("");
  }, [location.pathname, setSearchTerm]);

  /* ── only show search bar on dashboard page ── */

  const isDashboard = location.pathname === "/student/dashboard";

  // ✅ BUG FIX 3 — AuthContext logout use karo
  const handleLogout = () => {
    logout();
    navigate("/");
    setDropdownOpen(false);
  };

  /* ── render ── */

  return (
    <div className="dashboard-layout">

      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`sidebar ${collapsed ? "collapsed" : ""} ${sidebarOpen ? "open" : ""}`}
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
      >

        <h2 className="sidebar-logo">
          <span className="logo-full">QuizPlatform</span>
          <span className="logo-mini">QP</span>
        </h2>

        <ul className="sidebar-menu">

          <li>
            <NavLink to="/student/dashboard" onClick={closeSidebar}>
              <FaChartPie className="menu-icon" />
              <span>Dashboard</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/student/quizzes" onClick={closeSidebar}>
              <FaClipboardList className="menu-icon" />
              <span>My Quizzes</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/student/results" onClick={closeSidebar}>
              <FaTrophy className="menu-icon" />
              <span>Results</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/student/learn" onClick={closeSidebar}>
              <FaBook className="menu-icon" />
              <span>Learn & Practice</span>
            </NavLink>
          </li>

          <li>
            {/* ✅ Same as App.js — /profile */}
            <NavLink to="/profile" onClick={closeSidebar}>
              <FaUser className="menu-icon" />
              <span>Profile</span>
            </NavLink>
          </li>

        </ul>

      </aside>

      {/* MAIN */}
      <div className="dashboard-main">

        {/* TOPBAR */}
        <div className="dashboard-topbar">

          <button
            className="hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FaBars />
          </button>

          <div className="topbar-title">Student Panel</div>

          <div className="topbar-actions">

            {/* SEARCH — only on dashboard */}
            {isDashboard && (
              <div className="search-wrap">
                <span className="search-icon">🔍</span>
                <input
                  className="search-box"
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoComplete="off"
                />
                {searchTerm && (
                  <button
                    className="search-clear"
                    onClick={() => setSearchTerm("")}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {/* ✅ BUG FIX 2 — Dynamic avatar letter */}
            <div
              className="profile-circle"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {profilePic
                ? <img src={profilePic} alt="avatar" className="profile-circle-img" />
                : avatarLetter
              }
            </div>

            {/* DROPDOWN */}
            {dropdownOpen && (
              <div className="profile-dropdown">

                <div className="dropdown-user">
                  <div className="user-avatar">
                    {profilePic
                      ? <img src={profilePic} alt="avatar" className="profile-circle-img" />
                      : avatarLetter
                    }
                  </div>
                  <div className="user-info">
                    {/* ✅ BUG FIX 2 — Dynamic name */}
                    <span className="user-name">{name || "Student"}</span>
                    <span className="user-role">Learner</span>
                  </div>
                </div>

                <div className="dropdown-divider" />

                <div
                  className="dropdown-item"
                  onClick={() => { navigate("/profile"); setDropdownOpen(false); }}
                >
                  <FaUser className="dropdown-icon" /> Profile
                </div>

                <div
                  className="dropdown-item"
                  onClick={() => { navigate("/student/results"); setDropdownOpen(false); }}
                >
                  📊 Results
                </div>

                <div className="dropdown-divider" />

                {/* ✅ BUG FIX 3 — AuthContext logout */}
                <div
                  className="dropdown-item logout"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </div>

              </div>
            )}

          </div>

        </div>

        {/* CONTENT */}
        <div className="dashboard-content">
          <div key={location.pathname} className="page-animate">
            <Outlet />
          </div>
        </div>

      </div>

    </div>
  );
};

/* ═════════════════════════════════════════════
   WRAPPER — SearchProvider wrap
═════════════════════════════════════════════ */

const DashboardLayout = () => (
  <SearchProvider>
    <DashboardLayoutInner />
  </SearchProvider>
);

export default DashboardLayout;