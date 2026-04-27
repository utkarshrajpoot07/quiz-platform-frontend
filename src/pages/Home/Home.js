import React, { useContext }          from "react";
import "./Home.css";
import { useNavigate, Navigate }      from "react-router-dom";
import PlayCircleOutlineIcon          from "@mui/icons-material/PlayCircleOutline";
import { AuthContext }                from "../../context/AuthContext";

/* ═════════════════════════════════════════════
   CONSTANTS
═════════════════════════════════════════════ */

const categories = [
  { name: "C#",         image: "/images/csharp.svg" },
  { name: "Java",       image: "/images/java.svg"   },
  { name: "Python",     image: "/images/python.svg" },
  { name: "C++",        image: "/images/cpp.svg"    },
  { name: "HTML & CSS", image: "/images/html.svg"   },
  { name: "JavaScript", image: "/images/js.svg"     },
  { name: "SQL",        image: "/images/sql.svg"    },
];

/* ═════════════════════════════════════════════
   MAIN — Home Page
═════════════════════════════════════════════ */

const Home = () => {

  const navigate    = useNavigate();
  const { role }    = useContext(AuthContext);

  // ✅ FIX — Already logged in user ko redirect karo
  // Back button press karne pe Home nahi dikhega
  if (role === "Teacher") return <Navigate to="/teacher/dashboard" replace />;
  if (role === "Student") return <Navigate to="/student/dashboard" replace />;
  if (role === "Admin")   return <Navigate to="/admin/dashboard"   replace />;

  /* ── render ── */

  return (

    <div className="home-container">

      {/* ── HERO SECTION ── */}

      <section className="hero-section">

        <div className="hero-left">

          <h1>
            Learn • Practice • <span>Master</span> <br /> Quizzes
          </h1>

          <p className="hero-subtitle">
            A modern AI-powered quiz platform for Students, Teachers &
            Organizations. Improve your skills with interactive learning.
          </p>

          <div className="hero-buttons">

            <button
              className="btn-primary"
              onClick={() => navigate("/login")}
            >
              <PlayCircleOutlineIcon /> Start Learning
            </button>

            <button
              className="btn-outline"
              onClick={() => navigate("/login")}
            >
              Explore Quizzes
            </button>

          </div>

        </div>

        <div className="hero-right">
          <img src="/images/hero.svg" alt="Hero" className="hero-img" />
        </div>

      </section>

      {/* ── EXPLORE QUIZ CATEGORIES ── */}

      <section className="category-section">

        <h2 className="category-title">
          Explore <span>Quiz Categories</span>
        </h2>

        <div className="category-grid">

          {categories.map((cat, index) => (

            <div key={index} className="category-card">

              <div className="category-icon-wrapper">
                <img src={cat.image} alt={cat.name} className="category-icon" />
              </div>

              <h3>{cat.name}</h3>

              <p>Boost your knowledge in {cat.name} and test your skills.</p>

              <button
                className="category-btn"
                onClick={() => navigate("/login")}
              >
                Login to Start
              </button>

            </div>

          ))}

        </div>

      </section>

      {/* ── FEATURES SECTION ── */}

      <section className="features-section">

        <h2>
          Why Choose <span>QuizPlatform?</span>
        </h2>

        <div className="features-grid">

          <div className="feature-card">
            <div className="feature-icon">⏱️</div>
            <h3>Timed Challenges</h3>
            <p>Improve your accuracy with time-based quizzes.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>AI-Powered Insights</h3>
            <p>Instant performance analytics & smart suggestions.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Progress Tracking</h3>
            <p>Track your improvements & strengthen weak areas.</p>
          </div>

        </div>

      </section>

    </div>

  );

};

export default Home;