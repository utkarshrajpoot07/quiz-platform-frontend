import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../../api/axiosClient";
import { jwtDecode } from "jwt-decode";
import "./Leaderboard.css";

const Leaderboard = () => {

  const { quizId }  = useParams();
  const navigate    = useNavigate();
  const [leaders,  setLeaders]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);
  const [quizTitle,setQuizTitle]= useState("");
  const [myName, setMyName] = useState(null);

  // get current student id from JWT to highlight "You"
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const decoded = jwtDecode(token);
      const name = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
      setMyName(name);
    } catch {}
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const res    = await axiosClient.get(`/Leaderboard/quiz/${quizId}`);
      const data   = res.data.data || [];
      // sort by score descending
      const sorted = [...data].sort((a, b) => b.score - a.score)
      setLeaders(sorted);
      if (sorted.length > 0) setQuizTitle(sorted[0].quizTitle || "Quiz");
    } catch (err) {
      console.log(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  // BUG FIX: safe date format — handles null/undefined
  const formatDate = (date) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric"
      });
    } catch { return "—"; }
  };

  // BUG FIX: percentage based on totalMarks, not * 10
  const getPct = (score, total) =>
    total > 0 ? Math.min(Math.round((score / total) * 100), 100) : 0;

  const getAvatarColor = (index) => {
    const colors = [
      "#f59e0b","#3b82f6","#10b981","#8b5cf6",
      "#ef4444","#06b6d4","#f97316","#6366f1"
    ];
    return colors[index % colors.length];
  };

  const getRankStyle = (index) => {
    if (index === 0) return "lb-rank-gold";
    if (index === 1) return "lb-rank-silver";
    if (index === 2) return "lb-rank-bronze";
    return "";
  };

  // ── skeleton ─────────────────────────────────────────────
  const SkeletonRow = () => (
    <tr className="lb-skeleton-row">
      <td><div className="skeleton" style={{height:20,width:30,borderRadius:6}}/></td>
      <td>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div className="skeleton" style={{width:36,height:36,borderRadius:"50%",flexShrink:0}}/>
          <div className="skeleton" style={{height:14,width:120,borderRadius:6}}/>
        </div>
      </td>
      <td><div className="skeleton" style={{height:14,width:60,borderRadius:6}}/></td>
      <td><div className="skeleton" style={{height:14,width:80,borderRadius:6}}/></td>
    </tr>
  );

  // ── error ─────────────────────────────────────────────────
  if (error) return (
    <div className="lb-container">
      <div className="lb-empty">
        <div className="lb-empty-icon">⚠️</div>
        <h3>Could not load leaderboard</h3>
        <p>Please try again</p>
        <button className="lb-btn-primary" onClick={fetchLeaderboard}>Retry</button>
      </div>
    </div>
  );

  const top3    = leaders.slice(0, 3);
  const hasData = leaders.length > 0;

  // reorder top3 for podium: 2nd | 1st | 3rd
  const podium = top3.length === 3
    ? [top3[1], top3[0], top3[2]]
    : top3;

  const podiumHeight = ["lb-podium-2nd", "lb-podium-1st", "lb-podium-3rd"];
  const podiumMedals = top3.length === 3
    ? ["🥈", "🥇", "🥉"]
    : ["🥇", "🥈", "🥉"];

  return (
    <div className="lb-container">

      {/* ── HEADER ── */}
      <div className="lb-header">
        <button className="lb-back-btn" onClick={() => navigate("/student/dashboard")}>
          ← Back
        </button>
        <div>
          <h1 className="lb-title">🏆 Leaderboard</h1>
          {quizTitle && <p className="lb-subtitle">{quizTitle}</p>}
        </div>
      </div>

      {loading ? (
        <>
          {/* skeleton podium */}
          <div className="lb-podium-wrap">
            {[0,1,2].map(i => (
              <div key={i} className="lb-podium-card">
                <div className="skeleton" style={{width:64,height:64,borderRadius:"50%",margin:"0 auto 10px"}}/>
                <div className="skeleton" style={{height:14,width:80,margin:"0 auto 8px",borderRadius:6}}/>
                <div className="skeleton" style={{height:12,width:50,margin:"0 auto",borderRadius:6}}/>
              </div>
            ))}
          </div>
          {/* skeleton table */}
          <div className="lb-table-wrap">
            <table className="lb-table">
              <thead>
                <tr>
                  <th>Rank</th><th>Student</th><th>Score</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {[1,2,3,4,5].map(i => <SkeletonRow key={i}/>)}
              </tbody>
            </table>
          </div>
        </>

      ) : !hasData ? (
        <div className="lb-empty">
          <div className="lb-empty-icon">📭</div>
          <h3>No entries yet</h3>
          <p>Be the first to complete this quiz!</p>
          <button className="lb-btn-primary" onClick={() => navigate("/student/quizzes")}>
            Go to Quizzes
          </button>
        </div>

      ) : (
        <>
          {/* ── PODIUM (top 3) ── */}
          {top3.length >= 2 && (
            <div className="lb-podium-wrap">
              {podium.map((user, i) => (
                <div
                  key={`podium-${user.studentName}`}
                  className={`lb-podium-card ${podiumHeight[i]}`}
                >
                  <div className="lb-podium-medal">{podiumMedals[i]}</div>
                  <div
                    className="lb-podium-avatar"
                    style={{ background: getAvatarColor(leaders.indexOf(user)) }}
                  >
                    {user.studentName?.charAt(0).toUpperCase()}
                  </div>
                  <p className="lb-podium-name">{user.studentName}</p>
                  <p className="lb-podium-score">{user.score} pts</p>
                </div>
              ))}
            </div>
          )}

          {/* ── FULL TABLE ── */}
          <div className="lb-table-wrap">
            <table className="lb-table">
              <thead>
                <tr>
                  <th style={{width:60}}>Rank</th>
                  <th>Student</th>
                  <th style={{width:160}}>Score</th>
                  <th style={{width:120}}>Date</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((user, index) => {
                  const pct   = getPct(user.score, user.totalMarks || 10);
                  const isMe  = user.studentName === myName;
                  return (
                    <tr
                        key={`${user.studentName}-${index}`}
                      className={`lb-row ${isMe ? "lb-row-me" : ""} ${getRankStyle(index)}`}
                    >
                      {/* rank */}
                      <td className="lb-rank-cell">
                        {index === 0 && <span className="lb-medal">🥇</span>}
                        {index === 1 && <span className="lb-medal">🥈</span>}
                        {index === 2 && <span className="lb-medal">🥉</span>}
                        {index  > 2 && <span className="lb-rank-num">{index + 1}</span>}
                      </td>

                      {/* student */}
                      <td>
                        <div className="lb-student-cell">
                          <div
                            className="lb-avatar"
                            style={{ background: getAvatarColor(index) }}
                          >
                            {user.studentName?.charAt(0).toUpperCase()}
                          </div>
                          <span className="lb-student-name">
                            {user.studentName}
                            {isMe && <span className="lb-you-tag">You</span>}
                          </span>
                        </div>
                      </td>

                      {/* score + bar */}
                      <td className="lb-score-cell">
                        <div className="lb-score-row">
                          <span className="lb-score-num">{user.score}</span>
                          {/* BUG FIX: pct based on totalMarks not *10 */}
                          <div className="lb-bar-track">
                            <div
                              className="lb-bar-fill"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* date */}
                      <td className="lb-date">{formatDate(user.attemptedOn)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="lb-count">{leaders.length} student{leaders.length !== 1 ? "s" : ""} on this leaderboard</p>
        </>
      )}

    </div>
  );
};

export default Leaderboard;