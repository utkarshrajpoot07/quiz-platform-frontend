import { useEffect, useState } from "react";
import "./TeacherCategory.css";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";

import CategoryIcon        from "@mui/icons-material/Category";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon             from "@mui/icons-material/Edit";
import DeleteIcon           from "@mui/icons-material/Delete";
import SearchIcon           from "@mui/icons-material/Search";
import CloseIcon            from "@mui/icons-material/Close";

/* ═════════════════════════════════════════════
   MAIN — Teacher Category Management
═════════════════════════════════════════════ */

const TeacherCategory = () => {

  const [categories, setCategories] = useState([]);
  const [name,       setName]       = useState("");
  const [search,     setSearch]     = useState("");
  const [loading,    setLoading]    = useState(true);

  /* ── edit modal state ── */

  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({});

  /* ── delete modal state ── */

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId,   setDeleteId]   = useState(null);
  const [deleteName, setDeleteName] = useState("");

  useEffect(() => { load(); }, []);

  /* ── load categories ── */

  const load = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/Category");
      if (res.data.success) setCategories(res.data.data);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  /* ── add category ── */

  const addCategory = async () => {
    if (!name.trim()) return toast.error("Enter a category name");
    try {
      await axiosClient.post("/Category/create", { name });
      toast.success("Category added!");
      setName("");
      load();
    } catch {
      toast.error("Failed to add category");
    }
  };

  /* ── open delete modal ── */

  const confirmDelete = (id, catName) => {
    setDeleteId(id);
    setDeleteName(catName);
    setDeleteOpen(true);
  };

  /* ── delete category ── */

  const remove = async () => {
    try {
      await axiosClient.delete(`/Category/delete/${deleteId}`);
      toast.success("Category deleted");
      setDeleteOpen(false);
      load();
    } catch {
      toast.error("Failed to delete category");
    }
  };

  /* ── update category ── */

  const update = async () => {
    if (!editData.name?.trim()) return toast.error("Name cannot be empty");
    try {
      await axiosClient.put(`/Category/update/${editData.id}`, editData);
      toast.success("Category updated!");
      setEditOpen(false);
      load();
    } catch {
      toast.error("Failed to update category");
    }
  };

  /* ── filtered list ── */

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ── render ── */

  return (

    <div className="tc-wrap">

      {/* PAGE HEADER */}

      <div className="tc-page-header">
        <div>
          <h2 className="tc-page-title">
            <CategoryIcon sx={{ fontSize: 22, verticalAlign: "middle", marginRight: "8px" }} />
            Category Management
          </h2>
          <p className="tc-page-subtitle">
            Add, edit and delete quiz categories
          </p>
        </div>
      </div>

      {/* ADD CATEGORY */}

      <div className="tc-add-row">

        <input
          className="tc-input"
          placeholder="Add new category..."
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addCategory()}
        />

        <button className="tc-add-btn" onClick={addCategory}>
          <AddCircleOutlineIcon sx={{ fontSize: 17 }} />
          <span>Add</span>
        </button>

      </div>

      {/* SEARCH */}

      <div className="tc-search-wrap">
        <SearchIcon sx={{ fontSize: 18, color: "#9ca3af" }} className="tc-search-icon" />
        <input
          className="tc-search"
          placeholder="Search category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* LIST CARD */}

      <div className="tc-list-card">

        <div className="tc-list-header">
          <span className="tc-list-title">All Categories</span>
          {!loading && (
            <span className="tc-count-badge">
              {filtered.length} categor{filtered.length !== 1 ? "ies" : "y"}
            </span>
          )}
        </div>

        {/* Loading skeleton */}

        {loading && (
          <div className="tc-list">
            {[1, 2, 3].map(i => (
              <div key={i} className="tc-row">
                <div className="tc-skeleton" style={{ width: "40%", height: 14, borderRadius: 4 }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <div className="tc-skeleton" style={{ width: 60, height: 30, borderRadius: 8 }} />
                  <div className="tc-skeleton" style={{ width: 60, height: 30, borderRadius: 8 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}

        {!loading && filtered.length === 0 && (
          <div className="tc-empty">
            <CategoryIcon sx={{ fontSize: 40, color: "#94a3b8" }} />
            <p>{search ? "No categories match your search" : "No categories yet"}</p>
          </div>
        )}

        {/* Category rows */}

        {!loading && filtered.length > 0 && (

          <div className="tc-list">

            {filtered.map(c => (

              <div key={c.id} className="tc-row">

                <span className="tc-row-name">{c.name}</span>

                <div className="tc-row-actions">

                  <button
                    className="tc-btn tc-btn-edit"
                    onClick={() => { setEditData(c); setEditOpen(true); }}
                  >
                    <EditIcon sx={{ fontSize: 14 }} /> Edit
                  </button>

                  <button
                    className="tc-btn tc-btn-delete"
                    onClick={() => confirmDelete(c.id, c.name)}
                  >
                    <DeleteIcon sx={{ fontSize: 14 }} /> Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* ── EDIT MODAL ── */}

      {editOpen && (

        <div className="tc-modal-overlay" onClick={() => setEditOpen(false)}>

          <div className="tc-modal" onClick={e => e.stopPropagation()}>

            <div className="tc-modal-header">
              <h3>Edit Category</h3>
              <button className="tc-modal-close" onClick={() => setEditOpen(false)}>
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <div className="tc-modal-body">
              <label className="tc-field-label">Category Name</label>
              <input
                className="tc-input"
                value={editData.name || ""}
                onChange={e => setEditData({ ...editData, name: e.target.value })}
                onKeyDown={e => e.key === "Enter" && update()}
                autoFocus
              />
            </div>

            <div className="tc-modal-footer">
              <button className="tc-btn-ghost" onClick={() => setEditOpen(false)}>Cancel</button>
              <button className="tc-add-btn" onClick={update}>Save Changes</button>
            </div>

          </div>

        </div>

      )}

      {/* ── DELETE MODAL ── */}

      {deleteOpen && (

        <div className="tc-modal-overlay" onClick={() => setDeleteOpen(false)}>

          <div className="tc-modal" onClick={e => e.stopPropagation()}>

            <div className="tc-modal-header">
              <h3>Delete Category</h3>
              <button className="tc-modal-close" onClick={() => setDeleteOpen(false)}>
                <CloseIcon sx={{ fontSize: 18 }} />
              </button>
            </div>

            <div className="tc-modal-body tc-delete-body">
              <div className="tc-delete-icon">🗑️</div>
              <p className="tc-delete-msg">
                Are you sure you want to delete <strong>"{deleteName}"</strong>?
                <br />
                <span className="tc-delete-warn">This action cannot be undone.</span>
              </p>
            </div>

            <div className="tc-modal-footer">
              <button className="tc-btn-ghost" onClick={() => setDeleteOpen(false)}>Cancel</button>
              <button className="tc-btn-danger-solid" onClick={remove}>Delete</button>
            </div>

          </div>

        </div>

      )}

    </div>

  );

};

export default TeacherCategory;