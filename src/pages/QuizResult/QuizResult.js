import React, { useEffect, useState, useCallback, useContext } from "react";
import { useParams, useNavigate }  from "react-router-dom";
import axiosClient                 from "../../api/axiosClient";
import { AuthContext }             from "../../context/AuthContext";
import "./QuizResult.css";

/* ═════════════════════════════════════════════
   HELPERS
═════════════════════════════════════════════ */

const getPct = (score, total) =>
  total > 0 ? Math.round((score / total) * 100) : 0;

const getPerformance = (pct) => {
  if (pct === 100) return { msg: "Perfect Score! 🏆", cls: "perf-perfect" };
  if (pct >= 80)   return { msg: "Excellent Work! 🌟", cls: "perf-great"  };
  if (pct >= 60)   return { msg: "Good Job! 👍",       cls: "perf-good"   };
  if (pct >= 40)   return { msg: "Keep Practicing 💪", cls: "perf-ok"     };
  return                  { msg: "Needs Improvement",  cls: "perf-low"    };
};

/* ═════════════════════════════════════════════
   MAIN — Quiz Result
═════════════════════════════════════════════ */

const QuizResult = () => {

  const { quizId } = useParams();
  const navigate   = useNavigate();

  // ✅ FIX 1 — AuthContext use karo
  const { UserId } = useContext(AuthContext);

  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  /* ── Fetch result ── */

  const fetchResult = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await axiosClient.get(`/student/result/${quizId}`);
      setResult(res.data.data);
    } catch (err) {
      console.error("fetchResult error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [quizId, UserId]);

  useEffect(() => { fetchResult(); }, [fetchResult]);

  /* ── Loading skeleton ── */

  if (loading) return (
    <div className="qr-container">
      <div className="skeleton qr-skeleton-header" />
      <div className="qr-skeleton-card">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="skeleton qr-skeleton-stat" />
        ))}
      </div>
      {/* ✅ FIX 2 — inline styles hataye, CSS classes use ki */}
      <div className="skeleton qr-skeleton-row" />
      <div className="skeleton qr-skeleton-row" />
      <div className="skeleton qr-skeleton-row" />
    </div>
  );

  /* ── Error state ── */

  if (error || !result) return (
    <div className="qr-container">
      <div className="qr-error">
        <div className="qr-error-icon">⚠️</div>
        <h3>Could not load result</h3>
        <p>Please try again or go back to dashboard</p>
        <div className="qr-error-btns">
          <button
            className="qr-btn-primary"
            onClick={fetchResult}
          >
            Retry
          </button>
          <button
            className="qr-btn-outline"
            onClick={() => navigate("/student/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Derived values ── */

  const correctAnswers = result.questions.filter(q =>  q.isCorrect).length;
  const wrongAnswers   = result.questions.filter(q => !q.isCorrect).length;
  const totalQuestions = result.questions.length;
  const percentage     = getPct(result.score, result.totalMarks);
  const performance    = getPerformance(percentage);

  /* ── Render ── */

  return (
    <div className="qr-container">

      {/* ── HERO HEADER ── */}
      <div className="qr-hero">

        <div className={`qr-perf-badge ${performance.cls}`}>
          {performance.msg}
        </div>

        <h1 className="qr-hero-title">🎉 Quiz Completed!</h1>

        <p className="qr-hero-sub">
          You scored <strong>{percentage}%</strong> on{" "}
          <strong>{result.quizTitle}</strong>
        </p>

        {/* Score Ring */}
        <div className="qr-score-ring">
          <svg viewBox="0 0 120 120" width="120" height="120">
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="10"
            />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke={
                percentage >= 75 ? "#16a34a" :
                percentage >= 50 ? "#ea580c" :
                                   "#dc2626"
              }
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - percentage / 100)}`}
              transform="rotate(-90 60 60)"
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>
          <div className="qr-ring-text">
            <span className="qr-ring-pct">{percentage}%</span>
            <span className="qr-ring-label">Score</span>
          </div>
        </div>

      </div>

      {/* ── SUMMARY CARDS ── */}
      <div className="qr-summary-grid">

        <div className="qr-stat-card">
          <div className="qr-stat-icon">🏅</div>
          <div className="qr-stat-val">{result.score}</div>
          <div className="qr-stat-label">Score</div>
        </div>

        <div className="qr-stat-card">
          <div className="qr-stat-icon">📋</div>
          <div className="qr-stat-val">{totalQuestions}</div>
          <div className="qr-stat-label">Total Questions</div>
        </div>

        <div className="qr-stat-card qr-stat-correct">
          <div className="qr-stat-icon">✅</div>
          <div className="qr-stat-val">{correctAnswers}</div>
          <div className="qr-stat-label">Correct</div>
        </div>

        <div className="qr-stat-card qr-stat-wrong">
          <div className="qr-stat-icon">❌</div>
          <div className="qr-stat-val">{wrongAnswers}</div>
          <div className="qr-stat-label">Wrong</div>
        </div>

        <div className="qr-stat-card qr-stat-accuracy">
          <div className="qr-stat-icon">🎯</div>
          <div className="qr-stat-val">{percentage}%</div>
          <div className="qr-stat-label">Accuracy</div>
        </div>

      </div>

      {/* ── QUESTION REVIEW ── */}
      <div className="qr-review-section">

        <div className="qr-review-header">
          <h2>Question Review</h2>
          <div className="qr-review-legend">
            <span className="legend-correct">✓ {correctAnswers} Correct</span>
            <span className="legend-wrong">✗ {wrongAnswers} Wrong</span>
          </div>
        </div>

        <div className="qr-review-list">
          {result.questions.map((q, index) => (
            <div
              key={index}
              className={`qr-review-card ${q.isCorrect ? "qr-card-correct" : "qr-card-wrong"}`}
            >

              {/* Question number + status */}
              <div className="qr-review-top">
                <span className="qr-q-num">Q{index + 1}</span>
                <span className={`qr-status-tag ${q.isCorrect ? "tag-correct" : "tag-wrong"}`}>
                  {q.isCorrect ? "✔ Correct" : "✖ Wrong"}
                </span>
              </div>

              {/* Question text — ✅ confirmed field name from API */}
              <p className="qr-q-text">{q.questionText}</p>

              {/* Answers — ✅ confirmed field names from API */}
              <div className="qr-answers">

                <div className={`qr-answer ${q.isCorrect ? "ans-correct" : "ans-wrong"}`}>
                  <span className="ans-label">Your Answer</span>
                  <span className="ans-text">
                    {q.selectedOption || "Not answered"}
                  </span>
                </div>

                {!q.isCorrect && (
                  <div className="qr-answer ans-correct">
                    <span className="ans-label">Correct Answer</span>
                    <span className="ans-text">{q.correctOption}</span>
                  </div>
                )}

              </div>

            </div>
          ))}
        </div>

      </div>

      {/* ── ACTION BUTTONS ── */}
      <div className="qr-actions">

        <button
          className="qr-btn-secondary"
          onClick={() => navigate("/student/quizzes")}
        >
          Try Another Quiz
        </button>

        <button
          className="qr-btn-primary"
          onClick={() => navigate("/student/dashboard")}
        >
          Go to Dashboard
        </button>

        <button
          className="qr-btn-outline"
          onClick={() => navigate(`/leaderboard/${quizId}`)}
        >
          View Leaderboard
        </button>

      </div>

    </div>
  );
};

export default QuizResult;