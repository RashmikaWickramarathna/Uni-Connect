import React from "react";

import { getImageUrl } from "../../api/adminEventsApi";
import { formatTicketLabel, formatTicketPrice } from "../../utils/ticketUtils";

const CATEGORY_COLORS = {
  Academic: "#2563eb",
  Sports: "#16a34a",
  Cultural: "#d97706",
  Social: "#db2777",
  Workshop: "#7c3aed",
  Other: "#64748b",
};

const STATUS_CONFIG = {
  pending: { color: "#d97706", bg: "#fffbeb", border: "#fcd34d", label: "Pending" },
  approved: { color: "#16a34a", bg: "#f0fdf4", border: "#86efac", label: "Approved" },
  rejected: { color: "#dc2626", bg: "#fef2f2", border: "#fca5a5", label: "Rejected" },
  cancelled: { color: "#64748b", bg: "#f8fafc", border: "#cbd5e1", label: "Cancelled" },
};

const buttonStyle = (bg, color, border) => ({
  padding: "8px 12px",
  background: bg,
  border: `1px solid ${border}`,
  borderRadius: "10px",
  color,
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 600,
  textAlign: "center",
});

export default function AdminEventCard({ event, onApprove, onReject, onDelete, onEdit }) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const status = STATUS_CONFIG[event.status] || STATUS_CONFIG.pending;
  const categoryColor = CATEGORY_COLORS[event.category] || "#64748b";
  const imageUrl = getImageUrl(event.image);
  const showImage = Boolean(imageUrl) && !imageFailed;
  const organizer = event.organizer || "Unknown Society";
  const organizerEmail = event.organizerEmail || "No email available";
  const venue = event.venue || "TBA";
  const category = event.category || "Other";
  const maxParticipants = event.maxParticipants || 100;
  const ticketOptions = Array.isArray(event.tickets) ? event.tickets : [];
  const minPrice = ticketOptions.length
    ? Math.min(...ticketOptions.map((ticket) => Number(ticket?.price) || 0))
    : null;
  const title = event.title || "Untitled Event";
  const description = event.description || "No description provided.";

  const formatDate = (date) => {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    return `${hour % 12 || 12}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
  };

  const formatDateTime = (value) =>
    value
      ? new Date(value).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  const daysUntil = (() => {
    if (!event.date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((new Date(`${event.date}T00:00:00`) - today) / (1000 * 60 * 60 * 24));
  })();
  const imageFrame = {
    position: "relative",
    height: "180px",
    padding: "12px",
    background: "var(--app-surface-muted)",
    borderBottom: "1px solid var(--admin-border)",
  };
  const imageStyle = {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
  };

  React.useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <div
      style={{
        background: "var(--admin-card)",
        border: "1px solid var(--admin-border)",
        borderRadius: "18px",
        marginBottom: "16px",
        overflow: "hidden",
        boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
        borderLeft: `4px solid ${categoryColor}`,
        transition: "box-shadow 0.2s ease",
      }}
      onMouseEnter={(eventNode) => {
        eventNode.currentTarget.style.boxShadow = "0 18px 34px rgba(15,23,42,0.10)";
      }}
      onMouseLeave={(eventNode) => {
        eventNode.currentTarget.style.boxShadow = "0 10px 24px rgba(15,23,42,0.06)";
      }}
    >
      {showImage ? (
        <div style={imageFrame}>
          <img src={imageUrl} alt={title} style={imageStyle} onError={() => setImageFailed(true)} />
          <span
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              background: categoryColor,
              color: "#fff",
              padding: "3px 12px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: 700,
            }}
          >
            {category}
          </span>
        </div>
      ) : null}

      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "280px" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap", alignItems: "center" }}>
              {!showImage ? (
                <span
                  style={{
                    background: `${categoryColor}15`,
                    color: categoryColor,
                    padding: "3px 12px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {category}
                </span>
              ) : null}
              <span
                style={{
                  background: status.bg,
                  color: status.color,
                  border: `1px solid ${status.border}`,
                  padding: "3px 12px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                {status.label}
              </span>
              {daysUntil !== null && daysUntil >= 0 && daysUntil <= 7 ? (
                <span
                  style={{
                    background: "#fef3c7",
                    color: "#d97706",
                    border: "1px solid #fcd34d",
                    padding: "3px 10px",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `In ${daysUntil} days`}
                </span>
              ) : null}
            </div>

            <h3
              style={{
                fontSize: "17px",
                fontWeight: 700,
                color: "var(--admin-heading, var(--admin-text))",
                marginBottom: "4px",
              }}
            >
              {title}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--admin-muted)", marginBottom: "10px", lineHeight: 1.6 }}>
              {description}
            </p>

            <div
              style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
                fontSize: "13px",
                color: "var(--admin-muted)",
                marginBottom: "10px",
              }}
            >
              <span><strong style={{ color: "var(--admin-heading, var(--admin-text))" }}>Date:</strong> {formatDate(event.date)}</span>
              <span><strong style={{ color: "var(--admin-heading, var(--admin-text))" }}>Time:</strong> {formatTime(event.time)}</span>
              <span><strong style={{ color: "var(--admin-heading, var(--admin-text))" }}>Venue:</strong> {venue}</span>
              <span><strong style={{ color: "var(--admin-heading, var(--admin-text))" }}>Max:</strong> {maxParticipants}</span>
              {minPrice !== null ? (
                <span>
                  <strong style={{ color: "var(--admin-heading, var(--admin-text))" }}>Ticket Price:</strong>{" "}
                  {minPrice === 0 ? "Free" : `From ${formatTicketPrice(minPrice)}`}
                </span>
              ) : null}
              {event.views > 0 ? <span><strong style={{ color: "var(--admin-heading, var(--admin-text))" }}>Views:</strong> {event.views}</span> : null}
            </div>

            {ticketOptions.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginBottom: "10px",
                }}
              >
                {ticketOptions.map((ticket, index) => (
                  <span
                    key={`${ticket.type}-${index}`}
                    style={{
                      background: "var(--app-surface-elevated)",
                      color: "var(--admin-primary)",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    {formatTicketLabel(ticket, index)} • {formatTicketPrice(ticket.price)} • {ticket.totalSeats} seats
                  </span>
                ))}
              </div>
            ) : null}

            <div
              style={{
                background: "var(--app-surface-muted)",
                border: "1px solid var(--admin-border)",
                borderRadius: "12px",
                padding: "10px 14px",
                fontSize: "13px",
                color: "var(--admin-text)",
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <span><strong style={{ color: "var(--admin-heading, var(--admin-text))" }}>Society:</strong> {organizer}</span>
              <span><strong style={{ color: "var(--admin-heading, var(--admin-text))" }}>Email:</strong> {organizerEmail}</span>
              <span><strong style={{ color: "var(--admin-heading, var(--admin-text))" }}>Submitted:</strong> {formatDateTime(event.createdAt)}</span>
            </div>

            {event.tags && event.tags.length > 0 ? (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                {event.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      background: "var(--app-surface-elevated)",
                      color: "var(--admin-muted)",
                      padding: "2px 10px",
                      borderRadius: "20px",
                      fontSize: "11px",
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}

            {event.status === "rejected" && event.adminReason ? (
              <div
                style={{
                  marginTop: "10px",
                  background: "#fef2f2",
                  border: "1px solid #fca5a5",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "13px",
                }}
              >
                <strong style={{ color: "#b91c1c" }}>Rejection Reason:</strong>
                <span style={{ color: "#dc2626", marginLeft: "8px" }}>{event.adminReason}</span>
                {event.adminActionAt ? (
                  <span style={{ color: "var(--admin-muted)", fontSize: "11px", marginLeft: "10px" }}>
                    - {formatDateTime(event.adminActionAt)}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "110px" }}>
            {event.status !== "approved" ? (
              <button onClick={() => onApprove(event._id)} style={buttonStyle("#f0fdf4", "#16a34a", "#86efac")}>
                Approve
              </button>
            ) : null}
            {event.status !== "rejected" ? (
              <button onClick={() => onReject(event)} style={buttonStyle("#fffbeb", "#d97706", "#fcd34d")}>
                Reject
              </button>
            ) : null}
            <button
              onClick={() => onEdit(event)}
              style={buttonStyle("var(--app-surface-elevated)", "var(--admin-heading, var(--admin-text))", "var(--admin-border)")}
            >
              Edit
            </button>
            <button onClick={() => onDelete(event)} style={buttonStyle("#fef2f2", "#dc2626", "#fca5a5")}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
