import React, { useEffect, useState, useContext, useCallback } from "react";
import "./TeacherLeaderboard.css";
import axiosClient from "../../api/axiosClient";
import { AuthContext } from "../../context/AuthContext";

import EmojiEventsIcon  from "@mui/icons-material/EmojiEvents";
import PersonIcon       from "@mui/icons-material/Person";
import ScoreboardIcon   from "@mui/icons-material/Scoreboard";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

/* ═════════════════════════════════════════════
   MAIN — Teacher Leaderboard
═════════════════════════════════════════════ */

const TeacherLeaderboard = () => {

  const { user } = useContext(AuthContext);

  const [quizzes,      setQuizzes]      = useState([]);
  const [leaderboard,  setLeaderboard]  = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [error,        setError]        = useState(null);

  /* ── load teacher's quizzes ── */

  useEffect(() => { loadQuizzes(); }, []);

  const loadQuizzes = async () => {
    try {
      const res = await axiosClient.get(`/quiz/teacher/${user?.UserId}`);
      if (res.data.success) setQuizzes(res.data.data || []);
    } catch {
      setError("Failed to load quizzes.");
    }
  };

  /* ── load leaderboard for selected quiz ── */

  const loadLeaderboard = useCallback(async (quizId) => {
    setLoadingBoard(true);
    setError(null);
    setLeaderboard([]);
    try {
      const res = await axiosClient.get(`/Leaderboard/quiz/${quizId}`);
      if (res.data.success) setLeaderboard(res.data.data || []);
    } catch {
      setError("Failed to load leaderboard.");
    } finally {
      setLoadingBoard(false);
    }
  }, []);

  const handleQuizChange = (e) => {
    const quizId = e.target.value;
    setSelectedQuiz(quizId);
    if (quizId) loadLeaderboard(quizId);
    else        setLeaderboard([]);
  };

  /* ── helpers ── */

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const getRankLabel = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  const getPct = (score, total) => {
    if (!total) return 0;
    return Math.round((score / total) * 100);
  };

  /* ── top 3 safely ── */

  const top3   = leaderboard.slice(0, 3);
  const first  = leaderboard[0];
  const second = leaderboard[1];
  const third  = leaderboard[2];

  /* ── podium order: 2nd | 1st | 3rd ── */

  const podiumOrder = [second, first, third].filter(Boolean);

  /* ── skeleton row ── */

  const SkeletonRow = () => (
    <tr className="tl-skeleton-row">
      {[1,2,3,4].map(i => (
        <td key={i}>
          <div className="tl-skeleton" style={{ height: 14, width: i === 2 ? "60%" : "40%", borderRadius: 4 }} />
        </td>
      ))}
    </tr>
  );

  /* ── render ── */

  return (

    <div className="tl-wrap">

      {/* PAGE HEADER */}

      <div className="tl-page-header">
        <div>
          <h2 className="tl-page-title">
            <EmojiEventsIcon sx={{ fontSize: 22, verticalAlign: "middle", marginRight: "8px" }} />
            Quiz Leaderboard
          </h2>
          <p className="tl-page-subtitle">
            View top performers for each quiz
          </p>
        </div>
      </div>

      {/* QUIZ SELECTOR */}

      <div className="tl-selector-wrap">
        <label className="tl-selector-label">Select Quiz</label>
        <select
          className="tl-select"
          value={selectedQuiz}
          onChange={handleQuizChange}
        >
          <option value="">-- Choose a quiz --</option>
          {quizzes.map(q => (
            <option key={q.id} value={q.id}>{q.title}</option>
          ))}
        </select>
      </div>

      {/* ERROR */}

      {error && (
        <div className="tl-error-banner">⚠️ {error}</div>
      )}

      {/* PLACEHOLDER — no quiz selected */}

      {!selectedQuiz && !error && (
        <div className="tl-placeholder">
          <EmojiEventsIcon sx={{ fontSize: 52, color: "#e5e7eb" }} />
          <p>Select a quiz to view its leaderboard</p>
        </div>
      )}

      {/* CONTENT — quiz selected */}

      {selectedQuiz && !error && (

        <>

          {/* PODIUM — show only if 3+ entries */}

          {!loadingBoard && leaderboard.length >= 3 && (

            <div className="tl-podium-section">

              <div className="tl-podium-section-title">🏆 Top Performers</div>

              <div className="tl-podium-wrap">

              {podiumOrder.map((entry, idx) => {

                const isFirst  = entry === first;
                const isSecond = entry === second;
                const rank     = isFirst ? 1 : isSecond ? 2 : 3;
                const medal    = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
                const pct      = getPct(entry.score, entry.totalMarks);

                return (

                  <div
                    key={idx}
                    className={`tl-podium-card ${isFirst ? "tl-podium-first" : isSecond ? "tl-podium-second" : "tl-podium-third"}`}
                  >
                    <div className="tl-podium-medal">{medal}</div>
                    <div className="tl-podium-rank">#{rank}</div>
                    <div className="tl-podium-name">{entry.studentName}</div>
                    <div className="tl-podium-score">
                      {entry.score} / {entry.totalMarks}
                    </div>
                    <div className="tl-podium-pct">{pct}%</div>
                  </div>

                );

              })}

            </div>

            </div>

          )}

          {/* TABLE */}

          <div className="tl-table-card">

            <div className="tl-table-header">
              <h3 className="tl-table-title">
                <ScoreboardIcon sx={{ fontSize: 17, verticalAlign: "middle", marginRight: "6px" }} />
                Full Rankings
              </h3>
              {!loadingBoard && leaderboard.length > 0 && (
                <span className="tl-count-badge">
                  {leaderboard.length} attempt{leaderboard.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="tl-table-wrap">

              <table className="tl-table">

                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>
                      <PersonIcon sx={{ fontSize: 14, verticalAlign: "middle", marginRight: "4px" }} />
                      Student
                    </th>
                    <th>Score</th>
                    <th>
                      <CalendarTodayIcon sx={{ fontSize: 13, verticalAlign: "middle", marginRight: "4px" }} />
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {/* Skeleton */}
                  {loadingBoard && [1,2,3,4].map(i => <SkeletonRow key={i} />)}

                  {/* Empty */}
                  {!loadingBoard && leaderboard.length === 0 && (
                    <tr>
                      <td colSpan="4" className="tl-empty-row">
                        No attempts yet for this quiz
                      </td>
                    </tr>
                  )}

                  {/* Rows */}
                  {!loadingBoard && leaderboard.map((item, index) => {

                    const rank = index + 1;
                    const pct  = getPct(item.score, item.totalMarks);

                    return (
                      <tr key={index} className={rank <= 3 ? "tl-top-row" : ""}>

                        <td className="tl-td-rank">
                          {rank <= 3
                            ? <span className="tl-medal">{getRankLabel(rank)}</span>
                            : <span className="tl-rank-num">{rank}</span>
                          }
                        </td>

                        <td className="tl-td-name">{item.studentName}</td>

                        <td className="tl-td-score">
                          <div className="tl-score-wrap">
                            <span className="tl-score-text">
                              {item.score} / {item.totalMarks}
                            </span>
                            <div className="tl-score-bar-bg">
                              <div
                                className="tl-score-bar-fill"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="tl-td-date">{formatDate(item.attemptedOn)}</td>

                      </tr>
                    );

                  })}

                </tbody>

              </table>

            </div>

          </div>

        </>

      )}

    </div>

  );

};

export default TeacherLeaderboard;