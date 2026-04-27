import React, { useEffect, useState } from "react";
import { useParams, useNavigate }      from "react-router-dom";
import axiosClient                     from "../../api/axiosClient";
import "./PreviewQuiz.css";

import QuizIcon        from "@mui/icons-material/Quiz";
import TimerIcon       from "@mui/icons-material/Timer";
import StarIcon        from "@mui/icons-material/Star";
import CategoryIcon    from "@mui/icons-material/Category";
import ArrowBackIcon   from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

/* ═════════════════════════════════════════════
   MAIN — Preview Quiz
═════════════════════════════════════════════ */

const PreviewQuiz = () => {

  const { quizId } = useParams();
  const navigate   = useNavigate();

  const [quiz,    setQuiz]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  /* ── fetch quiz on mount ── */

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  /* ── fetch quiz details ── */

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axiosClient.get(`/quiz/details/${quizId}`);

      if (res.data.success) {
        setQuiz(res.data.data);
      } else {
        setError("Could not load quiz details.");
      }
    } catch (err) {
      console.error("Fetch quiz error:", err);
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  /* ── option letter helper ── */

  const getOptionLetter = (index) => {
    return String.fromCharCode(65 + index);
  };

  /* ── loading state ── */

  if (loading) {
    return (
      <div className="pq-wrap">
        <div className="pq-skeleton pq-sk-title" />
        <div className="pq-skeleton pq-sk-desc" />
        <div className="pq-skeleton pq-sk-meta" />
        {[1, 2, 3].map(n => (
          <div key={n} className="pq-skeleton pq-sk-card" />
        ))}
      </div>
    );
  }

  /* ── error state ── */

  if (error) {
    return (
      <div className="pq-wrap">
        <div className="pq-error-banner">
          <span>⚠ {error}</span>
          <button onClick={fetchQuiz}>Retry</button>
        </div>
      </div>
    );
  }

  /* ── render ── */

  return (

    <div className="pq-wrap">

      {/* BACK BUTTON */}

      <button
        className="pq-back-btn"
        onClick={() => navigate(-1)}
      >
        <ArrowBackIcon sx={{ fontSize: 17 }} />
        <span>Back</span>
      </button>

      {/* QUIZ HEADER */}

      <div className="pq-header">

        <div className="pq-header-left">
          <h2 className="pq-title">{quiz.title}</h2>
          <p className="pq-desc">{quiz.description}</p>
        </div>

        <span className="pq-question-count">
          <QuizIcon sx={{ fontSize: 15 }} />
          {quiz.questions?.length || 0} Questions
        </span>

      </div>

      {/* QUIZ META CHIPS */}

      <div className="pq-meta">

        {quiz.duration && (
          <div className="pq-meta-chip">
            <TimerIcon sx={{ fontSize: 15 }} />
            <span>{quiz.duration} min</span>
          </div>
        )}

        {quiz.totalMarks && (
          <div className="pq-meta-chip">
            <StarIcon sx={{ fontSize: 15 }} />
            <span>{quiz.totalMarks} marks</span>
          </div>
        )}

        {quiz.category && (
          <div className="pq-meta-chip">
            <CategoryIcon sx={{ fontSize: 15 }} />
            <span>{quiz.category}</span>
          </div>
        )}

      </div>

      {/* QUESTIONS LIST */}

      {(!quiz.questions || quiz.questions.length === 0) ? (

        <div className="pq-empty">
          No questions added yet.
        </div>

      ) : (

        <div className="pq-questions">

          {quiz.questions.map((q, index) => (

            <div key={q.id} className="pq-card">

              {/* Question header */}
              <div className="pq-q-header">
                <span className="pq-q-number">Q{index + 1}</span>
                <p className="pq-q-text">{q.text}</p>
              </div>

              {/* Options */}
              <ul className="pq-options">
                {q.options.map((o, i) => (
                  <li
                    key={o.id}
                    className={`pq-option ${o.isCorrect ? "pq-correct" : ""}`}
                  >
                    <span className="pq-opt-letter">
                      {getOptionLetter(i)}
                    </span>
                    <span className="pq-opt-text">{o.optionText}</span>
                    {o.isCorrect && (
                      <CheckCircleIcon
                        className="pq-correct-icon"
                        sx={{ fontSize: 16 }}
                      />
                    )}
                  </li>
                ))}
              </ul>

            </div>

          ))}

        </div>

      )}

    </div>

  );

};

export default PreviewQuiz;