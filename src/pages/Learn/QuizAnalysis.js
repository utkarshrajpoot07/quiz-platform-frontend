import React from "react";
import "./QuizAnalysis.css";
import { useNavigate, useParams, useLocation } from "react-router-dom";

/* ─────────────────────────────────────────────
   HELPER — grade config
───────────────────────────────────────────── */
const getGradeConfig = (percentage) => {
  if (percentage >= 90) return { grade:"A+", label:"Outstanding! 🏆", color:"#16a34a", bg:"#dcfce7", ring:"#16a34a" };
  if (percentage >= 75) return { grade:"A",  label:"Excellent! 🌟",   color:"#2563eb", bg:"#dbeafe", ring:"#2563eb" };
  if (percentage >= 60) return { grade:"B",  label:"Good Job! 👍",    color:"#7c3aed", bg:"#ede9fe", ring:"#7c3aed" };
  if (percentage >= 40) return { grade:"C",  label:"Keep Going! 📈",  color:"#ca8a04", bg:"#fef9c3", ring:"#ca8a04" };
  return                       { grade:"F",  label:"Need Practice 💪",color:"#dc2626", bg:"#fee2e2", ring:"#dc2626" };
};

/* ═════════════════════════════════════════════
   MAIN — Quiz Analysis / Result Page
═════════════════════════════════════════════ */
const QuizAnalysis = () => {
  const { topicId } = useParams();
  const navigate    = useNavigate();
  const location    = useLocation();

  const result = location.state?.result;

  /* ── no result data — redirect ── */
  if (!result) {
    return (
      <div className="qa-page">
        <div className="qa-error">
          <span>⚠️</span>
          <h3>No result found</h3>
          <p>Please take the quiz first</p>
          <button onClick={() => navigate(`/student/learn/${topicId}`)} className="qa-btn-primary">
            ← Back to Topic
          </button>
        </div>
      </div>
    );
  }

  const gradeConfig  = getGradeConfig(result.percentage);
  const CIRCUMFERENCE = 2 * Math.PI * 54;
  const ringOffset    = CIRCUMFERENCE - (CIRCUMFERENCE * result.percentage / 100);

  return (
    <div className="qa-page">

      {/* ── RESULT SUMMARY CARD ── */}
      <div className="qa-summary-card">

        {/* Score Ring */}
        <div className="qa-ring-wrap">
          <svg width="130" height="130" viewBox="0 0 130 130">
            <defs>
              <linearGradient id="qaGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor={gradeConfig.ring} />
                <stop offset="100%" stopColor={gradeConfig.ring + "88"} />
              </linearGradient>
            </defs>
            {/* track */}
            <circle cx="65" cy="65" r="54" fill="none" stroke="#f3f4f6" strokeWidth="10" />
            {/* progress */}
            <circle
              cx="65" cy="65" r="54"
              fill="none"
              stroke="url(#qaGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={ringOffset}
              transform="rotate(-90 65 65)"
              style={{ transition: "stroke-dashoffset 1.2s ease" }}
            />
            <text x="65" y="58" textAnchor="middle" fontSize="24" fontWeight="800" fill="#111827">
              {result.percentage}%
            </text>
            <text x="65" y="76" textAnchor="middle" fontSize="12" fill="#6b7280">
              score
            </text>
          </svg>

          {/* grade badge */}
          <div
            className="qa-grade-badge"
            style={{ background: gradeConfig.bg, color: gradeConfig.color }}
          >
            {gradeConfig.grade}
          </div>
        </div>

        {/* Summary info */}
        <div className="qa-summary-info">
          <h2 className="qa-topic-title">{result.topicTitle}</h2>
          <p className="qa-grade-label">{gradeConfig.label}</p>

          <div className="qa-stats-row">
            <div className="qa-stat">
              <span className="qa-stat-val" style={{ color:"#16a34a" }}>{result.score}</span>
              <span className="qa-stat-lbl">Correct</span>
            </div>
            <div className="qa-stat-divider" />
            <div className="qa-stat">
              <span className="qa-stat-val" style={{ color:"#dc2626" }}>
                {result.totalMarks - result.score}
              </span>
              <span className="qa-stat-lbl">Wrong</span>
            </div>
            <div className="qa-stat-divider" />
            <div className="qa-stat">
              <span className="qa-stat-val">{result.totalMarks}</span>
              <span className="qa-stat-lbl">Total</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="qa-actions">
          <button
            className="qa-btn-retry"
            onClick={() => navigate(`/student/learn/${topicId}/quiz`)}
          >
            🔄 Retry Quiz
          </button>
          <button
            className="qa-btn-primary"
            onClick={() => navigate("/student/learn")}
          >
            📚 All Topics
          </button>
        </div>
      </div>

      {/* ── ANSWER REVIEW ── */}
      <div className="qa-review-section">
        <h3 className="qa-review-title">Answer Review</h3>
        <p className="qa-review-sub">See which questions you got right and wrong</p>

        <div className="qa-answers-list">
          {result.answers?.map((ans, i) => (
            <div
              key={i}
              className={`qa-answer-card ${ans.isCorrect ? "qa-correct" : "qa-wrong"}`}
            >
              {/* Question header */}
              <div className="qa-answer-header">
                <div className={`qa-answer-icon ${ans.isCorrect ? "qa-icon-correct" : "qa-icon-wrong"}`}>
                  {ans.isCorrect ? "✓" : "✗"}
                </div>
                <div className="qa-qnum">Q{i + 1}</div>
                <p className="qa-question-text">{ans.questionText}</p>
              </div>

              {/* Options row */}
              <div className="qa-options-review">
                {["A","B","C","D"].map(opt => {
                  const isSelected = ans.selectedOption === opt;
                  const isCorrect  = ans.correctOption  === opt;
                  return (
                    <div
                      key={opt}
                      className={`qa-opt-pill 
                        ${isCorrect  ? "qa-opt-correct"  : ""}
                        ${isSelected && !isCorrect ? "qa-opt-wrong" : ""}
                      `}
                    >
                      <span className="qa-opt-letter">{opt}</span>
                      {isCorrect  && <span className="qa-opt-tag qa-tag-correct">Correct</span>}
                      {isSelected && !isCorrect && <span className="qa-opt-tag qa-tag-wrong">Your answer</span>}
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {ans.explanation && (
                <div className="qa-explanation">
                  <span className="qa-exp-icon">💡</span>
                  <p>{ans.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM NAV ── */}
      <div className="qa-bottom-nav">
        <button
          className="qa-btn-retry"
          onClick={() => navigate(`/student/learn/${topicId}/quiz`)}
        >
          🔄 Try Again
        </button>
        <button
          className="qa-btn-read"
          onClick={() => navigate(`/student/learn/${topicId}`)}
        >
          📖 Re-read Topic
        </button>
        <button
          className="qa-btn-primary"
          onClick={() => navigate("/student/learn")}
        >
          📚 More Topics →
        </button>
      </div>

    </div>
  );
};

export default QuizAnalysis;