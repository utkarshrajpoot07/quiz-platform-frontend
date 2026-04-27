import React, { useEffect, useState, useCallback, useContext } from "react";
import "./TeacherQuizzes.css";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon             from "@mui/icons-material/Edit";
import DeleteIcon           from "@mui/icons-material/Delete";
import KeyIcon              from "@mui/icons-material/VpnKey";
import LinkIcon             from "@mui/icons-material/Link";
import QrCodeIcon           from "@mui/icons-material/QrCode";
import VisibilityIcon       from "@mui/icons-material/Visibility";
import QuizIcon             from "@mui/icons-material/Quiz";
import QuestionAnswerIcon   from "@mui/icons-material/QuestionAnswer";
import AssignmentIcon       from "@mui/icons-material/Assignment";
import ContentCopyIcon      from "@mui/icons-material/ContentCopy";
import LockIcon             from "@mui/icons-material/Lock";
import LockOpenIcon         from "@mui/icons-material/LockOpen";

/* ═════════════════════════════════════════════
   HELPER — Status badge config
═════════════════════════════════════════════ */

const STATUS_CONFIG = {
  Active   : { label : "🟢 Active",   cls : "tq-status-active"   },
  Upcoming : { label : "🟡 Upcoming", cls : "tq-status-upcoming" },
  Expired  : { label : "⏰ Expired",  cls : "tq-status-expired"  },
  Closed   : { label : "🔴 Closed",   cls : "tq-status-closed"   },
};

/* ═════════════════════════════════════════════
   MAIN — Teacher Quizzes
═════════════════════════════════════════════ */

