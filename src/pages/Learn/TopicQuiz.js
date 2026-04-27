import React, { useState, useEffect, useRef } from "react";
import "./TopicQuiz.css";
import axiosClient from "../../api/axiosClient";
import { useNavigate, useParams } from "react-router-dom";

const TopicQuiz = () => {
  const { topicId } = useParams();
  const navigate    = useNavigate();

  const [questions,  setQuestions]  = useState([]);
  const [current,    setCurrent]    = useState(0);
  const [answers,    setAnswers]    = useState({});   // { questionId: "A"|"B"|"C"|"D" }
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState(false);
  const [timeLeft,   setTimeLeft]   = useState(0);

  const startTime = useRef(Date.now());
  const timerRef  = useRef(null);

  /* ── fetch questions ── */
  useEffect(() => {
    axiosClient.get(`/Learn/topics/${topicId}/questions`)
      .then(res => {
        const qs = res.data.data || [];
        setQuestions(qs);
        setTimeLeft(qs.length * 60); // 1 min per question
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [topicId]);

  /* ── countdown timer ── */
  useEffect(() => {
    if (questions.length === 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [questions]);

  /* ── format time ── */
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  /* ── select answer ── */
  const selectAnswer = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  /* ── submit quiz ── */
  const handleSubmit = async (autoSubmit = false) => {
    if (submitting) return;
    clearInterval(timerRef.current);
    setSubmitting(true);

    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);

    const payload = {
      topicId:   parseInt(topicId),
      timeTaken,
      answers: questions.map(q => ({
        questionId:     q.id,
        selectedOption: answers[q.id] || "A" // default if unanswered
      }))
    };

    try {
      const res = await axiosClient.post("/Learn/attempt", payload);
      // Navigate to result page with data
      navigate(`/student/learn/${topicId}/result`, {
        state: { result: res.data.data }
      });
    } catch {
      setError(true);
      setSubmitting(false);
    }
  };

  const answered    = Object.keys(answers).length;
  const total       = questions.length;
  const progress    = total > 0 ? Math.round((answered / total) * 100) : 0;
  const isLastQ     = current === total - 1;
  const currentQ    = questions[current];
  const OPTIONS     = ["A", "B", "C", "D"];
  const isLowTime   = timeLeft < 60 && timeLeft > 0;

  /* ── loading ── */
  if (loading) return (
    <div className="tq-page">
      <div className="tq-loading">
        <div className="tq-spinner" />
        <p>Loading questions...</p>
      </div>
    </div>
  );

  /* ── error ── */
  if (error || questions.length === 0) return (
    <div className="tq-page">
      <div className="tq-error">
        <span>⚠️</span>
        <h3>No questions available</h3>
        <p>This topic doesn't have any questions yet</p>
        <button onClick={() => navigate(`/student/learn/${topicId}`)} className="tq-back-btn">
          ← Back to Topic
        </button>
      </div>
    </div>
  );

  return (
    <div className="tq-page">

      {/* ── QUIZ HEADER ── */}
      <div className="tq-header">
        <button className="tq-back" onClick={() => navigate(`/student/learn/${topicId}`)}>
          ← Back
        </button>
        <div className="tq-header-center">
          <span className="tq-counter">Question {current + 1} of {total}</span>
          <div className="tq-progress-bar">
            <div className="tq-progress-fill" style={{ width: `${((current + 1) / total) * 100}%` }} />
          </div>
        </div>
        <div className={`tq-timer ${isLowTime ? "tq-timer-low" : ""}`}>
          ⏱ {formatTime(timeLeft)}
        </div>
      </div>

      {/* ── ANSWERED DOTS ── */}
      <div className="tq-dots">
        {questions.map((q, i) => (
          <button
            key={q.id}
            className={`tq-dot ${i === current ? "tq-dot-current" : ""} ${answers[q.id] ? "tq-dot-answered" : ""}`}
            onClick={() => setCurrent(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* ── QUESTION CARD ── */}
      <div className="tq-card">
        <div className="tq-qnum">Q{current + 1}</div>
        <h2 className="tq-question">{currentQ.questionText}</h2>

        <div className="tq-options">
          {OPTIONS.map(opt => {
            const optText  = currentQ[`option${opt}`];
            const selected = answers[currentQ.id] === opt;
            return (
              <button
                key={opt}
                className={`tq-option ${selected ? "tq-option-selected" : ""}`}
                onClick={() => selectAnswer(currentQ.id, opt)}
              >
                <span className="tq-opt-letter">{opt}</span>
                <span className="tq-opt-text">{optText}</span>
                {selected && <span className="tq-opt-check">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── NAVIGATION ── */}
      <div className="tq-nav">
        <button
          className="tq-prev-btn"
          onClick={() => setCurrent(c => c - 1)}
          disabled={current === 0}
        >
          ← Previous
        </button>

        <div className="tq-answered-count">
          {answered} / {total} answered
        </div>

        {isLastQ ? (
          <button
            className="tq-submit-btn"
            onClick={() => handleSubmit(false)}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Quiz ✓"}
          </button>
        ) : (
          <button
            className="tq-next-btn"
            onClick={() => setCurrent(c => c + 1)}
          >
            Next →
          </button>
        )}
      </div>

      {/* ── SUBMIT OVERLAY ── */}
      {submitting && (
        <div className="tq-overlay">
          <div className="tq-overlay-content">
            <div className="tq-spinner" />
            <p>Submitting your answers...</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default TopicQuiz;