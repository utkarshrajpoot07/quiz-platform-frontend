import React, { useState, useEffect } from "react";
import "./LearningHub.css";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────
   CATEGORY CONFIG — icons + colors per category
───────────────────────────────────────────── */
const CATEGORY_COLORS = {
  "Programming":  { bg: "#eff6ff", border: "#bfdbfe", badge: "#2563eb", text: "#1e40af" },
  "CS Core":      { bg: "#f5f3ff", border: "#ddd6fe", badge: "#7c3aed", text: "#5b21b6" },
  "Web":          { bg: "#f0fdf4", border: "#bbf7d0", badge: "#16a34a", text: "#15803d" },
  "Modern":       { bg: "#fff7ed", border: "#fed7aa", badge: "#ea580c", text: "#c2410c" },
};

const DIFFICULTY_COLORS = {
  "Beginner":     { bg: "#dcfce7", text: "#15803d" },
  "Intermediate": { bg: "#fef9c3", text: "#a16207" },
  "Advanced":     { bg: "#fee2e2", text: "#b91c1c" },
};

/* ─────────────────────────────────────────────
   COMPONENT — Single Topic Card
───────────────────────────────────────────── */
const TopicCard = ({ topic, onClick }) => {
  const catStyle  = CATEGORY_COLORS[topic.category]  || CATEGORY_COLORS["CS Core"];
  const diffStyle = DIFFICULTY_COLORS[topic.difficulty] || DIFFICULTY_COLORS["Beginner"];

  return (
    <div
      className={`lh-card ${topic.isAttempted ? "lh-card-done" : ""}`}
      style={{ borderColor: catStyle.border }}
      onClick={() => onClick(topic.id)}
    >
      {/* Top section */}
      <div className="lh-card-top" style={{ background: catStyle.bg }}>
        <span className="lh-card-icon">{topic.icon}</span>
        {topic.isAttempted && (
          <div className="lh-card-checkmark">✓</div>
        )}
      </div>

      {/* Content */}
      <div className="lh-card-body">
        <div className="lh-card-meta">
          <span className="lh-badge" style={{ background: catStyle.bg, color: catStyle.text, borderColor: catStyle.border }}>
            {topic.category}
          </span>
          <span className="lh-diff" style={{ background: diffStyle.bg, color: diffStyle.text }}>
            {topic.difficulty}
          </span>
        </div>

        <h3 className="lh-card-title">{topic.title}</h3>
        <p className="lh-card-desc">{topic.description}</p>

        <div className="lh-card-footer">
          <span className="lh-qcount">📝 {topic.questionCount} questions</span>
          {topic.isAttempted ? (
            <div className="lh-score-wrap">
              <div className="lh-score-bar-track">
                <div
                  className="lh-score-bar-fill"
                  style={{ width: `${topic.bestPercent}%` }}
                />
              </div>
              <span className="lh-score-text">{topic.bestPercent}%</span>
            </div>
          ) : (
            <span className="lh-start-hint">Start learning →</span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   COMPONENT — Skeleton Card
───────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="lh-card lh-skeleton-card">
    <div className="lh-card-top" style={{ background: "#f3f4f6" }}>
      <div className="skeleton" style={{ width:48, height:48, borderRadius:12 }} />
    </div>
    <div className="lh-card-body">
      <div style={{ display:"flex", gap:8, marginBottom:10 }}>
        <div className="skeleton" style={{ width:80, height:20, borderRadius:20 }} />
        <div className="skeleton" style={{ width:70, height:20, borderRadius:20 }} />
      </div>
      <div className="skeleton" style={{ width:"80%", height:18, borderRadius:4, marginBottom:8 }} />
      <div className="skeleton" style={{ width:"100%", height:13, borderRadius:4, marginBottom:4 }} />
      <div className="skeleton" style={{ width:"70%", height:13, borderRadius:4 }} />
    </div>
  </div>
);

/* ═════════════════════════════════════════════
   MAIN — Learning Hub Page
═════════════════════════════════════════════ */
const LearningHub = () => {
  const [topics,         setTopics]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm,     setSearchTerm]     = useState("");

  const navigate = useNavigate();

  /* ── fetch all topics ── */
  useEffect(() => {
    axiosClient.get("/Learn/topics")
      .then(res => setTopics(res.data.data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  /* ── unique categories from data ── */
  const categories = ["All", ...new Set(topics.map(t => t.category))];

  /* ── filter by category + search ── */
  const filtered = topics.filter(t => {
    const matchCat    = activeCategory === "All" || t.category === activeCategory;
    const matchSearch = !searchTerm.trim() ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  /* ── stats ── */
  const totalAttempted = topics.filter(t => t.isAttempted).length;
  const avgScore       = topics.filter(t => t.isAttempted).length > 0
    ? Math.round(topics.filter(t => t.isAttempted).reduce((acc, t) => acc + t.bestPercent, 0) / totalAttempted)
    : 0;

  return (
    <div className="lh-page">

      {/* ── PAGE HEADER ── */}
      <div className="lh-header">
        <div>
          <h1>📚 Learn & Practice</h1>
          <p>Master topics and test your knowledge with quizzes</p>
        </div>
        {!loading && !error && topics.length > 0 && (
          <div className="lh-stats">
            <div className="lh-stat-item">
              <span className="lh-stat-num">{topics.length}</span>
              <span className="lh-stat-lbl">Topics</span>
            </div>
            <div className="lh-stat-divider" />
            <div className="lh-stat-item">
              <span className="lh-stat-num">{totalAttempted}</span>
              <span className="lh-stat-lbl">Completed</span>
            </div>
            <div className="lh-stat-divider" />
            <div className="lh-stat-item">
              <span className="lh-stat-num" style={{ color:"#16a34a" }}>{avgScore}%</span>
              <span className="lh-stat-lbl">Avg Score</span>
            </div>
          </div>
        )}
      </div>

      {/* ── SEARCH + FILTER TOOLBAR ── */}
      <div className="lh-toolbar">
        <div className="lh-search-wrap">
          <span className="lh-search-icon">🔍</span>
          <input
            className="lh-search"
            placeholder="Search topics..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="lh-search-clear" onClick={() => setSearchTerm("")}>✕</button>
          )}
        </div>

        <div className="lh-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`lh-filter-btn ${activeCategory === cat ? "lh-filter-active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── ERROR STATE ── */}
      {error && (
        <div className="lh-error">
          <span>⚠️</span>
          <h3>Failed to load topics</h3>
          <p>Please check your connection and try again</p>
          <button onClick={() => window.location.reload()} className="lh-retry-btn">Retry</button>
        </div>
      )}

      {/* ── EMPTY SEARCH STATE ── */}
      {!loading && !error && filtered.length === 0 && topics.length > 0 && (
        <div className="lh-empty">
          <span>🔍</span>
          <h3>No topics found</h3>
          <p>Try a different search term or category</p>
        </div>
      )}

      {/* ── NO TOPICS AT ALL ── */}
      {!loading && !error && topics.length === 0 && (
        <div className="lh-empty">
          <span>📭</span>
          <h3>No topics available yet</h3>
          <p>Topics will appear here once published by your teacher</p>
        </div>
      )}

      {/* ── TOPIC GRID ── */}
      {!error && (
        <div className="lh-grid">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.map(topic => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  onClick={(id) => navigate(`/student/learn/${id}`)}
                />
              ))
          }
        </div>
      )}

    </div>
  );
};

export default LearningHub;