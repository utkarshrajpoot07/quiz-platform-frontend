import React, { useState, useEffect } from "react";
import "./GlobalLeaderboard.css";
import axiosClient from "../../api/axiosClient";
import { jwtDecode } from "jwt-decode";

/* ─────────────────────────────────────────────
   HELPER — get current student name from JWT
───────────────────────────────────────────── */
const getMyName = () => {
  try {
    const token   = localStorage.getItem("token");
    if (!token) return "";
    const decoded = jwtDecode(token);
    return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "";
  } catch { return ""; }
};

/* ─────────────────────────────────────────────
   COMPONENT — Top 3 Podium
───────────────────────────────────────────── */
const Podium = ({ top3, myName }) => {
  if (top3.length < 2) return null;

  // order: 2nd | 1st | 3rd
  const order  = [top3[1], top3[0], top3[2]].filter(Boolean);
  const heights = ["podium-silver", "podium-gold", "podium-bronze"];
  const medals  = ["🥈", "🥇", "🥉"];
  const ranks   = [2, 1, 3];

  return (
    <div className="gl-podium">
      {order.map((user, i) => {
        const isMe = user.studentName?.trim() === myName?.trim();
        return (
          <div key={user.studentId} className={`podium-slot ${heights[i]} ${isMe ? "podium-me" : ""}`}>
            <div className="podium-medal">{medals[i]}</div>
            <div className="podium-avatar">
              {user.studentName?.charAt(0).toUpperCase()}
            </div>
            <div className="podium-name">
              {user.studentName}
              {isMe && <span className="gl-you-tag">You</span>}
            </div>
            <div className="podium-score">{user.totalScore} pts</div>
            <div className={`podium-block rank-${ranks[i]}`}>
              <span className="podium-rank">#{ranks[i]}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ═════════════════════════════════════════════
   MAIN — Global Leaderboard Page
═════════════════════════════════════════════ */
const GlobalLeaderboard = () => {

  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  const myName = getMyName();

  useEffect(() => {
    axiosClient.get("/Leaderboard/global")
      .then(res => setLeaders(res.data.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  /* ── rank medal helper ── */
  const getRankDisplay = (i) => {
    if (i === 0) return <span className="gl-medal">🥇</span>;
    if (i === 1) return <span className="gl-medal">🥈</span>;
    if (i === 2) return <span className="gl-medal">🥉</span>;
    return <span className="gl-rank-num">{i + 1}</span>;
  };

  /* ── avatar color by index ── */
  const COLORS = ["#f59e0b","#3b82f6","#10b981","#8b5cf6","#ef4444","#ec4899","#06b6d4","#84cc16"];
  const getColor = (i) => COLORS[i % COLORS.length];

  /* ── score bar width ── */
  const maxScore  = leaders[0]?.totalScore || 1;
  const barWidth  = (score) => `${Math.round((score / maxScore) * 100)}%`;

  /* ── skeleton rows ── */
  const SkeletonRow = () => (
    <tr className="gl-skeleton-row">
      <td><div className="skeleton" style={{ width:30, height:20, borderRadius:4 }} /></td>
      <td>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div className="skeleton" style={{ width:36, height:36, borderRadius:"50%" }} />
          <div className="skeleton" style={{ width:120, height:14, borderRadius:4 }} />
        </div>
      </td>
      <td><div className="skeleton" style={{ width:80, height:8, borderRadius:4 }} /></td>
      <td><div className="skeleton" style={{ width:50, height:20, borderRadius:4 }} /></td>
      <td><div className="skeleton" style={{ width:40, height:14, borderRadius:4 }} /></td>
    </tr>
  );

  return (
    <div className="gl-page">

      {/* ── PAGE HEADER ── */}
      <div className="gl-header">
        <div>
          <h1>🏆 Global Leaderboard</h1>
          <p>Top performers across all quizzes</p>
        </div>
        {!loading && !error && (
          <div className="gl-total-badge">
            {leaders.length} students ranked
          </div>
        )}
      </div>

      {/* ── ERROR STATE ── */}
      {error && (
        <div className="gl-error">
          <div className="gl-error-icon">⚠️</div>
          <h3>Failed to load leaderboard</h3>
          <p>Please check your connection and try again</p>
          <button onClick={() => window.location.reload()} className="gl-retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* ── LOADING OR DATA ── */}
      {!error && (
        <>
          {/* Podium — top 3 */}
          {!loading && top3.length >= 2 && (
            <Podium top3={top3} myName={myName} />
          )}

          {/* Full leaderboard table */}
          <div className="gl-table-card">
            <div className="gl-table-header">
              <h2>Full Rankings</h2>
              {myName && (
                <div className="gl-my-rank-badge">
                  Your rank: <strong>
                    #{leaders.findIndex(u => u.studentName?.trim() === myName?.trim()) + 1 || "—"}
                  </strong>
                </div>
              )}
            </div>

            <div className="gl-table-wrap">
              <table className="gl-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Student</th>
                    <th className="th-progress">Progress</th>
                    <th>Score</th>
                    <th>Quizzes</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : leaders.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="gl-empty">
                          <span>📭</span>
                          <p>No rankings yet — be the first!</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    leaders.map((user, i) => {
                      const isMe    = user.studentName?.trim() === myName?.trim();
                      const color   = getColor(i);
                      return (
                        <tr key={user.studentId} className={`gl-row ${isMe ? "gl-row-me" : ""}`}>

                          {/* Rank */}
                          <td className="gl-td-rank">
                            {getRankDisplay(i)}
                          </td>

                          {/* Student name + avatar */}
                          <td className="gl-td-student">
                            <div className="gl-student-wrap">
                              <div className="gl-avatar" style={{ background: color + "22", color }}>
                                {user.studentName?.charAt(0).toUpperCase()}
                              </div>
                              <div className="gl-student-info">
                                <span className="gl-student-name">
                                  {user.studentName}
                                </span>
                                {isMe && <span className="gl-you-tag">You</span>}
                              </div>
                            </div>
                          </td>

                          {/* Score bar */}
                          <td className="gl-td-bar">
                            <div className="gl-bar-track">
                              <div
                                className="gl-bar-fill"
                                style={{
                                  width: barWidth(user.totalScore),
                                  background: isMe
                                    ? "linear-gradient(90deg,#2563eb,#7c3aed)"
                                    : `linear-gradient(90deg,${color},${color}88)`
                                }}
                              />
                            </div>
                          </td>

                          {/* Score */}
                          <td className="gl-td-score">
                            <span className="gl-score" style={{ color: isMe ? "#2563eb" : color }}>
                              {user.totalScore}
                            </span>
                            <span className="gl-score-label"> pts</span>
                          </td>

                          {/* Attempts */}
                          <td className="gl-td-attempts">
                            {user.totalAttempts} quiz{user.totalAttempts !== 1 ? "zes" : ""}
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default GlobalLeaderboard;