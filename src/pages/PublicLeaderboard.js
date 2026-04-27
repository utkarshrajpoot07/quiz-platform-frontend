import React, { useState, useCallback, useEffect } from "react";
import axiosClient                                  from "../api/axiosClient";
import "./PublicLeaderboard.css";

export default function PublicLeaderboard() {

    const [entries,  setEntries]  = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState("");

    /* ── fetch global leaderboard ── */
    const fetchLeaderboard = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res        = await axiosClient.get("/Leaderboard/global");
            const raw        = res.data.data || [];
            const normalized = raw.map(e => ({
                userId          : e.studentId,
                name            : e.studentName,
                totalScore      : e.totalScore,
                quizzesAttempted: e.totalAttempts,
            }));
            setEntries(normalized);
        } catch {
            setError("Failed to load leaderboard. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    /* ── medal helpers ── */
    const getMedal = (rank) => {
        if (rank === 1) return { icon: "🥇", cls: "plb-rank--gold"   };
        if (rank === 2) return { icon: "🥈", cls: "plb-rank--silver" };
        if (rank === 3) return { icon: "🥉", cls: "plb-rank--bronze" };
        return          { icon: rank,         cls: ""                };
    };

    /* ── skeleton ── */
    const Skeleton = () => (
        <>
            {[...Array(8)].map((_, i) => (
                <div key={i} className="plb-skeleton-row">
                    <div className="plb-sk plb-sk-rank"  />
                    <div className="plb-sk plb-sk-avatar"/>
                    <div className="plb-sk plb-sk-name"  />
                    <div className="plb-sk plb-sk-score" />
                </div>
            ))}
        </>
    );

    /* ── top 3 podium ── */
    const top3   = entries.slice(0, 3);
    const rest   = entries.slice(3);
    const podium = [top3[1], top3[0], top3[2]];

    return (
        <div className="plb-page">

            {/* ════ HERO ════ */}
            <section className="plb-hero">
                <div className="plb-hero-inner">
                    <div className="plb-hero-badge">🏆 Global Rankings</div>
                    <h1 className="plb-hero-title">Leaderboard</h1>
                    <p  className="plb-hero-sub">Top performers across all quizzes on the platform.</p>
                </div>
            </section>

            <div className="plb-main">

                {/* error */}
                {error && (
                    <div className="plb-error-banner">
                        <span>⚠️ {error}</span>
                        <button onClick={fetchLeaderboard}>Retry</button>
                    </div>
                )}

                {/* ════ PODIUM ════ */}
                {!loading && !error && top3.length > 0 && (
                    <div className="plb-podium-section">
                        <div className="plb-podium">
                            {podium.map((entry, idx) => {
                                if (!entry) return <div key={idx} className="plb-podium-slot plb-podium-slot--empty" />;
                                const isFirst = entry === top3[0];
                                const rankNum = entries.indexOf(entry) + 1;
                                const { icon } = getMedal(rankNum);
                                return (
                                    <div
                                        key={entry.userId || idx}
                                        className={`plb-podium-slot ${isFirst ? "plb-podium-slot--first" : ""}`}
                                    >
                                        <div className="plb-podium-avatar">
                                            {entry.name?.[0]?.toUpperCase() || "?"}
                                        </div>
                                        <div className="plb-podium-medal">{icon}</div>
                                        <div className="plb-podium-name">{entry.name || "Unknown"}</div>
                                        <div className="plb-podium-score">{entry.totalScore ?? 0} pts</div>
                                        <div className={`plb-podium-stand plb-podium-stand--${rankNum}`} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ════ TABLE ════ */}
                <div className="plb-table-section">
                    <div className="plb-table-header">
                        <span className="plb-th plb-th-rank"   >Rank</span>
                        <span className="plb-th plb-th-player" >Player</span>
                        <span className="plb-th plb-th-quizzes">Quizzes</span>
                        <span className="plb-th plb-th-score"  >Score</span>
                    </div>

                    {loading && <Skeleton />}

                    {!loading && !error && entries.length === 0 && (
                        <div className="plb-empty">
                            <div className="plb-empty-icon">📊</div>
                            <h3>No rankings yet</h3>
                            <p>Be the first to complete a quiz!</p>
                        </div>
                    )}

                    {!loading && !error && entries.length > 0 && (
                        <div className="plb-rows">
                            {(entries.length > 3 ? rest : entries).map((entry, idx) => {
                                const rankNum      = entries.indexOf(entry) + 1;
                                const { icon, cls} = getMedal(rankNum);
                                return (
                                    <div
                                        key={entry.userId || idx}
                                        className={`plb-row ${rankNum <= 3 ? "plb-row--top3" : ""}`}
                                    >
                                        <span className={`plb-rank-cell ${cls}`}>{icon}</span>

                                        <span className="plb-player-cell">
                                            <span className="plb-avatar">
                                                {entry.name?.[0]?.toUpperCase() || "?"}
                                            </span>
                                            <span className="plb-player-info">
                                                <span className="plb-player-name">{entry.name || "Unknown"}</span>
                                            </span>
                                        </span>

                                        <span className="plb-quizzes-cell">
                                            {entry.quizzesAttempted ?? "—"}
                                        </span>

                                        <span className="plb-score-cell">
                                            {entry.totalScore ?? 0}
                                            <span className="plb-pts">pts</span>
                                        </span>
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