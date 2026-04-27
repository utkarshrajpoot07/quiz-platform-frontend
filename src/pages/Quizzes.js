import React, { useState, useCallback, useEffect, useContext } from "react";
import { useNavigate }  from "react-router-dom";
import { toast }  from "react-hot-toast";
import axiosClient from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";
import "./Quizzes.css";

export default function Quizzes() {

    const navigate          = useNavigate();
    const { user, token }   = useContext(AuthContext);
    const isLoggedIn        = !!(user && token);

    /* ── state ── */
    const [quizzes,    setQuizzes]    = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [error,      setError]      = useState("");
    const [search,     setSearch]     = useState("");
    const [activecat,  setActivecat]  = useState({ id: null, name: "All" });
    const [joinCode,   setJoinCode]   = useState("");
    const [joining,    setJoining]    = useState(false);

    /* ── fetch quizzes ── */
    const fetchQuizzes = useCallback(async (searchVal = "", catId = null) => {
        setLoading(true);
        setError("");
        try {
            const params = { page: 1, pageSize: 100 };
            if (searchVal) params.search     = searchVal;
            if (catId)     params.categoryId = catId;

            const res   = await axiosClient.get("/quiz/all", { params });
            const items = res.data?.data?.items || [];
            setQuizzes(items);
        } catch {
            setError("Failed to load quizzes. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    /* ── fetch categories ── */
    const fetchCategories = useCallback(async () => {
        try {
            const res = await axiosClient.get("/Category");
            setCategories(res.data || []);
        } catch { /* silent */ }
    }, []);

    useEffect(() => {
        fetchQuizzes();
        fetchCategories();
    }, [fetchQuizzes, fetchCategories]);

    /* ── debounced re-fetch ── */
    useEffect(() => {
        const t = setTimeout(() => fetchQuizzes(search, activecat.id), 400);
        return () => clearTimeout(t);
    }, [search, activecat, fetchQuizzes]);

    /* ── join by code ── */
    const handleJoin = async () => {
        if (!joinCode.trim()) { toast.error("Enter a quiz code."); return; }
        if (!isLoggedIn)      { toast.error("Login first to join."); navigate("/login"); return; }
        setJoining(true);
        try {
            const res    = await axiosClient.get(`/quiz/join/${joinCode.trim().toUpperCase()}`);
            const quizId = res.data?.data?.id || res.data?.id;
            navigate(`/quiz/${quizId}`);
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid or expired code.");
        } finally {
            setJoining(false);
        }
    };

    /* ── attempt click ── */
    const handleAttempt = (quizId) => {
        if (!isLoggedIn) {
            toast.error("Please login to attempt this quiz.");
            navigate("/login");
            return;
        }
        navigate(`/quiz/${quizId}`);
    };

    /* ── status ── */
    const getStatus = (q) => {
        if (!q.isActive) return { label: "Inactive", cls: "qz-s--inactive" };
        const now   = new Date();
        const start = q.startDate && q.startDate !== "0001-01-01T00:00:00" ? new Date(q.startDate) : null;
        const end   = q.endDate   && q.endDate   !== "0001-01-01T00:00:00" ? new Date(q.endDate)   : null;
        if (start && now < start) return { label: "Upcoming", cls: "qz-s--upcoming" };
        if (end   && now > end)   return { label: "Ended",    cls: "qz-s--ended"    };
        return { label: "Live", cls: "qz-s--live" };
    };

    /* ── category list ── */
    const catList = [
        { id: null, name: "All" },
        ...categories.map(c => ({ id: c.id ?? c.categoryId, name: c.name })),
    ];

    /* ── skeleton ── */
    const Skeleton = () => (
        <div className="qz-grid">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="qz-card qz-card--skeleton">
                    <div className="qz-sk-top"   />
                    <div className="qz-sk-body">
                        <div className="qz-sk-line qz-sk-t1" />
                        <div className="qz-sk-line qz-sk-t2" />
                        <div className="qz-sk-line qz-sk-t3" />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="qz-page">

            {/* ════ HERO ════ */}
            <section className="qz-hero">
                <div className="qz-hero-inner">
                    <h1 className="qz-hero-title">Explore Quizzes</h1>
                    <p  className="qz-hero-sub">Browse all quizzes or jump in with a code.</p>

                    <div className="qz-join-row">
                        <input
                            className   = "qz-join-input"
                            type        = "text"
                            placeholder = "Enter Quiz Code (e.g. AB12CD)"
                            value       = {joinCode}
                            onChange    = {e => setJoinCode(e.target.value)}
                            onKeyDown   = {e => e.key === "Enter" && handleJoin()}
                            maxLength   = {10}
                        />
                        <button className="qz-join-btn" onClick={handleJoin} disabled={joining}>
                            {joining ? "Joining…" : "Join →"}
                        </button>
                    </div>

                    {!isLoggedIn && (
                        <p className="qz-hero-hint">
                            <span onClick={() => navigate("/login")}>Login</span> or{" "}
                            <span onClick={() => navigate("/register")}>Sign Up</span> to attempt quizzes
                        </p>
                    )}
                </div>
            </section>

            {/* ════ FILTERS ════ */}
            <div className="qz-filters">
                <div className="qz-filters-inner">
                    <div className="qz-search-wrap">
                        <span className="qz-search-ico">🔍</span>
                        <input
                            className   = "qz-search"
                            type        = "text"
                            placeholder = "Search quizzes…"
                            value       = {search}
                            onChange    = {e => setSearch(e.target.value)}
                        />
                        {search && <button className="qz-search-x" onClick={() => setSearch("")}>✕</button>}
                    </div>

                    <div className="qz-pills">
                        {catList.map(cat => (
                            <button
                                key       = {cat.name}
                                className = {`qz-pill ${activecat.name === cat.name ? "qz-pill--on" : ""}`}
                                onClick   = {() => setActivecat(cat)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ════ CONTENT ════ */}
            <div className="qz-body">
                <div className="qz-body-inner">

                    {error && (
                        <div className="qz-err">
                            ⚠️ {error}
                            <button onClick={() => fetchQuizzes(search, activecat.id)}>Retry</button>
                        </div>
                    )}

                    {!loading && !error && (
                        <p className="qz-count">{quizzes.length} quizzes found</p>
                    )}

                    {loading && <Skeleton />}

                    {!loading && !error && quizzes.length === 0 && (
                        <div className="qz-empty">
                            <div className="qz-empty-ico">📭</div>
                            <h3>No quizzes found</h3>
                            <p>Try a different search or category.</p>
                        </div>
                    )}

                    {!loading && !error && quizzes.length > 0 && (
                        <div className="qz-grid">
                            {quizzes.map(q => {
                                const st = getStatus(q);
                                const isLive = st.label === "Live";
                                return (
                                    <div key={q.id} className="qz-card" onClick={() => isLive && handleAttempt(q.id)}>

                                        {/* ── top: image or color block ── */}
                                        <div className="qz-card-top">
                                            {q.imageUrl
                                                ? <img src={q.imageUrl} alt={q.title} className="qz-card-img" />
                                                : <div className="qz-card-no-img">📝</div>
                                            }
                                            <span className={`qz-badge ${st.cls}`}>{st.label}</span>
                                        </div>

                                        {/* ── body ── */}
                                        <div className="qz-card-body">
                                            {q.categoryName && (
                                                <span className="qz-cat">{q.categoryName}</span>
                                            )}
                                            <h3 className="qz-card-title">{q.title}</h3>
                                            <p  className="qz-card-desc">
                                                {q.description || "No description available."}
                                            </p>

                                            <div className="qz-card-info">
                                                <span>❓ {q.totalQuestions ?? 0} Qs</span>
                                                <span>⏱ {q.durationMinutes ?? 0} min</span>
                                                <span>🏆 {q.totalMarks ?? 0} pts</span>
                                            </div>

                                            {q.teacherName && (
                                                <div className="qz-card-teacher">👨‍🏫 {q.teacherName}</div>
                                            )}
                                        </div>

                                        {/* ── footer ── */}
                                        <div className="qz-card-foot">
                                            {isLive ? (
                                                isLoggedIn ? (
                                                    <button
                                                        className = "qz-btn qz-btn--attempt"
                                                        onClick   = {e => { e.stopPropagation(); handleAttempt(q.id); }}
                                                    >
                                                        Attempt Quiz →
                                                    </button>
                                                ) : (
                                                    <button
                                                        className = "qz-btn qz-btn--login"
                                                        onClick   = {e => { e.stopPropagation(); navigate("/login"); }}
                                                    >
                                                        🔒 Login to Attempt
                                                    </button>
                                                )
                                            ) : (
                                                <button className="qz-btn qz-btn--disabled" disabled>
                                                    {st.label === "Upcoming" ? "⏳ Coming Soon" :
                                                     st.label === "Ended"    ? "Quiz Ended"     :
                                                                               "Not Available"  }
                                                </button>
                                            )}
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}