import React, { useEffect, useState, useCallback, useContext, useRef } from "react";
import axiosClient    from "../../../api/axiosClient";
import { AuthContext } from "../../../context/AuthContext";
import { toast }       from "react-hot-toast";
import "./StudentProfile.css";

/* ═════════════════════════════════════════════
   MAIN — Student Profile
═════════════════════════════════════════════ */

const StudentProfile = () => {

  // ✅ FIX 1 — AuthContext se UserId lo
  const { UserId } = useContext(AuthContext);

  const [profile,       setProfile]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [showEdit,      setShowEdit]      = useState(false);
  const [showPassword,  setShowPassword]  = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading,     setUploading]     = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    fullName : "",
    phone    : "",
    email    : "",
  });

  const [password, setPassword] = useState({
    oldPassword     : "",
    newPassword     : "",
    confirmPassword : "",
  });

  /* ── Fetch Profile ── */

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);

      // ✅ FIX 2 — Correct API endpoint
      const res  = await axiosClient.get(`/User/${UserId}`);
      const data = res.data.data;

      setProfile(data);
      setAvatarPreview(data.profilePicture
        ? `http://${window.location.hostname}:5273${data.profilePicture}`
        : null);
      setForm({
        fullName : data.fullName || "",
        phone    : data.phone    || "",
        email    : data.email    || "",
      });
    } catch (err) {
      console.error("fetchProfile error:", err);
      // ✅ FIX 3 — react-hot-toast use karo
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [UserId]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  /* ── Update Profile ── */

  const updateProfile = async () => {
    if (!form.fullName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      toast.error("Enter a valid email");
      return;
    }

    setSaving(true);
    try {
      // ✅ FIX 2 — Correct API endpoint
      await axiosClient.put("/User/update", {
        fullName : form.fullName,
        phone    : form.phone,
        email    : form.email,
      });

      // ✅ FIX 3 — react-hot-toast
      toast.success("Profile updated successfully!");
      setShowEdit(false);
      fetchProfile();
    } catch (err) {
      console.error("updateProfile error:", err);
      toast.error("Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ── Upload Profile Picture ── */

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

    setAvatarPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axiosClient.post("/auth/upload-profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        const BASE = `http://${window.location.hostname}:5273`;
        setAvatarPreview(BASE + res.data.data);
        setProfile(prev => ({ ...prev, profilePicture: res.data.data }));
        toast.success("Profile picture updated!");
      }
    } catch {
      toast.error("Failed to upload image");
      setAvatarPreview(profile?.profilePicture
        ? `http://${window.location.hostname}:5273${profile.profilePicture}`
        : null);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  /* ── Change Password ── */

  const changePassword = async () => {
    if (!password.oldPassword.trim()) {
      toast.error("Enter your old password");
      return;
    }
    if (password.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (password.newPassword !== password.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      await axiosClient.post("/auth/change-password", {
        oldPassword : password.oldPassword,
        newPassword : password.newPassword,
      });

      // ✅ FIX 3 — react-hot-toast
      toast.success("Password changed successfully!");
      setShowPassword(false);
      setPassword({
        oldPassword     : "",
        newPassword     : "",
        confirmPassword : "",
      });
    } catch (err) {
      console.error("changePassword error:", err);
      toast.error("Password change failed. Check your old password.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Close handlers ── */

  const closeEdit = () => {
    setShowEdit(false);
    if (profile) {
      setForm({
        fullName : profile.fullName || "",
        phone    : profile.phone    || "",
        email    : profile.email    || "",
      });
    }
  };

  const closePassword = () => {
    setShowPassword(false);
    setPassword({
      oldPassword     : "",
      newPassword     : "",
      confirmPassword : "",
    });
  };

  /* ── Loading Skeleton ── */

  if (loading) return (
    <div className="sp-container">
      <div className="sp-card">
        <div className="skeleton sp-sk-avatar" />
        <div className="skeleton sp-sk-name"   />
        <div className="skeleton sp-sk-email"  />
        <div className="skeleton sp-sk-phone"  />
        <div className="sp-sk-btns">
          <div className="skeleton sp-sk-btn" />
          <div className="skeleton sp-sk-btn" />
        </div>
      </div>
    </div>
  );

  /* ── Error State ── */

  if (!profile) return (
    <div className="sp-container">
      <div className="sp-error">
        {/* ✅ FIX 4 — inline style hataya */}
        <div className="sp-error-icon">⚠️</div>
        <h3>Could not load profile</h3>
        <button
          className="sp-btn-primary"
          onClick={fetchProfile}
        >
          Retry
        </button>
      </div>
    </div>
  );

  /* ── Avatar initials ── */

  const initials = profile.fullName
    ? profile.fullName
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "S";

  /* ── Render ── */

  return (
    <div className="sp-container">

      {/* ── PROFILE CARD ── */}
      <div className="sp-card">

        {/* Avatar */}
        <div className="sp-avatar-wrap">
          <div
            className="sp-avatar"
            onClick={() => fileInputRef.current.click()}
            title="Click to change photo"
          >
            {avatarPreview
              ? <img src={avatarPreview} alt="avatar" className="sp-avatar-img" />
              : initials
            }
            <div className={`sp-avatar-overlay${uploading ? " sp-avatar-uploading" : ""}`}>
              {uploading
                ? <span className="sp-upload-spinner" />
                : <span style={{ fontSize: 18 }}>📷</span>
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

        {/* Name + Role */}
        <h2 className="sp-name">{profile.fullName}</h2>
        <span className="sp-role-badge">🎓 Student</span>

        {/* Info rows */}
        <div className="sp-info-list">

          <div className="sp-info-row">
            <span className="sp-info-icon">✉️</span>
            <span className="sp-info-text">{profile.email}</span>
          </div>

          {profile.phone && (
            <div className="sp-info-row">
              <span className="sp-info-icon">📱</span>
              <span className="sp-info-text">{profile.phone}</span>
            </div>
          )}

        </div>

        {/* Action Buttons */}
        <div className="sp-actions">
          <button
            className="sp-btn-primary"
            onClick={() => setShowEdit(true)}
          >
            ✏️ Edit Profile
          </button>
          <button
            className="sp-btn-outline"
            onClick={() => setShowPassword(true)}
          >
            🔒 Change Password
          </button>
        </div>

      </div>

      {/* ── EDIT PROFILE MODAL ── */}
      {showEdit && (
        <div
          className="sp-modal-overlay"
          onClick={closeEdit}
        >
          <div
            className="sp-modal"
            onClick={e => e.stopPropagation()}
          >

            <div className="sp-modal-header">
              <h3>Edit Profile</h3>
              <button
                className="sp-modal-close"
                onClick={closeEdit}
              >
                ✕
              </button>
            </div>

            <div className="sp-modal-body">

              <div className="sp-field">
                <label>Full Name</label>
                <input
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                />
              </div>

              <div className="sp-field">
                <label>Phone</label>
                <input
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="sp-field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>

            </div>

            <div className="sp-modal-footer">
              <button
                className="sp-btn-ghost"
                onClick={closeEdit}
              >
                Cancel
              </button>
              <button
                className="sp-btn-primary"
                onClick={updateProfile}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── CHANGE PASSWORD MODAL ── */}
      {showPassword && (
        <div
          className="sp-modal-overlay"
          onClick={closePassword}
        >
          <div
            className="sp-modal"
            onClick={e => e.stopPropagation()}
          >

            <div className="sp-modal-header">
              <h3>Change Password</h3>
              <button
                className="sp-modal-close"
                onClick={closePassword}
              >
                ✕
              </button>
            </div>

            <div className="sp-modal-body">

              <div className="sp-field">
                <label>Old Password</label>
                <input
                  type="password"
                  placeholder="Enter old password"
                  value={password.oldPassword}
                  onChange={e => setPassword({ ...password, oldPassword: e.target.value })}
                />
              </div>

              <div className="sp-field">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={password.newPassword}
                  onChange={e => setPassword({ ...password, newPassword: e.target.value })}
                />
              </div>

              <div className="sp-field">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={password.confirmPassword}
                  onChange={e => setPassword({ ...password, confirmPassword: e.target.value })}
                />
              </div>

            </div>

            <div className="sp-modal-footer">
              <button
                className="sp-btn-ghost"
                onClick={closePassword}
              >
                Cancel
              </button>
              <button
                className="sp-btn-primary"
                onClick={changePassword}
                disabled={saving}
              >
                {saving ? "Updating..." : "Update Password"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default StudentProfile;