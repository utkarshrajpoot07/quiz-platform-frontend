import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import { jwtDecode } from "jwt-decode";
import "./TeacherSettings.css";

import PersonIcon        from "@mui/icons-material/Person";
import SecurityIcon      from "@mui/icons-material/Security";
import TuneIcon          from "@mui/icons-material/Tune";
import NotificationsIcon from "@mui/icons-material/Notifications";

/* ════ NAV CONFIG ════ */
const NAV_ITEMS = [
  { key: "account",       label: "Account",       icon: <PersonIcon />        },
  { key: "security",      label: "Security",       icon: <SecurityIcon />      },
  { key: "preferences",   label: "Preferences",    icon: <TuneIcon />          },
  { key: "notifications", label: "Notifications",  icon: <NotificationsIcon /> },
];

const TeacherSettings = () => {

  const [active,       setActive]       = useState("account");
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [saveMsg,      setSaveMsg]      = useState("");

  const [profile,      setProfile]      = useState({});
  const [editData,     setEditData]     = useState({});

  const [passwordData, setPasswordData] = useState({
    currentPassword : "",
    newPassword     : "",
    confirmPassword : "",
  });

  const [prefs, setPrefs] = useState({
    shuffleQuestions : false,
    showAnswers      : false,
  });

  const [notifs, setNotifs] = useState({
    emailAlerts        : false,
    leaderboardUpdates : false,
  });

  /* ════ LOAD PROFILE ════ */
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token   = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      const res     = await axiosClient.get(`/User/${decoded.UserId}`);

      if (res.data.success) {
        setProfile(res.data.data);
        setEditData(res.data.data);
      } else {
        setError("Failed to load profile.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ════ PROFILE ════ */
  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const updateProfile = async () => {
    try {
      setSaving(true);
      await axiosClient.put("/User/update", {
        id       : profile.id,
        fullName : editData.fullName,
        email    : editData.email,
        phone    : editData.phone,
      });
      showMsg("Profile saved successfully ✅");
    } catch {
      showMsg("Failed to save. Try again ❌");
    } finally {
      setSaving(false);
    }
  };

  /* ════ PASSWORD ════ */
  const handlePassword = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMsg("Passwords do not match ❌");
      return;
    }
    try {
      setSaving(true);
      await axiosClient.post("/auth/change-password", {
        oldPassword : passwordData.currentPassword,
        newPassword : passwordData.newPassword,
      });
      showMsg("Password updated 🔐");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      showMsg("Failed to update password ❌");
    } finally {
      setSaving(false);
    }
  };

  /* ════ HELPERS ════ */
  const showMsg = (msg) => {
    setSaveMsg(msg);
    setTimeout(() => setSaveMsg(""), 3000);
  };

  /* ════ LOADING ════ */
  if (loading) {
    return (
      <div className="ts-wrapper">
        <div className="ts-skeleton-header" />
        <div className="ts-skeleton-grid">
          <div className="ts-skeleton-nav" />
          <div className="ts-skeleton-panel" />
        </div>
      </div>
    );
  }

  /* ════ ERROR ════ */
  if (error) {
    return (
      <div className="ts-wrapper">
        <div className="ts-error-banner">
          <span>⚠ {error}</span>
          <button onClick={loadProfile}>Retry</button>
        </div>
      </div>
    );
  }

  /* ════ RENDER ════ */
  return (
    <div className="ts-wrapper">

      {/* ── HEADER ── */}
      <div className="ts-header">
        <h2>⚙ Settings</h2>
        <p>Manage your account and preferences</p>
      </div>

      {/* ── TOAST ── */}
      {saveMsg && <div className="ts-toast">{saveMsg}</div>}

      <div className="ts-grid">

        {/* ════ SIDEBAR ════ */}
        <div className="ts-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`ts-nav-item ${active === item.key ? "active" : ""}`}
              onClick={() => setActive(item.key)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* ════ PANEL ════ */}
        <div className="ts-panel">

          {/* ── ACCOUNT ── */}
          {active === "account" && (
            <>
              <h3 className="ts-panel-title">Account Information</h3>

              <div className="ts-form">
                <div className="ts-field">
                  <label>Full Name</label>
                  <input
                    name="fullName"
                    value={editData.fullName || ""}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="ts-field">
                  <label>Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={editData.email || ""}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="ts-field">
                  <label>Phone Number</label>
                  <input
                    name="phone"
                    value={editData.phone || ""}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                <button
                  className="ts-btn"
                  onClick={updateProfile}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </>
          )}

          {/* ── SECURITY ── */}
          {active === "security" && (
            <>
              <h3 className="ts-panel-title">Change Password</h3>

              <div className="ts-form">
                <div className="ts-field">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePassword}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="ts-field">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePassword}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="ts-field">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePassword}
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  className="ts-btn"
                  onClick={changePassword}
                  disabled={saving}
                >
                  {saving ? "Updating…" : "Update Password"}
                </button>
              </div>
            </>
          )}

          {/* ── PREFERENCES ── */}
          {active === "preferences" && (
            <>
              <h3 className="ts-panel-title">Preferences</h3>

              <div className="ts-toggles">
                <div className="ts-toggle-row">
                  <div className="ts-toggle-info">
                    <span className="ts-toggle-label">Shuffle Questions</span>
                    <span className="ts-toggle-desc">Randomize question order for each attempt</span>
                  </div>
                  <label className="ts-switch">
                    <input
                      type="checkbox"
                      checked={prefs.shuffleQuestions}
                      onChange={() => setPrefs({ ...prefs, shuffleQuestions: !prefs.shuffleQuestions })}
                    />
                    <span className="ts-slider" />
                  </label>
                </div>

                <div className="ts-toggle-row">
                  <div className="ts-toggle-info">
                    <span className="ts-toggle-label">Show Answers</span>
                    <span className="ts-toggle-desc">Display correct answers after quiz submission</span>
                  </div>
                  <label className="ts-switch">
                    <input
                      type="checkbox"
                      checked={prefs.showAnswers}
                      onChange={() => setPrefs({ ...prefs, showAnswers: !prefs.showAnswers })}
                    />
                    <span className="ts-slider" />
                  </label>
                </div>
              </div>
            </>
          )}

          {/* ── NOTIFICATIONS ── */}
          {active === "notifications" && (
            <>
              <h3 className="ts-panel-title">Notifications</h3>

              <div className="ts-toggles">
                <div className="ts-toggle-row">
                  <div className="ts-toggle-info">
                    <span className="ts-toggle-label">Email Alerts</span>
                    <span className="ts-toggle-desc">Receive quiz results and updates via email</span>
                  </div>
                  <label className="ts-switch">
                    <input
                      type="checkbox"
                      checked={notifs.emailAlerts}
                      onChange={() => setNotifs({ ...notifs, emailAlerts: !notifs.emailAlerts })}
                    />
                    <span className="ts-slider" />
                  </label>
                </div>

                <div className="ts-toggle-row">
                  <div className="ts-toggle-info">
                    <span className="ts-toggle-label">Leaderboard Updates</span>
                    <span className="ts-toggle-desc">Get notified when rankings change</span>
                  </div>
                  <label className="ts-switch">
                    <input
                      type="checkbox"
                      checked={notifs.leaderboardUpdates}
                      onChange={() => setNotifs({ ...notifs, leaderboardUpdates: !notifs.leaderboardUpdates })}
                    />
                    <span className="ts-slider" />
                  </label>
                </div>
              </div>
            </>
          )}

        </div>
        {/* end panel */}

      </div>
      {/* end grid */}

    </div>
  );
};

export default TeacherSettings;