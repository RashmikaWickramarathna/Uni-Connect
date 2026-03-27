// src/pages/Admin/AdminBookingsPage.jsx
// UniConnect – Admin Ticket Booking Management

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminBookingsPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const STATUS_STYLES = {
  confirmed: { bg: "#dcfce7", color: "#16a34a", label: "Confirmed" },
  pending:   { bg: "#fef9c3", color: "#ca8a04", label: "Pending"   },
  cancelled: { bg: "#fee2e2", color: "#dc2626", label: "Cancelled" },
  used:      { bg: "#e0e7ff", color: "#4338ca", label: "Used"      },
};

const METHOD_STYLES = {
  cash:          { bg: "#f0fdf4", color: "#15803d", label: "Cash",          icon: "💵" },
  bank_transfer: { bg: "#eff6ff", color: "#1d4ed8", label: "Bank Transfer", icon: "🏦" },
  online:        { bg: "#faf5ff", color: "#7c3aed", label: "Online",        icon: "💳" },
  not_required:  { bg: "#f8fafc", color: "#64748b", label: "Free",          icon: "🆓" },
};

export default function AdminBookingsPage() {
  const navigate = useNavigate();

  const [tickets, setTickets]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter]   = useState("all");
  const [methodFilter, setMethodFilter]   = useState("all");
  const [rejectModal, setRejectModal]     = useState(null); // ticket being rejected
  const [rejectReason, setRejectReason]   = useState("");
  const [stats, setStats]           = useState(null);

  const fetchTickets = () => {
    setLoading(true);
    setError("");
    fetch(`${API_BASE}/admin/bookings`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTickets(data);
          // compute stats
          setStats({
            total:     data.length,
            pending:   data.filter((t) => t.status === "pending").length,
            confirmed: data.filter((t) => t.status === "confirmed").length,
            cancelled: data.filter((t) => t.status === "cancelled").length,
            cash:      data.filter((t) => t.paymentMethod === "cash" && t.status === "pending").length,
          });
        } else {
          setError(data.message || "Failed to load bookings.");
        }
      })
      .catch(() => setError("Cannot connect to server."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const handleApprove = async (ticket) => {
    setActionLoading(ticket._id);
    try {
      const res = await fetch(`${API_BASE}/admin/bookings/${ticket._id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to approve");
      setTickets((prev) =>
        prev.map((t) => t._id === ticket._id ? { ...t, status: "confirmed", paymentStatus: "paid" } : t)
      );
      showSuccess(`✅ Ticket ${ticket.ticketNumber} approved successfully!`);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal._id);
    try {
      const res = await fetch(`${API_BASE}/admin/bookings/${rejectModal._id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason || "Rejected by admin" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reject");
      setTickets((prev) =>
        prev.map((t) => t._id === rejectModal._id ? { ...t, status: "cancelled" } : t)
      );
      showSuccess(`❌ Ticket ${rejectModal.ticketNumber} rejected.`);
      setRejectModal(null);
      setRejectReason("");
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-LK", {
      year: "numeric", month: "short", day: "numeric",
    });

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString("en-LK", { hour: "2-digit", minute: "2-digit" });

  const filtered = tickets.filter((t) => {
    const matchSearch =
      t.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      t.studentId?.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketNumber?.toLowerCase().includes(search.toLowerCase()) ||
      t.eventTitle?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchMethod = methodFilter === "all" || t.paymentMethod === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  });

  return (
    <div className="ab-page">

      {/* ── Header ── */}
      <div className="ab-header">
        <div className="ab-header-left">
          <button className="ab-back" onClick={() => navigate("/admin")}>← Admin</button>
          <div>
            <h1 className="ab-title">Ticket Bookings</h1>
            <p className="ab-sub">Approve or reject cash payment bookings</p>
          </div>
        </div>
        <button className="ab-refresh" onClick={fetchTickets}>🔄 Refresh</button>
      </div>

      {/* ── Success message ── */}
      {successMsg && (
        <div className="ab-success">{successMsg}</div>
      )}

      {/* ── Stats ── */}
      {stats && (
        <div className="ab-stats">
          {[
            { label: "Total Bookings", value: stats.total,     color: "#4361ee", icon: "🎟️" },
            { label: "Pending",        value: stats.pending,   color: "#ca8a04", icon: "⏳" },
            { label: "Confirmed",      value: stats.confirmed, color: "#16a34a", icon: "✅" },
            { label: "Cash Pending",   value: stats.cash,      color: "#dc2626", icon: "💵", highlight: true },
          ].map((s) => (
            <div className={`ab-stat-card ${s.highlight ? "highlight" : ""}`} key={s.label}>
              <div className="ab-stat-icon">{s.icon}</div>
              <div className="ab-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="ab-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Notice for auto-approval ── */}
      <div className="ab-auto-notice">
        <span>⚡</span>
        <div>
          <strong>Auto-Processing:</strong> Bank Transfer and Online payments are automatically approved or rejected upon booking.
          Only <strong>Cash</strong> payments require manual admin approval below.
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="ab-controls">
        <div className="ab-search-wrap">
          <span>🔍</span>
          <input
            className="ab-search"
            type="text"
            placeholder="Search by student, ticket number, event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="ab-filter-row">
          <select className="ab-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="used">Used</option>
          </select>
          <select className="ab-select" value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
            <option value="all">All Methods</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="online">Online</option>
          </select>
        </div>
      </div>

      {error && <div className="ab-error">⚠️ {error}</div>}

      {loading ? (
        <div className="ab-loading">
          <div className="ab-spinner" />
          <p>Loading bookings...</p>
        </div>
      ) : (
        <>
          <div className="ab-count">{filtered.length} booking{filtered.length !== 1 ? "s" : ""} found</div>

          {filtered.length === 0 ? (
            <div className="ab-empty">
              <div style={{ fontSize: "2.5rem" }}>📭</div>
              <h3>No bookings found</h3>
              <p>Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="ab-table-wrap">
              <table className="ab-table">
                <thead>
                  <tr>
                    <th>Ticket #</th>
                    <th>Student</th>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Type & Qty</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ticket) => {
                    const statusStyle = STATUS_STYLES[ticket.status] || STATUS_STYLES.pending;
                    const methodStyle = METHOD_STYLES[ticket.paymentMethod] || METHOD_STYLES.cash;
                    const isCashPending = ticket.paymentMethod === "cash" && ticket.status === "pending";
                    const isActing = actionLoading === ticket._id;

                    return (
                      <tr key={ticket._id} className={isCashPending ? "row-highlight" : ""}>
                        <td className="ab-ticket-num">{ticket.ticketNumber}</td>
                        <td>
                          <div className="ab-student-name">{ticket.studentName}</div>
                          <div className="ab-student-id">{ticket.studentId}</div>
                        </td>
                        <td className="ab-event-title">{ticket.eventTitle}</td>
                        <td className="ab-date">
                          {ticket.eventDate ? (
                            <>
                              <div>{formatDate(ticket.eventDate)}</div>
                              <div className="ab-time">{formatTime(ticket.eventDate)}</div>
                            </>
                          ) : "—"}
                        </td>
                        <td>
                          <div className="ab-type">{ticket.ticketType?.replace("_", " ")}</div>
                          <div className="ab-qty">× {ticket.quantity}</div>
                        </td>
                        <td className="ab-amount">
                          {ticket.totalAmount === 0 ? "Free" : `Rs. ${ticket.totalAmount?.toLocaleString()}`}
                        </td>
                        <td>
                          <span
                            className="ab-method-badge"
                            style={{ background: methodStyle.bg, color: methodStyle.color }}
                          >
                            {methodStyle.icon} {methodStyle.label}
                          </span>
                        </td>
                        <td>
                          <span
                            className="ab-status-badge"
                            style={{ background: statusStyle.bg, color: statusStyle.color }}
                          >
                            {statusStyle.label}
                          </span>
                        </td>
                        <td>
                          {isCashPending ? (
                            <div className="ab-action-btns">
                              <button
                                className="ab-approve-btn"
                                onClick={() => handleApprove(ticket)}
                                disabled={isActing}
                              >
                                {isActing ? "..." : "✅ Approve"}
                              </button>
                              <button
                                className="ab-reject-btn"
                                onClick={() => { setRejectModal(ticket); setRejectReason(""); }}
                                disabled={isActing}
                              >
                                ❌ Reject
                              </button>
                            </div>
                          ) : (
                            <span className="ab-no-action">
                              {ticket.status === "confirmed" ? "✅ Done" :
                               ticket.status === "cancelled" ? "❌ Rejected" :
                               ticket.paymentMethod !== "cash" ? "⚡ Auto" : "—"}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Reject Modal ── */}
      {rejectModal && (
        <div className="ab-modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="ab-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="ab-modal-title">Reject Booking</h3>
            <p className="ab-modal-sub">
              You are about to reject ticket <strong>{rejectModal.ticketNumber}</strong> for{" "}
              <strong>{rejectModal.studentName}</strong>.
            </p>
            <label className="ab-modal-label">Reason (optional)</label>
            <textarea
              className="ab-modal-textarea"
              placeholder="e.g. Payment not received at counter..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
            <div className="ab-modal-actions">
              <button className="ab-modal-cancel" onClick={() => setRejectModal(null)}>Cancel</button>
              <button
                className="ab-modal-confirm"
                onClick={handleReject}
                disabled={actionLoading === rejectModal._id}
              >
                {actionLoading === rejectModal._id ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