const TeacherQuizzes = () => {

  const { user }   = useContext(AuthContext);
  const navigate   = useNavigate();
  const teacherId  = user?.UserId || user?.userId;

  const [quizzes,     setQuizzes]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [deletingId,  setDeletingId]  = useState(null);
  const [togglingId,  setTogglingId]  = useState(null);
  const [copied,      setCopied]      = useState(false);

  /* ── dialog state ── */
  const [joinCode,  setJoinCode]  = useState("");
  const [joinLink,  setJoinLink]  = useState("");
  const [qrLink,    setQrLink]    = useState("");
  const [openCode,  setOpenCode]  = useState(false);
  const [openLink,  setOpenLink]  = useState(false);
  const [openQR,    setOpenQR]    = useState(false);

  /* ── fetch quizzes ── */

  const fetchQuizzes = useCallback(() => {
    setLoading(true);
    setError(null);
    axiosClient
      .get(`/quiz/teacher/${teacherId}`)
      .then(res => {
        if (res.data.success) setQuizzes(res.data.data || []);
      })
      .catch(() => setError("Failed to load quizzes. Please try again."))
      .finally(() => setLoading(false));
  }, [teacherId]);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  /* ── toggle active/closed ── */

  const toggleActive = async (quizId) => {
    setTogglingId(quizId);
    try {
      const res = await axiosClient.patch(`/quiz/toggle-active/${quizId}`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchQuizzes();
      }
    } catch {
      toast.error("Failed to update quiz status.");
    } finally {
      setTogglingId(null);
    }
  };

  /* ── delete quiz ── */

  const deleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    setDeletingId(quizId);
    try {
      await axiosClient.delete(`/quiz/delete/${quizId}?userId=${teacherId}`);
      toast.success("Quiz deleted successfully.");
      fetchQuizzes();
    } catch {
      toast.error("Failed to delete quiz.");
    } finally {
      setDeletingId(null);
    }
  };

  /* ── code / link / qr ── */

  const generateCode = async (quizId) => {
    try {
      const res = await axiosClient.post(`/quiz/generate-code/${quizId}`);
      setJoinCode(res.data.data);
      setOpenCode(true);
    } catch { toast.error("Failed to generate code."); }
  };

  const generateLink = async (quizId) => {
    try {
      const res = await axiosClient.get(`/quiz/link/${quizId}`);
      setJoinLink(res.data.data);
      setOpenLink(true);
    } catch { toast.error("Failed to generate link."); }
  };

  const generateQR = async (quizId) => {
    try {
      const res = await axiosClient.get(`/quiz/link/${quizId}`);
      setQrLink(res.data.data);
      setOpenQR(true);
    } catch { toast.error("Failed to generate QR."); }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── format date ── */

//  const formatDate = (dateStr) => {
//     if (!dateStr) return "—";
//     const date = new Date(dateStr);
//     if (date.getFullYear() < 2000) return "Not set";
//     return date.toLocaleDateString("en-US", {
//         day    : "2-digit",
//         month  : "short",
//         year   : "numeric",
//         hour   : "2-digit",
//         minute : "2-digit",
//         hour12 : true,        // ✅ AM/PM add
//     });
// };

  /* ── skeleton card ── */

  const SkeletonCard = () => (
    <div className="tq-card">
      <div className="tq-skeleton tq-sk-img"   />
      <div className="tq-skeleton tq-sk-title" />
      <div className="tq-skeleton tq-sk-sub"   />
      <div className="tq-skeleton tq-sk-stats" />
      <div className="tq-skeleton tq-sk-btns"  />
    </div>
  );

  /* ── render ── */

  return (

    <div className="tq-wrap">

      {/* PAGE HEADER */}

      <div className="tq-page-header">

        <div>
          <h2 className="tq-page-title">
            <AssignmentIcon sx={{ fontSize: 22, verticalAlign: "middle", marginRight: "8px" }} />
            My Quizzes
          </h2>
          <p className="tq-page-subtitle">Manage and share your quizzes with students</p>
        </div>

        <button
          className="tq-create-btn"
          onClick={() => navigate("/teacher/create")}
        >
          <AddCircleOutlineIcon sx={{ fontSize: 17 }} />
          <span>Create New Quiz</span>
        </button>

      </div>

      {/* ERROR BANNER */}

      {error && (
        <div className="tq-error-banner">
          <span>⚠️ {error}</span>
          <button className="tq-retry-btn" onClick={fetchQuizzes}>Retry</button>
        </div>
      )}

      {/* QUIZ GRID */}

      <div className="tq-grid">

        {/* Loading skeletons */}
        {loading && [1,2,3].map(i => <SkeletonCard key={i} />)}

        {/* Empty state */}
        {!loading && !error && quizzes.length === 0 && (
          <div className="tq-empty">
            <QuizIcon sx={{ fontSize: 48, color: "#94a3b8" }} />
            <h3>No quizzes yet</h3>
            <p>Create your first quiz for students</p>
            <button
              className="tq-create-btn"
              onClick={() => navigate("/teacher/create")}
            >
              <AddCircleOutlineIcon sx={{ fontSize: 17 }} />
              <span>Create First Quiz</span>
            </button>
          </div>
        )}

        {/* Quiz cards */}
        {!loading && !error && quizzes.map(quiz => {

          const statusCfg = STATUS_CONFIG[quiz.status] || STATUS_CONFIG.Active;

          return (

            <div key={quiz.id} className={`tq-card ${!quiz.isActive ? "tq-card-closed" : ""}`}>

              {/* ✅ Status Badge */}
              <div className={`tq-status-badge ${statusCfg.cls}`}>
                {statusCfg.label}
              </div>

              {/* Quiz image */}
              <div className="tq-card-img-wrap">
                <img
                  src={quiz?.imageUrl || "/quiz-default.png"}
                  alt={quiz.title}
                  className="tq-card-img"
                  onError={e => { e.target.src = "/quiz-default.png"; }}
                />
              </div>

              {/* Title + category */}
              <h3 className="tq-card-title">{quiz.title}</h3>
              <span className="tq-card-category">{quiz.categoryName}</span>

     

              {/* Stats row */}
              <div className="tq-card-stats">
                <div className="tq-card-stat">
                  <span className="tq-card-stat-val">{quiz.totalQuestions || 0}</span>
                  <span className="tq-card-stat-lbl">Questions</span>
                </div>
                <div className="tq-card-stat-divider" />
                <div className="tq-card-stat">
                  <span className="tq-card-stat-val">{quiz.attempts || 0}</span>
                  <span className="tq-card-stat-lbl">Attempts</span>
                </div>
              </div>

              {/* Primary actions */}
              <div className="tq-card-actions">

                <button
                  className="tq-btn tq-btn-primary"
                  onClick={() => navigate(`/teacher/edit-quiz/${quiz.id}`)}
                >
                  <EditIcon sx={{ fontSize: 14 }} /> Edit
                </button>

                <button
                  className="tq-btn tq-btn-outline"
                  onClick={() => navigate(`/teacher/edit-questions/${quiz.id}`)}
                >
                  <QuestionAnswerIcon sx={{ fontSize: 14 }} /> Questions
                </button>

                <button
                  className="tq-btn tq-btn-danger"
                  onClick={() => deleteQuiz(quiz.id)}
                  disabled={deletingId === quiz.id}
                >
                  <DeleteIcon sx={{ fontSize: 14 }} />
                  {deletingId === quiz.id ? "..." : "Delete"}
                </button>

              </div>

              {/* ✅ TOGGLE ACTIVE BUTTON */}
              <button
                className={`tq-toggle-btn ${quiz.isActive ? "tq-toggle-close" : "tq-toggle-open"}`}
                onClick={() => toggleActive(quiz.id)}
                disabled={togglingId === quiz.id}
              >
                {togglingId === quiz.id
                  ? "Updating..."
                  : quiz.isActive
                    ? <><LockIcon sx={{ fontSize: 14 }} /> Close Quiz</>
                    : <><LockOpenIcon sx={{ fontSize: 14 }} /> Reopen Quiz</>
                }
              </button>

              {/* Divider */}
              <div className="tq-card-divider" />

              {/* Secondary actions */}
              <div className="tq-card-secondary">

                <button
                  className="tq-icon-btn"
                  title="Preview"
                  onClick={() => navigate(`/teacher/preview/${quiz.id}`)}
                >
                  <VisibilityIcon sx={{ fontSize: 15 }} />
                  <span>Preview</span>
                </button>

                <button
                  className="tq-icon-btn"
                  title="Join Code"
                  onClick={() => generateCode(quiz.id)}
                >
                  <KeyIcon sx={{ fontSize: 15 }} />
                  <span>Code</span>
                </button>

                <button
                  className="tq-icon-btn"
                  title="Join Link"
                  onClick={() => generateLink(quiz.id)}
                >
                  <LinkIcon sx={{ fontSize: 15 }} />
                  <span>Link</span>
                </button>

                <button
                  className="tq-icon-btn"
                  title="QR Code"
                  onClick={() => generateQR(quiz.id)}
                >
                  <QrCodeIcon sx={{ fontSize: 15 }} />
                  <span>QR</span>
                </button>

              </div>

            </div>

          );

        })}

      </div>

      {/* ── DIALOG: Join Code ── */}

      <Dialog open={openCode} onClose={() => setOpenCode(false)} PaperProps={{ className: "tq-dialog" }}>
        <DialogTitle className="tq-dialog-title">🔑 Join Code</DialogTitle>
        <DialogContent className="tq-dialog-content">
          <div className="tq-code-display">{joinCode}</div>
          <p className="tq-dialog-hint">Share this code with students to join the quiz</p>
          <button
            className="tq-create-btn"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => copyToClipboard(joinCode)}
          >
            <ContentCopyIcon sx={{ fontSize: 16 }} />
            <span>{copied ? "Copied!" : "Copy Code"}</span>
          </button>
        </DialogContent>
      </Dialog>

      {/* ── DIALOG: Join Link ── */}

      <Dialog open={openLink} onClose={() => setOpenLink(false)} PaperProps={{ className: "tq-dialog" }}>
        <DialogTitle className="tq-dialog-title">🔗 Join Link</DialogTitle>
        <DialogContent className="tq-dialog-content">
          <div className="tq-link-display">
            <span className="tq-link-text">{joinLink}</span>
          </div>
          <button
            className="tq-create-btn"
            style={{ width: "100%", justifyContent: "center", marginTop: 12 }}
            onClick={() => copyToClipboard(joinLink)}
          >
            <ContentCopyIcon sx={{ fontSize: 16 }} />
            <span>{copied ? "Copied!" : "Copy Link"}</span>
          </button>
        </DialogContent>
      </Dialog>

      {/* ── DIALOG: QR Code ── */}

      <Dialog open={openQR} onClose={() => setOpenQR(false)} PaperProps={{ className: "tq-dialog" }}>
        <DialogTitle className="tq-dialog-title">📱 QR Code</DialogTitle>
        <DialogContent className="tq-dialog-content">
          <div className="tq-qr-wrap">
            <QRCodeCanvas value={qrLink || " "} size={200} />
          </div>
          <p className="tq-dialog-hint">Students can scan this to join directly</p>
        </DialogContent>
      </Dialog>

    </div>

  );

};

export default TeacherQuizzes;