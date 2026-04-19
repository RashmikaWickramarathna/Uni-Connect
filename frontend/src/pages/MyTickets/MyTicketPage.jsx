import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";

import TicketDownload from "./TicketDownload.jsx";
import { humanizeTicketType } from "../../utils/ticketUtils";
import "./MyTicketPage.css";

const STATUS_STYLES = {
  confirmed: { bg: "#dcfce7", color: "#16a34a", label: "Confirmed", icon: "✓" },
  pending: { bg: "#fef9c3", color: "#ca8a04", label: "Pending", icon: "⏳" },
  cancelled: { bg: "#fee2e2", color: "#dc2626", label: "Cancelled", icon: "✕" },
  used: { bg: "#e0e7ff", color: "#4338ca", label: "Used", icon: "🎫" },
};

const PAYMENT_STYLES = {
  paid: { bg: "#dcfce7", color: "#16a34a", label: "Paid" },
  pending: { bg: "#fef9c3", color: "#ca8a04", label: "Pending" },
  not_required: { bg: "#f1f5f9", color: "#64748b", label: "Free" },
  failed: { bg: "#fee2e2", color: "#dc2626", label: "Failed" },
};

function TicketQR({ ticketNumber }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && ticketNumber) {
      QRCode.toCanvas(canvasRef.current, ticketNumber, {
        width: 140,
        margin: 1,
        color: { dark: "#1e293b", light: "#ffffff" },
      });
    }
  }, [ticketNumber]);

  return <canvas ref={canvasRef} className="ticket-qr-canvas" />;
}

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [inputStudentId, setInputStudentId] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [showDownloadModal, setShowDownloadModal] = useState(null);
  const [credentials, setCredentials] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const fetchTickets = (sid, em) => {
    if (!sid.trim() || !em.trim()) return;

    setLoading(true);
    setError("");
    const encodedEmail = encodeURIComponent(em.trim());

    fetch(`${API_BASE}/tickets/verify/${sid.trim()}/${encodedEmail}`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTickets(data);
          if (data.length === 0) {
            setError("No tickets found for these credentials.");
          }
        } else {
          setError(data.message || "Failed to load tickets.");
        }
      })
      .catch(() => setError("Cannot connect to server."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (credentials && studentId && email) {
      fetchTickets(studentId, email);
    }
  }, [credentials, email, studentId]);

  const handleVerify = () => {
    if (!inputStudentId.trim() || !inputEmail.trim()) {
      setError("Student ID and Email both required");
      return;
    }

    setStudentId(inputStudentId.trim());
    setEmail(inputEmail.trim().toLowerCase());
    setCredentials(true);
    setError("");
  };

  const filteredTickets =
    filter === "all" ? tickets : tickets.filter((ticket) => ticket.status === filter);

  const formatDate = (value) =>
    new Date(value).toLocaleDateString("en-LK", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatTime = (value) =>
    new Date(value).toLocaleTimeString("en-LK", { hour: "2-digit", minute: "2-digit" });

  const getTicketName = (ticket) => ticket.ticketLabel || humanizeTicketType(ticket.ticketType);

  return (
    <div className="mt-page">
      <div className="mt-header">
        <button className="mt-back" onClick={() => navigate("/")}>
          ← Home
        </button>
        <div>
          <h1 className="mt-title">My Tickets</h1>
          <p className="mt-sub">View and manage your event bookings</p>
        </div>
      </div>

      <div className="mt-lookup">
        <div className="lookup-box" style={{ flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
            <span className="lookup-icon">🎓</span>
            <input
              className="lookup-input"
              type="text"
              placeholder="Student ID (e.g. it23711228)"
              value={inputStudentId}
              onChange={(event) => setInputStudentId(event.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
            <span className="lookup-icon" style={{ background: "none" }}>
              ✉
            </span>
            <input
              className="lookup-input"
              type="email"
              placeholder="Email (e.g. you@student.ac.lk)"
              value={inputEmail}
              onChange={(event) => setInputEmail(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleVerify()}
            />
          </div>
          <button className="lookup-btn" onClick={handleVerify} style={{ alignSelf: "stretch" }}>
            Verify & View Tickets
          </button>
        </div>
      </div>

      {tickets.length > 0 ? (
        <div className="mt-filters">
          {["all", "confirmed", "pending", "cancelled", "used"].map((status) => (
            <button
              key={status}
              className={`mt-filter-btn ${filter === status ? "active" : ""}`}
              onClick={() => setFilter(status)}
            >
              {STATUS_STYLES[status]?.icon || "📋"}{" "}
              {status === "all"
                ? `All (${tickets.length})`
                : `${STATUS_STYLES[status]?.label} (${tickets.filter((ticket) => ticket.status === status).length})`}
            </button>
          ))}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-loading">
          <div className="mt-spinner" />
          <p>Loading your tickets...</p>
        </div>
      ) : null}

      {error && !loading ? (
        <div className="mt-error">
          <span>⚠</span> {error}
        </div>
      ) : null}

      {!loading && filteredTickets.length > 0 ? (
        <div className="mt-list">
          {filteredTickets.map((ticket) => {
            const statusStyle = STATUS_STYLES[ticket.status] || STATUS_STYLES.pending;
            const paymentStyle = PAYMENT_STYLES[ticket.paymentStatus] || PAYMENT_STYLES.pending;
            const isExpanded = expanded === ticket._id;

            return (
              <div key={ticket._id} className={`mt-card ${isExpanded ? "expanded" : ""}`}>
                <div className="mt-card-strip" style={{ background: statusStyle.color }} />

                <div className="mt-card-body">
                  <div className="mt-card-qr">
                    <TicketQR ticketNumber={ticket.ticketNumber} />
                    <div className="mt-ticket-num">{ticket.ticketNumber}</div>
                  </div>

                  <div className="mt-card-divider">
                    <div className="divider-circle top" />
                    <div className="divider-line" />
                    <div className="divider-circle bottom" />
                  </div>

                  <div className="mt-card-details">
                    <div className="mt-card-top-row">
                      <div>
                        <h3 className="mt-event-title">{ticket.eventTitle}</h3>
                        <span
                          className="mt-status-badge"
                          style={{ background: statusStyle.bg, color: statusStyle.color }}
                        >
                          {statusStyle.icon} {statusStyle.label}
                        </span>
                      </div>
                      <div className="mt-card-actions">
                        <button
                          className="mt-download-btn"
                          onClick={(event) => {
                            event.stopPropagation();
                            setShowDownloadModal(ticket._id);
                          }}
                        >
                          Download Ticket
                        </button>
                        <button
                          className="mt-expand-btn"
                          onClick={() => setExpanded(isExpanded ? null : ticket._id)}
                        >
                          {isExpanded ? "Less" : "More"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-meta-grid">
                      <div className="mt-meta-item">
                        <span className="mt-meta-icon">📅</span>
                        <div>
                          <div className="mt-meta-label">Date & Time</div>
                          <div className="mt-meta-value">
                            {ticket.eventDate
                              ? `${formatDate(ticket.eventDate)} at ${formatTime(ticket.eventDate)}`
                              : "—"}
                          </div>
                        </div>
                      </div>
                      <div className="mt-meta-item">
                        <span className="mt-meta-icon">📍</span>
                        <div>
                          <div className="mt-meta-label">Venue</div>
                          <div className="mt-meta-value">{ticket.venue || "—"}</div>
                        </div>
                      </div>
                      <div className="mt-meta-item">
                        <span className="mt-meta-icon">🎟</span>
                        <div>
                          <div className="mt-meta-label">Ticket Type</div>
                          <div className="mt-meta-value">
                            {getTicketName(ticket)} × {ticket.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="mt-meta-item">
                        <span className="mt-meta-icon">💰</span>
                        <div>
                          <div className="mt-meta-label">Amount</div>
                          <div className="mt-meta-value">
                            {ticket.totalAmount === 0 ? "Free" : `Rs. ${ticket.totalAmount?.toLocaleString()}`}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-payment-row">
                      <span className="mt-payment-method">
                        💳 {String(ticket.paymentMethod || "").replaceAll("_", " ")}
                      </span>
                      <span
                        className="mt-payment-status"
                        style={{ background: paymentStyle.bg, color: paymentStyle.color }}
                      >
                        {paymentStyle.label}
                      </span>
                    </div>

                    {showDownloadModal ? (
                      <TicketDownload
                        ticket={tickets.find((item) => item._id === showDownloadModal)}
                        onClose={() => setShowDownloadModal(null)}
                      />
                    ) : null}

                    {isExpanded ? (
                      <div className="mt-expanded-section">
                        <div className="mt-expanded-grid">
                          {[
                            ["Student Name", ticket.studentName],
                            ["Student ID", ticket.studentId],
                            ["Email", ticket.email],
                            ["Phone", ticket.phone || "—"],
                            ["Faculty", ticket.faculty || "—"],
                            [
                              "Booked At",
                              ticket.bookedAt ? new Date(ticket.bookedAt).toLocaleString("en-LK") : "—",
                            ],
                          ].map(([label, value]) => (
                            <div className="mt-exp-row" key={label}>
                              <span className="mt-exp-label">{label}</span>
                              <span className="mt-exp-value">{value}</span>
                            </div>
                          ))}
                        </div>

                        {ticket.status === "pending" && ticket.paymentMethod === "cash" ? (
                          <div className="mt-pending-notice">
                            Your cash payment is pending admin approval. Please pay at the event counter.
                          </div>
                        ) : null}

                        {ticket.status === "pending" && ticket.paymentMethod === "bank_transfer" ? (
                          <div className="mt-pending-notice info">
                            Your bank transfer is being verified. This usually takes a few minutes.
                          </div>
                        ) : null}

                        {ticket.status === "confirmed" ? (
                          <div className="mt-confirmed-notice">
                            Your booking is confirmed. Show the QR code at the event entrance.
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {!loading && !error && tickets.length === 0 && studentId ? (
        <div className="mt-empty">
          <div className="mt-empty-icon">🎫</div>
          <h3>No tickets yet</h3>
          <p>You haven't booked any event tickets yet.</p>
          <button className="mt-browse-btn" onClick={() => navigate("/events")}>
            Browse Events →
          </button>
        </div>
      ) : null}

      {!credentials && !loading ? (
        <div className="mt-empty">
          <div className="mt-empty-icon">🔐</div>
          <h3>Verify Your Identity</h3>
          <p>Enter your Student ID and Email used during booking to view your tickets securely.</p>
        </div>
      ) : null}
    </div>
  );
}
