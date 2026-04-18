import React from "react";

import { getImageUrl } from "../../api/adminEventsApi";

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
  const status = STATUS_CONFIG[event.status] || STATUS_CONFIG.pending;
  const categoryColor = CATEGORY_COLORS[event.category] || "#64748b";
  const imageUrl = getImageUrl(event.image);
  const organizer = event.organizer || "Unknown Society";
  const organizerEmail = event.organizerEmail || "No email available";
  const venue = event.venue || "TBA";
  const category = event.category || "Other";
  const maxParticipants = event.maxParticipants || 100;
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

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
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
      {imageUrl ? (
        <div style={{ position: "relative" }}>
          <img
            src={imageUrl}
            alt={title}
            style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
          />
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
              {!imageUrl ? (
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

            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
              {title}
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "10px", lineHeight: 1.6 }}>
              {description}
            </p>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "13px", color: "#94a3b8", marginBottom: "10px" }}>
              <span><strong style={{ color: "#374151" }}>Date:</strong> {formatDate(event.date)}</span>
              <span><strong style={{ color: "#374151" }}>Time:</strong> {formatTime(event.time)}</span>
              <span><strong style={{ color: "#374151" }}>Venue:</strong> {venue}</span>
              <span><strong style={{ color: "#374151" }}>Max:</strong> {maxParticipants}</span>
              {event.views > 0 ? <span><strong style={{ color: "#374151" }}>Views:</strong> {event.views}</span> : null}
            </div>

            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "10px 14px",
                fontSize: "13px",
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <span><strong style={{ color: "#374151" }}>Society:</strong> {organizer}</span>
              <span><strong style={{ color: "#374151" }}>Email:</strong> {organizerEmail}</span>
              <span><strong style={{ color: "#374151" }}>Submitted:</strong> {formatDateTime(event.createdAt)}</span>
            </div>

            {event.tags && event.tags.length > 0 ? (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                {event.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      background: "#f1f5f9",
                      color: "#64748b",
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
                  <span style={{ color: "#94a3b8", fontSize: "11px", marginLeft: "10px" }}>
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
            <button onClick={() => onEdit(event)} style={buttonStyle("#f8fafc", "#374151", "#e2e8f0")}>
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
