import React, { useEffect, useState, useCallback } from "react";
import ReactDOM                                     from "react-dom";
import axiosClient                                  from "../../api/axiosClient";
import { useParams }                                from "react-router-dom";
import "./EditQuestions.css";

/* ═════════════════════════════════════════════
   EDIT MODAL — rendered via Portal to document.body
   Fixes: position:fixed trapped inside parent transform
═════════════════════════════════════════════ */

const EditModal = ({ editing, saving, onUpdate, onCancel, onChange }) => {

  return ReactDOM.createPortal(

    <div
      className="eq-modal-overlay"
      onClick={onCancel}
    >
      <div
        className="eq-modal-box"
        onClick={(e) => e.stopPropagation()}
      >

        <h3 className="eq-modal-title">Edit Question</h3>

        {/* Question text */}
        <input
          className="eq-input"
          value={editing.text}
          placeholder="Question text"
          onChange={(e) => onChange({ ...editing, text: e.target.value })}
        />

        {/* Options grid */}
        <div className="eq-options-grid">
          {editing.options.map((o, i) => (
            <input
              key={i}
              className="eq-input"
              value={o}
              placeholder={`Option ${i + 1}`}
              onChange={(e) => {
                const copy = [...editing.options];
                copy[i]    = e.target.value;
                onChange({ ...editing, options: copy });
              }}
            />
          ))}
        </div>

        {/* Correct option */}
        <div className="eq-correct-row">
          <span className="eq-correct-label">Correct Option:</span>
          <div className="eq-radio-group">
            {[1, 2, 3, 4].map(n => (
              <label
                key={n}
                className={`eq-radio-label ${editing.correctOption === n ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  checked={editing.correctOption === n}
                  onChange={() => onChange({ ...editing, correctOption: n })}
                />
                {n}
              </label>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="eq-modal-buttons">
          <button
            className="eq-btn-update"
            onClick={onUpdate}
            disabled={saving}
          >
            {saving ? "Saving…" : "Update"}
          </button>
          <button
            className="eq-btn-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>,

    document.body

  );

};

/* ═════════════════════════════════════════════
   MAIN — Edit Questions
═════════════════════════════════════════════ */

const EditQuestions = () => {

  const { quizId } = useParams();

  const [questions,     setQuestions]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [toast,         setToast]         = useState("");
  const [editing,       setEditing]       = useState(null);

  const [newQuestion,   setNewQuestion]   = useState("");
  const [options,       setOptions]       = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState(1);

  /* ── toast helper ── */

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  /* ── fetch questions ── */

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axiosClient.get(`/question/quiz/${quizId}`);

      if (res.data.success) {
        setQuestions(res.data.data);
      } else {
        setError("Failed to load questions.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  /* ── delete question ── */

  const deleteQuestion = async (id) => {
    if (!window.confirm("Delete this question?")) return;

    try {
      await axiosClient.delete(`/Question/delete/${id}`);
      showToast("Question deleted 🗑️");
      fetchQuestions();
    } catch {
      showToast("Delete failed ❌");
    }
  };

  /* ── add question ── */

  const addQuestion = async () => {
    if (!newQuestion.trim() || options.some(o => !o.trim())) {
      showToast("Please fill all fields ⚠️");
      return;
    }

    try {
      setSaving(true);

      const res = await axiosClient.post("/Question/add", {
        quizId  : parseInt(quizId),
        text    : newQuestion,
        marks   : 1,
        options : options.map((opt, index) => ({
          optionText : opt,
          isCorrect  : correctOption === index + 1,
        })),
      });

      if (res.data) {
        showToast("Question added ✅");
        setNewQuestion("");
        setOptions(["", "", "", ""]);
        setCorrectOption(1);
        fetchQuestions();
      }
    } catch {
      showToast("Failed to add question ❌");
    } finally {
      setSaving(false);
    }
  };

  /* ── open edit modal ── */

  const openEdit = (q) => {
    setEditing({
      id            : q.id,
      text          : q.text,
      options       : q.options.map(o => o.optionText),
      correctOption : q.options.findIndex(o => o.isCorrect) + 1,
    });
  };

  /* ── update question ── */

  const updateQuestion = async () => {
    try {
      setSaving(true);

      const res = await axiosClient.put("/Question/update", {
        id      : editing.id,
        text    : editing.text,
        marks   : 1,
        options : editing.options.map((opt, index) => ({
          optionText : opt,
          isCorrect  : editing.correctOption === index + 1,
        })),
      });

      if (res.data) {
        showToast("Question updated ✅");
        setEditing(null);
        fetchQuestions();
      }
    } catch {
      showToast("Update failed ❌");
    } finally {
      setSaving(false);
    }
  };

  /* ── loading state ── */

  if (loading) {
    return (
      <div className="eq-wrapper">
        <div className="eq-skeleton-title" />
        {[1, 2, 3].map(n => (
          <div key={n} className="eq-skeleton-card" />
        ))}
      </div>
    );
  }

  /* ── error state ── */

  if (error) {
    return (
      <div className="eq-wrapper">
        <div className="eq-error-banner">
          <span>⚠ {error}</span>
          <button onClick={fetchQuestions}>Retry</button>
        </div>
      </div>
    );
  }

  /* ── render ── */

  return (

    <div className="eq-wrapper">

      {/* PAGE HEADER */}

      <div className="eq-header">
        <h2 className="eq-title">Manage Questions</h2>
        <span className="eq-count">{questions.length} Questions</span>
      </div>

      {/* TOAST */}

      {toast && (
        <div className="eq-toast">{toast}</div>
      )}

      {/* EMPTY STATE */}

      {questions.length === 0 && (
        <div className="eq-empty">
          No questions yet. Add one below ⬇
        </div>
      )}

      {/* QUESTIONS LIST */}

      {questions.map((q, index) => (

        <div key={q.id} className="eq-card">

          <div className="eq-card-header">
            <span className="eq-q-number">Q{index + 1}</span>
            <p className="eq-q-text">{q.text}</p>
          </div>

          <ul className="eq-options">
            {q.options.map(o => (
              <li
                key={o.id}
                className={`eq-option ${o.isCorrect ? "correct" : ""}`}
              >
                {o.isCorrect && <span className="eq-tick">✓</span>}
                {o.optionText}
              </li>
            ))}
          </ul>

          <div className="eq-actions">
            <button className="eq-btn-edit"   onClick={() => openEdit(q)}>Edit</button>
            <button className="eq-btn-delete" onClick={() => deleteQuestion(q.id)}>Delete</button>
          </div>

        </div>

      ))}

      {/* ADD QUESTION CARD */}

      <div className="eq-add-card">

        <h3 className="eq-add-title">Add New Question</h3>

        {/* Question input */}
        <input
          className="eq-input"
          placeholder="Enter question text"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
        />

        {/* Options grid */}
        <div className="eq-options-grid">
          {options.map((o, i) => (
            <input
              key={i}
              className="eq-input"
              placeholder={`Option ${i + 1}`}
              value={o}
              onChange={(e) => {
                const copy = [...options];
                copy[i]    = e.target.value;
                setOptions(copy);
              }}
            />
          ))}
        </div>

        {/* Correct option selector */}
        <div className="eq-correct-row">
          <span className="eq-correct-label">Correct Option:</span>
          <div className="eq-radio-group">
            {[1, 2, 3, 4].map(n => (
              <label
                key={n}
                className={`eq-radio-label ${correctOption === n ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  checked={correctOption === n}
                  onChange={() => setCorrectOption(n)}
                />
                {n}
              </label>
            ))}
          </div>
        </div>

        <button
          className="eq-btn-add"
          onClick={addQuestion}
          disabled={saving}
        >
          {saving ? "Adding…" : "Add Question"}
        </button>

      </div>

      {/* EDIT MODAL — via Portal to fix transform trap */}

      {editing && (
        <EditModal
          editing={editing}
          saving={saving}
          onUpdate={updateQuestion}
          onCancel={() => setEditing(null)}
          onChange={setEditing}
        />
      )}

    </div>

  );

};

export default EditQuestions;