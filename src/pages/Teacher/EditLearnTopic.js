import React, { useState, useEffect, useCallback } from "react";
import "./ManageLearn.css";
import "./ViewLearnTopic.css";
import axiosClient from "../../api/axiosClient";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import ArrowBackIcon        from "@mui/icons-material/ArrowBack";
import SaveIcon             from "@mui/icons-material/Save";
import PublishIcon          from "@mui/icons-material/Publish";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArticleIcon          from "@mui/icons-material/Article";
import QuizIcon             from "@mui/icons-material/Quiz";
import CheckCircleIcon      from "@mui/icons-material/CheckCircle";
import InfoOutlinedIcon     from "@mui/icons-material/InfoOutlined";
import EditIcon             from "@mui/icons-material/Edit";
import DeleteForeverIcon    from "@mui/icons-material/DeleteForever";
import WarningAmberIcon     from "@mui/icons-material/WarningAmber";
import CloseIcon            from "@mui/icons-material/Close";

/* ════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════ */

const CATEGORIES   = ["Programming", "CS Core", "Web", "Modern"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const LANGUAGES    = ["", "csharp", "python", "javascript", "java", "cpp", "sql", "html", "css"];
const ICONS        = ["🔷","🐍","☕","💻","⚛️","🌐","🤖","📊","🗄️","🖥️","🔗","📱","🎯","🔥","📐"];

/* ════════════════════════════════════════════
   EMPTY FORM DEFAULTS
════════════════════════════════════════════ */

const EMPTY_CONTENT = {
  orderNo     : 1,
  heading     : "",
  body        : "",
  codeSnippet : "",
  language    : "",
};

const EMPTY_QUESTION = {
  questionText  : "",
  optionA       : "",
  optionB       : "",
  optionC       : "",
  optionD       : "",
  correctOption : "A",
  explanation   : "",
};

/* ═════════════════════════════════════════════
   MAIN — Edit Learn Topic
═════════════════════════════════════════════ */

const EditLearnTopic = () => {

  const { id }   = useParams();
  const navigate = useNavigate();

  /* ── page state ── */

  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error,      setError]      = useState(null);
  const [activeTab,  setActiveTab]  = useState("info");

  /* ── data state ── */

  const [questions, setQuestions] = useState([]);
  const [contents,  setContents]  = useState([]);

  const [topicForm, setTopicForm] = useState({
    title       : "",
    icon        : "🔷",
    category    : "CS Core",
    description : "",
    difficulty  : "Beginner",
    isPublished : false,
  });

  /* ── add forms ── */

  const [contentForm,  setContentForm]  = useState(EMPTY_CONTENT);
  const [questionForm, setQuestionForm] = useState(EMPTY_QUESTION);

  /* ── edit state — content ── */

  const [editingContent,    setEditingContent]    = useState(null);
  const [editContentForm,   setEditContentForm]   = useState(EMPTY_CONTENT);
  const [editContentSaving, setEditContentSaving] = useState(false);

  /* ── edit state — question ── */

  const [editingQuestion,    setEditingQuestion]    = useState(null);
  const [editQuestionForm,   setEditQuestionForm]   = useState(EMPTY_QUESTION);
  const [editQuestionSaving, setEditQuestionSaving] = useState(false);

  /* ── delete modal ── */

  const [deleteModal,   setDeleteModal]   = useState({ open: false, type: null, item: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  /* ════════════════════════════════════════════
     FETCH
  ════════════════════════════════════════════ */

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      axiosClient.get(`/Learn/topics/${id}`),
      axiosClient.get(`/Learn/topics/${id}/questions`),
    ])
      .then(([topicRes, qRes]) => {
        const t = topicRes.data.data || topicRes.data;
        
        setTopicForm({
          title       : t.title       || "",
          icon        : t.icon        || "🔷",
          category    : t.category    || "CS Core",
          description : t.description || "",
          difficulty  : t.difficulty  || "Beginner",
          isPublished : t.isPublished || false,
        });
        setContents(t.contents  || t.content || []);
        setQuestions(qRes.data.data || qRes.data || []);
      })
      .catch(() => setError("Failed to load topic. Please try again."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ════════════════════════════════════════════
     SAVE TOPIC INFO
  ════════════════════════════════════════════ */

  const handleSaveInfo = async () => {
    if (!topicForm.title.trim())       return toast.error("Title is required");
    if (!topicForm.description.trim()) return toast.error("Description is required");

    setSaving(true);
    try {
      await axiosClient.put(`/Learn/teacher/${id}`, topicForm);
      toast.success("Topic info saved!");
    } catch {
      toast.error("Failed to save topic info.");
    }
    setSaving(false);
  };

  /* ════════════════════════════════════════════
     ADD CONTENT
  ════════════════════════════════════════════ */

  const handleAddContent = async () => {
    if (!contentForm.heading.trim()) return toast.error("Heading is required");
    if (!contentForm.body.trim())    return toast.error("Body is required");

    setSaving(true);
    try {
      const res = await axiosClient.post("/Learn/teacher/content", {
        ...contentForm,
        topicId: parseInt(id),
      });
      if (res.data.success || res.status === 200) {
        setContents(prev => [...prev, { ...contentForm, id: res.data.data }]);
        toast.success("Section added!");
        setContentForm(prev => ({ ...EMPTY_CONTENT, orderNo: prev.orderNo + 1 }));
      }
    } catch {
      toast.error("Failed to add section.");
    }
    setSaving(false);
  };

  /* ════════════════════════════════════════════
     EDIT CONTENT
  ════════════════════════════════════════════ */

  const handleEditContentClick = (content) => {
    setEditingContent(content);
    setEditContentForm({
      orderNo     : content.orderNo     || 1,
      heading     : content.heading     || "",
      body        : content.body        || "",
      codeSnippet : content.codeSnippet || "",
      language    : content.language    || "",
    });
  };

  const handleEditContentSave = async () => {
    if (!editContentForm.heading.trim()) return toast.error("Heading is required");
    if (!editContentForm.body.trim())    return toast.error("Body is required");

    setEditContentSaving(true);
    try {
      await axiosClient.put(`/Learn/teacher/content/${editingContent.id}`, editContentForm);
      setContents(prev =>
        prev.map(c => c.id === editingContent.id ? { ...c, ...editContentForm } : c)
      );
      toast.success("Section updated!");
      setEditingContent(null);
    } catch {
      toast.error("Failed to update section.");
    }
    setEditContentSaving(false);
  };

  const handleEditContentCancel = () => {
    if (editContentSaving) return;
    setEditingContent(null);
  };

  /* ════════════════════════════════════════════
     ADD QUESTION
  ════════════════════════════════════════════ */

  const handleAddQuestion = async () => {
    const { questionText, optionA, optionB, optionC, optionD } = questionForm;
    if (!questionText.trim())                                                       return toast.error("Question is required");
    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) return toast.error("All 4 options required");

    setSaving(true);
    try {
      const res = await axiosClient.post("/Learn/teacher/question", {
        ...questionForm,
        topicId: parseInt(id),
      });
      if (res.data.success || res.status === 200) {
        setQuestions(prev => [...prev, { ...questionForm, id: res.data.data }]);
        toast.success(`Question ${questions.length + 1} added!`);
        setQuestionForm(EMPTY_QUESTION);
      }
    } catch {
      toast.error("Failed to add question.");
    }
    setSaving(false);
  };

  /* ════════════════════════════════════════════
     EDIT QUESTION
  ════════════════════════════════════════════ */

  const handleEditQuestionClick = (question) => {
    setEditingQuestion(question);
    setEditQuestionForm({
      questionText  : question.questionText  || "",
      optionA       : question.optionA       || "",
      optionB       : question.optionB       || "",
      optionC       : question.optionC       || "",
      optionD       : question.optionD       || "",
      correctOption : question.correctOption || "A",
      explanation   : question.explanation   || "",
    });
  };

  const handleEditQuestionSave = async () => {
    const { questionText, optionA, optionB, optionC, optionD } = editQuestionForm;
    if (!questionText.trim())                                                       return toast.error("Question is required");
    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) return toast.error("All 4 options required");

    setEditQuestionSaving(true);
    try {
      await axiosClient.put(`/Learn/teacher/question/${editingQuestion.id}`, editQuestionForm);
      setQuestions(prev =>
        prev.map(q => q.id === editingQuestion.id ? { ...q, ...editQuestionForm } : q)
      );
      toast.success("Question updated!");
      setEditingQuestion(null);
    } catch {
      toast.error("Failed to update question.");
    }
    setEditQuestionSaving(false);
  };

  const handleEditQuestionCancel = () => {
    if (editQuestionSaving) return;
    setEditingQuestion(null);
  };

  /* ════════════════════════════════════════════
     DELETE (shared for content + question)
  ════════════════════════════════════════════ */

  const handleDeleteContentClick  = (content)  => setDeleteModal({ open: true, type: "content",  item: content  });
  const handleDeleteQuestionClick = (question) => setDeleteModal({ open: true, type: "question", item: question });

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteModal.item) return;
    setDeleteLoading(true);

    const { type, item } = deleteModal;
    const url = type === "content"
      ? `/Learn/teacher/content/${item.id}`
      : `/Learn/teacher/question/${item.id}`;

    try {
      await axiosClient.delete(url);
      if (type === "content") {
        setContents(prev  => prev.filter(c => c.id !== item.id));
        toast.success("Section deleted!");
      } else {
        setQuestions(prev => prev.filter(q => q.id !== item.id));
        toast.success("Question deleted!");
      }
      setDeleteModal({ open: false, type: null, item: null });
    } catch {
      toast.error(`Failed to delete ${type}.`);
    }
    setDeleteLoading(false);
  }, [deleteModal]);

  const handleDeleteCancel = () => {
    if (deleteLoading) return;
    setDeleteModal({ open: false, type: null, item: null });
  };

  /* ════════════════════════════════════════════
     PUBLISH
  ════════════════════════════════════════════ */

  const handlePublish = async () => {
    if (questions.length < 5)
      return toast.error(`Need at least 5 questions (currently: ${questions.length})`);

    setPublishing(true);
    try {
      await axiosClient.put(`/Learn/teacher/${id}/publish`);
      setTopicForm(p => ({ ...p, isPublished: true }));
      toast.success("Topic published successfully!");
    } catch {
      toast.error("Failed to publish topic.");
    }
    setPublishing(false);
  };

  /* ════════════════════════════════════════════
     LOADING / ERROR
  ════════════════════════════════════════════ */

  if (loading) return (
    <div className="vlt-wrap">
      <div className="vlt-skeleton-header" />
      <div className="vlt-skeleton-card"   />
      <div className="vlt-skeleton-card"   />
    </div>
  );

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

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */

  return (

    <div className="ml-wrap">

      {/* ── PAGE HEADER ── */}

      <div className="ml-page-header">

        <div className="ml-header-left">

          <button
            className="ml-back-btn"
            onClick={() => navigate(`/teacher/learn/${id}`)}
          >
            <ArrowBackIcon fontSize="small" /> View Topic
          </button>

          <div>
            <h2 className="ml-page-title">
              <span style={{ marginRight: 8 }}>{topicForm.icon}</span>
              Edit: {topicForm.title}
            </h2>
            <p className="ml-page-subtitle">
              Modify topic info, content sections, and questions
            </p>
          </div>

        </div>

        {!topicForm.isPublished ? (
          <button
            className="ml-create-btn"
            onClick={handlePublish}
            disabled={publishing}
          >
            <PublishIcon sx={{ fontSize: 16 }} />
            <span>{publishing ? "Publishing..." : "Publish Topic"}</span>
          </button>
        ) : (
          <span className="ml-status-badge ml-published">
            <CheckCircleIcon sx={{ fontSize: 13 }} /> Published
          </span>
        )}

      </div>

      {/* ── TABS ── */}

      <div className="vlt-tabs" style={{ marginBottom: 20 }}>

        <button
          className={`vlt-tab ${activeTab === "info" ? "vlt-tab-active" : ""}`}
          onClick={() => setActiveTab("info")}
        >
          <InfoOutlinedIcon sx={{ fontSize: 16 }} />
          Topic Info
        </button>

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
          <QuizIcon sx={{ fontSize: 16 }} />
          Questions ({questions.length})
        </button>

      </div>

      {/* ══════════════════════════════
          TAB 1 — TOPIC INFO
      ══════════════════════════════ */}

      {activeTab === "info" && (

        <div className="ml-card">

          <div className="ml-card-header">
            <div>
              <h3><InfoOutlinedIcon /> Topic Info</h3>
              <p>Edit the basic details of this topic</p>
            </div>
          </div>

          <div className="ml-field">
            <label>Choose Icon</label>
            <div className="ml-icon-grid">
              {ICONS.map(icon => (
                <button
                  key={icon}
                  className={`ml-icon-btn ${topicForm.icon === icon ? "ml-icon-selected" : ""}`}
                  onClick={() => setTopicForm(p => ({ ...p, icon }))}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="ml-field">
            <label>Topic Title <span className="ml-req">*</span></label>
            <input
              className="ml-input"
              value={topicForm.title}
              onChange={e => setTopicForm(p => ({ ...p, title: e.target.value }))}
            />
          </div>

          <div className="ml-field">
            <label>Description <span className="ml-req">*</span></label>
            <textarea
              className="ml-input ml-textarea"
              rows={3}
              value={topicForm.description}
              onChange={e => setTopicForm(p => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div className="ml-row">

            <div className="ml-field">
              <label>Category</label>
              <select
                className="ml-input ml-select"
                value={topicForm.category}
                onChange={e => setTopicForm(p => ({ ...p, category: e.target.value }))}
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="ml-field">
              <label>Difficulty</label>
              <select
                className="ml-input ml-select"
                value={topicForm.difficulty}
                onChange={e => setTopicForm(p => ({ ...p, difficulty: e.target.value }))}
              >
                {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

          </div>

          <div className="ml-preview">
            <span className="ml-preview-label">Preview Card</span>
            <div className="ml-preview-card">
              <span className="ml-preview-icon">{topicForm.icon}</span>
              <div>
                <div className="ml-preview-title">{topicForm.title || "Topic Title"}</div>
                <div className="ml-preview-desc">{topicForm.description || "Description..."}</div>
                <div className="ml-preview-badges">
                  <span className="ml-badge-cat">{topicForm.category}</span>
                  <span className="ml-badge-diff">{topicForm.difficulty}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            className="ml-create-btn"
            onClick={handleSaveInfo}
            disabled={saving}
          >
            <SaveIcon sx={{ fontSize: 16 }} />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>

        </div>

      )}

      {/* ══════════════════════════════
          TAB 2 — CONTENT
      ══════════════════════════════ */}

      {activeTab === "content" && (

        <div className="ml-card">

          <div className="ml-card-header">
            <div>
              <h3><ArticleIcon /> Content Sections</h3>
              <p>View, edit, delete existing sections or add new ones</p>
            </div>
            <span className="ml-count-badge">{contents.length} sections</span>
          </div>

          {/* Existing sections */}

          {contents.length > 0 && (

            <div className="ml-added-list">

              {contents
                .slice()
                .sort((a, b) => (a.orderNo || 0) - (b.orderNo || 0))
                .map((c, i) => (

                  <div key={c.id || i} className="ml-added-item">

                    <span className="ml-added-num">{c.orderNo || i + 1}</span>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="ml-added-title">{c.heading}</div>
                      <div className="ml-added-sub">
                        {(c.body || "").substring(0, 70)}{c.body?.length > 70 ? "..." : ""}
                      </div>
                    </div>

                    <div className="ml-topic-actions">

                      <button
                        className="ml-icon-action-btn edit"
                        title="Edit section"
                        onClick={() => handleEditContentClick(c)}
                      >
                        <EditIcon sx={{ fontSize: 15 }} />
                      </button>

                      <button
                        className="ml-icon-action-btn delete"
                        title="Delete section"
                        onClick={() => handleDeleteContentClick(c)}
                      >
                        <DeleteForeverIcon sx={{ fontSize: 15 }} />
                      </button>

                    </div>

                  </div>

                ))}

            </div>

          )}

          {/* Add new section */}

          <div className="vlt-add-section-label">➕ Add New Section</div>

          <div className="ml-row">

            <div className="ml-field ml-field-order">
              <label>Order #</label>
              <input
                className="ml-input"
                type="number"
                min={1}
                value={contentForm.orderNo}
                onChange={e => setContentForm(p => ({ ...p, orderNo: parseInt(e.target.value) }))}
              />
            </div>

            <div className="ml-field">
              <label>Heading <span className="ml-req">*</span></label>
              <input
                className="ml-input"
                placeholder="e.g. What is an Array?"
                value={contentForm.heading}
                onChange={e => setContentForm(p => ({ ...p, heading: e.target.value }))}
              />
            </div>

          </div>

          <div className="ml-field">
            <label>Body <span className="ml-req">*</span></label>
            <textarea
              className="ml-input ml-textarea"
              rows={5}
              placeholder="Write learning content here..."
              value={contentForm.body}
              onChange={e => setContentForm(p => ({ ...p, body: e.target.value }))}
            />
          </div>

          <div className="ml-field">
            <label>Code Snippet <span className="ml-optional">(optional)</span></label>
            <textarea
              className="ml-input ml-textarea ml-code-input"
              rows={4}
              placeholder="Add code example..."
              value={contentForm.codeSnippet}
              onChange={e => setContentForm(p => ({ ...p, codeSnippet: e.target.value }))}
            />
          </div>

          {contentForm.codeSnippet && (
            <div className="ml-field">
              <label>Language</label>
              <select
                className="ml-input ml-select"
                value={contentForm.language}
                onChange={e => setContentForm(p => ({ ...p, language: e.target.value }))}
              >
                {LANGUAGES.map(l => (
                  <option key={l} value={l}>{l || "-- select --"}</option>
                ))}
              </select>
            </div>
          )}

          <button
            className="ml-create-btn ml-btn-outline"
            onClick={handleAddContent}
            disabled={saving}
          >
            <AddCircleOutlineIcon sx={{ fontSize: 16 }} />
            <span>{saving ? "Adding..." : "Add Section"}</span>
          </button>

        </div>

      )}

      {/* ══════════════════════════════
          TAB 3 — QUESTIONS
      ══════════════════════════════ */}

      {activeTab === "questions" && (

        <div className="ml-card">

          <div className="ml-card-header">
            <div>
              <h3><QuizIcon /> Questions</h3>
              <p>View, edit, delete existing questions or add new ones (min 5 to publish)</p>
            </div>
            <span className={`ml-count-badge ${questions.length >= 5 ? "ml-count-green" : ""}`}>
              {questions.length} / 5 min
            </span>
          </div>

          {/* Existing questions */}

          {questions.length > 0 && (

            <div className="ml-added-list">

              {questions.map((q, i) => (

                <div key={q.id || i} className="ml-added-item">

                  <span className="ml-added-num">Q{i + 1}</span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ml-added-title">{q.questionText}</div>
                    <div className="ml-added-sub">Correct: Option {q.correctOption}</div>
                  </div>

                  <div className="ml-topic-actions">

                    <button
                      className="ml-icon-action-btn edit"
                      title="Edit question"
                      onClick={() => handleEditQuestionClick(q)}
                    >
                      <EditIcon sx={{ fontSize: 15 }} />
                    </button>

                    <button
                      className="ml-icon-action-btn delete"
                      title="Delete question"
                      onClick={() => handleDeleteQuestionClick(q)}
                    >
                      <DeleteForeverIcon sx={{ fontSize: 15 }} />
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

          {/* Add new question */}

          <div className="vlt-add-section-label">➕ Add New Question</div>

          <div className="ml-field">
            <label>Question <span className="ml-req">*</span></label>
            <textarea
              className="ml-input ml-textarea"
              rows={2}
              placeholder="e.g. What is time complexity of binary search?"
              value={questionForm.questionText}
              onChange={e => setQuestionForm(p => ({ ...p, questionText: e.target.value }))}
            />
          </div>

          <div className="ml-options-grid">
            {["A", "B", "C", "D"].map(opt => (
              <div
                key={opt}
                className={`ml-option-box ${questionForm.correctOption === opt ? "ml-option-correct" : ""}`}
              >
                <div className="ml-option-top">
                  <span className="ml-opt-letter">{opt}</span>
                  <label className="ml-correct-label">
                    <input
                      type="radio"
                      name="correct-add"
                      checked={questionForm.correctOption === opt}
                      onChange={() => setQuestionForm(p => ({ ...p, correctOption: opt }))}
                    />
                    Correct
                  </label>
                </div>
                <input
                  className="ml-input"
                  placeholder={`Option ${opt}`}
                  value={questionForm[`option${opt}`]}
                  onChange={e => setQuestionForm(p => ({ ...p, [`option${opt}`]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          <div className="ml-field">
            <label>Explanation <span className="ml-optional">(shown after quiz)</span></label>
            <input
              className="ml-input"
              placeholder="Why is this the correct answer?"
              value={questionForm.explanation}
              onChange={e => setQuestionForm(p => ({ ...p, explanation: e.target.value }))}
            />
          </div>

          <div className="ml-btn-row">

            <button
              className="ml-create-btn ml-btn-outline"
              onClick={handleAddQuestion}
              disabled={saving}
            >
              <AddCircleOutlineIcon sx={{ fontSize: 16 }} />
              <span>{saving ? "Adding..." : `Add Question ${questions.length + 1}`}</span>
            </button>

            {!topicForm.isPublished && questions.length >= 5 && (
              <button
                className="ml-create-btn"
                onClick={handlePublish}
                disabled={publishing}
              >
                <PublishIcon sx={{ fontSize: 16 }} />
                <span>{publishing ? "Publishing..." : "Publish Now"}</span>
              </button>
            )}

          </div>

        </div>

      )}

      {/* ════════════════════════════════════════════
          EDIT CONTENT MODAL
      ════════════════════════════════════════════ */}

      {editingContent && (

        <div className="ml-modal-overlay" onClick={handleEditContentCancel}>
          <div
            className="ml-modal"
            style={{ maxWidth: 560, textAlign: "left" }}
            onClick={e => e.stopPropagation()}
          >

            <div className="ml-edit-modal-header">
              <h3 className="ml-modal-title" style={{ margin: 0 }}>✏️ Edit Section</h3>
              <button
                className="ml-modal-close-btn"
                onClick={handleEditContentCancel}
                disabled={editContentSaving}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>

              <div className="ml-row">

                <div className="ml-field ml-field-order">
                  <label>Order #</label>
                  <input
                    className="ml-input"
                    type="number"
                    min={1}
                    value={editContentForm.orderNo}
                    onChange={e => setEditContentForm(p => ({ ...p, orderNo: parseInt(e.target.value) }))}
                  />
                </div>

                <div className="ml-field">
                  <label>Heading <span className="ml-req">*</span></label>
                  <input
                    className="ml-input"
                    value={editContentForm.heading}
                    onChange={e => setEditContentForm(p => ({ ...p, heading: e.target.value }))}
                  />
                </div>

              </div>

              <div className="ml-field">
                <label>Body <span className="ml-req">*</span></label>
                <textarea
                  className="ml-input ml-textarea"
                  rows={5}
                  value={editContentForm.body}
                  onChange={e => setEditContentForm(p => ({ ...p, body: e.target.value }))}
                />
              </div>

              <div className="ml-field">
                <label>Code Snippet <span className="ml-optional">(optional)</span></label>
                <textarea
                  className="ml-input ml-textarea ml-code-input"
                  rows={3}
                  value={editContentForm.codeSnippet}
                  onChange={e => setEditContentForm(p => ({ ...p, codeSnippet: e.target.value }))}
                />
              </div>

              {editContentForm.codeSnippet && (
                <div className="ml-field">
                  <label>Language</label>
                  <select
                    className="ml-input ml-select"
                    value={editContentForm.language}
                    onChange={e => setEditContentForm(p => ({ ...p, language: e.target.value }))}
                  >
                    {LANGUAGES.map(l => (
                      <option key={l} value={l}>{l || "-- select --"}</option>
                    ))}
                  </select>
                </div>
              )}

            </div>

            <div className="ml-modal-actions" style={{ marginTop: 20 }}>

              <button
                className="ml-modal-cancel-btn"
                onClick={handleEditContentCancel}
                disabled={editContentSaving}
              >
                Cancel
              </button>

              <button
                className="ml-modal-save-btn"
                onClick={handleEditContentSave}
                disabled={editContentSaving}
              >
                {editContentSaving
                  ? <span className="ml-modal-spinner" />
                  : <SaveIcon sx={{ fontSize: 15 }} />
                }
                {editContentSaving ? "Saving..." : "Save Changes"}
              </button>

            </div>

          </div>
        </div>

      )}

      {/* ════════════════════════════════════════════
          EDIT QUESTION MODAL
      ════════════════════════════════════════════ */}

      {editingQuestion && (

        <div className="ml-modal-overlay" onClick={handleEditQuestionCancel}>
          <div
            className="ml-modal"
            style={{ maxWidth: 600, textAlign: "left" }}
            onClick={e => e.stopPropagation()}
          >

            <div className="ml-edit-modal-header">
              <h3 className="ml-modal-title" style={{ margin: 0 }}>✏️ Edit Question</h3>
              <button
                className="ml-modal-close-btn"
                onClick={handleEditQuestionCancel}
                disabled={editQuestionSaving}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>

              <div className="ml-field">
                <label>Question <span className="ml-req">*</span></label>
                <textarea
                  className="ml-input ml-textarea"
                  rows={2}
                  value={editQuestionForm.questionText}
                  onChange={e => setEditQuestionForm(p => ({ ...p, questionText: e.target.value }))}
                />
              </div>

              <div className="ml-options-grid">
                {["A", "B", "C", "D"].map(opt => (
                  <div
                    key={opt}
                    className={`ml-option-box ${editQuestionForm.correctOption === opt ? "ml-option-correct" : ""}`}
                  >
                    <div className="ml-option-top">
                      <span className="ml-opt-letter">{opt}</span>
                      <label className="ml-correct-label">
                        <input
                          type="radio"
                          name="correct-edit"
                          checked={editQuestionForm.correctOption === opt}
                          onChange={() => setEditQuestionForm(p => ({ ...p, correctOption: opt }))}
                        />
                        Correct
                      </label>
                    </div>
                    <input
                      className="ml-input"
                      placeholder={`Option ${opt}`}
                      value={editQuestionForm[`option${opt}`]}
                      onChange={e => setEditQuestionForm(p => ({ ...p, [`option${opt}`]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>

              <div className="ml-field">
                <label>Explanation <span className="ml-optional">(shown after quiz)</span></label>
                <input
                  className="ml-input"
                  placeholder="Why is this the correct answer?"
                  value={editQuestionForm.explanation}
                  onChange={e => setEditQuestionForm(p => ({ ...p, explanation: e.target.value }))}
                />
              </div>

            </div>

            <div className="ml-modal-actions" style={{ marginTop: 20 }}>

              <button
                className="ml-modal-cancel-btn"
                onClick={handleEditQuestionCancel}
                disabled={editQuestionSaving}
              >
                Cancel
              </button>

              <button
                className="ml-modal-save-btn"
                onClick={handleEditQuestionSave}
                disabled={editQuestionSaving}
              >
                {editQuestionSaving
                  ? <span className="ml-modal-spinner" />
                  : <SaveIcon sx={{ fontSize: 15 }} />
                }
                {editQuestionSaving ? "Saving..." : "Save Changes"}
              </button>

            </div>

          </div>
        </div>

      )}

      {/* ════════════════════════════════════════════
          DELETE CONFIRMATION MODAL (shared)
      ════════════════════════════════════════════ */}

      {deleteModal.open && (

        <div className="ml-modal-overlay" onClick={handleDeleteCancel}>
          <div className="ml-modal" onClick={e => e.stopPropagation()}>

            <div className="ml-modal-icon">
              <WarningAmberIcon sx={{ fontSize: 32, color: "#ef4444" }} />
            </div>

            <h3 className="ml-modal-title">
              Delete {deleteModal.type === "content" ? "Section" : "Question"}?
            </h3>

            <p className="ml-modal-msg">
              You are about to permanently delete{" "}
              <strong>
                "{deleteModal.type === "content"
                  ? deleteModal.item?.heading
                  : deleteModal.item?.questionText}"
              </strong>.
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

export default EditLearnTopic;