import React, { useState, useContext, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useTheme }    from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { jwtDecode }   from "jwt-decode";
import logo            from "../../assets/logo.jpeg";

/* ═════════════════════════════════════════════
   NAVBAR
═════════════════════════════════════════════ */

const Navbar = () => {

  const { darkMode, toggleTheme } = useTheme();
  const { user, logout }          = useContext(AuthContext);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const navigate                  = useNavigate();

  /* ── Get first name and role from JWT ── */

  const getUserInfo = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return { firstName: "", role: "" };

      const decoded = jwtDecode(token);

      const name =
        decoded.name ||
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
        "";

      const role =
        decoded.role ||
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        "";

      return {
        firstName : name ? name.split(" ")[0] : "",
        role      : role,
      };
    } catch {
      return { firstName: "", role: "" };
    }
  };

  const { firstName, role } = getUserInfo();

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const userId = decoded.UserId || decoded.userId || decoded.sub || "";
      if (userId) {
        axiosClient.get(`/User/${userId}`)
          .then(res => {
            if (res.data?.success && res.data.data?.profilePicture) {
              setProfilePic(`http://${window.location.hostname}:5273${res.data.data.profilePicture}`);
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, [user]);

  const isStudent = role === "Student";

  /* ── Logout ── */

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  /* ── render ── */

  return (

    <nav className="navbar">

      <div className="nav-container">

        {/* LOGO */}

        <Link to="/" className="nav-logo">
          <img src={logo} alt="QuizPlatform" className="nav-logo-img" />
          <span className="nav-logo-text">QuizPlatform</span>
        </Link>

        {/* CENTER LINKS
            Guest   : Home · Quizzes · Leaderboard (public) · Contact
            Student : Leaderboard (protected)
            Teacher : (nothing — sidebar handles navigation)
        */}

        <ul className="nav-links">

          {!user && <li><Link to="/">Home</Link></li>}
          {!user && <li><Link to="/quizzes">Quizzes</Link></li>}

          {/* Guest — public leaderboard */}
          {!user && (
            <li><Link to="/public-leaderboard">Leaderboard</Link></li>
          )}

          {/* Student — protected leaderboard */}
          {isStudent && (
            <li><Link to="/leaderboard">Leaderboard</Link></li>
          )}

          {!user && <li><Link to="/contact">Contact</Link></li>}

        </ul>

        {/* RIGHT SIDE */}

        <div className="nav-right">

          {/* Dark mode toggle — public only */}
          {!user && (
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title="Toggle theme"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          )}

          {!user ? (

            /* Public — Login + Sign Up */
            <>
              <Link to="/login"    className="btn-login">Login</Link>
              <Link to="/register" className="btn-signup">Sign Up</Link>
            </>

          ) : (

            /* Logged in — Avatar + Name + Logout */
            <>
              <div className="nav-user">
                <div className="nav-user-avatar">
                  {profilePic
                    ? <img src={profilePic} alt="avatar" className="nav-avatar-img" />
                    : firstName.charAt(0).toUpperCase()
                  }
                </div>
                <span className="nav-user-name">{firstName}</span>
              </div>

              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </>

          )}

          {/* Mobile hamburger — public only */}
          {!user && (
            <button
              className="nav-hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="menu"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          )}

        </div>

      </div>

      {/* MOBILE MENU — public only */}

      {!user && menuOpen && (
        <div className="nav-mobile-menu">
          <Link to="/"                   onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/quizzes"            onClick={() => setMenuOpen(false)}>Quizzes</Link>
          <Link to="/public-leaderboard" onClick={() => setMenuOpen(false)}>Leaderboard</Link>
          <Link to="/contact"            onClick={() => setMenuOpen(false)}>Contact</Link>
          <Link to="/login"              onClick={() => setMenuOpen(false)} className="mobile-login">Login</Link>
          <Link to="/register"           onClick={() => setMenuOpen(false)} className="mobile-signup">Sign Up</Link>
        </div>
      )}

    </nav>

  );

};

export default Navbar;