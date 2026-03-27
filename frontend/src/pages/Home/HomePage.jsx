// src/pages/Home/HomePage.jsx
// UniConnect – Landing Page with Student & Admin portals

import { useNavigate } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* ── Nav ── */}
      <nav className="home-nav">
        <div className="home-nav-brand">
          <span className="brand-icon">🎓</span>
          <span className="brand-name">UniConnect</span>
        </div>
        <div className="home-nav-links">
          <button className="nav-link" onClick={() => navigate("/events")}>Events</button>
          <button className="nav-link" onClick={() => navigate("/my-tickets")}>My Tickets</button>
          <button className="nav-link admin" onClick={() => navigate("/admin")}>Admin Panel</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="home-hero">
        <div className="hero-glow glow-1" />
        <div className="hero-glow glow-2" />
        <div className="hero-content">
          <div className="hero-badge">University Event Management System</div>
          
          <div className="hero-actions">
            <button className="hero-btn primary" onClick={() => navigate("/events")}>
              Browse Events →
            </button>
            <button className="hero-btn secondary" onClick={() => navigate("/my-tickets")}>
              My Tickets
            </button>
          </div>
        </div>
      </section>

      {/* ── Portal Cards ── */}
      <section className="home-portals">
        <h2 className="portals-title">Choose Your Portal</h2>
        <p className="portals-sub">Select the portal that matches your role</p>

        <div className="portals-grid">
          {/* Student Portal */}
          <div className="portal-card student-card">
            <div className="portal-card-glow" />
            <div className="portal-icon">🎓</div>
            <div className="portal-badge">Student</div>
            <h3 className="portal-title">Student Portal</h3>
            <p className="portal-desc">
              Browse upcoming events, book tickets, and track your bookings all in one place.
            </p>
            <ul className="portal-features">
              <li><span className="feat-check">✓</span> Browse & search events</li>
              <li><span className="feat-check">✓</span> Book tickets instantly</li>
              <li><span className="feat-check">✓</span> View ticket status & QR code</li>
              <li><span className="feat-check">✓</span> Track payment history</li>
            </ul>
            <div className="portal-actions">
              <button className="portal-btn primary" onClick={() => navigate("/events")}>
                Browse Events →
              </button>
              <button className="portal-btn outline" onClick={() => navigate("/my-tickets")}>
                My Tickets
              </button>
            </div>
          </div>

          {/* Admin Portal */}
          <div className="portal-card admin-card">
            <div className="portal-card-glow" />
            <div className="portal-icon">🛡️</div>
            <div className="portal-badge admin">Admin</div>
            <h3 className="portal-title">Admin Panel</h3>
            <p className="portal-desc">
              Manage ticket bookings, approve or reject requests, and oversee all university events.
            </p>
            <ul className="portal-features">
              <li><span className="feat-check">✓</span> View all ticket bookings</li>
              <li><span className="feat-check">✓</span> Approve / reject cash payments</li>
              <li><span className="feat-check">✓</span> Auto-process bank & online</li>
              <li><span className="feat-check">✓</span> Event & payment stats</li>
            </ul>
            <div className="portal-actions">
              <button className="portal-btn admin-primary" onClick={() => navigate("/admin")}>
                Open Admin Panel →
              </button>
              <button className="portal-btn outline" onClick={() => navigate("/admin/bookings")}>
                Manage Bookings
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="home-stats">
        {[
          { icon: "🎟️", value: "100%", label: "Digital Ticketing" },
          { icon: "⚡", value: "Auto",  label: "Online & Bank Approval" },
          { icon: "✅", value: "Manual", label: "Cash Approval by Admin" },
          { icon: "📧", value: "Live",   label: "Booking Confirmations" },
        ].map((s) => (
          <div className="stat-item" key={s.label}>
            <span className="stat-icon">{s.icon}</span>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── Footer ── */}
      <footer className="home-footer">
        <span>© 2026 UniConnect — University of Colombo</span>
      </footer>
    </div>
  );
}
