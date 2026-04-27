import React, { useEffect, useState, useCallback, useContext } from "react";
import { useNavigate }  from "react-router-dom";
import axiosClient      from "../../api/axiosClient";
import { AuthContext }  from "../../context/AuthContext";
import "./StudentResults.css";

/* ═════════════════════════════════════════════
   HELPERS
═════════════════════════════════════════════ */

const getPct = (score, total) =>
  total > 0 ? Math.round((score / total) * 100) : 0;

const getGrade = (pct) => {
  if (pct >= 90) return { label: "A+", cls: "grade-aplus" };
  if (pct >= 75) return { label: "A",  cls: "grade-a"    };
  if (pct >= 60) return { label: "B",  cls: "grade-b"    };
  if (pct >= 40) return { label: "C",  cls: "grade-c"    };
  return               { label: "F",  cls: "grade-f"    };
};

// ✅ Color via inline style only — dynamic value
const scoreColor = (pct) =>
  pct >= 75 ? "#16a34a" : pct >= 50 ? "#ea580c" : "#dc2626";

const formatDate = (d) => {
  if (!d) return "Attempted";
  try {
    return new Date(d).toLocaleDateString("en-IN", {
      day   : "numeric",
      month : "short",
      year  : "numeric",
    });
  } catch {
    return "Attempted";
  }
};

/* ═════════════════════════════════════════════
   SUB — Skeleton Card
═════════════════════════════════════════════ */

const SkeletonCard = () => (
  <div className="rs-card">
    <div className="skeleton rs-sk-grade" />
    <div className="rs-left">
      <div className="skeleton rs-sk-title" />
      <div className="skeleton rs-sk-date"  />
    </div>
    <div className="rs-center">
      <div className="skeleton rs-sk-score" />
      <div className="skeleton rs-sk-bar"   />
      <div className="skeleton rs-sk-acc"   />
    </div>
    <div className="rs-right">
      <div className="skeleton rs-sk-btn" />
    </div>
  </div>
);

/* ═════════════════════════════════════════════
   MAIN — Student Results
═════════════════════════════════════════════ */

