import React, { useState, useEffect } from "react";
import "./TopicDetail.css";
import axiosClient from "../../api/axiosClient";
import { useNavigate, useParams } from "react-router-dom";

const TopicDetail = () => {
  const { topicId } = useParams();
  const navigate    = useNavigate();

  const [topic,   setTopic]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    axiosClient.get(`/Learn/topics/${topicId}`)
      .then(res => setTopic(res.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [topicId]);

  if (loading) return (
    <div className="td-page">
      <div className="td-skeleton">
        <div className="skeleton" style={{ width:"40%", height:32, borderRadius:4, marginBottom:12 }} />
        <div className="skeleton" style={{ width:"70%", height:16, borderRadius:4, marginBottom:32 }} />
        {[1,2,3].map(i => (
          <div key={i} style={{ marginBottom:24 }}>
            <div className="skeleton" style={{ width:"50%", height:20, borderRadius:4, marginBottom:10 }} />
            <div className="skeleton" style={{ width:"100%", height:13, borderRadius:4, marginBottom:6 }} />
            <div className="skeleton" style={{ width:"90%", height:13, borderRadius:4, marginBottom:6 }} />
            <div className="skeleton" style={{ width:"80%", height:13, borderRadius:4 }} />
          </div>
        ))}
      </div>
    </div>
  );

  if (error || !topic) return (
    <div className="td-page">
      <div className="td-error">
        <span>⚠️</span>
        <h3>Topic not found</h3>
        <p>This topic may not exist or is not published yet</p>
        <button onClick={() => navigate("/student/learn")} className="td-back-btn">← Back to Topics</button>
      </div>
    </div>
  );

  return (
    <div className="td-page">

      {/* ── BACK BUTTON ── */}
      <button className="td-back" onClick={() => navigate("/student/learn")}>
        ← Back to Topics
      </button>

      {/* ── TOPIC HEADER ── */}
      <div className="td-header">
        <div className="td-header-left">
          <span className="td-icon">{topic.icon}</span>
          <div>
            <div className="td-meta">
              <span className="td-cat-badge">{topic.category}</span>
              <span className="td-diff-badge">{topic.difficulty}</span>
              <span className="td-qcount">📝 {topic.questionCount} questions</span>
            </div>
            <h1 className="td-title">{topic.title}</h1>
            <p className="td-desc">{topic.description}</p>
          </div>
        </div>

        <button
          className="td-quiz-btn"
          onClick={() => navigate(`/student/learn/${topicId}/quiz`)}
        >
          Take Quiz →
        </button>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div className="td-progress-wrap">
        <div className="td-progress-label">
          <span>Reading Progress</span>
          <span>{topic.contents?.length || 0} sections</span>
        </div>
        <div className="td-progress-bar">
          <div className="td-progress-fill" style={{ width: "100%" }} />
        </div>
      </div>

      {/* ── CONTENT SECTIONS ── */}
      <div className="td-content">
        {topic.contents?.map((section, i) => (
          <div key={i} className="td-section">
            <div className="td-section-num">{String(i + 1).padStart(2, "0")}</div>
            <div className="td-section-body">
              {section.heading && (
                <h2 className="td-section-heading">{section.heading}</h2>
              )}
              {section.body && (
                <p className="td-section-text">{section.body}</p>
              )}
              {section.codeSnippet && (
                <div className="td-code-wrap">
                  <div className="td-code-header">
                    <span className="td-code-lang">{section.language || "code"}</span>
                    <button
                      className="td-copy-btn"
                      onClick={() => navigator.clipboard.writeText(section.codeSnippet)}
                    >
                      📋 Copy
                    </button>
                  </div>
                  <pre className="td-code"><code>{section.codeSnippet}</code></pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── BOTTOM CTA ── */}
      <div className="td-cta">
        <div className="td-cta-text">
          <h3>Ready to test your knowledge?</h3>
          <p>Take a {topic.questionCount}-question quiz on {topic.title}</p>
        </div>
        <button
          className="td-quiz-btn-lg"
          onClick={() => navigate(`/student/learn/${topicId}/quiz`)}
        >
          🚀 Start Quiz
        </button>
      </div>

    </div>
  );
};

export default TopicDetail;