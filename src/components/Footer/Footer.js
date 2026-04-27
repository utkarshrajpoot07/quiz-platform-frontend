import React from "react";
import "./Footer.css";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaGithub,
  FaTwitter
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* COLUMN 1 */}
        <div className="footer-col">
          <h2 className="footer-logo">QuizX</h2>
          <p className="footer-desc">
            A modern platform for students and teachers to create, share,
            and attempt quizzes with real-time analytics and insights.
          </p>

          <div className="footer-socials">
            <FaFacebook />
            <FaTwitter />
            <FaLinkedin />
            <FaInstagram />
            <FaGithub />
          </div>
        </div>

        {/* COLUMN 2 */}
        <div className="footer-col">
          <h3>Platform</h3>
          <ul>
            <li>Explore Quizzes</li>
            <li>Create Quiz</li>
            <li>Leaderboard</li>
            <li>Analytics</li>
          </ul>
        </div>

        {/* COLUMN 3 */}
        <div className="footer-col">
          <h3>Resources</h3>
          <ul>
            <li>Documentation</li>
            <li>API Access</li>
            <li>Help Center</li>
            <li>Community</li>
          </ul>
        </div>

        {/* COLUMN 4 */}
        <div className="footer-col">
          <h3>Stay Updated</h3>

          <p className="newsletter-text">
            Subscribe to get latest quizzes and platform updates.
          </p>

          <div className="newsletter-box">
            <input type="email" placeholder="Enter your email" />
            <button>Subscribe</button>
          </div>
        </div>

      </div>

      {/* BOTTOM BAR */}

      <div className="footer-bottom">
        © {new Date().getFullYear()} QuizPlatform. All rights reserved.
        <h2>Developed by Team U S </h2>
      </div>

    </footer>
  );
};

export default Footer;