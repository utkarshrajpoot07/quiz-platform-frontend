import React, { useEffect, useState, useCallback } from "react";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";
import "./MyQuizzes.css";
import JoinQuizModal from "../../components/JoinQuizModal/JoinQuizModal";

const MyQuizzes = () => {

  const [quizzes,      setQuizzes]      = useState([]);
  const [attemptedIds, setAttemptedIds] = useState([]);
  const [openJoinModal,setOpenJoinModal]= useState(false);
  const [loading,      setLoading]      = useState(true);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [filter,       setFilter]       = useState("all"); // all | pending | completed

  const navigate = useNavigate();

  // ── BUG FIX: Promise.all instead of sequential for-loop ──
  const checkAttempts = useCallback(async (list) => {
    const results = await Promise.all(
      list.map(async (q) => {
        try {
          await axiosClient.get(`/student/result/${q.id}`);
          return q.id;
        } catch {
          return null;
        }
      })
    );
    setAttemptedIds(results.filter(Boolean));
  }, []);

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/quiz/all?page=1&pageSize=100");
      const list = res.data.data.items || [];
      setQuizzes(list);
      await checkAttempts(list);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [checkAttempts]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  // ── filter + search ──────────────────────────────────────
  const filteredQuizzes = quizzes.filter((q) => {
    const matchSearch =
      !searchTerm.trim() ||
      q.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const isAttempted = attemptedIds.includes(q.id);
    const matchFilter =
      filter === "all" ||
      (filter === "completed" && isAttempted) ||
      (filter === "pending"   && !isAttempted);

    return matchSearch && matchFilter;
  });

  const completedCount = attemptedIds.length;
  const pendingCount   = quizzes.length - completedCount;

  // ── skeleton row ─────────────────────────────────────────
  const SkeletonRow = () => (
    <div className="quiz-row skeleton-row">
      <div className="quiz-info">
        <div className="skeleton sk-title" />
        <div className="skeleton sk-desc"  />
      </div>
      <div className="quiz-meta">
        <div className="skeleton sk-pill" />
        <div className="skeleton sk-btn"  />
      </div>
    </div>
  );

  return (
    <div className="myquizzes-container">

      {/* ── PAGE HEADER ── */}
      <div className="mq-header">
        <div>
          <h1>My Quizzes</h1>
          <p className="mq-sub">
            {loading
              ? "Loading your quizzes..."
              : `${quizzes.length} total · ${completedCount} completed · ${pendingCount} pending`}
          </p>
        </div>
        <button
          className="mq-join-btn"
          onClick={() => setOpenJoinModal(true)}
        >
          + Join Quiz
        </button>
      </div>


      {/* ── SEARCH + FILTER BAR ── */}
      <div className="mq-toolbar">
        <div className="mq-search-wrap">
          <span className="mq-search-icon">🔍</span>
          <input
            className="mq-search"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="mq-clear"
              onClick={() => setSearchTerm("")}
            >✕</button>
          )}
        </div>

        <div className="mq-filters">
          {["all", "pending", "completed"].map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all"       ? "All"       :
               f === "pending"   ? "⏳ Pending" :
               "✅ Completed"}
            </button>
          ))}
        </div>
      </div>

      {/* ── QUIZ LIST ── */}
      <div className="quiz-table">

        {/* Loading skeletons */}
        {loading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>

        /* No results from search/filter */
        ) : filteredQuizzes.length === 0 ? (
          <div className="mq-empty">
            <div className="mq-empty-icon">
              {searchTerm ? "🔍" : "📭"}
            </div>
            <h3>
              {searchTerm
                ? `No quizzes found for "${searchTerm}"`
                : filter === "completed"
                ? "No completed quizzes yet"
                : filter === "pending"
                ? "No pending quizzes"
                : "No quizzes available"}
            </h3>
            <p>
              {searchTerm
                ? "Try a different search term"
                : "Join a quiz using a code to get started"}
            </p>
            {!searchTerm && (
              <button
                className="mq-join-btn"
                style={{ marginTop: 16 }}
                onClick={() => setOpenJoinModal(true)}
              >
                + Join a Quiz
              </button>
            )}
          </div>

        /* Quiz rows */
        ) : (
          filteredQuizzes.map((q, index) => {
            const isAttempted = attemptedIds.includes(q.id);
            return (
              <div
                key={q.id}
                className={`quiz-row ${isAttempted ? "row-done" : "row-pending"}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* left accent bar */}
                <div className={`row-accent ${isAttempted ? "accent-green" : "accent-blue"}`} />

                <div className="quiz-info">
                  <div className="quiz-title-row">
                    <h3>{q.title}</h3>
                    <span className={`status-badge ${isAttempted ? "badge-done" : "badge-open"}`}>
                      {isAttempted ? "✓ Completed" : "● Open"}
                    </span>
                  </div>
                  <p>{q.description}</p>
                </div>

                <div className="quiz-meta">
                  <span className="quiz-time">
                    🕒 {q.durationMinutes} min
                  </span>

                  {isAttempted ? (
                    <button
                      className="result-btn"
                      onClick={() => navigate(`/quiz-result/${q.id}`)}
                    >
                      View Result
                    </button>
                  ) : (
                    <button
                      className="start-btn"
                      onClick={() => setOpenJoinModal(true)}
                    >
                      Start Quiz →
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── RESULT COUNT ── */}
      {!loading && filteredQuizzes.length > 0 && (
        <div className="mq-result-count">
          Showing {filteredQuizzes.length} of {quizzes.length} quizzes
        </div>
      )}

      <JoinQuizModal
        open={openJoinModal}
        onClose={() => setOpenJoinModal(false)}
      />
    </div>
  );
};

export default MyQuizzes;