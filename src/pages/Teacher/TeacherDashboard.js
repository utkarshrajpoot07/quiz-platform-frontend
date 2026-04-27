import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import AddIcon            from "@mui/icons-material/Add";
import BarChartIcon       from "@mui/icons-material/BarChart";
import AssessmentIcon     from "@mui/icons-material/Assessment";
import QuizIcon           from "@mui/icons-material/Quiz";
import SchoolIcon         from "@mui/icons-material/School";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import TrendingUpIcon     from "@mui/icons-material/TrendingUp";
import PeopleIcon         from "@mui/icons-material/People";

import axiosClient from "../../api/axiosClient";
import "./TeacherDashboard.css";

const TeacherDashboard = () => {

  const navigate = useNavigate();

  const [teacherName, setTeacherName] = useState("Teacher");
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const [data, setData] = useState({
    totalQuizzes           : 0,
    totalQuestions         : 0,
    totalAttempts          : 0,
    totalStudentsAttempted : 0,
    averageScore           : 0,
  });

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  useEffect(() => {
    loadTeacherName();
    fetchDashboard();
  }, []);

  // ─── Load name from JWT ───────────────────────────────────────────────────

  const loadTeacherName = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const name =
        decoded.name ||
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
        "Teacher";
      setTeacherName(name);
    } catch {
      // keep default
    }
  };

  // ─── Fetch dashboard summary ──────────────────────────────────────────────

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axiosClient.get("/TeacherDashboard/summary");

      if (res.data.success) {
        const d = res.data.data;
        setData({
          totalQuizzes           : d.totalQuizzes            ?? 0,
          totalQuestions         : d.totalQuestions          ?? 0,
          totalAttempts          : d.totalAttempts           ?? 0,
          totalStudentsAttempted : d.totalStudentsAttempted  ?? 0,
          averageScore           : d.averageScore            ??
                                   d.averageScorePercentage  ??
                                   d.avgScore                ?? 0,
        });
      } else {
        setError("Could not load dashboard data.");
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Greeting ─────────────────────────────────────────────────────────────

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // ─── Format score ─────────────────────────────────────────────────────────

  const formatScore = (score) => {
    const num = parseFloat(score);
    if (isNaN(num)) return "0%";
    return `${Math.round(num * 100) / 100}%`;
  };

  // ─── Stat cards ───────────────────────────────────────────────────────────

  const statCards = [
    {
      key       : "attempts",
      label     : "ATTEMPTS",
      value     : data.totalAttempts,
      sub       : "Total quiz attempts",
      icon      : <SchoolIcon sx={{ fontSize: 20 }} />,
      iconColor : "#f59e0b",
      accent    : "#f59e0b",
    },
    {
      key       : "quizzes",
      label     : "QUIZZES",
      value     : data.totalQuizzes,
      sub       : "Quizzes created",
      icon      : <QuizIcon sx={{ fontSize: 20 }} />,
      iconColor : "#6366f1",
      accent    : "#6366f1",
    },
    {
      key       : "questions",
      label     : "QUESTIONS",
      value     : data.totalQuestions,
      sub       : "Total questions",
      icon      : <QuestionAnswerIcon sx={{ fontSize: 20 }} />,
      iconColor : "#10b981",
      accent    : "#10b981",
    },
    {
      key       : "students",
      label     : "STUDENTS",
      value     : data.totalStudentsAttempted,
      sub       : "Unique students",
      icon      : <PeopleIcon sx={{ fontSize: 20 }} />,
      iconColor : "#06b6d4",
      accent    : "#06b6d4",
    },
    {
      key       : "score",
      label     : "AVG SCORE",
      value     : formatScore(data.averageScore),
      sub       : "Across all quizzes",
      icon      : <TrendingUpIcon sx={{ fontSize: 20 }} />,
      iconColor : "#ef4444",
      accent    : "#ef4444",
    },
  ];

  // ─── Quick actions ────────────────────────────────────────────────────────

  const quickActions = [
    { label: "Create Quiz",    icon: <AddIcon sx={{ fontSize: 18 }} />,        path: "/teacher/create"    },
    { label: "Manage Quizzes", icon: <QuizIcon sx={{ fontSize: 18 }} />,       path: "/teacher/quizzes"   },
    { label: "View Reports",   icon: <AssessmentIcon sx={{ fontSize: 18 }} />, path: "/teacher/reports"   },
    { label: "Full Analytics", icon: <BarChartIcon sx={{ fontSize: 18 }} />,   path: "/teacher/analytics" },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="td-wrap">

      {/* ── HEADER — plain, no card box ──────────────── */}
      <div className="td-header">
        <div>
          <h2 className="td-greeting">
            {getGreeting()}, <span className="td-name">{teacherName}</span> 👋
          </h2>
          <p className="td-subtitle">Here's what's happening with your quizzes today.</p>
        </div>

        <button
          className="td-create-btn"
          onClick={() => navigate("/teacher/create")}
        >
          <AddIcon sx={{ fontSize: 18 }} />
          <span>Create Quiz</span>
        </button>
      </div>

      {/* ── ERROR BANNER ─────────────────────────────── */}
      {error && (
        <div className="td-error">
          <span>{error}</span>
          <button className="td-retry" onClick={fetchDashboard}>Retry</button>
        </div>
      )}

      {/* ── STAT CARDS ───────────────────────────────── */}
      <div className="td-stats">
        {loading
          ? [1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="td-card td-skeleton" />
            ))
          : statCards.map((card) => (
              <div
                key={card.key}
                className="td-card"
                style={{ borderBottom: `3px solid ${card.accent}` }}
              >
                <div className="td-card-top">
                  <span className="td-card-label">{card.label}</span>
                  <span
                    className="td-card-icon"
                    style={{
                      color      : card.iconColor,
                      background : `${card.iconColor}1a`,
                    }}
                  >
                    {card.icon}
                  </span>
                </div>

                <div className="td-card-number">{card.value}</div>
                <div className="td-card-sub">{card.sub}</div>
              </div>
            ))}
      </div>

      {/* ── QUICK ACTIONS ────────────────────────────── */}
      <div className="td-section">
        <h3 className="td-section-title">Quick Actions</h3>
        <div className="td-actions">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="td-action-btn"
              onClick={() => navigate(action.path)}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── ANALYTICS EMPTY STATE ────────────────────── */}
      <div className="td-section">
        <h3 className="td-section-title">Quiz Analytics</h3>
        <div className="td-analytics-empty">
          <BarChartIcon sx={{ fontSize: 42, color: "#94a3b8" }} />
          <p className="td-analytics-hint">
            Charts will appear here once your quizzes receive attempts.
          </p>
          <button
            className="td-action-btn outline"
            onClick={() => navigate("/teacher/analytics")}
          >
            <BarChartIcon sx={{ fontSize: 18 }} />
            <span>View Full Analytics</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default TeacherDashboard;