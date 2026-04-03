// src/pages/PaymentHistory/PaymentHistoryPage.jsx
// UniConnect – Student Payment History

import { useState, useEffect } from "react";
import "./PaymentHistoryPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const STATUS_MAP = {
  completed: { label: "Completed", bg: "#dcfce7", color: "#16a34a" },
  pending:   { label: "Pending",   bg: "#fef9c3", color: "#ca8a04" },
  failed:    { label: "Failed",    bg: "#fee2e2", color: "#dc2626" },
  refunded:  { label: "Refunded",  bg: "#e0e7ff", color: "#4361ee" },
};

export default function PaymentHistoryPage() {
  const studentId = localStorage.getItem("studentId") || "SC/2021/001";

  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [filter, setFilter]     = useState("all");

  useEffect(() => {
    fetch(`${API_BASE}/payments/history/${studentId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPayments(data);
        } else {
          setError(data.message || "Failed to load payments.");
        }
      })
      .catch(() => setError("Cannot connect to server."))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all" ? payments : payments.filter((p) => p.status === filter);

  const totalSpent = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + (p.amountPaid || 0), 0);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-LK", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="ph-loading">
        <div className="ph-spinner" />
        <p>Fetching payment records...</p>
      </div>
    );
  }

  return (
    <div className="ph-page">
      <div className="ph-header">
        <div>
          <h1 className="ph-title">Payment History</h1>
          <p className="ph-sub">All transactions linked to your student account.</p>
        </div>
        <div className="ph-total-card">
          <div className="ph-total-label">Total Spent</div>
          <div className="ph-total-value">Rs. {totalSpent.toLocaleString()}</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="ph-stats">
        {Object.entries(STATUS_MAP).map(([key, val]) => (
          <div key={key} className="ph-stat-card" style={{ borderColor: val.color + "44" }}>
            <div className="ph-stat-num" style={{ color: val.color }}>
              {payments.filter((p) => p.status === key).length}
            </div>
            <div className="ph-stat-label">{val.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="ph-filters">
        {["all", "completed", "pending", "failed", "refunded"].map((f) => (
          <button
            key={f}
            className={`ph-filter-btn ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f === "all"
              ? `All (${payments.length})`
              : `${STATUS_MAP[f]?.label} (${payments.filter((p) => p.status === f).length})`}
          </button>
        ))}
      </div>

      {error && <div className="ph-error">{error}</div>}

      {filtered.length === 0 ? (
        <div className="ph-empty">
          <div className="ph-empty-icon">💳</div>
          <h3>No payments found</h3>
          <p>{filter === "all" ? "You have no payment records yet." : `No ${filter} payments.`}</p>
        </div>
      ) : (
        <div className="ph-table-wrap">
          <table className="ph-table">
            <thead>
              <tr>
                <th>Receipt No.</th>
                <th>Description</th>
                <th>Type</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const statusStyle = STATUS_MAP[p.status] || STATUS_MAP.pending;
                return (
                  <tr key={p._id}>
                    <td className="ph-receipt">{p.receiptNumber || "—"}</td>
                    <td className="ph-desc">
                      {p.metadata?.description || p.eventName || p.paymentType?.replace("_", " ") || "Payment"}
                    </td>
                    <td className="ph-type">{p.paymentType?.replace("_", " ")}</td>
                    <td className="ph-date">{formatDate(p.paymentDate)}</td>
                    <td className="ph-amount">
                      {p.amountPaid === 0 ? "Free" : `Rs. ${p.amountPaid?.toLocaleString()}`}
                    </td>
                    <td>
                      <span
                        className="ph-status"
                        style={{ background: statusStyle.bg, color: statusStyle.color }}
                      >
                        {statusStyle.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
