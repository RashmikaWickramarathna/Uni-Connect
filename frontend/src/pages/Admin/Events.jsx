import React, { useEffect, useState } from "react";

import AdminLayout from "../../components/AdminLayout";
import {
  approveEvent,
  deleteEvent,
  getAllEvents,
  rejectEvent,
} from "../../api/adminEventsApi";
import AdminCalendar from "../../components/adminEvents/AdminCalendar";
import AdminEventCard from "../../components/adminEvents/AdminEventCard";
import Analytics from "../../components/adminEvents/Analytics";
import ReasonModal from "../../components/adminEvents/ReasonModal";
import Reminders from "../../components/adminEvents/Reminders";
import "../../styles/adminEvents.css";

const safeText = (value) => String(value ?? "");

const normalizeStatus = (status) => {
  const normalized = safeText(status).toLowerCase();
  if (normalized === "published") return "approved";
  if (normalized === "draft") return "pending";
  return normalized || "pending";
};

const normalizeEvent = (event) => ({
  ...event,
  title: safeText(event?.title).trim() || "Untitled Event",
  description: safeText(event?.description),
  organizer: safeText(event?.organizer).trim() || "Unknown Society",
  organizerEmail: safeText(event?.organizerEmail).trim().toLowerCase(),
  venue: safeText(event?.venue).trim() || "TBA",
  category: safeText(event?.category).trim() || "Other",
  date: safeText(event?.date),
  time: safeText(event?.time),
  status: normalizeStatus(event?.status),
  maxParticipants: Number(event?.maxParticipants) > 0 ? Number(event.maxParticipants) : 100,
  tags: Array.isArray(event?.tags) ? event.tags : [],
  views: Number.isFinite(Number(event?.views)) ? Number(event.views) : 0,
});

const TABS = [
  { key: "dashboard", label: "Overview" },
  { key: "analytics", label: "Analytics" },
  { key: "reminders", label: "Reminders" },
  { key: "calendar", label: "Calendar" },
];

