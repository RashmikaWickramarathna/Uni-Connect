import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AdminLayout from "../../components/AdminLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import { paymentAPI } from "../../services/api";

const STATUS_STYLES = {
  completed: { bg: "#dcfce7", color: "#166534", label: "Completed" },
  pending: { bg: "#fef3c7", color: "#92400e", label: "Pending" },
  failed: { bg: "#fee2e2", color: "#991b1b", label: "Failed" },
  refunded: { bg: "#e0e7ff", color: "#3730a3", label: "Refunded" },
};

const METHOD_LABELS = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  online: "Online",
  other: "Other",
};

const TYPE_LABELS = {
  ticket_booking: "Ticket Booking",
  shop_rent: "Shop Rent",
  license_fee: "License Fee",
  penalty: "Penalty",
  property_tax: "Property Tax",
  other: "Other",
};

function SmallStatCard({ label, value, color, icon }) {
  return (
    <div className="small-stat-card">
      <div className="small-accent" style={{ background: color }} />
      <div className="small-body">
        <div className="small-icon" style={{ background: color }}>
          {icon}
        </div>
        <div className="small-text">
          <div className="small-value">{value}</div>
          <div className="small-label">{label}</div>
        </div>
      </div>
    </div>
  );
}

function getGroupedValue(items, key) {
  return items.find((item) => item._id === key) || { count: 0, totalAmount: 0 };
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toLocaleString()}`;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ byStatus: [], byType: [], monthlyRevenue: [] });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmingId, setConfirmingId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const params = { page, limit: 20 };
      if (statusFilter !== "all") params.status = statusFilter;
      if (typeFilter !== "all") params.paymentType = typeFilter;

      const [paymentResponse, statsResponse] = await Promise.all([
        paymentAPI.getAll(params),
        paymentAPI.getStats(),
      ]);

      setPayments(paymentResponse.payments || []);
      setPagination(paymentResponse.pagination || { total: 0, page: 1, pages: 1 });
      setStats(statsResponse || { byStatus: [], byType: [], monthlyRevenue: [] });
    } catch (loadError) {
      setError(loadError.message || "Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [page, statusFilter, typeFilter]);

  const handleConfirm = async (payment) => {
    setConfirmingId(payment._id);
    setError("");

    try {
      await paymentAPI.confirmPayment(payment._id, {
        notes: "Confirmed from the admin payments view",
      });
      setSuccess(`Payment ${payment.receiptNumber || payment._id} marked as completed.`);
      await loadPayments();
    } catch (requestError) {
      setError(requestError.message || "Failed to confirm payment.");
    } finally {
      setConfirmingId("");
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const searchValue = search.toLowerCase().trim();
    if (!searchValue) return true;

    return [
      payment.receiptNumber,
      payment.applicantName,
      payment.studentId,
      payment.eventName,
      payment.metadata?.description,
      payment.email,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(searchValue));
  });

  const completedSummary = getGroupedValue(stats.byStatus, "completed");
  const pendingSummary = getGroupedValue(stats.byStatus, "pending");
  const failedSummary = getGroupedValue(stats.byStatus, "failed");
  const ticketSummary = getGroupedValue(stats.byType, "ticket_booking");

  return (
    <AdminLayout
      title="Payments"
      subtitle="Track all recorded payments, review pending items, and confirm transactions."
    >
      <div className="page-header split">
        <div>
          <h2>Payments</h2>
          <p>All payment records created for bookings and other admin-managed transactions.</p>
        </div>
        <div className="page-actions">
          <button className="btn" type="button" onClick={loadPayments}>
            Refresh
          </button>
          <Link className="btn" to="/admin/bookings">
            Open Ticket Reservations
          </Link>
        </div>
      </div>

      {success && (
        <div className="error-banner" style={{ background: "#f0fdf4", borderColor: "#bbf7d0", color: "#166534" }}>
          <div className="error-text">{success}</div>
          <div className="error-actions">
            <button className="btn small" type="button" onClick={() => setSuccess("")}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="error-banner">
          <div className="error-text">{error}</div>
          <div className="error-actions">
            <button className="btn small" type="button" onClick={() => setError("")}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="empty-state-panel">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div className="small-cards-grid">
            <SmallStatCard label="Recorded" value={pagination.total} color="#2563eb" icon="All" />
            <SmallStatCard label="Completed" value={completedSummary.count} color="#10b981" icon="Done" />
            <SmallStatCard label="Pending" value={pendingSummary.count} color="#f59e0b" icon="Wait" />
            <SmallStatCard label="Revenue" value={formatCurrency(completedSummary.totalAmount)} color="#0f766e" icon="LKR" />
            <SmallStatCard label="Ticket Payments" value={ticketSummary.count} color="#7c3aed" icon="Tix" />
            <SmallStatCard label="Failed" value={failedSummary.count} color="#ef4444" icon="Fail" />
          </div>

          <div className="dashboard-summary-card payment-summary-card">
            <div className="summary-copy payment-summary-copy">
              <h3>Payment Operations</h3>
              <p>
                Pending cash ticket payments can be confirmed here or from{" "}
                <Link className="inline-link" to="/admin/bookings">
                  Ticket Reservations
                </Link>
                . Use filters to narrow down the admin list quickly.
              </p>
            </div>
            <div className="summary-stats payment-summary-stats">
              <div className="summary-stat">
                <div className="summary-value">{pendingSummary.count}</div>
                <div className="summary-label">Pending</div>
              </div>
              <div className="summary-stat">
                <div className="summary-value">{stats.monthlyRevenue?.[0]?.count || 0}</div>
                <div className="summary-label">This Period</div>
              </div>
              <div className="summary-stat">
                <div className="summary-value">{formatCurrency(stats.monthlyRevenue?.[0]?.revenue || 0)}</div>
                <div className="summary-label">Latest Revenue</div>
              </div>
            </div>
          </div>

          <div className="search-filter-row">
            <input
              className="search-input"
              type="text"
              placeholder="Search by receipt, student, event, or email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              className="filter-select"
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Types</option>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="empty-state-panel">No payments matched the current filters.</div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Receipt</th>
                    <th>Student</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => {
                    const statusStyle = STATUS_STYLES[payment.status] || STATUS_STYLES.pending;
                    const methodLabel = METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod || "Unknown";
                    const description =
                      payment.metadata?.description ||
                      payment.eventName ||
                      TYPE_LABELS[payment.paymentType] ||
                      "Payment";

                    return (
                      <tr key={payment._id}>
                        <td>
                          <strong>{payment.receiptNumber || "-"}</strong>
                          <div className="date-badge" style={{ marginTop: "0.55rem", display: "inline-flex" }}>
                            {TYPE_LABELS[payment.paymentType] || payment.paymentType}
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{payment.applicantName || "Unknown Student"}</strong>
                          </div>
                          <div className="table-secondary-text">{payment.studentId || "-"}</div>
                          <div className="table-tertiary-text">{payment.email || "-"}</div>
                        </td>
                        <td>
                          <div>{description}</div>
                          <div className="table-secondary-text">
                            {payment.eventId?.title || payment.eventName || "No linked event"}
                          </div>
                        </td>
                        <td>{formatDate(payment.paymentDate)}</td>
                        <td>{methodLabel}</td>
                        <td>
                          <strong>{formatCurrency(payment.amountPaid || payment.amount)}</strong>
                        </td>
                        <td>
                          <span
                            className="badge"
                            style={{ background: statusStyle.bg, color: statusStyle.color }}
                          >
                            {statusStyle.label}
                          </span>
                        </td>
                        <td>
                          {payment.status === "pending" ? (
                            <button
                              className="btn primary small"
                              type="button"
                              onClick={() => handleConfirm(payment)}
                              disabled={confirmingId === payment._id}
                            >
                              {confirmingId === payment._id ? "Confirming..." : "Mark Completed"}
                            </button>
                          ) : (
                            <span className="table-status-text">
                              {payment.status === "completed" ? "Settled" : "No action"}
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

          {pagination.pages > 1 && (
            <div className="page-actions" style={{ marginTop: "1rem", justifyContent: "space-between" }}>
              <div className="pagination-note">
                Page {pagination.page} of {pagination.pages}
              </div>
              <div className="actions">
                <button className="btn small" type="button" onClick={() => setPage((current) => current - 1)} disabled={page <= 1}>
                  Previous
                </button>
                <button
                  className="btn small"
                  type="button"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={page >= pagination.pages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
