import React, { useState } from "react";
import "./ManageLearn.css";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArticleIcon          from "@mui/icons-material/Article";
import QuizIcon             from "@mui/icons-material/Quiz";
import PublishIcon          from "@mui/icons-material/Publish";
import CheckCircleIcon      from "@mui/icons-material/CheckCircle";
import ArrowBackIcon        from "@mui/icons-material/ArrowBack";

/* ════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════ */

const CATEGORIES   = ["Programming", "CS Core", "Web", "Modern"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const LANGUAGES    = ["", "csharp", "python", "javascript", "java", "cpp", "sql", "html", "css"];
const ICONS        = ["🔷","🐍","☕","💻","⚛️","🌐","🤖","📊","🗄️","🖥️","🔗","📱","🎯","🔥","📐"];

/* ════════════════════════════════════════════
   STEP INDICATOR
════════════════════════════════════════════ */

const StepIndicator = ({ currentStep }) => {

  const steps = [
    { num: 1, label: "Create Topic",  icon: <AddCircleOutlineIcon fontSize="small" /> },
    { num: 2, label: "Add Content",   icon: <ArticleIcon          fontSize="small" /> },
    { num: 3, label: "Add Questions", icon: <QuizIcon             fontSize="small" /> },
    { num: 4, label: "Publish",       icon: <PublishIcon          fontSize="small" /> },
  ];

  return (
    <div className="ml-steps">
      {steps.map((step, i) => (
        <React.Fragment key={step.num}>

          <div className={`
            ml-step
            ${currentStep === step.num ? "ml-step-active" : ""}
            ${currentStep  >  step.num ? "ml-step-done"   : ""}
          `}>
            <div className="ml-step-circle">
              {currentStep > step.num
                ? <CheckCircleIcon fontSize="small" />
                : step.icon
              }
            </div>
            <span className="ml-step-label">{step.label}</span>
          </div>

          {i < steps.length - 1 && (
            <div className={`ml-step-line ${currentStep > step.num ? "ml-line-done" : ""}`} />
          )}

        </React.Fragment>
      ))}
    </div>
  );

};

/* ═════════════════════════════════════════════
   MAIN — Create Learn Topic
═════════════════════════════════════════════ */

const CreateLearnTopic = () => {

  const navigate = useNavigate();

  const [step,       setStep]       = useState(1);
  const [topicId,    setTopicId]    = useState(null);
  const [topicTitle, setTopicTitle] = useState("");
  const [loading,    setLoading]    = useState(false);
  const [published,  setPublished]  = useState(false);
  const [toast,      setToast]      = useState(null);

  const [contents,  setContents]  = useState([]);
  const [questions, setQuestions] = useState([]);

  const [topicForm, setTopicForm] = useState({
    title       : "",
    icon        : "🔷",
    category    : "CS Core",
    description : "",
    difficulty  : "Beginner",
  });

  const [contentForm, setContentForm] = useState({
    orderNo     : 1,
    heading     : "",
    body        : "",
    codeSnippet : "",
    language    : "",
  });

  const [questionForm, setQuestionForm] = useState({
    questionText  : "",
    optionA       : "",
    optionB       : "",
    optionC       : "",
    optionD       : "",
    correctOption : "A",
    explanation   : "",
  });

  /* ── toast helper ── */

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  /* ══════════════════════════════
     STEP 1 — CREATE TOPIC
  ══════════════════════════════ */

  const handleCreateTopic = async () => {
    if (!topicForm.title.trim())       return showToast("error", "Title is required");
    if (!topicForm.description.trim()) return showToast("error", "Description is required");

    setLoading(true);

    try {
      const res = await axiosClient.post("/Learn/teacher/create", topicForm);
      if (res.data.success) {
        setTopicId(res.data.data);
        setTopicTitle(topicForm.title);
        showToast("success", `Topic "${topicForm.title}" created!`);
        setStep(2);
      }
    } catch {
      showToast("error", "Failed to create topic.");
    }

    setLoading(false);
  };

  /* ══════════════════════════════
     STEP 2 — ADD CONTENT
  ══════════════════════════════ */

  const handleAddContent = async () => {
    if (!contentForm.heading.trim()) return showToast("error", "Heading is required");
    if (!contentForm.body.trim())    return showToast("error", "Body is required");

    setLoading(true);

    try {
      const res = await axiosClient.post("/Learn/teacher/content", {
        ...contentForm,
        topicId,
      });
      if (res.data.success) {
        setContents(prev => [...prev, { ...contentForm }]);
        showToast("success", `Section ${contents.length + 1} added!`);
        setContentForm(prev => ({
          orderNo     : prev.orderNo + 1,
          heading     : "",
          body        : "",
          codeSnippet : "",
          language    : "",
        }));
      }
    } catch {
      showToast("error", "Failed to add content.");
    }

    setLoading(false);
  };

  /* ══════════════════════════════
     STEP 3 — ADD QUESTION
  ══════════════════════════════ */

  const handleAddQuestion = async () => {
    const { questionText, optionA, optionB, optionC, optionD } = questionForm;

    if (!questionText.trim())                                                       return showToast("error", "Question is required");
    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) return showToast("error", "All 4 options required");

    setLoading(true);

    try {
      const res = await axiosClient.post("/Learn/teacher/question", {
        ...questionForm,
        topicId,
      });
      if (res.data.success) {
        setQuestions(prev => [...prev, { ...questionForm }]);
        showToast("success", `Question ${questions.length + 1} added!`);
        setQuestionForm({
          questionText  : "",
          optionA       : "",
          optionB       : "",
          optionC       : "",
          optionD       : "",
          correctOption : "A",
          explanation   : "",
        });
      }
    } catch {
      showToast("error", "Failed to add question.");
    }

    setLoading(false);
  };

  /* ══════════════════════════════
     STEP 4 — PUBLISH
  ══════════════════════════════ */

  const handlePublish = async () => {
    if (questions.length < 5)
      return showToast("error", `Need 5 questions. Currently: ${questions.length}`);

    setLoading(true);

    try {
      const res = await axiosClient.put(`/Learn/teacher/${topicId}/publish`);
      if (res.data.success) {
        setPublished(true);
        showToast("success", `"${topicTitle}" published successfully!`);
      }
    } catch {
      showToast("error", "Failed to publish.");
    }

    setLoading(false);
  };

  /* ── render ── */

  return (

    <div className="ml-wrap">

      {/* TOAST */}

      {toast && (
        <div className={`ml-toast ml-toast-${toast.type}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.message}
        </div>
      )}

      {/* PAGE HEADER */}

      <div className="ml-page-header">

        <div className="ml-header-left">

          <button
            className="ml-back-btn"
            onClick={() => navigate("/teacher/learn")}
          >
            <ArrowBackIcon fontSize="small" /> Back to Topics
          </button>

          <div>
            <h2 className="ml-page-title">📚 Create New Topic</h2>
            <p className="ml-page-subtitle">Add content and questions step by step</p>
          </div>

        </div>

        {topicId && (
          <div className="ml-topic-chip">
            <span>{topicForm.icon}</span>
            <span>{topicTitle}</span>
            <span className="ml-chip-id">ID: {topicId}</span>
          </div>
        )}

      </div>

      {/* STEP INDICATOR */}

      <StepIndicator currentStep={step} />

      {/* ══════════════════════════════
          STEP 1 — CREATE TOPIC
      ══════════════════════════════ */}

      {step === 1 && (

        <div className="ml-card">

          <div className="ml-card-header">
            <div>
              <h3><AddCircleOutlineIcon /> Step 1 — Create Topic</h3>
              <p>Fill in the basic details</p>
            </div>
          </div>

          {/* Icon picker */}
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

          {/* Title */}
          <div className="ml-field">
            <label>Topic Title <span className="ml-req">*</span></label>
            <input
              className="ml-input"
              placeholder="e.g. Data Structures & Algorithms"
              value={topicForm.title}
              onChange={e => setTopicForm(p => ({ ...p, title: e.target.value }))}
            />
          </div>

          {/* Description */}
          <div className="ml-field">
            <label>Description <span className="ml-req">*</span></label>
            <textarea
              className="ml-input ml-textarea"
              rows={3}
              placeholder="What will students learn?"
              value={topicForm.description}
              onChange={e => setTopicForm(p => ({ ...p, description: e.target.value }))}
            />
          </div>

          {/* Category + Difficulty */}
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

          {/* Preview */}
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
            onClick={handleCreateTopic}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Topic & Continue →"}
          </button>

        </div>

      )}

      {/* ══════════════════════════════
          STEP 2 — ADD CONTENT
      ══════════════════════════════ */}

      {step === 2 && (

        <div className="ml-card">

          <div className="ml-card-header">
            <div>
              <h3><ArticleIcon /> Step 2 — Add Content</h3>
              <p>Add learning material for "{topicTitle}"</p>
            </div>
            <span className="ml-count-badge">{contents.length} added</span>
          </div>

          {/* Added sections */}
          {contents.length > 0 && (
            <div className="ml-added-list">
              {contents.map((c, i) => (
                <div key={i} className="ml-added-item">
                  <span className="ml-added-num">{i + 1}</span>
                  <div>
                    <div className="ml-added-title">{c.heading}</div>
                    <div className="ml-added-sub">{c.body.substring(0, 60)}...</div>
                  </div>
                  <CheckCircleIcon className="ml-added-check" fontSize="small" />
                </div>
              ))}
            </div>
          )}

          {/* Order + Heading row */}
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

          {/* Body */}
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

          {/* Code snippet */}
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

          {/* Language — only show if code added */}
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

          <div className="ml-btn-row">

            <button
              className="ml-create-btn ml-btn-outline"
              onClick={handleAddContent}
              disabled={loading}
            >
              {loading ? "Adding..." : "+ Add Section"}
            </button>

            {contents.length > 0 && (
              <button
                className="ml-create-btn"
                onClick={() => setStep(3)}
              >
                Continue to Questions →
              </button>
            )}

          </div>

        </div>

      )}

      {/* ══════════════════════════════
          STEP 3 — ADD QUESTIONS
      ══════════════════════════════ */}

      {step === 3 && (

        <div className="ml-card">

          <div className="ml-card-header">
            <div>
              <h3><QuizIcon /> Step 3 — Add Questions</h3>
              <p>Minimum 5 questions for "{topicTitle}"</p>
            </div>
            <span className={`ml-count-badge ${questions.length >= 5 ? "ml-count-green" : ""}`}>
              {questions.length} / 5 min
            </span>
          </div>

          {/* Added questions */}
          {questions.length > 0 && (
            <div className="ml-added-list">
              {questions.map((q, i) => (
                <div key={i} className="ml-added-item">
                  <span className="ml-added-num">Q{i + 1}</span>
                  <div>
                    <div className="ml-added-title">{q.questionText}</div>
                    <div className="ml-added-sub">Correct: Option {q.correctOption}</div>
                  </div>
                  <CheckCircleIcon className="ml-added-check" fontSize="small" />
                </div>
              ))}
            </div>
          )}

          {/* Question text */}
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

          {/* Options grid */}
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
                      name="correct"
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

          {/* Explanation */}
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
              disabled={loading}
            >
              {loading ? "Adding..." : `+ Add Question ${questions.length + 1}`}
            </button>

            {questions.length >= 5 && (
              <button
                className="ml-create-btn"
                onClick={() => setStep(4)}
              >
                Review & Publish →
              </button>
            )}

          </div>

        </div>

      )}

      {/* ══════════════════════════════
          STEP 4 — PUBLISH
      ══════════════════════════════ */}

      {step === 4 && !published && (

        <div className="ml-card ml-publish-card">

          <div className="ml-publish-icon">🎉</div>
          <h3>Ready to Publish!</h3>
          <p>Review summary before publishing to students</p>

          <div className="ml-summary">

            <div className="ml-summary-top">
              <span className="ml-sum-icon">{topicForm.icon}</span>
              <div>
                <div className="ml-sum-title">{topicTitle}</div>
                <div className="ml-sum-sub">{topicForm.category} · {topicForm.difficulty}</div>
              </div>
            </div>

            {/* Summary stats — using ml- classes, no dashboard conflicts */}
            <div className="ml-summary-stats">

              <div className="ml-sum-stat">
                <div className="ml-sum-stat-label">Sections</div>
                <div className="ml-sum-stat-value">{contents.length}</div>
              </div>

              <div className="ml-sum-stat">
                <div className="ml-sum-stat-label">Questions</div>
                <div className="ml-sum-stat-value">{questions.length}</div>
              </div>

            </div>

          </div>

          <button
            className="ml-create-btn ml-publish-btn"
            onClick={handlePublish}
            disabled={loading}
          >
            <PublishIcon style={{ marginRight: 6 }} />
            {loading ? "Publishing..." : "Publish Topic"}
          </button>

        </div>

      )}

      {/* SUCCESS STATE */}

      {step === 4 && published && (

        <div className="ml-card ml-success-card">

          <CheckCircleIcon className="ml-success-icon" />
          <h3>Published Successfully!</h3>
          <p>Students can now access "<strong>{topicTitle}</strong>"</p>

          <div className="ml-btn-row ml-btn-row-center">

            <button
              className="ml-create-btn"
              onClick={() => navigate("/teacher/learn/create")}
            >
              + Create Another
            </button>

            <button
              className="ml-create-btn ml-btn-outline"
              onClick={() => navigate("/teacher/learn")}
            >
              View All Topics
            </button>

          </div>

        </div>

      )}

    </div>

  );

};

export default CreateLearnTopic;