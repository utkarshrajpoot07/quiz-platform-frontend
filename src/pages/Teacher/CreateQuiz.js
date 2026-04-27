import React, { useEffect, useState, useContext, useCallback } from "react";
import "./CreateQuiz.css";
import axiosClient          from "../../api/axiosClient";
import { useNavigate }      from "react-router-dom";
import { AuthContext }      from "../../context/AuthContext";
import { toast }            from "react-hot-toast";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AutoAwesomeIcon      from "@mui/icons-material/AutoAwesome";
import ImageIcon            from "@mui/icons-material/Image";
import LinkIcon             from "@mui/icons-material/Link";
import TimerIcon            from "@mui/icons-material/Timer";
import GradeIcon            from "@mui/icons-material/Grade";
import CategoryIcon         from "@mui/icons-material/Category";
import TitleIcon            from "@mui/icons-material/Title";
import DescriptionIcon      from "@mui/icons-material/Description";
import DeleteOutlineIcon    from "@mui/icons-material/DeleteOutline";
import EditIcon             from "@mui/icons-material/Edit";
import CheckIcon            from "@mui/icons-material/Check";
import EventIcon            from "@mui/icons-material/Event";

/* ═════════════════════════════════════════════
   CONSTANTS
═════════════════════════════════════════════ */

const TABS = {
  MANUAL : "manual",
  AI     : "ai",
};

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

/* ═════════════════════════════════════════════
   HELPER — local datetime string for input
═════════════════════════════════════════════ */

