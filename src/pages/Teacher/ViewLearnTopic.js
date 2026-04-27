import React, { useState, useEffect, useCallback } from "react";
import "./ManageLearn.css";
import "./ViewLearnTopic.css";
import axiosClient from "../../api/axiosClient";
import { useNavigate, useParams } from "react-router-dom";

import ArrowBackIcon      from "@mui/icons-material/ArrowBack";
import EditIcon           from "@mui/icons-material/Edit";
import MenuBookIcon       from "@mui/icons-material/MenuBook";
import QuizIcon           from "@mui/icons-material/Quiz";
import CheckCircleIcon    from "@mui/icons-material/CheckCircle";
import PendingIcon        from "@mui/icons-material/Pending";
import ArticleIcon        from "@mui/icons-material/Article";
import CodeIcon           from "@mui/icons-material/Code";
import HelpOutlineIcon    from "@mui/icons-material/HelpOutline";

/* ═════════════════════════════════════════════
   MAIN — View Learn Topic (Teacher)
═════════════════════════════════════════════ */

const ViewLearnTopic = () => {

  const { id }     = useParams();
  const navigate   = useNavigate();

  const [topic,     setTopic]     = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [activeTab, setActiveTab] = useState("content"); /* content | questions */

  /* ── fetch topic + questions ── */

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      axiosClient.get(`/Learn/topics/${id}`),
      axiosClient.get(`/Learn/topics/${id}/questions`),
    ])
      .then(([topicRes, qRes]) => {
        setTopic(topicRes.data.data || topicRes.data);
        setQuestions(qRes.data.data || qRes.data || []);
      })
      .catch(() => setError("Failed to load topic. Please try again."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── helpers ── */

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  /* ── skeleton ── */

  if (loading) return (
    <div className="vlt-wrap">
      <div className="vlt-skeleton-header" />
      <div className="vlt-skeleton-card"  />
      <div className="vlt-skeleton-card"  />
    </div>
  );

  /* ── error ── */

  if (error) return (
    <div className="vlt-wrap">
      <div className="ml-page-header">
        <button className="ml-back-btn" onClick={() => navigate("/teacher/learn")}>
          <ArrowBackIcon fontSize="small" /> Back to Topics
        </button>
      </div>
      <div className="vlt-error-banner">
        <span>⚠️ {error}</span>
        <button className="vlt-retry-btn" onClick={fetchData}>Retry</button>
      </div>
    </div>
  );

  const contents  = topic?.contents  || topic?.content  || [];

  /* ── render ── */

  return (

    <div className="vlt-wrap">

      {/* PAGE HEADER */}

      <div className="ml-page-header">

        <div className="ml-header-left">

          <button
            className="ml-back-btn"
            onClick={() => navigate("/teacher/learn")}
          >
            <ArrowBackIcon fontSize="small" /> Back
          </button>

          <div>
            <h2 className="ml-page-title">
              <span style={{ marginRight: 8 }}>{topic?.icon || "📚"}</span>
              {topic?.title}
            </h2>
            <p className="ml-page-subtitle">
              {topic?.category} · {topic?.difficulty} · Created {formatDate(topic?.createdAt)}
            </p>
          </div>

        </div>

        <button
          className="ml-create-btn"
          onClick={() => navigate(`/teacher/learn/${id}/edit`)}
        >
          <EditIcon sx={{ fontSize: 16 }} />
          <span>Edit Topic</span>
        </button>

      </div>

      {/* META CARDS */}

      <div className="vlt-meta-row">

        <div className="vlt-meta-card">
          <span className="vlt-meta-label">STATUS</span>
          <span className={`ml-status-badge ${topic?.isPublished ? "ml-published" : "ml-draft"}`}>
            {topic?.isPublished
              ? <><CheckCircleIcon sx={{ fontSize: 13 }}/> Published</>
              : <><PendingIcon    sx={{ fontSize: 13 }}/> Draft</>
            }
          </span>
        </div>

        <div className="vlt-meta-card">
          <span className="vlt-meta-label">CONTENT SECTIONS</span>
          <span className="vlt-meta-value">
            <ArticleIcon sx={{ fontSize: 16, verticalAlign: "middle", marginRight: 4 }} />
            {contents.length}
          </span>
        </div>

        <div className="vlt-meta-card">
          <span className="vlt-meta-label">QUESTIONS</span>
          <span className="vlt-meta-value">
            <QuizIcon sx={{ fontSize: 16, verticalAlign: "middle", marginRight: 4 }} />
            {questions.length}
          </span>
        </div>

        <div className="vlt-meta-card">
          <span className="vlt-meta-label">CATEGORY</span>
          <span className="ml-badge-cat">{topic?.category || "—"}</span>
        </div>

        <div className="vlt-meta-card">
          <span className="vlt-meta-label">DIFFICULTY</span>
          <span className="ml-badge-diff">{topic?.difficulty || "—"}</span>
        </div>

      </div>

      {/* DESCRIPTION */}

      {topic?.description && (
        <div className="vlt-desc-card">
          <p className="vlt-desc-text">{topic.description}</p>
        </div>
      )}

      {/* TABS */}

      <div className="vlt-tabs">

        <button
          className={`vlt-tab ${activeTab === "content" ? "vlt-tab-active" : ""}`}
          onClick={() => setActiveTab("content")}
        >
          <ArticleIcon sx={{ fontSize: 16 }} />
          Content ({contents.length})
        </button>

        <button
          className={`vlt-tab ${activeTab === "questions" ? "vlt-tab-active" : ""}`}
          onClick={() => setActiveTab("questions")}
        >
          <HelpOutlineIcon sx={{ fontSize: 16 }} />
          Questions ({questions.length})
        </button>

      </div>

      {/* ── CONTENT TAB ── */}

      {activeTab === "content" && (

        <div className="vlt-section">

          {contents.length === 0 ? (

            <div className="vlt-empty">
              <MenuBookIcon sx={{ fontSize: 40, color: "#94a3b8" }} />
              <p>No content sections added yet.</p>
            </div>

          ) : (

            contents
              .slice()
              .sort((a, b) => (a.orderNo || 0) - (b.orderNo || 0))
              .map((section, i) => (

                <div key={section.id || i} className="vlt-content-card">

                  <div className="vlt-content-header">
                    <span className="vlt-order-badge">#{section.orderNo || i + 1}</span>
                    <h3 className="vlt-content-heading">{section.heading}</h3>
                  </div>

                  <p className="vlt-content-body">{section.body}</p>

                  {section.codeSnippet && (
                    <div className="vlt-code-block">
                      <div className="vlt-code-lang">
                        <CodeIcon sx={{ fontSize: 14 }} />
                        {section.language || "code"}
                      </div>
                      <pre className="vlt-code-pre"><code>{section.codeSnippet}</code></pre>
                    </div>
                  )}

                </div>

              ))

          )}

        </div>

      )}

      {/* ── QUESTIONS TAB ── */}

      {activeTab === "questions" && (

        <div className="vlt-section">

          {questions.length === 0 ? (

            <div className="vlt-empty">
              <QuizIcon sx={{ fontSize: 40, color: "#94a3b8" }} />
              <p>No questions added yet.</p>
            </div>

          ) : (

            questions.map((q, i) => (

              <div key={q.id || i} className="vlt-question-card">

                <div className="vlt-q-header">
                  <span className="vlt-q-num">Q{i + 1}</span>
                  <p className="vlt-q-text">{q.questionText}</p>
                </div>

                <div className="ml-options-grid">
                  {["A", "B", "C", "D"].map(opt => (
                    <div
                      key={opt}
                      className={`ml-option-box ${q.correctOption === opt ? "ml-option-correct" : ""}`}
                    >
                      <div className="ml-option-top">
                        <span className="ml-opt-letter">{opt}</span>
                        {q.correctOption === opt && (
                          <CheckCircleIcon sx={{ fontSize: 16, color: "#059669" }} />
                        )}
                      </div>
                      <span className="vlt-opt-text">{q[`option${opt}`]}</span>
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <div className="vlt-explanation">
                    <span className="vlt-expl-label">💡 Explanation</span>
                    <p className="vlt-expl-text">{q.explanation}</p>
                  </div>
                )}

              </div>

            ))

          )}

        </div>

      )}

    </div>

  );

};

export default ViewLearnTopic;