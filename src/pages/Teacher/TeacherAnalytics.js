import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import axiosClient from "../../api/axiosClient";
import "./TeacherAnalytics.css";

import BarChartIcon    from "@mui/icons-material/BarChart";
import TrendingUpIcon  from "@mui/icons-material/TrendingUp";
import QuizIcon        from "@mui/icons-material/Quiz";
import CategoryIcon    from "@mui/icons-material/Category";
import SchoolIcon      from "@mui/icons-material/School";

/* ═════════════════════════════════════════════
   MAIN — Teacher Analytics
═════════════════════════════════════════════ */

const TeacherAnalytics = () => {

  const [attemptTrend,  setAttemptTrend]  = useState([]);
  const [quizAverage,   setQuizAverage]   = useState([]);
  const [categoryData,  setCategoryData]  = useState([]);
  const [loading,       setLoading]       = useState(true);

  /* ── fetch on mount ── */

  useEffect(() => {
    loadData();
  }, []);

  /* ── load all chart data ── */

  const loadData = async () => {
    try {
      setLoading(true);

      const [trend, avg, cat] = await Promise.all([
        axiosClient.get("/teacher/charts/attempts/30"),
        axiosClient.get("/teacher/charts/quiz-average"),
        axiosClient.get("/teacher/charts/category-performance"),
      ]);

      setAttemptTrend(trend.data.data || []);
      setQuizAverage(avg.data.data   || []);
      setCategoryData(cat.data.data  || []);

    } catch (err) {
      console.error("Analytics load error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ── derived stats ── */

  const totalAttempts  = attemptTrend.reduce((acc, b) => acc + (b.attempts || 0), 0);
  const activeQuizzes  = quizAverage.filter(q => q.averageScore > 0);

  const avgScore =
    activeQuizzes.length > 0
      ? (
          activeQuizzes.reduce((acc, b) => acc + b.averageScore, 0) /
          activeQuizzes.length
        ).toFixed(2)
      : 0;

  /* ── stat cards config ── */

  const statCards = [
    {
      key       : "attempts",
      label     : "Total Attempts",
      value     : loading ? "—" : totalAttempts,
      icon      : <SchoolIcon sx={{ fontSize: 22 }} />,
      colorClass: "an-card1",
    },
    {
      key       : "quizzes",
      label     : "Total Quizzes",
      value     : loading ? "—" : quizAverage.length,
      icon      : <QuizIcon sx={{ fontSize: 22 }} />,
      colorClass: "an-card2",
    },
    {
      key       : "categories",
      label     : "Categories",
      value     : loading ? "—" : categoryData.length,
      icon      : <CategoryIcon sx={{ fontSize: 22 }} />,
      colorClass: "an-card3",
    },
    {
      key       : "score",
      label     : "Average Score",
      value     : loading ? "—" : `${avgScore}%`,
      icon      : <TrendingUpIcon sx={{ fontSize: 22 }} />,
      colorClass: "an-card4",
    },
  ];

  /* ── render ── */

  return (

    <div className="an-wrap">

      {/* PAGE HEADER */}

      <div className="an-header">

        <div>
          <h2 className="an-title">
            <BarChartIcon sx={{ fontSize: 24, verticalAlign: "middle", marginRight: "8px" }} />
            Teacher Analytics Dashboard
          </h2>
          <p className="an-subtitle">
            Track quiz performance, attempts and category insights
          </p>
        </div>

      </div>

      {/* STAT CARDS */}

      <div className="an-cards">

        {statCards.map((card) => (

          <div key={card.key} className={`an-card ${card.colorClass}`}>
            <div className="an-card-top">
              <span className="an-card-label">{card.label}</span>
              <span className="an-card-icon">{card.icon}</span>
            </div>
            <div className="an-card-value">{card.value}</div>
          </div>

        ))}

      </div>

      {/* CHARTS GRID */}

      <div className="an-charts-grid">

        {/* ATTEMPTS TREND */}

        <div className="an-chart-card">

          <h3 className="an-chart-title">📈 Attempts Trend</h3>

          {!loading && attemptTrend.length === 0 ? (

            <div className="an-chart-empty">No attempt data yet.</div>

          ) : (

            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={attemptTrend}>

                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />

                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />

                <Tooltip
                  contentStyle={{
                    borderRadius : "8px",
                    border       : "1px solid #e5e7eb",
                    fontSize     : "13px",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="attempts"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#6366f1" }}
                  activeDot={{ r: 6 }}
                />

              </LineChart>
            </ResponsiveContainer>

          )}

        </div>

        {/* QUIZ AVERAGE SCORES */}

        <div className="an-chart-card">

          <h3 className="an-chart-title">📊 Quiz Average Scores</h3>

          {!loading && quizAverage.length === 0 ? (

            <div className="an-chart-empty">No quiz data yet.</div>

          ) : (

            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={quizAverage}>

                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

                <XAxis
                  dataKey="title"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />

                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />

                <Tooltip
                  contentStyle={{
                    borderRadius : "8px",
                    border       : "1px solid #e5e7eb",
                    fontSize     : "13px",
                  }}
                />

                <Bar
                  dataKey="averageScore"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>

          )}

        </div>

        {/* CATEGORY PERFORMANCE */}

        <div className="an-chart-card">

          <h3 className="an-chart-title">📚 Category Performance</h3>

          {!loading && categoryData.length === 0 ? (

            <div className="an-chart-empty">No category data yet.</div>

          ) : (

            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData}>

                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />

                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />

                <Tooltip
                  contentStyle={{
                    borderRadius : "8px",
                    border       : "1px solid #e5e7eb",
                    fontSize     : "13px",
                  }}
                />

                <Bar
                  dataKey="averageScore"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>

          )}

        </div>

      </div>

    </div>

  );

};

export default TeacherAnalytics;