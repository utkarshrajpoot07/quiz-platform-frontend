import React, { useEffect, useState, useCallback } from "react";
import axiosClient   from "../../api/axiosClient";
import { useParams, useNavigate } from "react-router-dom";
import { toast }     from "react-hot-toast";
import "./EditQuiz.css";

import TitleIcon       from "@mui/icons-material/Title";
import DescriptionIcon from "@mui/icons-material/Description";
import TimerIcon       from "@mui/icons-material/Timer";
import GradeIcon       from "@mui/icons-material/Grade";
import CategoryIcon    from "@mui/icons-material/Category";
import ImageIcon       from "@mui/icons-material/Image";
import LinkIcon        from "@mui/icons-material/Link";
import EventIcon       from "@mui/icons-material/Event";
import EditIcon        from "@mui/icons-material/Edit";

/* ═════════════════════════════════════════════
   HELPER — local datetime string for input
═════════════════════════════════════════════ */

const toLocalDatetimeStr = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d) || d.getFullYear() < 2000) return "";
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

/* ═════════════════════════════════════════════
   MAIN — Edit Quiz
═════════════════════════════════════════════ */

const EditQuiz = () => {

  const { id }    = useParams();
  const navigate  = useNavigate();

  const [quiz, setQuiz] = useState({
    title           : "",
    description     : "",
    durationMinutes : "",
    totalMarks      : "",
    categoryId      : "",
    imageUrl        : "",
    startDate       : "",
    endDate         : "",
  });

  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [preview,    setPreview]    = useState("");

  /* ── fetch categories ── */

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axiosClient.get("/category");
      if (res.data.success) setCategories(res.data.data);
    } catch {
      toast.error("Failed to load categories.");
    }
  }, []);

  /* ── fetch quiz ── */

  const fetchQuiz = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/quiz/details/${id}`);
      if (res.data.success) {
        const d = res.data.data;
        setQuiz({
          title           : d.title           || "",
          description     : d.description     || "",
          durationMinutes : d.durationMinutes  || "",
          totalMarks      : d.totalMarks       || "",
          categoryId      : d.categoryId       || "",
          imageUrl        : d.imageUrl         || "",
          // ✅ Pre-fill StartDate/EndDate
          startDate       : toLocalDatetimeStr(d.startDate),
          endDate         : toLocalDatetimeStr(d.endDate),
        });
        // ✅ Pre-fill image preview
        if (d.imageUrl) setPreview(d.imageUrl);
      }
    } catch {
      toast.error("Failed to load quiz.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCategories();
    fetchQuiz();
  }, [fetchCategories, fetchQuiz]);

  /* ── handlers ── */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuiz(prev => ({ ...prev, [name]: value }));
    // ✅ Live image preview on URL change
    if (name === "imageUrl") setPreview(value);
  };

  /* ── validate ── */

  const validate = () => {
    if (!quiz.title.trim())        return "Quiz title is required";
    if (!quiz.durationMinutes)     return "Duration is required";
    if (quiz.durationMinutes < 1)  return "Duration must be at least 1 minute";
    if (!quiz.totalMarks)          return "Total marks is required";
    if (quiz.totalMarks < 1)       return "Total marks must be at least 1";
    if (!quiz.categoryId)          return "Please select a category";
    if (quiz.startDate && quiz.endDate &&
        new Date(quiz.endDate) <= new Date(quiz.startDate))
                                   return "End date must be after start date";
    return null;
  };

  /* ── submit ── */

  const updateQuiz = async (e) => {
    e.preventDefault();

    const err = validate();
    if (err) return toast.error(err);

    setSaving(true);
    try {
      await axiosClient.put("/quiz/update", {
        id              : parseInt(id),
        title           : quiz.title,
        description     : quiz.description,
        durationMinutes : parseInt(quiz.durationMinutes),
        totalMarks      : parseInt(quiz.totalMarks),
        categoryId      : parseInt(quiz.categoryId),
        imageUrl        : quiz.imageUrl || "",
        // ✅ Send StartDate/EndDate
        startDate       : quiz.startDate ? new Date(quiz.startDate).toISOString() : null,
        endDate         : quiz.endDate   ? new Date(quiz.endDate).toISOString()   : null,
      });

      toast.success("Quiz updated successfully!");
      navigate("/teacher/quizzes");
    } catch {
      toast.error("Failed to update quiz. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* ── loading skeleton ── */

  if (loading) {
    return (
      <div className="eq-wrap">
        <div className="eq-card">
          <div className="eq-skeleton eq-sk-title" />
          <div className="eq-skeleton eq-sk-field" />
          <div className="eq-skeleton eq-sk-field" />
          <div className="eq-skeleton eq-sk-field" />
          <div className="eq-skeleton eq-sk-btn"   />
        </div>
      </div>
    );
  }

  /* ── render ── */

  return (
    <div className="eq-wrap">
      <div className="eq-card">

        {/* HEADER */}
        <div className="eq-header">
          <h2 className="eq-title">
            <EditIcon sx={{ fontSize: 20, verticalAlign: "middle", marginRight: "8px" }} />
            Edit Quiz
          </h2>
          <p className="eq-subtitle">Update quiz details, schedule and image</p>
        </div>

        <form className="eq-form" onSubmit={updateQuiz}>

          {/* Title */}
          <div className="eq-field">
            <label className="eq-label">
              <TitleIcon sx={{ fontSize: 15 }} />
              Quiz Title <span className="eq-req">*</span>
            </label>
            <input
              className="eq-input"
              name="title"
              placeholder="e.g. JavaScript Fundamentals"
              value={quiz.title}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div className="eq-field">
            <label className="eq-label">
              <DescriptionIcon sx={{ fontSize: 15 }} />
              Description
            </label>
            <textarea
              className="eq-input eq-textarea"
              name="description"
              rows={3}
              placeholder="What is this quiz about?"
              value={quiz.description}
              onChange={handleChange}
            />
          </div>

          {/* Duration + Marks */}
          <div className="eq-row">
            <div className="eq-field">
              <label className="eq-label">
                <TimerIcon sx={{ fontSize: 15 }} />
                Duration (minutes) <span className="eq-req">*</span>
              </label>
              <input
                className="eq-input"
                name="durationMinutes"
                type="number"
                min={1}
                placeholder="e.g. 30"
                value={quiz.durationMinutes}
                onChange={handleChange}
              />
            </div>

            <div className="eq-field">
              <label className="eq-label">
                <GradeIcon sx={{ fontSize: 15 }} />
                Total Marks <span className="eq-req">*</span>
              </label>
              <input
                className="eq-input"
                name="totalMarks"
                type="number"
                min={1}
                placeholder="e.g. 100"
                value={quiz.totalMarks}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Category — ✅ Pre-filled */}
          <div className="eq-field">
            <label className="eq-label">
              <CategoryIcon sx={{ fontSize: 15 }} />
              Category <span className="eq-req">*</span>
            </label>
            <select
              className="eq-input eq-select"
              name="categoryId"
              value={quiz.categoryId}
              onChange={handleChange}
            >
              <option value="">-- Select Category --</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* ✅ Schedule — StartDate + EndDate */}
          <div className="eq-schedule-wrap">

            <div className="eq-schedule-banner">
              <EventIcon sx={{ fontSize: 16 }} />
              <span>Quiz Schedule — Students can only attempt within this window</span>
            </div>

            <div className="eq-row">
              <div className="eq-field">
                <label className="eq-label">
                  <EventIcon sx={{ fontSize: 15 }} />
                  Start Date &amp; Time
                </label>
                <input
                  className="eq-input"
                  type="datetime-local"
                  name="startDate"
                  value={quiz.startDate}
                  onChange={handleChange}
                />
              </div>

              <div className="eq-field">
                <label className="eq-label">
                  <EventIcon sx={{ fontSize: 15 }} />
                  End Date &amp; Time
                </label>
                <input
                  className="eq-input"
                  type="datetime-local"
                  name="endDate"
                  value={quiz.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>

          </div>

          {/* Image URL — ✅ Pre-filled */}
          <div className="eq-field">
            <label className="eq-label">
              <LinkIcon sx={{ fontSize: 15 }} />
              Image URL
            </label>
            <input
              className="eq-input"
              name="imageUrl"
              placeholder="https://example.com/image.png"
              value={quiz.imageUrl}
              onChange={handleChange}
            />
          </div>

          {/* ✅ Image Preview — pre-filled + live update */}
          {preview && (
            <div className="eq-preview">
              <span className="eq-preview-label">
                <ImageIcon sx={{ fontSize: 14 }} /> Preview
              </span>
              <img
                src={preview}
                alt="Quiz"
                className="eq-preview-img"
                onError={e => { e.target.style.display = "none"; }}
              />
            </div>
          )}

          {/* Buttons */}
          <div className="eq-btns">
            <button
              type="button"
              className="eq-btn-cancel"
              onClick={() => navigate("/teacher/quizzes")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="eq-btn-save"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes →"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default EditQuiz;