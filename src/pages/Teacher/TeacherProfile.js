import React, { useEffect, useState, useContext, useRef, useCallback } from "react";
import "./TeacherProfile.css";
import axiosClient from "../../api/axiosClient";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

import PersonIcon        from "@mui/icons-material/Person";
import EditIcon          from "@mui/icons-material/Edit";
import LockIcon          from "@mui/icons-material/Lock";
import QuizIcon          from "@mui/icons-material/Quiz";
import QuestionMarkIcon  from "@mui/icons-material/QuestionMark";
import PeopleIcon        from "@mui/icons-material/People";
import TrendingUpIcon    from "@mui/icons-material/TrendingUp";
import CloseIcon         from "@mui/icons-material/Close";
import EmailIcon         from "@mui/icons-material/Email";
import PhoneIcon         from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import VisibilityIcon    from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CameraAltIcon     from "@mui/icons-material/CameraAlt";

/* ═════════════════════════════════════════════
   MAIN — Teacher Profile
═════════════════════════════════════════════ */

const TeacherProfile = () => {

  const { user } = useContext(AuthContext);

  const [profile,       setProfile]       = useState({});
  const [stats,         setStats]         = useState({});
  const [recent,        setRecent]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading,     setUploading]     = useState(false);
  const fileInputRef = useRef(null);

  /* ── modal state ── */

  const [showEdit,     setShowEdit]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saving,       setSaving]       = useState(false);

  const [editData, setEditData] = useState({});

  const [passwordData, setPasswordData] = useState({
    currentPassword : "",
    newPassword     : "",
    confirmPassword : "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);

  /* ── load data ── */

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const teacherId = user?.UserId;

      const [profileRes, dashRes] = await Promise.all([
        axiosClient.get(`/User/${teacherId}`),
        axiosClient.get("/TeacherDashboard/summary"),
      ]);

      if (profileRes.data.success) {
        setProfile(profileRes.data.data);
        setEditData(profileRes.data.data);
        setAvatarPreview(profileRes.data.data.profilePicture ? `http://localhost:5273${profileRes.data.data.profilePicture}` : null);      }

      if (dashRes.data.success) {
        setStats(dashRes.data.data);
        setRecent(dashRes.data.data.recentQuizzes || []);
      }

    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [user?.UserId]);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── helpers ── */

  const handleEditChange = (e) => {
    setEditData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const getInitials = (name) => {
    if (!name) return "T";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  /* ── upload profile picture ── */

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPG, PNG or WEBP allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    // instant local preview
    setAvatarPreview(URL.createObjectURL(file));

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axiosClient.post("/auth/upload-profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setAvatarPreview(`http://localhost:5273${res.data.data}`);
        setProfile(prev => ({ ...prev, profilePicture: res.data.data }));
        toast.success("Profile picture updated!");
      }
    } catch {
      toast.error("Failed to upload image");
      // revert preview
      setAvatarPreview(profile.profilePicture
        ? `http://localhost:5273${profile.profilePicture}`
        : null);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  /* ── update profile ── */

  const updateProfile = async () => {
    if (!editData.fullName?.trim()) return toast.error("Name is required");

    setSaving(true);
    try {
      const res = await axiosClient.put("/User/update", {
        id       : profile.id,
        fullName : editData.fullName,
        email    : editData.email,
        phone    : editData.phone,
      });

      if (res.data.success) {
        setProfile(prev => ({
          ...prev,
          fullName : editData.fullName,
          phone    : editData.phone,
        }));
        toast.success("Profile updated successfully!");
        setShowEdit(false);
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  /* ── change password ── */

  const changePassword = async () => {
    if (!passwordData.currentPassword) return toast.error("Enter current password");
    if (!passwordData.newPassword)     return toast.error("Enter new password");
    if (passwordData.newPassword.length < 6)
      return toast.error("New password must be at least 6 characters");
    if (passwordData.newPassword !== passwordData.confirmPassword)
      return toast.error("Passwords do not match");

    setSaving(true);
    try {
      const res = await axiosClient.post("/auth/change-password", {
        oldPassword : passwordData.currentPassword,
        newPassword : passwordData.newPassword,
      });

      if (res.data.success) {
        toast.success("Password changed successfully!");
        setShowPassword(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch {
      toast.error("Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  /* ── stat cards ── */

  const statCards = [
    {
      key       : "quizzes",
      label     : "Quizzes Created",
      value     : stats.totalQuizzes            || 0,
      icon      : <QuizIcon        sx={{ fontSize: 20 }} />,
      iconColor : "#f59e0b",
      accent    : "#f59e0b",
    },
    {
      key       : "questions",
      label     : "Total Questions",
      value     : stats.totalQuestions          || 0,
      icon      : <QuestionMarkIcon sx={{ fontSize: 20 }} />,
      iconColor : "#06b6d4",
      accent    : "#06b6d4",
    },
    {
      key       : "attempts",
      label     : "Quiz Attempts",
      value     : stats.totalAttempts           || 0,
      icon      : <TrendingUpIcon  sx={{ fontSize: 20 }} />,
      iconColor : "#10b981",
      accent    : "#10b981",
    },
    {
      key       : "students",
      label     : "Students Reached",
      value     : stats.totalStudentsAttempted  || 0,
      icon      : <PeopleIcon      sx={{ fontSize: 20 }} />,
      iconColor : "#6366f1",
      accent    : "#6366f1",
    },
  ];

  /* ── skeleton ── */

  if (loading) return (
    <div className="tp-wrap">
      <div className="tp-skeleton tp-sk-hero"  />
      <div className="tp-stats-grid">
        {[1,2,3,4].map(i => <div key={i} className="tp-skeleton tp-sk-stat" />)}
      </div>
      <div className="tp-skeleton tp-sk-table" />
    </div>
  );

  /* ── render ── */

  return (

    <div className="tp-wrap">

      {/* ── HERO CARD ── */}

      <div className="tp-hero">

        {/* Background decoration */}
        <div className="tp-hero-bg" />

        <div className="tp-hero-content">

          {/* Left — avatar + info */}
          <div className="tp-hero-left">

            <div className="tp-avatar-wrap">
              <div
                className="tp-avatar"
                onClick={() => fileInputRef.current.click()}
                title="Click to change photo"
              >
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" className="tp-avatar-img" />
                  : getInitials(profile.fullName)
                }
                <div className={`tp-avatar-overlay${uploading ? " tp-avatar-uploading" : ""}`}>
                  {uploading
                    ? <span className="tp-upload-spinner" />
                    : <CameraAltIcon sx={{ fontSize: 20, color: "#fff" }} />
                  }
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
            </div>

            <div className="tp-hero-info">

              <h2 className="tp-name">{profile.fullName || "Teacher"}</h2>

              <div className="tp-meta-row">

                <span className="tp-meta-item">
                  <EmailIcon sx={{ fontSize: 14 }} />
                  {profile.email || "—"}
                </span>

                {profile.phone && (
                  <span className="tp-meta-item">
                    <PhoneIcon sx={{ fontSize: 14 }} />
                    {profile.phone}
                  </span>
                )}

                {profile.createdAt && (
                  <span className="tp-meta-item">
                    <CalendarTodayIcon sx={{ fontSize: 14 }} />
                    Joined {formatDate(profile.createdAt)}
                  </span>
                )}

              </div>

              <span className="tp-role-badge">
                <PersonIcon sx={{ fontSize: 13 }} /> Teacher
              </span>

            </div>

          </div>

          {/* Right — action buttons */}
          <div className="tp-hero-actions">

            <button
              className="tp-btn-edit"
              onClick={() => setShowEdit(true)}
            >
              <EditIcon sx={{ fontSize: 15 }} />
              Edit Profile
            </button>

            <button
              className="tp-btn-password"
              onClick={() => setShowPassword(true)}
            >
              <LockIcon sx={{ fontSize: 15 }} />
              Change Password
            </button>

          </div>

        </div>

      </div>

      {/* ── STAT CARDS ── */}

      <div className="tp-stats-grid">

        {statCards.map(card => (

          <div
            key={card.key}
            className="tp-stat-card"
            style={{ borderBottom: `3px solid ${card.accent}` }}
          >

            <div className="tp-stat-top">
              <span className="tp-stat-label">{card.label.toUpperCase()}</span>
              <span
                className="tp-stat-icon"
                style={{ color: card.iconColor, background: `${card.iconColor}1a` }}
              >
                {card.icon}
              </span>
            </div>

            <div className="tp-stat-number">{card.value}</div>

          </div>

        ))}

      </div>

      {/* ── RECENT QUIZZES ── */}

      <div className="tp-recent-card">

        <div className="tp-recent-header">
          <h3 className="tp-recent-title">
            <QuizIcon sx={{ fontSize: 18, verticalAlign: "middle", marginRight: "6px" }} />
            Recent Quizzes
          </h3>
          {recent.length > 0 && (
            <span className="tp-recent-count">{recent.length} quizzes</span>
          )}
        </div>

        {recent.length === 0 ? (

          <div className="tp-empty">
            <QuizIcon sx={{ fontSize: 40, color: "#94a3b8" }} />
            <p>No quizzes created yet</p>
          </div>

        ) : (

          <div className="tp-table-wrap">

            <table className="tp-table">

              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Attempts</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {recent.map((q, i) => (
                  <tr key={q.quizId || i}>
                    <td className="tp-td-title">{q.title}</td>
                    <td>
                      <span className="tp-attempts-badge">{q.attempts}</span>
                    </td>
                    <td className="tp-td-date">{formatDate(q.createdAt)}</td>
                  </tr>
                ))}
              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* ══════════════════════════════
          EDIT PROFILE MODAL
      ══════════════════════════════ */}

      {showEdit && (

        <div className="tp-modal-overlay" onClick={() => setShowEdit(false)}>

          <div className="tp-modal" onClick={e => e.stopPropagation()}>

            <div className="tp-modal-header">
              <h3>Edit Profile</h3>
              <button className="tp-modal-close" onClick={() => setShowEdit(false)}>
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <div className="tp-modal-body">

              <div className="tp-field">
                <label className="tp-field-label">Full Name</label>
                <input
                  className="tp-input"
                  name="fullName"
                  placeholder="Your full name"
                  value={editData.fullName || ""}
                  onChange={handleEditChange}
                />
              </div>

              <div className="tp-field">
                <label className="tp-field-label">Email</label>
                <input
                  className="tp-input"
                  name="email"
                  placeholder="Email address"
                  value={editData.email || ""}
                  onChange={handleEditChange}
                  disabled
                />
              </div>

              <div className="tp-field">
                <label className="tp-field-label">Phone <span className="tp-optional">(optional)</span></label>
                <input
                  className="tp-input"
                  name="phone"
                  placeholder="Phone number"
                  value={editData.phone || ""}
                  onChange={handleEditChange}
                />
              </div>

            </div>

            <div className="tp-modal-footer">
              <button className="tp-btn-ghost" onClick={() => setShowEdit(false)}>Cancel</button>
              <button className="tp-btn-save" onClick={updateProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </div>

        </div>

      )}

      {/* ══════════════════════════════
          CHANGE PASSWORD MODAL
      ══════════════════════════════ */}

      {showPassword && (

        <div className="tp-modal-overlay" onClick={() => setShowPassword(false)}>

          <div className="tp-modal" onClick={e => e.stopPropagation()}>

            <div className="tp-modal-header">
              <h3>Change Password</h3>
              <button className="tp-modal-close" onClick={() => setShowPassword(false)}>
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <div className="tp-modal-body">

              {/* Current password */}
              <div className="tp-field">
                <label className="tp-field-label">Current Password</label>
                <div className="tp-input-wrap">
                  <input
                    className="tp-input"
                    type={showCurrent ? "text" : "password"}
                    name="currentPassword"
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                  />
                  <button
                    className="tp-eye-btn"
                    type="button"
                    onClick={() => setShowCurrent(p => !p)}
                  >
                    {showCurrent
                      ? <VisibilityOffIcon sx={{ fontSize: 18 }} />
                      : <VisibilityIcon   sx={{ fontSize: 18 }} />
                    }
                  </button>
                </div>
              </div>

              {/* New password */}
              <div className="tp-field">
                <label className="tp-field-label">New Password</label>
                <div className="tp-input-wrap">
                  <input
                    className="tp-input"
                    type={showNew ? "text" : "password"}
                    name="newPassword"
                    placeholder="At least 6 characters"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                  <button
                    className="tp-eye-btn"
                    type="button"
                    onClick={() => setShowNew(p => !p)}
                  >
                    {showNew
                      ? <VisibilityOffIcon sx={{ fontSize: 18 }} />
                      : <VisibilityIcon   sx={{ fontSize: 18 }} />
                    }
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="tp-field">
                <label className="tp-field-label">Confirm New Password</label>
                <input
                  className="tp-input"
                  type="password"
                  name="confirmPassword"
                  placeholder="Repeat new password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                />
              </div>

            </div>

            <div className="tp-modal-footer">
              <button className="tp-btn-ghost" onClick={() => setShowPassword(false)}>Cancel</button>
              <button className="tp-btn-save" onClick={changePassword} disabled={saving}>
                {saving ? "Saving..." : "Change Password"}
              </button>
            </div>

          </div>

        </div>

      )}

    </div>

  );

};

export default TeacherProfile;