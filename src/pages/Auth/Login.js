import React, { useState, useContext } from "react";
import "./Login.css";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { toast }                        from "react-hot-toast";
import axiosClient                      from "../../api/axiosClient";
import { AuthContext }                  from "../../context/AuthContext";

import VisibilityIcon    from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import EmailIcon         from "@mui/icons-material/Email";
import LockIcon          from "@mui/icons-material/Lock";

/* ═════════════════════════════════════════════
   MAIN — Login Page
═════════════════════════════════════════════ */

const Login = () => {

  const navigate       = useNavigate();
  const { login, role } = useContext(AuthContext);

  const [form, setForm] = useState({
    email    : "",
    password : "",
    remember : false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);

  // ✅ FIX 1 — Already logged in user ko redirect karo
  if (role === "Teacher") return <Navigate to="/teacher/dashboard" replace />;
  if (role === "Student") return <Navigate to="/student/dashboard" replace />;
  if (role === "Admin")   return <Navigate to="/admin/dashboard"   replace />;

  /* ── handlers ── */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // ✅ FIX 2 — alert() → toast.error()
    if (!form.email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!form.password.trim()) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      const res   = await axiosClient.post("/auth/login", {
        email    : form.email,
        password : form.password,
      });

      const token = res.data.data.token;

      // ✅ FIX 3 — AuthContext login use karo — no jwtDecode directly
      login(token);

      toast.success("Login successful!");

      // ✅ FIX 4 — AuthContext se role aayega — no jwtDecode
      // Role decode AuthContext mein hota hai
      // Thodi der baad redirect — AuthContext update hone do
      setTimeout(() => {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        const role    = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

        if      (role === "Admin")   navigate("/admin/dashboard",   { replace: true });
        else if (role === "Teacher") navigate("/teacher/dashboard", { replace: true });
        else                         navigate("/student/dashboard", { replace: true });
      }, 100);

    } catch (err) {
      console.error(err);
      // ✅ FIX 2 — alert() → toast.error()
      toast.error(
        err?.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── render ── */

  return (

    <div className="login-container">

      <div className="login-card">

        <div className="login-header">
          <h2 className="login-title">Welcome Back 👋</h2>
          <p className="login-subtitle">Login to continue learning</p>
        </div>

        {/* ✅ FIX 5 — MUI TextField/Button/Card hataye — custom inputs */}
        <form className="login-form" onSubmit={handleLogin}>

          {/* Email */}
          <div className="ln-field">
            <label className="ln-label">
              <EmailIcon sx={{ fontSize: 15 }} /> Email Address
            </label>
            <input
              className="ln-input"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="ln-field">
            <label className="ln-label">
              <LockIcon sx={{ fontSize: 15 }} /> Password
            </label>
            <div className="ln-password-wrap">
              <input
                className="ln-input"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="ln-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword
                  ? <VisibilityOffIcon sx={{ fontSize: 18 }} />
                  : <VisibilityIcon    sx={{ fontSize: 18 }} />
                }
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="ln-options">
            <label className="ln-remember">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
              />
              Remember me
            </label>
            <Link className="ln-forgot" to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="ln-submit-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login →"}
          </button>

          {/* Register link */}
          <p className="ln-switch">
            Don't have an account?
            <Link to="/register"> Create one</Link>
          </p>

        </form>

      </div>

    </div>

  );

};

export default Login;