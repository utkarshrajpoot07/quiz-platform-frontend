import React, { useEffect, useState, useCallback, useContext, useRef } from "react";
import { useParams, useNavigate }  from "react-router-dom";
import axiosClient                 from "../../api/axiosClient";
import { AuthContext }             from "../../context/AuthContext";
import { toast }                   from "react-hot-toast";
import "./QuizAttempt.css";

/* ═════════════════════════════════════════════
   MAIN — Quiz Attempt
═════════════════════════════════════════════ */

const QuizAttempt = () => {

  const { quizId }  = useParams();
  const navigate    = useNavigate();

  // ✅ FIX 1 — AuthContext use karo
  const { UserId }  = useContext(AuthContext);

  const [quiz,          setQuiz]          = useState(null);
  const [current,       setCurrent]       = useState(0);
  const [answers,       setAnswers]       = useState([]);
  const [timeLeft,      setTimeLeft]      = useState(null);
  const [submitted,     setSubmitted]     = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [tabSwitchCount,setTabSwitchCount]= useState(0);

  // ✅ ref to call submitQuiz inside event listeners
  const submittedRef = useRef(false);

  /* ════════════════════════════════════════════
     CHECK IF ALREADY ATTEMPTED
  ════════════════════════════════════════════ */

  const checkIfAttempted = useCallback(async () => {
    try {
      await axiosClient.get(`/student/result/${quizId}`);
      navigate(`/quiz-result/${quizId}`, { replace: true });
    } catch {
      // Not attempted yet — continue
    }
  }, [quizId, navigate]);

  /* ════════════════════════════════════════════
     FETCH QUIZ
  ════════════════════════════════════════════ */

  const fetchQuiz = useCallback(async () => {
    try {
      const res      = await axiosClient.get(`/quiz/details/${quizId}`);
      const quizData = res.data.data;

      setQuiz(quizData);

      // ✅ Timer persistence
      const savedEndTime = localStorage.getItem(`quiz_${quizId}_end`);

      if (savedEndTime) {
        const remaining = Math.floor((savedEndTime - Date.now()) / 1000);
        setTimeLeft(remaining > 0 ? remaining : 0);
      } else {
        const endTime = Date.now() + quizData.durationMinutes * 60 * 1000;
        localStorage.setItem(`quiz_${quizId}_end`, endTime);
        setTimeLeft(quizData.durationMinutes * 60);
      }

      // ✅ Restore saved answers
      const savedAnswers = localStorage.getItem(`quiz_${quizId}_answers`);
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers));
      }

    } catch (err) {
      console.error("fetchQuiz error:", err);
      toast.error("Failed to load quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  /* ════════════════════════════════════════════
     SUBMIT QUIZ
  ════════════════════════════════════════════ */

  const submitQuiz = useCallback(async (auto = false) => {

    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);

    try {
      await axiosClient.post("/student/submit", {
        quizId  : parseInt(quizId),
        answers : answers,
      });

      localStorage.removeItem(`quiz_${quizId}_end`);
      localStorage.removeItem(`quiz_${quizId}_answers`);

      // ✅ FIX 2 — alert() → toast
      if (auto) {
        toast.error("⏰ Time Up! Quiz Auto Submitted");
      } else {
        toast.success("🎉 Quiz Submitted Successfully!");
      }

      navigate(`/quiz-result/${quizId}`);

    } catch (error) {
      submittedRef.current = false;
      setSubmitted(false);
      // ✅ FIX 2 — alert() → toast
      toast.error(
        error.response?.data?.message || "Submit failed. Please try again."
      );
    }
  }, [quizId, answers, navigate]);

  /* ════════════════════════════════════════════
     MOUNT — load quiz + check attempt
  ════════════════════════════════════════════ */

  useEffect(() => {
    checkIfAttempted();
    fetchQuiz();
  }, [checkIfAttempted, fetchQuiz]);

  /* ════════════════════════════════════════════
     TIMER
  ════════════════════════════════════════════ */

  useEffect(() => {
    if (timeLeft === null || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          submitQuiz(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitted, submitQuiz]);

  /* ════════════════════════════════════════════
     PAGE RELOAD PROTECTION
  ════════════════════════════════════════════ */

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!submittedRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  /* ════════════════════════════════════════════
     TAB SWITCH DETECTION
  ════════════════════════════════════════════ */

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !submittedRef.current) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          // ✅ FIX 2 — alert() → toast
          if (newCount === 1) {
            toast.error("⚠️ Warning: Do not switch tabs during the exam!");
          }
          if (newCount >= 2) {
            toast.error("🚨 Tab switching detected! Quiz will be submitted.");
            submitQuiz(true);
          }
          return newCount;
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [submitQuiz]);

  /* ════════════════════════════════════════════
     SELECT OPTION
  ════════════════════════════════════════════ */

  const selectOption = useCallback((questionId, optionId) => {
    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== questionId);
      const updated  = [...filtered, { questionId, selectedOptionId: optionId }];
      localStorage.setItem(`quiz_${quizId}_answers`, JSON.stringify(updated));
      return updated;
    });
  }, [quizId]);

  /* ════════════════════════════════════════════
     FORMAT TIME
  ════════════════════════════════════════════ */

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  /* ════════════════════════════════════════════
     LOADING SKELETON
  ════════════════════════════════════════════ */

  if (loading || !quiz || timeLeft === null) return (
    <div className="qa-wrap">
      <div className="qa-skeleton-header skeleton" />
      <div className="qa-skeleton-progress skeleton" />
      <div className="qa-skeleton-nav">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="skeleton qa-skeleton-nav-btn" />
        ))}
      </div>
      <div className="qa-skeleton-card skeleton" />
      <div className="qa-skeleton-footer skeleton" />
    </div>
  );

  const question      = quiz.questions[current];
  const answeredCount = answers.length;
  const isLowTime     = timeLeft <= 60;

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */

  return (
    <div className="qa-wrap">

      {/* ── HEADER ── */}
      <div className="qa-header">

        <div className="qa-title-wrap">
          <h2 className="qa-title">{quiz.title}</h2>
          <span className="qa-category">{quiz.categoryName}</span>
        </div>

        {/* Timer — red when < 60s */}
        <div className={`qa-timer ${isLowTime ? "qa-timer-low" : ""}`}>
          ⏱ {formatTime(timeLeft)}
        </div>

      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="qa-progress-wrap">
        <div className="qa-progress-info">
          <span>Answered <strong>{answeredCount}</strong> of <strong>{quiz.questions.length}</strong></span>
          <span>{Math.round((answeredCount / quiz.questions.length) * 100)}% Complete</span>
        </div>
        <div className="qa-progress-track">
          <div
            className="qa-progress-fill"
            style={{ width: `${(answeredCount / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* ── QUESTION NAVIGATOR ── */}
      <div className="qa-navigator">
        {quiz.questions.map((q, index) => {
          const answered = answers.find(a => a.questionId === q.id);
          return (
            <button
              key={q.id}
              onClick={() => setCurrent(index)}
              className={`qa-nav-btn
                ${current  === index ? "qa-nav-current"  : ""}
                ${answered            ? "qa-nav-answered" : ""}
              `}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* ── QUESTION CARD ── */}
      <div className="qa-card">

        <div className="qa-card-top">
          <span className="qa-q-num">
            Question {current + 1} / {quiz.questions.length}
          </span>
          <span className="qa-q-marks">
            {question.marks} mark{question.marks !== 1 ? "s" : ""}
          </span>
        </div>

        <p className="qa-q-text">{question.text}</p>

        <div className="qa-options">
          {question.options.map(opt => {
            const isSelected = answers.find(
              a => a.questionId === question.id && a.selectedOptionId === opt.id
            );
            return (
              <button
                key={opt.id}
                onClick={() => selectOption(question.id, opt.id)}
                className={`qa-option ${isSelected ? "qa-option-selected" : ""}`}
              >
                <span className="qa-option-dot" />
                {opt.optionText}
              </button>
            );
          })}
        </div>

      </div>

      {/* ── NAVIGATION ── */}
      <div className="qa-nav-footer">

        <button
          className="qa-btn-prev"
          disabled={current === 0}
          onClick={() => setCurrent(current - 1)}
        >
          ← Previous
        </button>

        <span className="qa-nav-count">
          {current + 1} / {quiz.questions.length}
        </span>

        {current === quiz.questions.length - 1 ? (
          <button
            className="qa-btn-submit"
            onClick={() => submitQuiz(false)}
            disabled={submitted}
          >
            {submitted ? "Submitting..." : "Submit Quiz ✓"}
          </button>
        ) : (
          <button
            className="qa-btn-next"
            onClick={() => setCurrent(current + 1)}
          >
            Next →
          </button>
        )}

      </div>

    </div>
  );
};

export default QuizAttempt;