const StudentResults = () => {

  const navigate      = useNavigate();

  // ✅ FIX — AuthContext use karo
  const { UserId }    = useContext(AuthContext);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [filter,  setFilter]  = useState("all");

  /* ── Fetch all quizzes + check attempts ── */

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);

      // ✅ FIX 1 — pageSize=100 so all quizzes fetch ho sakein
      const quizRes = await axiosClient.get("/quiz/all?page=1&pageSize=100");
      const quizzes = quizRes.data.data?.items || [];

      const settled = await Promise.all(
        quizzes.map(async (q) => {
          try {
            const res  = await axiosClient.get(`/student/result/${q.id}`);
            const data = res.data.data;
            return {
              quizId      : data.quizId,
              title       : data.quizTitle,
              score       : data.score,
              total       : data.totalMarks,
              // ✅ FIX 3 — attemptedOn bhi check karo
              submittedAt : data.attemptedOn || data.submittedAt || null,
            };
          } catch {
            return null;
          }
        })
      );

      setResults(settled.filter(Boolean));
    } catch (err) {
      console.error("fetchResults error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [UserId]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  /* ── Stats ── */

  const totalAttempted = results.length;

  const avgScore = totalAttempted
    ? Math.round(
        results.reduce((a, r) => a + getPct(r.score, r.total), 0) / totalAttempted
      )
    : 0;

  const bestScore = totalAttempted
    ? Math.max(...results.map((r) => getPct(r.score, r.total)))
    : 0;

  /* ── Filter ── */

  const filtered = results.filter((r) => {
    const pct = getPct(r.score, r.total);
    if (filter === "pass") return pct >= 50;
    if (filter === "fail") return pct <  50;
    return true;
  });

  /* ── Error state ── */

  if (error) return (
    <div className="results-container">
      <div className="rs-empty">
        <div className="rs-empty-icon">⚠️</div>
        <h3>Something went wrong</h3>
        <p>Could not load your results. Please try again.</p>
        <button
          className="rs-btn-primary"
          onClick={fetchResults}
        >
          Retry
        </button>
      </div>
    </div>
  );

  /* ── Render ── */

  return (
    <div className="results-container">

      {/* HEADER */}
      <div className="rs-header">
        <h1>Quiz Results</h1>
        <p className="rs-sub">
          {loading
            ? "Loading..."
            : `${totalAttempted} quiz${totalAttempted !== 1 ? "zes" : ""} attempted`
          }
        </p>
      </div>

      {/* STATS */}
      {!loading && totalAttempted > 0 && (
        <div className="rs-stats">

          <div className="rs-stat-card">
            <span className="rs-stat-icon">📋</span>
            <div>
              <div className="rs-stat-val">{totalAttempted}</div>
              <div className="rs-stat-label">Attempted</div>
            </div>
          </div>

          <div className="rs-stat-card">
            <span className="rs-stat-icon">🎯</span>
            <div>
              <div className="rs-stat-val">{avgScore}%</div>
              <div className="rs-stat-label">Avg Score</div>
            </div>
          </div>

          <div className="rs-stat-card">
            <span className="rs-stat-icon">🏆</span>
            <div>
              <div className="rs-stat-val">{bestScore}%</div>
              <div className="rs-stat-label">Best Score</div>
            </div>
          </div>

        </div>
      )}

      {/* FILTERS */}
      {!loading && totalAttempted > 0 && (
        <div className="rs-filters">

          {[
            { key : "all",  label : "All Results" },
            { key : "pass", label : "✅ Passed"   },
            { key : "fail", label : "❌ Failed"   },
          ].map((f) => (
            <button
              key={f.key}
              className={`rs-filter-btn ${filter === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}

        </div>
      )}

      {/* LIST */}
      <div className="rs-list">

        {/* Loading */}
        {loading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {/* No results at all */}
        {!loading && results.length === 0 && (
          <div className="rs-empty">
            <div className="rs-empty-icon">📭</div>
            <h3>No results yet</h3>
            <p>Complete a quiz to see your results here</p>
            <button
              className="rs-btn-primary"
              onClick={() => navigate("/student/quizzes")}
            >
              Go to Quizzes
            </button>
          </div>
        )}

        {/* No results after filter */}
        {!loading && results.length > 0 && filtered.length === 0 && (
          <div className="rs-empty">
            <div className="rs-empty-icon">🔍</div>
            <h3>No {filter === "pass" ? "passed" : "failed"} quizzes</h3>
            <p>Try a different filter</p>
          </div>
        )}

        {/* Result Cards */}
        {!loading && filtered.map((r, i) => {

          const pct   = getPct(r.score, r.total);
          const grade = getGrade(pct);
          const color = scoreColor(pct);

          return (
            <div
              key={r.quizId}
              className="rs-card"
              style={{ animationDelay: `${i * 0.06}s` }}
            >

              {/* Grade Badge */}
              <div className={`rs-grade ${grade.cls}`}>
                {grade.label}
              </div>

              {/* Left — title + date */}
              <div className="rs-left">
                <h3>{r.title}</h3>
                <span className="rs-date">
                  📅 {formatDate(r.submittedAt)}
                </span>
              </div>

              {/* Center — score + bar + accuracy */}
              <div className="rs-center">

                <p className="rs-score">
                  {r.score}
                  <span className="rs-score-total">/{r.total}</span>
                </p>

                <div className="rs-bar-track">
                  <div
                    className="rs-bar-fill"
                    style={{
                      width           : `${pct}%`,
                      backgroundColor : color,
                    }}
                  />
                </div>

                <p
                  className="rs-accuracy"
                  style={{ color }}
                >
                  {pct}% Accuracy
                </p>

              </div>

              {/* Right — button */}
              <div className="rs-right">
                <button
                  className="rs-view-btn"
                  onClick={() => navigate(`/quiz-result/${r.quizId}`)}
                >
                  View Detail →
                </button>
              </div>

            </div>
          );

        })}

      </div>

    </div>
  );
};

export default StudentResults;