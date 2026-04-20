import React, { useState } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const normalizeStatus = (status) => {
  if (status === "published") return "approved";
  if (status === "draft") return "pending";
  return status || "pending";
};

const safeText = (value) => String(value ?? "");

export default function AdminCalendar({ events }) {
  const today = new Date();
  const [cur, setCur] = useState({ month: today.getMonth(), year: today.getFullYear() });
  const [sel, setSel] = useState(null);
  const { month, year } = cur;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const eventMap = {};
  events.forEach((event) => {
    if (!event.date) return;
    if (!eventMap[event.date]) eventMap[event.date] = [];
    eventMap[event.date].push(event);
  });

  const cells = [];
  for (let i = 0; i < firstDay; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);

  const getKey = (day) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const dotColor = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === "approved") return "#16a34a";
    if (normalized === "rejected") return "#dc2626";
    if (normalized === "cancelled") return "#64748b";
    return "#d97706";
  };

  const selectedEvents = sel ? eventMap[sel] || [] : [];
  const formatTime = (time) => {
    if (!time) return "";
    const [hour, minute] = time.split(":");
    return `${hour % 12 || 12}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px", alignItems: "start" }}>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "18px", padding: "24px", boxShadow: "0 10px 24px rgba(15,23,42,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>All Events Calendar</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              style={navButtonStyle}
              onClick={() =>
                setCur((current) => {
                  const nextDate = new Date(current.year, current.month - 1);
                  return { month: nextDate.getMonth(), year: nextDate.getFullYear() };
                })
              }
            >
              &#8249;
            </button>
            <span style={{ fontWeight: 700, fontSize: "14px", minWidth: "130px", textAlign: "center", color: "#0f172a" }}>
              {MONTHS[month]} {year}
            </span>
            <button
              style={navButtonStyle}
              onClick={() =>
                setCur((current) => {
                  const nextDate = new Date(current.year, current.month + 1);
                  return { month: nextDate.getMonth(), year: nextDate.getFullYear() };
                })
              }
            >
              &#8250;
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "4px", marginBottom: "6px" }}>
          {DAYS.map((day) => (
            <div key={day} style={{ textAlign: "center", fontSize: "11px", fontWeight: 700, color: "#94a3b8", padding: "4px 0" }}>
              {day}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "4px" }}>
          {cells.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} />;

            const key = getKey(day);
            const dayEvents = eventMap[key] || [];
            const isToday = key === todayStr;
            const hasEvents = dayEvents.length > 0;
            const isSelected = sel === key;

            return (
              <div
                key={key}
                onClick={() => setSel(isSelected ? null : key)}
                style={{
                  minHeight: "50px",
                  padding: "6px 4px",
                  borderRadius: "8px",
                  textAlign: "center",
                  cursor: hasEvents ? "pointer" : "default",
                  background: isSelected ? "#eff6ff" : hasEvents ? "#f0fdf4" : isToday ? "#f8fafc" : "transparent",
                  border: isSelected ? "2px solid #2563eb" : isToday ? "2px solid #2563eb" : hasEvents ? "1px solid #86efac" : "1px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: isToday ? 800 : hasEvents ? 700 : 400,
                    color: isToday ? "#2563eb" : hasEvents ? "#16a34a" : "#374151",
                    display: "block",
                  }}
                >
                  {day}
                </span>
                {hasEvents ? (
                  <div style={{ display: "flex", justifyContent: "center", gap: "2px", marginTop: "4px", flexWrap: "wrap" }}>
                    {dayEvents.slice(0, 3).map((event, dotIndex) => (
                      <div
                        key={dotIndex}
                        style={{ width: "6px", height: "6px", borderRadius: "50%", background: dotColor(event.status) }}
                      />
                    ))}
                    {dayEvents.length > 3 ? <span style={{ fontSize: "9px", color: "#94a3b8" }}>+{dayEvents.length - 3}</span> : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: "16px", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #f1f5f9", justifyContent: "flex-end" }}>
          {[
            ["#d97706", "Pending"],
            ["#16a34a", "Approved"],
            ["#dc2626", "Rejected"],
            ["#64748b", "Cancelled"],
          ].map(([color, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#64748b" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "18px", padding: "20px", boxShadow: "0 10px 24px rgba(15,23,42,0.06)", minHeight: "280px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 800, marginBottom: "4px", color: "#0f172a" }}>
          {sel ? `Events on ${sel}` : "Select a Date"}
        </h3>
        <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "16px" }}>
          {sel ? `${selectedEvents.length} event(s)` : "Click a highlighted date"}
        </p>

        {!sel ? <p style={{ fontSize: "13px", color: "#cbd5e1", textAlign: "center", paddingTop: "30px" }}>No date selected</p> : null}
        {sel && selectedEvents.length === 0 ? <p style={{ fontSize: "13px", color: "#94a3b8", textAlign: "center", paddingTop: "20px" }}>No events on this date</p> : null}

        {selectedEvents.map((event, index) => {
          const normalizedStatus = normalizeStatus(event.status);
          const statusColor =
            normalizedStatus === "approved"
              ? "#16a34a"
              : normalizedStatus === "rejected"
                ? "#dc2626"
                : normalizedStatus === "cancelled"
                  ? "#64748b"
                  : "#d97706";

          return (
            <div
              key={event._id || index}
              style={{
                borderLeft: `3px solid ${statusColor}`,
                paddingLeft: "12px",
                marginBottom: "14px",
                paddingBottom: "14px",
                borderBottom: index < selectedEvents.length - 1 ? "1px solid #f1f5f9" : "none",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a", marginBottom: "2px" }}>
                {safeText(event.title).trim() || "Untitled Event"}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "2px" }}>
                {formatTime(event.time)} {formatTime(event.time) ? "-" : ""} {safeText(event.venue).trim() || "TBA"}
              </div>
              <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "6px" }}>
                {safeText(event.organizer).trim() || "Unknown Society"}
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: statusColor,
                  background: `${statusColor}15`,
                  padding: "2px 10px",
                  borderRadius: "20px",
                }}
              >
                {normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const navButtonStyle = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  color: "#374151",
  cursor: "pointer",
  width: "30px",
  height: "30px",
  fontSize: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
