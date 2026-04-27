import React, { useState, useEffect, useCallback } from "react";
import "./ManageLearn.css";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import MenuBookIcon         from "@mui/icons-material/MenuBook";
import CheckCircleIcon      from "@mui/icons-material/CheckCircle";
import PendingIcon          from "@mui/icons-material/Pending";
import QuizIcon             from "@mui/icons-material/Quiz";
import TopicIcon            from "@mui/icons-material/Topic";
import PublicIcon           from "@mui/icons-material/Public";
import DraftsIcon           from "@mui/icons-material/Drafts";
import HelpOutlineIcon      from "@mui/icons-material/HelpOutline";
import ChevronLeftIcon      from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon     from "@mui/icons-material/ChevronRight";
import EditIcon             from "@mui/icons-material/Edit";
import VisibilityIcon       from "@mui/icons-material/Visibility";
import DeleteForeverIcon    from "@mui/icons-material/DeleteForever";
import WarningAmberIcon     from "@mui/icons-material/WarningAmber";

/* ═════════════════════════════════════════════
   CONSTANTS
═════════════════════════════════════════════ */

const PAGE_SIZE = 8;

/* ═════════════════════════════════════════════
   MAIN — Manage Learn Topics List
═════════════════════════════════════════════ */

const ManageLearn = () => {

  const navigate = useNavigate();

  const [topics,        setTopics]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [currentPage,   setCurrentPage]   = useState(1);
  const [deleteModal,   setDeleteModal]   = useState({ open: false, topic: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ── fetch all topics ── */

  const fetchTopics = useCallback(() => {
    setLoading(true);
    axiosClient
      .get("/Learn/teacher/topics")
      .then(res => {
        setTopics(res.data.data || []);
        setCurrentPage(1);
      })
      .catch(err => console.error("Fetch topics error:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  /* ── delete handlers ── */

  const handleDeleteClick = (topic) => {
    setDeleteModal({ open: true, topic });
  };

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteModal.topic) return;
    setDeleteLoading(true);
    try {
      await axiosClient.delete(`/Learn/teacher/${deleteModal.topic.id}`);
      toast.success(`"${deleteModal.topic.title}" deleted successfully`);
      setDeleteModal({ open: false, topic: null });
      fetchTopics();
    } catch (err) {
      toast.error("Failed to delete topic. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteModal.topic, fetchTopics]);

  const handleDeleteCancel = () => {
    if (deleteLoading) return;
    setDeleteModal({ open: false, topic: null });
  };

  /* ── helpers ── */

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day   : "2-digit",
      month : "short",
      year  : "numeric",
    });
  };

  /* ── derived stats ── */

  const totalQuestions = topics.reduce((acc, t) => acc + (t.questionCount || 0), 0);
  const publishedCount = topics.filter(t =>  t.isPublished).length;
  const draftCount     = topics.filter(t => !t.isPublished).length;

  /* ── pagination logic ── */

  const totalPages  = Math.ceil(topics.length / PAGE_SIZE);
  const startIndex  = (currentPage - 1) * PAGE_SIZE;
  const endIndex    = startIndex + PAGE_SIZE;
  const pagedTopics = topics.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── page numbers to show (max 5 visible) ── */

  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end   = Math.min(totalPages, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  /* ── stat cards config ── */

  const statCards = [
    {
      key       : "topics",
      label     : "TOTAL TOPICS",
      value     : topics.length,
      sub       : "All topics",
      icon      : <TopicIcon sx={{ fontSize: 20 }} />,
      iconColor : "#f59e0b",
      accent    : "#f59e0b",
    },
    {
      key       : "published",
      label     : "PUBLISHED",
      value     : publishedCount,
      sub       : "Live for students",
      icon      : <PublicIcon sx={{ fontSize: 20 }} />,
      iconColor : "#10b981",
      accent    : "#10b981",
    },
    {
      key       : "draft",
      label     : "DRAFT",
      value     : draftCount,
      sub       : "Not published yet",
      icon      : <DraftsIcon sx={{ fontSize: 20 }} />,
      iconColor : "#6366f1",
      accent    : "#6366f1",
    },
    {
      key       : "questions",
      label     : "TOTAL QUESTIONS",
      value     : totalQuestions,
      sub       : "Across all topics",
      icon      : <HelpOutlineIcon sx={{ fontSize: 20 }} />,
      iconColor : "#06b6d4",
      accent    : "#06b6d4",
    },
  ];

  /* ── skeleton row ── */

  const SkeletonRow = () => (
    <div className="ml-topic-row">

      <div
        className="ml-skeleton"
        style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div className="ml-skeleton" style={{ height: 14, width: "40%", borderRadius: 4 }} />
        <div className="ml-skeleton" style={{ height: 11, width: "25%", borderRadius: 4 }} />
      </div>

      <div className="ml-skeleton" style={{ width: 76, height: 26, borderRadius: 20 }} />
      <div className="ml-skeleton" style={{ width: 64, height: 12, borderRadius: 4  }} />

    </div>
  );

  /* ── render ── */

  return (

    <div className="ml-wrap">

      {/* PAGE HEADER */}

      <div className="ml-page-header">

        <div>

          <h2 className="ml-page-title">
            <MenuBookIcon sx={{ fontSize: 22, verticalAlign: "middle", marginRight: "8px" }} />
            Learn & Practice
          </h2>

          <p className="ml-page-subtitle">
            Manage topics and quiz questions for students
          </p>

        </div>

        <button
          className="ml-create-btn"
          onClick={() => navigate("/teacher/learn/create")}
        >
          <AddCircleOutlineIcon sx={{ fontSize: 17 }} />
          <span>Create New Topic</span>
        </button>

      </div>

      {/* STAT CARDS */}

      <div className="ml-stats">

        {statCards.map((card) => (

          <div
            key={card.key}
            className="ml-stat-card"
            style={{ borderBottom: `3px solid ${card.accent}` }}
          >

            <div className="ml-stat-top">
              <span className="ml-stat-label">{card.label}</span>
              <span
                className="ml-stat-icon"
                style={{
                  color      : card.iconColor,
                  background : `${card.iconColor}1a`,
                }}
              >
                {card.icon}
              </span>
            </div>

            <div className="ml-stat-number">
              {loading ? "—" : card.value}
            </div>

            <div className="ml-stat-sub">{card.sub}</div>

          </div>

        ))}

      </div>

      {/* TOPICS LIST CARD */}

      <div className="ml-list-card">

        {/* Card header */}

        <div className="ml-list-header">

          <div className="ml-list-header-left">
            <h3 className="ml-list-title">All Topics</h3>
            {!loading && topics.length > 0 && (
              <span className="ml-topic-count">
                {topics.length} topic{topics.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

        </div>

        {/* Loading skeletons */}

        {loading && (
          <div className="ml-topics-list">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        )}

        {/* Empty state */}

        {!loading && topics.length === 0 && (

          <div className="ml-empty">

            <MenuBookIcon sx={{ fontSize: 48, color: "#94a3b8" }} />

            <h3>No topics yet</h3>

            <p>Create your first topic for students</p>

            <button
              className="ml-create-btn"
              onClick={() => navigate("/teacher/learn/create")}
            >
              <AddCircleOutlineIcon sx={{ fontSize: 17 }} />
              <span>Create First Topic</span>
            </button>

          </div>

        )}

        {/* Topics list */}

        {!loading && topics.length > 0 && (

          <>

            <div className="ml-topics-list">

              {pagedTopics.map(topic => (

                <div key={topic.id} className="ml-topic-row">

                  {/* Icon */}
                  <div className="ml-topic-icon">
                    {topic.icon || "📚"}
                  </div>

                  {/* Info */}
                  <div className="ml-topic-info">

                    <div className="ml-topic-title">{topic.title}</div>

                    <div className="ml-topic-meta">

                      {topic.category && (
                        <span className="ml-badge-cat">{topic.category}</span>
                      )}

                      {topic.difficulty && (
                        <span className="ml-badge-diff">{topic.difficulty}</span>
                      )}

                      <span className="ml-topic-qcount">
                        <QuizIcon sx={{ fontSize: 12, verticalAlign: "middle", marginRight: "3px" }} />
                        {topic.questionCount || 0} questions
                      </span>

                    </div>

                  </div>

                  {/* Status badge */}
                  <div className={`ml-status-badge ${topic.isPublished ? "ml-published" : "ml-draft"}`}>
                    {topic.isPublished
                      ? <><CheckCircleIcon sx={{ fontSize: 13 }}/> Published</>
                      : <><PendingIcon    sx={{ fontSize: 13 }}/> Draft</>
                    }
                  </div>

                  {/* Date */}
                  <div className="ml-topic-date">
                    {formatDate(topic.createdAt)}
                  </div>

                  {/* Actions */}
                  <div className="ml-topic-actions">

                    <button
                      className="ml-icon-action-btn view"
                      title="View topic"
                      onClick={() => navigate(`/teacher/learn/${topic.id}`)}
                    >
                      <VisibilityIcon sx={{ fontSize: 16 }} />
                    </button>

                    <button
                      className="ml-icon-action-btn edit"
                      title="Edit topic"
                      onClick={() => navigate(`/teacher/learn/${topic.id}/edit`)}
                    >
                      <EditIcon sx={{ fontSize: 16 }} />
                    </button>

                    <button
                      className="ml-icon-action-btn delete"
                      title="Delete topic"
                      onClick={() => handleDeleteClick(topic)}
                    >
                      <DeleteForeverIcon sx={{ fontSize: 16 }} />
                    </button>

                  </div>

                </div>

              ))}

            </div>

            {/* PAGINATION */}

            {totalPages > 1 && (

              <div className="ml-pagination">

                {/* Left info */}
                <span className="ml-page-info">
                  Showing {startIndex + 1}–{Math.min(endIndex, topics.length)} of {topics.length}
                </span>

                {/* Page controls */}
                <div className="ml-page-controls">

                  {/* Prev button */}
                  <button
                    className="ml-page-btn ml-page-nav"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeftIcon sx={{ fontSize: 18 }} />
                  </button>

                  {/* Page numbers */}
                  {getPageNumbers().map(page => (
                    <button
                      key={page}
                      className={`ml-page-btn ${currentPage === page ? "ml-page-active" : ""}`}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next button */}
                  <button
                    className="ml-page-btn ml-page-nav"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRightIcon sx={{ fontSize: 18 }} />
                  </button>

                </div>

              </div>

            )}

          </>

        )}

      </div>

      {/* ════ DELETE CONFIRMATION MODAL ════ */}

      {deleteModal.open && (
        <div className="ml-modal-overlay" onClick={handleDeleteCancel}>
          <div className="ml-modal" onClick={(e) => e.stopPropagation()}>

            <div className="ml-modal-icon">
              <WarningAmberIcon sx={{ fontSize: 32, color: "#ef4444" }} />
            </div>

            <h3 className="ml-modal-title">Delete Topic?</h3>

            <p className="ml-modal-msg">
              You are about to delete{" "}
              <strong>"{deleteModal.topic?.title}"</strong>.
              <br />
              This will permanently remove all content, questions, and
              student attempts associated with this topic.
              <br /><br />
              <span className="ml-modal-warn">This action cannot be undone.</span>
            </p>

            <div className="ml-modal-actions">

              <button
                className="ml-modal-cancel-btn"
                onClick={handleDeleteCancel}
                disabled={deleteLoading}
              >
                Cancel
              </button>

              <button
                className="ml-modal-delete-btn"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
              >
                {deleteLoading
                  ? <span className="ml-modal-spinner" />
                  : <DeleteForeverIcon sx={{ fontSize: 16 }} />
                }
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>

            </div>

          </div>
        </div>
      )}

    </div>

  );

};

export default ManageLearn;