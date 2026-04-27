import React, { useEffect, useState, useContext, useCallback } from "react";
import axiosClient from "../../api/axiosClient";
import "./TeacherReports.css";
import { AuthContext } from "../../context/AuthContext";

import SearchIcon      from "@mui/icons-material/Search";
import DownloadIcon    from "@mui/icons-material/Download";
import AssessmentIcon  from "@mui/icons-material/Assessment";
import BarChartIcon    from "@mui/icons-material/BarChart";

/* ═════════════════════════════════════════════
   MAIN — Teacher Reports
═════════════════════════════════════════════ */

const TeacherReports = () => {

  const { user } = useContext(AuthContext);

  const [quizzes,   setQuizzes]   = useState([]);
  const [filtered,  setFiltered]  = useState([]);
  const [search,    setSearch]    = useState("");
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  /* ── fetch quizzes ── */

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axiosClient.get(`/quiz/teacher/${user?.UserId}`);

      if (res.data.success) {
        setQuizzes(res.data.data);
        setFiltered(res.data.data);
      }
    } catch (err) {
      console.error("Fetch quizzes error:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.UserId]);

  /* ── fetch on mount ── */

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  /* ── search filter ── */

  const handleSearch = (value) => {
    setSearch(value);
    setFiltered(
      quizzes.filter(q =>
        q.title.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  /* ── toast ── */

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── format score ──
     API returns raw averageScore (e.g. 7.6 out of totalMarks 10)
     Formula: (averageScore / totalMarks) * 100
  ── */

  const formatScore = (score, totalMarks) => {
    if (score === null || score === undefined) return "0%";
    if (!totalMarks || totalMarks === 0)       return "0%";
    const pct = (parseFloat(score) / parseFloat(totalMarks)) * 100;
    return `${pct.toFixed(2)}%`;
  };

  /* ── score badge color ── */

  const getScoreColor = (score, totalMarks) => {
    if (!totalMarks || totalMarks === 0) return "rp-score-red";
    const pct = (parseFloat(score) / parseFloat(totalMarks)) * 100;
    if (pct >= 75) return "rp-score-green";
    if (pct >= 50) return "rp-score-yellow";
    return "rp-score-red";
  };

  /* ── download quiz summary ── */

  const downloadQuizReport = async (quizId) => {
    try {
      setLoadingId(`summary-${quizId}`);

      const res = await axiosClient.get(`/Report/quiz-summary/${quizId}`, {
        responseType: "blob",
      });

      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href     = url;
      link.download = `QuizSummary_${quizId}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast("success", "Quiz summary downloaded!");
    } catch {
      showToast("error", "Download failed. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  /* ── download student performance ── */

  const downloadPerformanceReport = async (quizId) => {
    try {
      setLoadingId(`perf-${quizId}`);

      const res = await axiosClient.get(`/Report/student-performance/${quizId}`, {
        responseType: "blob",
      });

      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href     = url;
      link.download = `StudentPerformance_${quizId}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast("success", "Performance report downloaded!");
    } catch {
      showToast("error", "Download failed. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  /* ── skeleton row ── */

  const SkeletonRow = () => (
    <tr className="tr-skeleton">
      <td><div className="rp-skeleton" style={{ width: "60%", height: 14, margin: "0 auto" }} /></td>
      <td><div className="rp-skeleton" style={{ width: "30%", height: 14, margin: "0 auto" }} /></td>
      <td><div className="rp-skeleton" style={{ width: "40%", height: 14, margin: "0 auto" }} /></td>
      <td>
        <div className="rp-actions">
          <div className="rp-skeleton" style={{ width: 90,  height: 32, borderRadius: 8 }} />
          <div className="rp-skeleton" style={{ width: 100, height: 32, borderRadius: 8 }} />
        </div>
      </td>
    </tr>
  );

  /* ── render ── */

  return (

    <div className="rp-wrap">

      {/* TOAST */}

      {toast && (
        <div className={`rp-toast rp-toast-${toast.type}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.message}
        </div>
      )}

      {/* PAGE HEADER */}

      <div className="rp-header">

        <div>
          <h2 className="rp-title">Quiz Reports</h2>
          <p className="rp-subtitle">
            Download quiz summary and student performance reports
          </p>
        </div>

        <div className="rp-search-box">
          <SearchIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
          <input
            className="rp-search-input"
            placeholder="Search quiz..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

      </div>

      {/* TABLE CARD */}

      <div className="rp-table-card">

        <table className="rp-table">

          <thead>
            <tr>
              <th>Quiz</th>
              <th>Attempts</th>
              <th>Average Score</th>
              <th>Reports</th>
            </tr>
          </thead>

          <tbody>

            {loading && (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="rp-empty">
                  <BarChartIcon sx={{ fontSize: 40, color: "#d1d5db" }} />
                  <p>{search ? "No quizzes match your search." : "No quizzes found."}</p>
                </td>
              </tr>
            )}

            {!loading && filtered.map(q => (

              <tr key={q.id} className="rp-row">

                <td className="rp-quiz-name">{q.title}</td>

                <td className="rp-center">{q.attempts ?? 0}</td>

                <td className="rp-center">
                  <span className={`rp-score-badge ${getScoreColor(q.averageScore, q.totalMarks)}`}>
                    {formatScore(q.averageScore, q.totalMarks)}
                  </span>
                </td>

                <td>
                  <div className="rp-actions">

                    <button
                      className="rp-btn rp-btn-summary"
                      onClick={() => downloadQuizReport(q.id)}
                      disabled={loadingId === `summary-${q.id}`}
                    >
                      <DownloadIcon sx={{ fontSize: 15 }} />
                      <span>{loadingId === `summary-${q.id}` ? "..." : "Summary"}</span>
                    </button>

                    <button
                      className="rp-btn rp-btn-perf"
                      onClick={() => downloadPerformanceReport(q.id)}
                      disabled={loadingId === `perf-${q.id}`}
                    >
                      <AssessmentIcon sx={{ fontSize: 15 }} />
                      <span>{loadingId === `perf-${q.id}` ? "..." : "Performance"}</span>
                    </button>

                  </div>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

};

export default TeacherReports;