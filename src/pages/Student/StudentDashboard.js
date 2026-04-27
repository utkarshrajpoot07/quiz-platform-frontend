import React, { useState, useEffect, useCallback, useContext } from "react";
import "./StudentDashboard.css";
import JoinQuizModal  from "../../components/JoinQuizModal/JoinQuizModal";
import axiosClient    from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useSearch }  from "../../context/SearchContext";

/* ═════════════════════════════════════════════
   HELPER — score color scheme
═════════════════════════════════════════════ */

const getScoreStyle = (score) => {
  if (score >= 75) return {
    iconBg  : "#f0fdf4", iconColor : "#16a34a",
    barBg   : "#dcfce7", barFill   : "linear-gradient(90deg,#16a34a,#4ade80)",
    text    : "#16a34a", grade     : "Excellent ✓"
  };
  if (score >= 50) return {
    iconBg  : "#fefce8", iconColor : "#ca8a04",
    barBg   : "#fef9c3", barFill   : "linear-gradient(90deg,#ca8a04,#fde047)",
    text    : "#ca8a04", grade     : "Average"
  };
  return {
    iconBg  : "#fef2f2", iconColor : "#dc2626",
    barBg   : "#fee2e2", barFill   : "linear-gradient(90deg,#dc2626,#f87171)",
    text    : "#dc2626", grade     : "Needs Work"
  };
};

/* ═════════════════════════════════════════════
   SUB — Score History Bars
═════════════════════════════════════════════ */

const ScoreHistoryBars = ({ quizScores }) => {

  if (!quizScores || quizScores.length === 0) {
    return (
      <div className="score-empty">
        <span className="score-empty-icon">📊</span>
        <p>Complete quizzes to see your score history</p>
      </div>
    );
  }

  return (
    <div className="score-bars-list">
      {quizScores.map((item, i) => {
        const s = getScoreStyle(item.score);
        return (
          <div key={i} className="score-bar-row">

            <div className="score-bar-icon" style={{ background: s.iconBg, color: s.iconColor }}>
              {item.title?.charAt(0).toUpperCase()}
            </div>

            <div className="score-bar-content">
              <div className="score-bar-top">
                <span className="score-bar-title">{item.title}</span>
                <span className="score-bar-pct" style={{ color: s.text }}>
                  {Math.round(item.score)}%
                </span>
              </div>
              <div className="score-bar-track" style={{ background: s.barBg }}>
                <div
                  className="score-bar-fill"
                  style={{
                    width      : `${Math.min(item.score, 100)}%`,
                    background : s.barFill,
                    transition : "width 1s cubic-bezier(0.4,0,0.2,1)"
                  }}
                />
              </div>
              <span className="score-bar-grade" style={{ color: s.text }}>{s.grade}</span>
            </div>

          </div>
        );
      })}
    </div>
  );
};

/* ═════════════════════════════════════════════
   SUB — Mini Leaderboard
═════════════════════════════════════════════ */

const MiniLeaderboard = ({ myName }) => {

  const [leaders,   setLeaders]   = useState([]);
  const [lbLoading, setLbLoading] = useState(true);

  useEffect(() => {
    axiosClient.get("/Leaderboard/global")
      .then(res => setLeaders((res.data.data || []).slice(0, 5)))
      .catch(() => {})
      .finally(() => setLbLoading(false));
  }, []);

  const AVATAR_COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444"];
  const MEDALS        = ["🥇", "🥈", "🥉"];

  if (lbLoading) return (
    <div className="lb-loading">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="mini-lb-row">
          <div className="skeleton" style={{ width:22,  height:14, borderRadius:4 }} />
          <div className="skeleton" style={{ width:32,  height:32, borderRadius:"50%" }} />
          <div className="skeleton" style={{ flex:1,   height:13, borderRadius:4 }} />
          <div className="skeleton" style={{ width:46, height:13, borderRadius:4 }} />
        </div>
      ))}
    </div>
  );

  if (leaders.length === 0) return (
    <div className="score-empty">
      <span className="score-empty-icon">🏆</span>
      <p>No leaderboard data yet</p>
    </div>
  );

  return (
    <div className="mini-lb-list">
      {leaders.map((user, i) => {
        const isMe  = user.studentName?.trim() === myName?.trim();
        const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
        return (
          <div key={user.studentId} className={`mini-lb-row ${isMe ? "mini-lb-me" : ""}`}>

            <span className="mini-lb-rank">
              {i < 3
                ? MEDALS[i]
                : <span style={{ color:"#9ca3af", fontSize:12 }}>{i + 1}</span>
              }
            </span>

            <div className="mini-lb-av" style={{ background: color + "22", color }}>
              {user.studentName?.charAt(0).toUpperCase()}
            </div>

            <div className="mini-lb-info">
              <div className="mini-lb-name">
                {user.studentName}
                {isMe && <span className="mini-lb-you">You</span>}
              </div>
              <div className="mini-lb-attempts">{user.totalAttempts} quizzes</div>
            </div>

            <span className="mini-lb-score">{user.totalScore} pts</span>

          </div>
        );
      })}
    </div>
  );
};

