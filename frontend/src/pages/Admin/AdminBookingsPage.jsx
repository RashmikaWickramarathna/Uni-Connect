import { useEffect, useState } from "react";

import AdminLayout from "../../components/AdminLayout";
import { humanizeTicketType } from "../../utils/ticketUtils";
import "./AdminBookingsPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const STATUS_STYLES = {
  confirmed: { bg: "#dcfce7", color: "#16a34a", label: "Confirmed" },
  pending: { bg: "#fef9c3", color: "#ca8a04", label: "Pending" },
  cancelled: { bg: "#fee2e2", color: "#dc2626", label: "Cancelled" },
  used: { bg: "#e0e7ff", color: "#4338ca", label: "Used" },
};

const METHOD_STYLES = {
  cash: { bg: "#f0fdf4", color: "#15803d", label: "Cash" },
  bank_transfer: { bg: "#eff6ff", color: "#1d4ed8", label: "Bank Transfer" },
  online: { bg: "#faf5ff", color: "#7c3aed", label: "Online" },
  not_required: { bg: "#f8fafc", color: "#64748b", label: "Free" },
};

export default function AdminBookingsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [stats, setStats] = useState(null);

  const fetchTickets = () => {
    setLoading(true);
    setError("");

    fetch(`${API_BASE}/admin/bookings`)
      .then((response) => response.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          setError(data.message || "Failed to load bookings.");
          return;
        }

        setTickets(data);
        setStats({
          total: data.length,
          pending: data.filter((ticket) => ticket.status === "pending").length,
          confirmed: data.filter((ticket) => ticket.status === "confirmed").length,
          cancelled: data.filter((ticket) => ticket.status === "cancelled").length,
          cash: data.filter((ticket) => ticket.paymentMethod === "cash" && ticket.status === "pending").length,
        });
      })
      .catch(() => setError("Cannot connect to server."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const showSuccess = (message) => {
    setSuccessMsg(message);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const handleApprove = async (ticket) => {
    setActionLoading(ticket._id);

    try {
      const response = await fetch(`${API_BASE}/admin/bookings/${ticket._id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to approve");
      }

      setTickets((current) =>
        current.map((item) =>
          item._id === ticket._id ? { ...item, status: "confirmed", paymentStatus: "paid" } : item
        )
      );
      showSuccess(`Ticket ${ticket.ticketNumber} approved successfully.`);
      fetchTickets();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;

    setActionLoading(rejectModal._id);

    try {
      const response = await fetch(`${API_BASE}/admin/bookings/${rejectModal._id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason || "Rejected by admin" }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reject");
      }

      setTickets((current) =>
        current.map((item) => (item._id === rejectModal._id ? { ...item, status: "cancelled" } : item))
      );
      showSuccess(`Ticket ${rejectModal.ticketNumber} rejected.`);
      setRejectModal(null);
      setRejectReason("");
      fetchTickets();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (value) =>
    new Date(value).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatTime = (value) =>
    new Date(value).toLocaleTimeString("en-LK", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const filteredTickets = tickets.filter((ticket) => {
    const searchValue = search.toLowerCase();
    const matchSearch =
      ticket.studentName?.toLowerCase().includes(searchValue) ||
      ticket.studentId?.toLowerCase().includes(searchValue) ||
      ticket.ticketNumber?.toLowerCase().includes(searchValue) ||
      ticket.eventTitle?.toLowerCase().includes(searchValue);
    const matchStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchMethod = methodFilter === "all" || ticket.paymentMethod === methodFilter;

    return matchSearch && matchStatus && matchMethod;
  });

  const getTicketName = (ticket) => ticket.ticketLabel || humanizeTicketType(ticket.ticketType);

  return (
    <AdminLayout
      title="Ticket Reservations"
      subtitle="Review ticket bookings and manually approve pending cash payments."
    >
      <div className="ab-page">
        <div className="ab-header">
          <div className="ab-header-left">
            <div>
              <h1 className="ab-title">Ticket Reservations</h1>
              <p className="ab-sub">Approve or reject cash payment bookings from the shared admin workspace.</p>
            </div>
          </div>
          <button className="ab-refresh" onClick={fetchTickets} type="button">
            Refresh
          </button>
        </div>

        {successMsg && <div className="ab-success">{successMsg}</div>}

        {stats && (
          <div className="ab-stats">
            {[
              { label: "Total Bookings", value: stats.total, color: "#4361ee", icon: "All" },
              { label: "Pending", value: stats.pending, color: "#ca8a04", icon: "Wait" },
              { label: "Confirmed", value: stats.confirmed, color: "#16a34a", icon: "Done" },
              { label: "Cash Pending", value: stats.cash, color: "#dc2626", icon: "Cash", highlight: true },
            ].map((stat) => (
              <div className={`ab-stat-card ${stat.highlight ? "highlight" : ""}`} key={stat.label}>
                <div className="ab-stat-icon">{stat.icon}</div>
                <div className="ab-stat-value" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="ab-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="ab-auto-notice">
          <span>Info</span>
          <div>
            <strong>Auto-processing:</strong> bank transfer and online payments are approved automatically after booking.
            Only <strong>cash</strong> payments require manual admin action here.
          </div>
        </div>

        <div className="ab-controls">
          <div className="ab-search-wrap">
            <span>Search</span>
            <input
              className="ab-search"
              type="text"
              placeholder="Search by student, ticket number, or event..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="ab-filter-row">
            <select className="ab-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="used">Used</option>
            </select>
            <select className="ab-select" value={methodFilter} onChange={(event) => setMethodFilter(event.target.value)}>
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="online">Online</option>
              <option value="not_required">Free</option>
            </select>
          </div>
        </div>

        {error && <div className="ab-error">{error}</div>}

        {loading ? (
          <div className="ab-loading">
            <div className="ab-spinner" />
            <p>Loading bookings...</p>
          </div>
        ) : (
          <>
            <div className="ab-count">
              {filteredTickets.length} booking{filteredTickets.length !== 1 ? "s" : ""} found
            </div>

            {filteredTickets.length === 0 ? (
              <div className="ab-empty">
                <div style={{ fontSize: "2rem" }}>No results</div>
                <h3>No bookings found</h3>
                <p>Try adjusting the filters or search term.</p>
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
                    {filteredTickets.map((ticket) => {
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
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>
                            <div className="ab-type">{getTicketName(ticket) || "-"}</div>
                            <div className="ab-qty">x {ticket.quantity}</div>
                          </td>
                          <td className="ab-amount">
                            {ticket.totalAmount === 0 ? "Free" : `Rs. ${ticket.totalAmount?.toLocaleString()}`}
                          </td>
                          <td>
                            <span
                              className="ab-method-badge"
                              style={{ background: methodStyle.bg, color: methodStyle.color }}
                            >
                              {methodStyle.label}
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
                                  type="button"
                                >
                                  {isActing ? "..." : "Approve"}
                                </button>
                                <button
                                  className="ab-reject-btn"
                                  onClick={() => {
                                    setRejectModal(ticket);
                                    setRejectReason("");
                                  }}
                                  disabled={isActing}
                                  type="button"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="ab-no-action">
                                {ticket.status === "confirmed"
                                  ? "Done"
                                  : ticket.status === "cancelled"
                                    ? "Rejected"
                                    : ticket.paymentMethod !== "cash"
                                      ? "Auto"
                                      : "-"}
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

        {rejectModal && (
          <div className="ab-modal-overlay" onClick={() => setRejectModal(null)}>
            <div className="ab-modal" onClick={(event) => event.stopPropagation()}>
              <h3 className="ab-modal-title">Reject Booking</h3>
              <p className="ab-modal-sub">
                You are about to reject ticket <strong>{rejectModal.ticketNumber}</strong> for{" "}
                <strong>{rejectModal.studentName}</strong>.
              </p>
              <label className="ab-modal-label">Reason (optional)</label>
              <textarea
                className="ab-modal-textarea"
                placeholder="Example: payment not received at counter."
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                rows={3}
              />
              <div className="ab-modal-actions">
                <button className="ab-modal-cancel" onClick={() => setRejectModal(null)} type="button">
                  Cancel
                </button>
                <button
                  className="ab-modal-confirm"
                  onClick={handleReject}
                  disabled={actionLoading === rejectModal._id}
                  type="button"
                >
                  {actionLoading === rejectModal._id ? "Rejecting..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
