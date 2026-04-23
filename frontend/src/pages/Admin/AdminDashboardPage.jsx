// src/pages/Admin/AdminDashboardPage.jsx
// UniConnect – Admin Dashboard

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboardPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/tickets/stats`).then((r) => r.json()),
      fetch(`${API_BASE}/admin/bookings`).then((r) => r.json()),
    ])
      .then(([ticketStats, bookings]) => {
        const cashPending = Array.isArray(bookings)
          ? bookings.filter((t) => t.paymentMethod === "cash" && t.status === "pending").length
          : 0;
        const totalRevenue = Array.isArray(bookings)
          ? bookings.filter((t) => t.paymentStatus === "paid").reduce((sum, t) => sum + (t.totalAmount || 0), 0)
          : 0;
        setStats({ ...ticketStats, cashPending, totalRevenue });
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="ad-page">
      {/* ── Header ── */}
      <div className="ad-header">
        <button className="ad-back" onClick={() => navigate("/")}>← Home</button>
        <div>
          <h1 className="ad-title">Admin Panel</h1>
          <p className="ad-sub">UniConnect Event Management System</p>
        </div>
      </div>

      {/* ── Stats ── */}
      {!loading && stats && (
        <div className="ad-stats">
          {[
            { label: "Total Tickets",   value: stats.totalTickets, color: "#4361ee", icon: "🎟️" },
            { label: "Confirmed",       value: stats.confirmed,    color: "#16a34a", icon: "✅" },
            { label: "Pending",         value: stats.pending,      color: "#ca8a04", icon: "⏳" },
            { label: "Cash Pending",    value: stats.cashPending,  color: "#dc2626", icon: "💵" },
            { label: "Total Revenue",   value: `Rs. ${(stats.totalRevenue || 0).toLocaleString()}`, color: "#0ea5e9", icon: "💰", wide: true },
          ].map((s) => (
            <div className={`ad-stat-card ${s.wide ? "wide" : ""}`} key={s.label}>
              <div className="ad-stat-icon">{s.icon}</div>
              <div className="ad-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="ad-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Quick Action Cards ── */}
      <div className="ad-cards">
        <div className="ad-card primary" onClick={() => navigate("/admin/bookings")}>
          <div className="ad-card-icon">🎟️</div>
          <div className="ad-card-content">
            <h3>Manage Bookings</h3>
            <p>Approve or reject cash payment ticket bookings. View all student bookings.</p>
            {stats?.cashPending > 0 && (
              <div className="ad-card-badge">{stats.cashPending} awaiting approval</div>
            )}
          </div>
          <div className="ad-card-arrow">→</div>
        </div>

        <div className="ad-card" onClick={() => navigate("/events")}>
          <div className="ad-card-icon">📅</div>
          <div className="ad-card-content">
            <h3>Browse Events</h3>
            <p>View all published university events and their booking status.</p>
          </div>
          <div className="ad-card-arrow">→</div>
        </div>

        <div className="ad-card" onClick={() => navigate("/payment-history")}>
          <div className="ad-card-icon">💳</div>
          <div className="ad-card-content">
            <h3>Payment History</h3>
            <p>View all payment records and transaction history.</p>
          </div>
          <div className="ad-card-arrow">→</div>
        </div>
      </div>

      {/* ── Payment Method Legend ── */}
      <div className="ad-legend">
        <h3 className="ad-legend-title">Payment Approval Logic</h3>
        <div className="ad-legend-items">
          <div className="ad-legend-item">
            <span className="ad-leg-icon">💵</span>
            <div>
              <div className="ad-leg-method">Cash</div>
              <div className="ad-leg-desc">Requires <strong>manual admin approval</strong> below</div>
            </div>
            <span className="ad-leg-badge manual">Manual</span>
          </div>
          <div className="ad-legend-item">
            <span className="ad-leg-icon">🏦</span>
            <div>
              <div className="ad-leg-method">Bank Transfer</div>
              <div className="ad-leg-desc">Auto-approved on booking confirmation</div>
            </div>
            <span className="ad-leg-badge auto">Auto ⚡</span>
          </div>
          <div className="ad-legend-item">
            <span className="ad-leg-icon">💳</span>
            <div>
              <div className="ad-leg-method">Online Payment</div>
              <div className="ad-leg-desc">Auto-approved on successful card processing</div>
            </div>
            <span className="ad-leg-badge auto">Auto ⚡</span>
          </div>
        </div>
      </div>
    </div>
  );
}