const toLocalDatetimeStr = (date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

/* ═════════════════════════════════════════════
   SUB-COMPONENT — AI Question Preview Card
═════════════════════════════════════════════ */

const AIQuestionCard = ({ question, index, onEdit, onDelete }) => {

  const [editing,     setEditing]     = useState(false);
  const [editingText, setEditingText] = useState(question.text);
  const [editingOpts, setEditingOpts] = useState(
    question.options.map(o => o.optionText)
  );
  const [correctIdx,  setCorrectIdx]  = useState(
    question.options.findIndex(o => o.isCorrect)
  );

  const saveEdit = () => {
    const updated = {
      ...question,
      text    : editingText,
      options : editingOpts.map((opt, i) => ({
        optionText : opt,
        isCorrect  : i === correctIdx,
      })),
    };
    onEdit(index, updated);
    setEditing(false);
  };

  /* ── View mode ── */
  if (!editing) {
    return (
      <div className="cq-ai-qcard">

        <div className="cq-ai-qcard-header">
          <span className="cq-ai-qnum">Q{index + 1}</span>
          <p className="cq-ai-qtext">{question.text}</p>
          <div className="cq-ai-qactions">
            <button
              className="cq-ai-qbtn-edit"
              onClick={() => setEditing(true)}
              title="Edit"
            >
              <EditIcon sx={{ fontSize: 15 }} />
            </button>
            <button
              className="cq-ai-qbtn-del"
              onClick={() => onDelete(index)}
              title="Delete"
            >
              <DeleteOutlineIcon sx={{ fontSize: 15 }} />
            </button>
          </div>
        </div>

        <ul className="cq-ai-opts">
          {question.options.map((opt, i) => (
            <li
              key={i}
              className={`cq-ai-opt ${opt.isCorrect ? "cq-ai-opt-correct" : ""}`}
            >
              {opt.isCorrect && <CheckIcon sx={{ fontSize: 13 }} />}
              {opt.optionText}
            </li>
          ))}
        </ul>

      </div>
    );
  }

  /* ── Edit mode ── */
  return (
    <div className="cq-ai-qcard cq-ai-qcard-editing">

      <p className="cq-ai-edit-label">Editing Q{index + 1}</p>

      <textarea
        className="cq-input cq-textarea"
        value={editingText}
        rows={2}
        onChange={e => setEditingText(e.target.value)}
      />

      <div className="cq-ai-edit-opts">
        {editingOpts.map((opt, i) => (
          <div key={i} className="cq-ai-edit-opt-row">
            <label
              className={`cq-ai-radio-label ${correctIdx === i ? "selected" : ""}`}
              title="Mark as correct"
            >
              <input
                type="radio"
                checked={correctIdx === i}
                onChange={() => setCorrectIdx(i)}
              />
              ✓
            </label>
            <input
              className="cq-input"
              value={opt}
              placeholder={`Option ${i + 1}`}
              onChange={e => {
                const copy = [...editingOpts];
                copy[i]    = e.target.value;
                setEditingOpts(copy);
              }}
            />
          </div>
        ))}
      </div>

      <div className="cq-ai-edit-btns">
        <button className="cq-ai-save-btn"   onClick={saveEdit}>Save</button>
        <button className="cq-ai-cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
      </div>

    </div>
  );
};

/* ═════════════════════════════════════════════
   MAIN — Create New Quiz
═════════════════════════════════════════════ */

const CreateQuiz = () => {

  const navigate  = useNavigate();
  const { user }  = useContext(AuthContext);
  const teacherId = user?.UserId;

  /* ── Shared ── */
  const [activeTab,  setActiveTab]  = useState(TABS.MANUAL);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [uploading,  setUploading]  = useState(false);

  /* ════════════════════════════════════════════
     MANUAL FORM STATE
  ════════════════════════════════════════════ */

  const [quiz, setQuiz] = useState({
    title           : "",
    description     : "",
    durationMinutes : "",
    totalMarks      : "",
    categoryId      : "",
    imageUrl        : "",
    // ✅ PRODUCTION — Schedule
    startDate       : toLocalDatetimeStr(new Date()),
    endDate         : toLocalDatetimeStr(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
  });

  const [manualPreview, setManualPreview] = useState("");

  /* ════════════════════════════════════════════
     AI FORM STATE
  ════════════════════════════════════════════ */

  const [aiForm, setAiForm] = useState({
    topic      : "",
    difficulty : "Medium",
    count      : 5,
  });

  /* AI-generated quiz details — all editable by teacher */
  const [aiQuiz, setAiQuiz] = useState({
    title           : "",
    description     : "",
    durationMinutes : "",
    totalMarks      : "",
    categoryId      : "",
    imageUrl        : "",
    // ✅ PRODUCTION — Schedule
    startDate       : toLocalDatetimeStr(new Date()),
    endDate         : toLocalDatetimeStr(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
  });

  const [aiPreview,    setAiPreview]    = useState("");
  const [aiUploading,  setAiUploading]  = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiQuestions,  setAiQuestions]  = useState([]);
  const [aiGenerated,  setAiGenerated]  = useState(false);
  const [aiSaving,     setAiSaving]     = useState(false);

  /* ════════════════════════════════════════════
     FETCH CATEGORIES
  ════════════════════════════════════════════ */

const fetchCategories = useCallback(async () => {
    try {
      const res = await axiosClient.get("/category");
      if (res.data.success) setCategories(res.data.data);
    } catch {
      toast.error("Failed to load categories.");
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  /* ════════════════════════════════════════════
     SHARED — Image upload handler
  ════════════════════════════════════════════ */

  const uploadImage = async (file, isAi = false) => {
    if (!file) return;

    isAi ? setAiUploading(true) : setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res     = await axiosClient.post("/quiz/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url     = res.data.imageUrl;
      const fullUrl = url.startsWith("http") ? url : `http://localhost:5273${url}`;

      if (isAi) {
        setAiQuiz(prev => ({ ...prev, imageUrl: url }));
        setAiPreview(fullUrl);
      } else {
        setQuiz(prev => ({ ...prev, imageUrl: url }));
        setManualPreview(fullUrl);
      }
    } catch {
      toast.error("Image upload failed. Try using a URL instead.");
    } finally {
      isAi ? setAiUploading(false) : setUploading(false);
    }
  };

  const handleImageUrl = (e, isAi = false) => {
    const url = e.target.value;
    if (isAi) {
      setAiQuiz(prev => ({ ...prev, imageUrl: url }));
      setAiPreview(url);
    } else {
      setQuiz(prev => ({ ...prev, imageUrl: url }));
      setManualPreview(url);
    }
  };

  /* ════════════════════════════════════════════
     SHARED — Validate quiz detail fields
  ════════════════════════════════════════════ */

  const validateQuizFields = (data) => {
    if (!data.title.trim())       return "Quiz title is required";
    if (!data.durationMinutes)    return "Duration is required";
    if (data.durationMinutes < 1) return "Duration must be at least 1 minute";
    if (!data.totalMarks)         return "Total marks is required";
    if (data.totalMarks < 1)      return "Total marks must be at least 1";
    if (!data.categoryId)         return "Please select a category";
    if (!data.startDate)          return "Start date is required";
    if (!data.endDate)            return "End date is required";
    if (new Date(data.endDate) <= new Date(data.startDate))
                                  return "End date must be after start date";
    return null;
  };

  /* ════════════════════════════════════════════
     MANUAL TAB — handlers
  ════════════════════════════════════════════ */

  const handleChange = (e) => {
    setQuiz(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();

    const err = validateQuizFields(quiz);
    if (err) return toast.error(err);

    setLoading(true);
    try {
      const res = await axiosClient.post("/quiz/create", {
        title           : quiz.title,
        description     : quiz.description,
        durationMinutes : parseInt(quiz.durationMinutes),
        totalMarks      : parseInt(quiz.totalMarks),
        categoryId      : parseInt(quiz.categoryId),
        teacherId       : teacherId,
        imageUrl        : quiz.imageUrl,
        // ✅ PRODUCTION — Schedule
        startDate       : new Date(quiz.startDate).toISOString(),
        endDate         : new Date(quiz.endDate).toISOString(),
      });

      const quizId = res.data.data;
      toast.success("Quiz created! Add questions now.");
      navigate(`/teacher/add-questions/${quizId}`);
    } catch {
      toast.error("Failed to create quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ════════════════════════════════════════════
     AI TAB — handlers
  ════════════════════════════════════════════ */

  const handleAiFormChange = (e) => {
    setAiForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAiQuizChange = (e) => {
    setAiQuiz(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* Step 1 — Generate via AI */
  const handleAiGenerate = async () => {
    if (!aiForm.topic.trim()) return toast.error("Please enter a topic.");
    if (aiForm.count < 1)     return toast.error("At least 1 question required.");

    setAiGenerating(true);
    setAiGenerated(false);
    setAiQuestions([]);

    try {
      const res  = await axiosClient.post("/AIQuiz/generate", {
        topic      : aiForm.topic,
        difficulty : aiForm.difficulty,
        count      : parseInt(aiForm.count),
      });

      const data = res.data.data;

      setAiQuiz(prev => ({
        ...prev,
        title           : data.title,
        description     : data.description,
        durationMinutes : data.questions.length * 2,
        totalMarks      : data.questions.length,
      }));

      setAiQuestions(data.questions);
      setAiGenerated(true);
      toast.success(`✨ Generated ${data.questions.length} questions!`);
    } catch {
      toast.error("AI generation failed. Please try again.");
    } finally {
      setAiGenerating(false);
    }
  };

  /* Edit a generated question */
  const handleEditQuestion = (index, updatedQ) => {
    setAiQuestions(prev => {
      const copy  = [...prev];
      copy[index] = updatedQ;
      return copy;
    });
  };

  /* Delete a generated question */
  const handleDeleteQuestion = (index) => {
    setAiQuestions(prev => prev.filter((_, i) => i !== index));
    toast.success("Question removed.");
  };

  /* Step 2 — Save AI quiz + all questions */
  const handleAiSave = async () => {
    const err = validateQuizFields(aiQuiz);
    if (err) return toast.error(err);

    if (aiQuestions.length === 0) return toast.error("No questions to save.");

    setAiSaving(true);
    try {
      const quizRes = await axiosClient.post("/quiz/create", {
        title           : aiQuiz.title,
        description     : aiQuiz.description,
        durationMinutes : parseInt(aiQuiz.durationMinutes),
        totalMarks      : parseInt(aiQuiz.totalMarks),
        categoryId      : parseInt(aiQuiz.categoryId),
        teacherId       : teacherId,
        imageUrl        : aiQuiz.imageUrl,
        // ✅ PRODUCTION — Schedule
        startDate       : new Date(aiQuiz.startDate).toISOString(),
        endDate         : new Date(aiQuiz.endDate).toISOString(),
      });

      const quizId = quizRes.data.data;

      await Promise.all(
        aiQuestions.map(q =>
          axiosClient.post("/Question/add", {
            quizId  : quizId,
            text    : q.text,
            marks   : 1,
            options : q.options,
          })
        )
      );

      toast.success("🎉 AI Quiz saved successfully!");
      navigate(`/teacher/add-questions/${quizId}`);
    } catch {
      toast.error("Failed to save quiz. Please try again.");
    } finally {
      setAiSaving(false);
    }
  };

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */

  return (
    <div className="cq-wrap">
      <div className="cq-card">

        {/* ── HEADER ── */}
        <div className="cq-card-header">
          <h2 className="cq-title">
            <AddCircleOutlineIcon sx={{ fontSize: 22, verticalAlign: "middle", marginRight: "8px" }} />
            Create New Quiz
          </h2>
          <p className="cq-subtitle">
            Fill in details manually or let AI generate a quiz for you
          </p>
        </div>

        {/* ── TAB SWITCHER ── */}
        <div className="cq-tabs">
          <button
            className={`cq-tab ${activeTab === TABS.MANUAL ? "cq-tab-active" : ""}`}
            onClick={() => setActiveTab(TABS.MANUAL)}
          >
            <AddCircleOutlineIcon sx={{ fontSize: 16 }} />
            Manual
          </button>
          <button
            className={`cq-tab ${activeTab === TABS.AI ? "cq-tab-active cq-tab-ai-active" : ""}`}
            onClick={() => setActiveTab(TABS.AI)}
          >
            <AutoAwesomeIcon sx={{ fontSize: 16 }} />
            AI Generate
          </button>
        </div>

        {/* ════════════════════════════════════════
            MANUAL TAB
        ════════════════════════════════════════ */}

        {activeTab === TABS.MANUAL && (
          <form className="cq-form" onSubmit={handleManualSubmit}>

            <div className="cq-field">
              <label className="cq-label">
                <TitleIcon sx={{ fontSize: 15 }} />
                Quiz Title <span className="cq-req">*</span>
              </label>
              <input
                className="cq-input"
                name="title"
                placeholder="e.g. JavaScript Fundamentals"
                value={quiz.title}
                onChange={handleChange}
              />
            </div>

            <div className="cq-field">
              <label className="cq-label">
                <DescriptionIcon sx={{ fontSize: 15 }} />
                Description
              </label>
              <textarea
                className="cq-input cq-textarea"
                name="description"
                rows={3}
                placeholder="What is this quiz about?"
                value={quiz.description}
                onChange={handleChange}
              />
            </div>

            <div className="cq-row">
              <div className="cq-field">
                <label className="cq-label">
                  <TimerIcon sx={{ fontSize: 15 }} />
                  Duration (minutes) <span className="cq-req">*</span>
                </label>
                <input
                  className="cq-input"
                  name="durationMinutes"
                  type="number"
                  min={1}
                  placeholder="e.g. 30"
                  value={quiz.durationMinutes}
                  onChange={handleChange}
                />
              </div>

              <div className="cq-field">
                <label className="cq-label">
                  <GradeIcon sx={{ fontSize: 15 }} />
                  Total Marks <span className="cq-req">*</span>
                </label>
                <input
                  className="cq-input"
                  name="totalMarks"
                  type="number"
                  min={1}
                  placeholder="e.g. 100"
                  value={quiz.totalMarks}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="cq-field">
              <label className="cq-label">
                <CategoryIcon sx={{ fontSize: 15 }} />
                Category <span className="cq-req">*</span>
              </label>
              <select
                className="cq-input cq-select"
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

            {/* ✅ PRODUCTION — Schedule */}
            <div className="cq-schedule-wrap">

              <div className="cq-schedule-banner">
                <EventIcon sx={{ fontSize: 16 }} />
                <span>Quiz Schedule — Students can only attempt within this window</span>
              </div>

              <div className="cq-row">

                <div className="cq-field">
                  <label className="cq-label">
                    <EventIcon sx={{ fontSize: 15 }} />
                    Start Date &amp; Time <span className="cq-req">*</span>
                  </label>
                  <input
                    className="cq-input"
                    type="datetime-local"
                    name="startDate"
                    value={quiz.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="cq-field">
                  <label className="cq-label">
                    <EventIcon sx={{ fontSize: 15 }} />
                    End Date &amp; Time <span className="cq-req">*</span>
                  </label>
                  <input
                    className="cq-input"
                    type="datetime-local"
                    name="endDate"
                    value={quiz.endDate}
                    onChange={handleChange}
                  />
                </div>

              </div>

            </div>

            <div className="cq-field">
              <label className="cq-label">
                <ImageIcon sx={{ fontSize: 15 }} />
                Upload Quiz Image
              </label>
              <div className="cq-file-wrap">
                <label className="cq-file-label">
                  {uploading ? "Uploading..." : "Choose File"}
                  <input
                    type="file"
                    accept="image/*"
                    className="cq-file-input"
                    disabled={uploading}
                    onChange={e => uploadImage(e.target.files[0], false)}
                  />
                </label>
                {quiz.imageUrl && (
                  <span className="cq-file-name">Image selected ✓</span>
                )}
              </div>
            </div>

            <div className="cq-field">
              <label className="cq-label">
                <LinkIcon sx={{ fontSize: 15 }} />
                Or Paste Image URL
              </label>
              <input
                className="cq-input"
                name="imageUrl"
                placeholder="https://example.com/image.png"
                value={quiz.imageUrl}
                onChange={e => handleImageUrl(e, false)}
              />
            </div>

            {manualPreview && (
              <div className="cq-preview">
                <span className="cq-preview-label">Preview</span>
                <img
                  src={manualPreview}
                  alt="Quiz preview"
                  className="cq-preview-img"
                  onError={e => { e.target.style.display = "none"; }}
                />
              </div>
            )}

            <button
              type="submit"
              className="cq-submit-btn"
              disabled={loading || uploading}
            >
              {loading ? "Creating..." : "Create Quiz & Add Questions →"}
            </button>

          </form>
        )}

        {/* ════════════════════════════════════════
            AI GENERATE TAB
        ════════════════════════════════════════ */}

        {activeTab === TABS.AI && (
          <div className="cq-form">

            {/* ── AI Banner ── */}
            <div className="cq-ai-banner">
              <AutoAwesomeIcon sx={{ fontSize: 18 }} />
              <span>
                Enter a topic — AI will generate quiz title, description and all
                questions. Review and edit everything before saving.
              </span>
            </div>

            {/* ── Topic ── */}
            <div className="cq-field">
              <label className="cq-label">
                <AutoAwesomeIcon sx={{ fontSize: 15 }} />
                Topic <span className="cq-req">*</span>
              </label>
              <input
                className="cq-input"
                name="topic"
                placeholder="e.g. Python Data Types, SQL Joins, React Hooks"
                value={aiForm.topic}
                onChange={handleAiFormChange}
              />
            </div>

            {/* ── Difficulty + Count ── */}
            <div className="cq-row">
              <div className="cq-field">
                <label className="cq-label">
                  Difficulty <span className="cq-req">*</span>
                </label>
                <select
                  className="cq-input cq-select"
                  name="difficulty"
                  value={aiForm.difficulty}
                  onChange={handleAiFormChange}
                >
                  {DIFFICULTIES.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="cq-field">
                <label className="cq-label">
                  No. of Questions <span className="cq-req">*</span>
                </label>
                <input
                  className="cq-input"
                  name="count"
                  type="number"
                  min={1}
                  placeholder="e.g. 10"
                  value={aiForm.count}
                  onChange={handleAiFormChange}
                />
              </div>
            </div>

            {/* ── Generate Button ── */}
            <button
              className="cq-ai-generate-btn"
              onClick={handleAiGenerate}
              disabled={aiGenerating}
            >
              {aiGenerating
                ? <><span className="cq-ai-spinner" /> Generating with AI...</>
                : <><AutoAwesomeIcon sx={{ fontSize: 17 }} /> Generate Quiz with AI</>
              }
            </button>

            {/* ════════════════════════════════════════
                AI RESULT
            ════════════════════════════════════════ */}

            {aiGenerated && (
              <div className="cq-ai-result">

                <div className="cq-ai-result-divider">
                  <span>✨ AI Generated — Review & Edit Before Saving</span>
                </div>

                <div className="cq-field">
                  <label className="cq-label">
                    <TitleIcon sx={{ fontSize: 15 }} />
                    Quiz Title <span className="cq-req">*</span>
                  </label>
                  <input
                    className="cq-input"
                    name="title"
                    placeholder="e.g. JavaScript Fundamentals"
                    value={aiQuiz.title}
                    onChange={handleAiQuizChange}
                  />
                </div>

                <div className="cq-field">
                  <label className="cq-label">
                    <DescriptionIcon sx={{ fontSize: 15 }} />
                    Description
                  </label>
                  <textarea
                    className="cq-input cq-textarea"
                    name="description"
                    rows={3}
                    placeholder="What is this quiz about?"
                    value={aiQuiz.description}
                    onChange={handleAiQuizChange}
                  />
                </div>

                <div className="cq-row">
                  <div className="cq-field">
                    <label className="cq-label">
                      <TimerIcon sx={{ fontSize: 15 }} />
                      Duration (minutes) <span className="cq-req">*</span>
                    </label>
                    <input
                      className="cq-input"
                      name="durationMinutes"
                      type="number"
                      min={1}
                      placeholder="e.g. 30"
                      value={aiQuiz.durationMinutes}
                      onChange={handleAiQuizChange}
                    />
                  </div>

                  <div className="cq-field">
                    <label className="cq-label">
                      <GradeIcon sx={{ fontSize: 15 }} />
                      Total Marks <span className="cq-req">*</span>
                    </label>
                    <input
                      className="cq-input"
                      name="totalMarks"
                      type="number"
                      min={1}
                      placeholder="e.g. 10"
                      value={aiQuiz.totalMarks}
                      onChange={handleAiQuizChange}
                    />
                  </div>
                </div>

                <div className="cq-field">
                  <label className="cq-label">
                    <CategoryIcon sx={{ fontSize: 15 }} />
                    Category <span className="cq-req">*</span>
                  </label>
                  <select
                    className="cq-input cq-select"
                    name="categoryId"
                    value={aiQuiz.categoryId}
                    onChange={handleAiQuizChange}
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* ✅ PRODUCTION — Schedule AI Tab */}
                <div className="cq-schedule-wrap">

                  <div className="cq-schedule-banner">
                    <EventIcon sx={{ fontSize: 16 }} />
                    <span>Quiz Schedule — Students can only attempt within this window</span>
                  </div>

                  <div className="cq-row">

                    <div className="cq-field">
                      <label className="cq-label">
                        <EventIcon sx={{ fontSize: 15 }} />
                        Start Date &amp; Time <span className="cq-req">*</span>
                      </label>
                      <input
                        className="cq-input"
                        type="datetime-local"
                        name="startDate"
                        value={aiQuiz.startDate}
                        onChange={handleAiQuizChange}
                      />
                    </div>

                    <div className="cq-field">
                      <label className="cq-label">
                        <EventIcon sx={{ fontSize: 15 }} />
                        End Date &amp; Time <span className="cq-req">*</span>
                      </label>
                      <input
                        className="cq-input"
                        type="datetime-local"
                        name="endDate"
                        value={aiQuiz.endDate}
                        onChange={handleAiQuizChange}
                      />
                    </div>

                  </div>

                </div>

                <div className="cq-field">
                  <label className="cq-label">
                    <ImageIcon sx={{ fontSize: 15 }} />
                    Upload Quiz Image
                  </label>
                  <div className="cq-file-wrap">
                    <label className="cq-file-label">
                      {aiUploading ? "Uploading..." : "Choose File"}
                      <input
                        type="file"
                        accept="image/*"
                        className="cq-file-input"
                        disabled={aiUploading}
                        onChange={e => uploadImage(e.target.files[0], true)}
                      />
                    </label>
                    {aiQuiz.imageUrl && (
                      <span className="cq-file-name">Image selected ✓</span>
                    )}
                  </div>
                </div>

                <div className="cq-field">
                  <label className="cq-label">
                    <LinkIcon sx={{ fontSize: 15 }} />
                    Or Paste Image URL
                  </label>
                  <input
                    className="cq-input"
                    name="imageUrl"
                    placeholder="https://example.com/image.png"
                    value={aiQuiz.imageUrl}
                    onChange={e => handleImageUrl(e, true)}
                  />
                </div>

                {aiPreview && (
                  <div className="cq-preview">
                    <span className="cq-preview-label">Preview</span>
                    <img
                      src={aiPreview}
                      alt="Quiz preview"
                      className="cq-preview-img"
                      onError={e => { e.target.style.display = "none"; }}
                    />
                  </div>
                )}

                <div className="cq-ai-questions-header">
                  <span className="cq-ai-questions-title">
                    Generated Questions ({aiQuestions.length})
                  </span>
                  <span className="cq-ai-questions-hint">
                    Edit ✏️ or delete 🗑️ any question before saving
                  </span>
                </div>

                <div className="cq-ai-questions">
                  {aiQuestions.map((q, i) => (
                    <AIQuestionCard
                      key={i}
                      question={q}
                      index={i}
                      onEdit={handleEditQuestion}
                      onDelete={handleDeleteQuestion}
                    />
                  ))}
                </div>

                <button
                  className="cq-submit-btn"
                  onClick={handleAiSave}
                  disabled={aiSaving || aiUploading}
                >
                  {aiSaving
                    ? "Saving Quiz..."
                    : `Save AI Quiz & ${aiQuestions.length} Questions →`
                  }
                </button>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default CreateQuiz;