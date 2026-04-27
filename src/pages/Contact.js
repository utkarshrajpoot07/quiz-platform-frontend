import React, { useState } from "react";
import { toast }           from "react-hot-toast";
import axiosClient         from "../api/axiosClient";
import "./Contact.css";

export default function Contact() {

    const [form,    setForm]    = useState({ name: "", email: "", subject: "", message: "" });
    const [sending, setSending] = useState(false);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    /* ── submit — real API call ── */
    const handleSubmit = async () => {
        const { name, email, subject, message } = form;

        if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
            toast.error("Please fill in all fields.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address.");
            return;
        }

        setSending(true);
        try {
            await axiosClient.post("/Contact", { name, email, subject, message });
            toast.success("Message sent! We'll get back to you soon. ✅");
            setForm({ name: "", email: "", subject: "", message: "" });
        } catch {
            toast.error("Failed to send message. Please try again.");
        } finally {
            setSending(false);
        }
    };

    const faqs = [
        {
            q: "How do I join a quiz?",
            a: "You can join a quiz by entering the quiz code provided by your teacher on the Quizzes page, or by browsing available public quizzes.",
        },
        {
            q: "Can I create my own quizzes?",
            a: "Yes! Teachers can create quizzes, add questions manually, or use our AI-powered quiz generator to auto-create questions from a topic.",
        },
        {
            q: "Is the platform free to use?",
            a: "QuizPlatform is free for students. Teachers and organizations can contact us for institutional plans.",
        },
        {
            q: "How does the leaderboard work?",
            a: "The global leaderboard ranks users by their cumulative score across all quiz attempts on the platform.",
        },
    ];

    return (
        <div className="ct-page">

            {/* ════ HERO ════ */}
            <section className="ct-hero">
                <div className="ct-hero-inner">
                    <div className="ct-hero-badge">💬 Get In Touch</div>
                    <h1 className="ct-hero-title">Contact Us</h1>
                    <p  className="ct-hero-sub">
                        Have a question, feedback, or need support? We'd love to hear from you.
                    </p>
                </div>
            </section>

            <div className="ct-main">

                {/* ════ INFO CARDS ════ */}
                <div className="ct-info-cards">
                    <div className="ct-info-card">
                        <div className="ct-info-icon">📧</div>
                        <div className="ct-info-label">Email</div>
                        <div className="ct-info-value">support@quizplatform.com</div>
                    </div>
                    <div className="ct-info-card">
                        <div className="ct-info-icon">⏰</div>
                        <div className="ct-info-label">Response Time</div>
                        <div className="ct-info-value">Within 24 hours</div>
                    </div>
                    <div className="ct-info-card">
                        <div className="ct-info-icon">📍</div>
                        <div className="ct-info-label">Location</div>
                        <div className="ct-info-value">India 🇮🇳</div>
                    </div>
                </div>

                {/* ════ FORM + FAQ ════ */}
                <div className="ct-grid">

                    {/* contact form */}
                    <div className="ct-form-card">
                        <h2 className="ct-form-title">Send a Message</h2>

                        <div className="ct-form-group">
                            <label className="ct-label">Your Name</label>
                            <input
                                className="ct-input"
                                type="text"
                                name="name"
                                placeholder="e.g. Rahul Sharma"
                                value={form.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="ct-form-group">
                            <label className="ct-label">Email Address</label>
                            <input
                                className="ct-input"
                                type="email"
                                name="email"
                                placeholder="e.g. rahul@example.com"
                                value={form.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="ct-form-group">
                            <label className="ct-label">Subject</label>
                            <input
                                className="ct-input"
                                type="text"
                                name="subject"
                                placeholder="e.g. Issue with quiz attempt"
                                value={form.subject}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="ct-form-group">
                            <label className="ct-label">Message</label>
                            <textarea
                                className="ct-textarea"
                                name="message"
                                rows={5}
                                placeholder="Describe your query in detail…"
                                value={form.message}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            className="ct-submit-btn"
                            onClick={handleSubmit}
                            disabled={sending}
                        >
                            {sending ? "Sending…" : "Send Message →"}
                        </button>
                    </div>

                    {/* FAQ */}
                    <div className="ct-faq-section">
                        <h2 className="ct-faq-title">Frequently Asked Questions</h2>
                        <div className="ct-faq-list">
                            {faqs.map((faq, i) => (
                                <FaqItem key={i} q={faq.q} a={faq.a} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FaqItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className={`ct-faq-item ${open ? "ct-faq-item--open" : ""}`}>
            <button className="ct-faq-q" onClick={() => setOpen(o => !o)}>
                <span>{q}</span>
                <span className="ct-faq-chevron">{open ? "▲" : "▼"}</span>
            </button>
            {open && <p className="ct-faq-a">{a}</p>}
        </div>
    );
}