function StatCard({ active, accent, soft, label, note, short, value, onClick }) {
  return (
    <article
      className={`events-stat-card${active ? " is-active" : ""}`}
      style={{ "--stat-accent": accent, "--stat-soft": soft }}
      onClick={onClick}
    >
      <div className="events-stat-card-header">
        <span className="events-stat-icon">{short}</span>
        <div className="events-stat-value">{value}</div>
      </div>
      <div className="events-stat-label">{label}</div>
      <div className="events-stat-note">{note}</div>
    </article>
  );
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ msg: message, type });
    window.setTimeout(() => setToast(null), 4000);
  };

  const fetchEvents = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await getAllEvents();
      setEvents((response.data || []).map(normalizeEvent));
    } catch {
      showToast("Failed to load events.", "error");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    const handleFocus = () => {
      fetchEvents(false);
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const handleApprove = async (id) => {
    try {
      const response = await approveEvent(id);
      setEvents((previous) =>
        previous.map((event) => (event._id === id ? normalizeEvent(response.data) : event))
      );
      showToast("Event approved and the society has been notified.");
    } catch (error) {
      showToast(error.response?.data?.errors?.[0] || "Failed to approve the event.", "error");
    }
  };

  const handleRejectConfirm = async (reason) => {
    try {
      const response = await rejectEvent(rejectModal._id, reason);
      setEvents((previous) =>
        previous.map((event) =>
          event._id === rejectModal._id ? normalizeEvent(response.data) : event
        )
      );
      showToast("Event rejected and the society received your reason.", "warning");
    } catch (error) {
      showToast(error.response?.data?.errors?.[0] || "Failed to reject the event.", "error");
    } finally {
      setRejectModal(null);
    }
  };

  const handleDeleteConfirm = async (reason) => {
    try {
      await deleteEvent(deleteModal._id, reason);
      setEvents((previous) => previous.filter((event) => event._id !== deleteModal._id));
      showToast("Event deleted and the society has been notified.", "warning");
    } catch (error) {
      showToast(error.response?.data?.errors?.[0] || "Failed to delete the event.", "error");
    } finally {
      setDeleteModal(null);
    }
  };

  const stats = {
    total: events.length,
    pending: events.filter((event) => event.status === "pending").length,
    approved: events.filter((event) => event.status === "approved").length,
    rejected: events.filter((event) => event.status === "rejected").length,
  };

  let filtered = filter === "all" ? events : events.filter((event) => event.status === filter);
  if (search.trim()) {
    const searchValue = search.toLowerCase();
    filtered = filtered.filter(
      (event) =>
        safeText(event.title).toLowerCase().includes(searchValue) ||
        safeText(event.organizer).toLowerCase().includes(searchValue) ||
        safeText(event.venue).toLowerCase().includes(searchValue) ||
        safeText(event.organizerEmail).toLowerCase().includes(searchValue)
    );
  }

  const spotlightStats = [
    { label: "Awaiting Review", value: stats.pending, accent: "#f59e0b" },
    { label: "Approved", value: stats.approved, accent: "#10b981" },
    { label: "Rejected", value: stats.rejected, accent: "#ef4444" },
  ];

  const statCards = [
    {
      label: "Total Events",
      note: "Every submission in the moderation pipeline.",
      value: stats.total,
      accent: "#2563eb",
      soft: "rgba(37, 99, 235, 0.12)",
      short: "ALL",
      filterValue: "all",
    },
    {
      label: "Pending Review",
      note: "Items still waiting for an admin decision.",
      value: stats.pending,
      accent: "#f59e0b",
      soft: "rgba(245, 158, 11, 0.16)",
      short: "PEN",
      filterValue: "pending",
    },
    {
      label: "Approved",
      note: "Confirmed events already released to societies.",
      value: stats.approved,
      accent: "#10b981",
      soft: "rgba(16, 185, 129, 0.14)",
      short: "APP",
      filterValue: "approved",
    },
    {
      label: "Rejected",
      note: "Entries that still need society-side changes.",
      value: stats.rejected,
      accent: "#ef4444",
      soft: "rgba(239, 68, 68, 0.14)",
      short: "REJ",
      filterValue: "rejected",
    },
  ];

  return (
    <AdminLayout>
      <div className="events-workspace">
        {toast ? <div className={`events-toast ${toast.type || "success"}`}>{toast.msg}</div> : null}

        {rejectModal ? (
          <ReasonModal
            type="reject"
            eventTitle={rejectModal.title}
            onConfirm={handleRejectConfirm}
            onCancel={() => setRejectModal(null)}
          />
        ) : null}

        {deleteModal ? (
          <ReasonModal
            type="delete"
            eventTitle={deleteModal.title}
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteModal(null)}
          />
        ) : null}

        <div className="page-header split">
          <div>
            <h2>Event Management</h2>
            <p>Review and manage event submissions inside the main Uni-Connect admin workspace.</p>
          </div>
          <div className="events-page-actions">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`events-tab${activeTab === tab.key ? " is-active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "dashboard" ? (
          <>
            <section className="events-spotlight">
              <div className="events-spotlight-copy">
                <p className="events-kicker">Moderation focus</p>
                <h3>Review event submissions directly inside the main Uni-Connect admin panel.</h3>
                <p>
                  This page no longer depends on a separate `localhost:3001` app. Approvals,
                  rejections, reminders, and calendar review now run from the same `5173` admin
                  workspace.
                </p>
              </div>

              <div className="events-spotlight-stats">
                {spotlightStats.map((item) => (
                  <div key={item.label} className="events-spotlight-stat">
                    <strong style={{ color: item.accent }}>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="events-stat-grid">
              {statCards.map((card) => (
                <StatCard
                  key={card.label}
                  active={filter === card.filterValue}
                  accent={card.accent}
                  soft={card.soft}
                  label={card.label}
                  note={card.note}
                  short={card.short}
                  value={card.value}
                  onClick={() => setFilter(card.filterValue)}
                />
              ))}
            </section>

            <section className="events-control-card">
              <div className="events-control-row">
                <input
                  className="events-search-input"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by title, society, venue, or organizer email"
                />
                <div className="events-filter-group">
                  {["all", "pending", "approved", "rejected"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`events-filter-button${filter === item ? " is-active" : ""}`}
                      onClick={() => setFilter(item)}
                    >
                      {item === "all" ? `All (${stats.total})` : item.charAt(0).toUpperCase() + item.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {stats.pending > 0 && filter === "all" ? (
              <div className="events-banner warning">
                {stats.pending} {stats.pending === 1 ? "event is" : "events are"} waiting for your decision.
                Approve or reject with a reason and the society will be notified automatically.
              </div>
            ) : null}

            {loading ? (
              <section className="events-loading">
                <h3>Loading event queue</h3>
                <p>Fetching the latest submissions and moderation state for the admin panel.</p>
              </section>
            ) : filtered.length === 0 ? (
              <section className="events-empty">
                <h3>{search ? "No events match your search" : "Nothing to review right now"}</h3>
                <p>
                  {search
                    ? "Try a broader search term or switch the filter state to see more events."
                    : "When societies create or update events, they will appear here for review."}
                </p>
              </section>
            ) : (
              filtered.map((event) => (
                <AdminEventCard
                  key={event._id}
                  event={event}
                  onApprove={handleApprove}
                  onReject={setRejectModal}
                  onDelete={setDeleteModal}
                  onEdit={() => {}}
                />
              ))
            )}
          </>
        ) : null}

        {activeTab === "analytics" ? <Analytics /> : null}
        {activeTab === "reminders" ? <Reminders events={events} /> : null}
        {activeTab === "calendar" ? <AdminCalendar events={events} /> : null}
      </div>
    </AdminLayout>
  );
}