/* ═════════════════════════════════════════════
   SUB — Skeleton Row
═════════════════════════════════════════════ */

const SkeletonRow = () => (
  <div className="quiz-compact-row" style={{ pointerEvents:"none" }}>
    <div className="skeleton" style={{ width:36, height:36, borderRadius:10, flexShrink:0 }} />
    <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
      <div className="skeleton" style={{ height:13, width:"60%" }} />
      <div className="skeleton" style={{ height:11, width:"40%" }} />
    </div>
    <div className="skeleton" style={{ width:14, height:14, borderRadius:4 }} />
  </div>
);

/* ═════════════════════════════════════════════
   HELPER — highlight search term
═════════════════════════════════════════════ */

const highlightMatch = (text, term) => {
  if (!term.trim() || !text) return text;
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return text.split(regex).map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="search-highlight">{part}</mark>
      : part
  );
};

/* ═════════════════════════════════════════════
   MAIN — Student Dashboard
═════════════════════════════════════════════ */

const StudentDashboard = () => {

  const [openJoinModal, setOpenJoinModal] = useState(false);
  const [quizzes,       setQuizzes]       = useState([]);
  const [attemptedIds,  setAttemptedIds]  = useState([]);
  const [quizScores,    setQuizScores]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);

  const [stats, setStats] = useState({
    attempted  : 0,
    completed  : 0,
    pending    : 0,
    avgScore   : 0,
    globalRank : 0,
  });

  // ✅ AuthContext se name aur UserId lo — no jwtDecode directly
  const { name, UserId } = useContext(AuthContext);
  const { searchTerm }   = useSearch();
  const navigate         = useNavigate();

  /* ── Fetch global rank ── */

  const fetchGlobalRank = useCallback(async () => {
    try {
      const res     = await axiosClient.get("/Leaderboard/global");
      const list    = res.data.data || [];
      // ✅ AuthContext UserId use karo
      const myIndex = list.findIndex((s) => String(s.studentId) === String(UserId));
      const rank    = myIndex !== -1 ? myIndex + 1 : 0;
      setStats((prev) => ({ ...prev, globalRank: rank }));
    } catch (err) {
      console.error("fetchGlobalRank error:", err);
    }
  }, [UserId]);

  /* ── Check attempts + calculate stats ── */

  const checkAttempts = useCallback(async (quizList) => {
    const results = await Promise.all(
      quizList.map(async (q) => {
        try {
          const res    = await axiosClient.get(`/student/result/${q.id}`);
          const result = res.data.data;
          const score  = (result.score / result.totalMarks) * 100;
          return { id: q.id, score, title: q.title };
        } catch {
          return null;
        }
      })
    );

    const attempted       = results.filter(Boolean);
    const attemptedIdList = attempted.map((r) => r.id);
    const scoreSum        = attempted.reduce((acc, r) => acc + r.score, 0);
    const completed       = attempted.length;
    const avgScore        = completed ? Math.round(scoreSum / completed) : 0;

    // ✅ FIX — pending = total quizzes - attempted (not just 4!)
    const pending = quizList.length - completed;

    setAttemptedIds(attemptedIdList);
    setQuizScores(attempted);
    setStats((prev) => ({ ...prev, attempted: completed, completed, pending, avgScore }));
  }, []);

  /* ── Fetch ALL quizzes ── */

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ FIX — pageSize=100 so all quizzes fetch ho sakein
      const res  = await axiosClient.get("/quiz/all?page=1&pageSize=100");
      const list = res.data.data?.items || [];

      setQuizzes(list);
      await checkAttempts(list);
    } catch (err) {
      console.error("fetchQuizzes error:", err);
      setError("Failed to load quizzes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [checkAttempts]);

  /* ── Mount ── */

  useEffect(() => {
    fetchQuizzes();
    fetchGlobalRank();
  }, [fetchQuizzes, fetchGlobalRank]);

  /* ── Greeting ── */

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  /* ── Filter quizzes by search ── */

  const filteredQuizzes = quizzes.filter((q) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      q.title?.toLowerCase().includes(term) ||
      q.description?.toLowerCase().includes(term)
    );
  });

  /* ── Recent 4 for dashboard display ── */
  const recentQuizzes = filteredQuizzes.slice(0, 4);

  /* ── Accuracy ring ── */

  const CIRCUMFERENCE = 2 * Math.PI * 64;
  const ringOffset    = CIRCUMFERENCE - (CIRCUMFERENCE * stats.avgScore) / 100;

  /* ── Grade label ── */

  const getGradeLabel = (score) => {
    if (score >= 90) return "A+ Grade · Outstanding 🏆";
    if (score >= 75) return "A Grade · Excellent 🌟";
    if (score >= 60) return "B Grade · Good 👍";
    if (score >= 40) return "C Grade · Average 📈";
    if (score > 0)   return "Keep Practicing 💪";
    return "No attempts yet";
  };

  /* ═══════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════ */

  return (
    <div className="student-dashboard">

      {/* ── HERO BANNER ── */}
      <div className="dashboard-hero">
        <div className="hero-overlay">
          <div className="hero-content">
            <span className="hero-badge">🚀 New quizzes available</span>
            <h2>Test Your Knowledge with Quizzes 🧠</h2>
            <p>Challenge yourself, track progress and level up daily</p>
            <button className="hero-btn" onClick={() => setOpenJoinModal(true)}>
              Start Now →
            </button>
          </div>
        </div>
      </div>

      {/* ── GREETING ── */}
      <div className="dashboard-header">
        <div>
          {/* ✅ AuthContext se name */}
          <h1>👋 {getGreeting()}, <span className="name">{name || "Student"}</span></h1>
          <p>Ready to continue your learning journey?</p>
        </div>
        <button className="join-quiz-btn" onClick={() => setOpenJoinModal(true)}>
          + Join Quiz
        </button>
      </div>

      {/* ── ERROR BANNER ── */}
      {error && (
        <div className="sd-error-banner">
          ⚠️ {error}
          <button onClick={fetchQuizzes}>Retry</button>
        </div>
      )}

      {/* ── STAT CARDS ── */}
      <div className="stats-grid">

        <div className="stat-card stat-blue">
          <div className="stat-icon">📊</div>
          <p>Attempted</p>
          <h3>{stats.attempted}</h3>
          <div className="stat-trend">Total quizzes taken</div>
        </div>

        <div className="stat-card stat-green">
          <div className="stat-icon">✅</div>
          <p>Completed</p>
          <h3>{stats.completed}</h3>
          <div className="stat-trend">Successfully finished</div>
        </div>

        <div className="stat-card stat-orange">
          <div className="stat-icon">⏳</div>
          <p>Pending</p>
          <h3>{stats.pending}</h3>
          <div className="stat-trend">Awaiting attempt</div>
        </div>

        <div className="stat-card stat-sky">
          <div className="stat-icon">🏅</div>
          <p>Global Rank</p>
          <h3>{stats.globalRank > 0 ? `#${stats.globalRank}` : "—"}</h3>
          <div className="stat-trend">
            {stats.globalRank === 1  ? "🥇 You're #1!"
            : stats.globalRank > 0  ? `↑ Top ${stats.globalRank} globally`
            : "Not ranked yet"}
          </div>
        </div>

      </div>

      {/* ══ ROW 1 — Recent Quizzes | Accuracy ══ */}
      <div className="dash-mid-row">

        {/* LEFT — Recent Quizzes */}
        <div className="dash-card recent-section">
          <div className="section-header">
            <div>
              <h2>Recent Quizzes</h2>
              <p className="section-sub">
                {searchTerm.trim()
                  ? filteredQuizzes.length === 0
                    ? `No results for "${searchTerm}"`
                    : `${filteredQuizzes.length} result${filteredQuizzes.length > 1 ? "s" : ""} for "${searchTerm}"`
                  : "Your latest assigned quizzes"}
              </p>
            </div>
            <button className="view-all-btn" onClick={() => navigate("/student/quizzes")}>
              View All →
            </button>
          </div>

          {loading ? (
            <div className="quiz-compact-list">
              <SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow />
            </div>
          ) : searchTerm.trim() && filteredQuizzes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No quizzes found</h3>
              <p>No quiz matches "<strong>{searchTerm}</strong>"</p>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No quizzes yet</h3>
              <p>Join a quiz using a code to get started</p>
              <button className="hero-btn" style={{ marginTop:16 }} onClick={() => setOpenJoinModal(true)}>
                Join a Quiz
              </button>
            </div>
          ) : (
            <div className="quiz-compact-list">
              {recentQuizzes.map((q) => {
                const isAttempted = attemptedIds.includes(q.id);
                return (
                  <div
                    key={q.id}
                    className={`quiz-compact-row ${isAttempted ? "qcr-done" : "qcr-open"}`}
                    onClick={() => isAttempted
                      ? navigate(`/quiz-result/${q.id}`)
                      : setOpenJoinModal(true)
                    }
                  >
                    <div className={`qcr-icon ${isAttempted ? "qcr-icon-done" : "qcr-icon-open"}`}>
                      {q.title?.charAt(0).toUpperCase()}
                    </div>
                    <div className="qcr-info">
                      <div className="qcr-title">{highlightMatch(q.title, searchTerm)}</div>
                      <div className="qcr-meta">
                        🕒 {q.durationMinutes} min &nbsp;·&nbsp;
                        <span className={isAttempted ? "qcr-status-done" : "qcr-status-open"}>
                          {isAttempted ? "Completed" : "Open"}
                        </span>
                      </div>
                    </div>
                    <div className="qcr-arrow">→</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT — Accuracy Ring */}
        <div className="dash-card dash-accuracy-card">
          <div className="section-header">
            <div>
              <h2>Overall Accuracy</h2>
              <p className="section-sub">Based on all your attempts</p>
            </div>
            <button className="view-all-btn" onClick={() => navigate("/student/results")}>
              Details →
            </button>
          </div>

          <div className="accuracy-ring-wrap">
            <svg width="150" height="150" viewBox="0 0 160 160">
              <defs>
                <linearGradient id="accGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%"   stopColor="#7c3aed"/>
                  <stop offset="100%" stopColor="#22d3a5"/>
                </linearGradient>
              </defs>
              <circle cx="80" cy="80" r="64" fill="none" stroke="#f0f4ff" strokeWidth="12"/>
              {stats.avgScore > 0 && (
                <circle
                  cx="80" cy="80" r="64"
                  fill="none"
                  stroke="url(#accGrad)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={ringOffset}
                  transform="rotate(-90 80 80)"
                  style={{ transition:"stroke-dashoffset 1s ease" }}
                />
              )}
              <text x="80" y="72" textAnchor="middle" fontWeight="700" fontSize="28" fill="#111827">
                {stats.avgScore}%
              </text>
              <text x="80" y="92" textAnchor="middle" fontSize="12" fill="#9ca3af">
                avg score
              </text>
            </svg>

            <div className="accuracy-grade">{getGradeLabel(stats.avgScore)}</div>
          </div>

          <div className="accuracy-meta">
            <div className="acc-meta-item">
              <span className="acc-meta-label">Avg Score</span>
              <span className="acc-meta-val best">{stats.avgScore}%</span>
            </div>
            <div className="acc-meta-item">
              <span className="acc-meta-label">Completed</span>
              <span className="acc-meta-val neutral">{stats.completed} quizzes</span>
            </div>
          </div>
        </div>

      </div>

      {/* ══ ROW 2 — Score History | Leaderboard ══ */}
      <div className="dash-bot-row">

        {/* LEFT — Score History */}
        <div className="dash-card dash-score-card">
          <div className="section-header">
            <div>
              <h2>Score History</h2>
              <p className="section-sub">Your performance per quiz</p>
            </div>
            <button className="view-all-btn" onClick={() => navigate("/student/results")}>
              All Results →
            </button>
          </div>
          <ScoreHistoryBars quizScores={quizScores} />
        </div>

        {/* RIGHT — Mini Leaderboard */}
        <div className="dash-card dash-lb-card">
          <div className="section-header">
            <div>
              <h2>Leaderboard</h2>
              <p className="section-sub">Top performers globally</p>
            </div>
            <button className="view-all-btn" onClick={() => navigate("/leaderboard")}>
              Full board →
            </button>
          </div>
          {/* ✅ AuthContext se name pass karo */}
          <MiniLeaderboard myName={name} />
        </div>

      </div>

      <JoinQuizModal open={openJoinModal} onClose={() => setOpenJoinModal(false)} />

    </div>
  );
};

export default StudentDashboard;