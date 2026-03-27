// src/pages/Events/EventsListPage.jsx
// UniConnect – Browse & Book Events

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EventsListPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const CATEGORY_COLORS = {
  academic:  { bg: "#dbeafe", color: "#1d4ed8" },
  cultural:  { bg: "#fce7f3", color: "#be185d" },
  sports:    { bg: "#dcfce7", color: "#15803d" },
  tech:      { bg: "#ede9fe", color: "#7c3aed" },
  workshop:  { bg: "#ffedd5", color: "#c2410c" },
  seminar:   { bg: "#fef9c3", color: "#a16207" },
  social:    { bg: "#e0f2fe", color: "#0369a1" },
  other:     { bg: "#f1f5f9", color: "#475569" },
};

export default function EventsListPage() {
  const navigate = useNavigate();

  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    fetch(`${API_BASE}/events`)           // ✅ FIXED: was /tickets/events
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const seen   = new Set();
          const unique = data.filter((e) => {
            if (seen.has(e._id)) return false;
            seen.add(e._id);
            return true;
          });
          setEvents(unique);
        } else {
          setError("Failed to load events.");
        }
      })
      .catch(() => setError("Cannot connect to server. Make sure your backend is running."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter((e) => {
    const matchSearch =
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.venue?.toLowerCase().includes(search.toLowerCase()) ||
      e.organizer?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || e.category === category;
    return matchSearch && matchCat;
  });

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-LK", {
      weekday: "short", year: "numeric", month: "short", day: "numeric",
    });

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString("en-LK", { hour: "2-digit", minute: "2-digit" });

  const getMinPrice = (tickets) => {
    if (!tickets || tickets.length === 0) return null;
    const min = Math.min(...tickets.map((t) => t.price));
    return min === 0 ? "Free" : `Rs. ${min.toLocaleString()}`;
  };

  const getAvailableSeats = (event) =>
    (event.totalSeats || 0) - (event.bookedSeats || 0);

  if (loading) {
    return (
      <div className="el-loading">
        <div className="el-spinner" />
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="el-page">

      {/* ── Header ── */}
      <div className="el-header">
        <div className="el-header-text">
          <h1 className="el-title">Upcoming Events</h1>
          <p className="el-sub">Discover and book tickets for university events</p>
        </div>
        <div className="el-count-badge">
          {filtered.length} event{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── Search & Filter ── */}
      <div className="el-controls">
        <div className="el-search-wrap">
          <span className="el-search-icon">🔍</span>
          <input
            className="el-search"
            type="text"
            placeholder="Search events, venues, organizers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="el-search-clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>

        <div className="el-categories">
          {["all", "academic", "cultural", "sports", "tech", "workshop", "seminar", "social", "other"].map((cat) => (
            <button
              key={cat}
              className={`el-cat-btn ${category === cat ? "active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="el-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* ── Events Grid ── */}
      {filtered.length === 0 ? (
        <div className="el-empty">
          <div className="el-empty-icon">📭</div>
          <h3>No events found</h3>
          <p>
            {events.length === 0
              ? "No events have been published yet."
              : "Try adjusting your search or category filter."}
          </p>
          {search && (
            <button className="el-clear-btn" onClick={() => { setSearch(""); setCategory("all"); }}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="el-grid">
          {filtered.map((event) => {
            const catStyle       = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other;
            const availableSeats = getAvailableSeats(event);
            const isSoldOut      = availableSeats <= 0 && event.totalSeats > 0;
            const minPrice       = getMinPrice(event.tickets);

            return (
              <div key={event._id} className="el-card">

                {/* Banner */}
                <div className="el-card-banner">
                  {event.bannerImage ? (
                    <img src={event.bannerImage} alt={event.title} className="el-banner-img" />
                  ) : (
                    <div className="el-banner-placeholder">
                      <span>🎓</span>
                    </div>
                  )}
                  <div className="el-card-badges">
                    <span
                      className="el-cat-badge"
                      style={{ background: catStyle.bg, color: catStyle.color }}
                    >
                      {event.category || "other"}
                    </span>
                    {event.isFeatured && (
                      <span className="el-featured-badge">⭐ Featured</span>
                    )}
                    {isSoldOut && (
                      <span className="el-soldout-badge">Sold Out</span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="el-card-content">
                  <h3 className="el-card-title">{event.title}</h3>
                  {(event.shortDescription || event.description) && (
                    <p className="el-card-desc">
                      {(event.shortDescription || event.description).slice(0, 100)}
                      {(event.shortDescription || event.description).length > 100 ? "..." : ""}
                    </p>
                  )}

                  <div className="el-card-meta">
                    <div className="el-meta-row">
                      <span>📅</span>
                      <span>{formatDate(event.date)} at {formatTime(event.date)}</span>
                    </div>
                    <div className="el-meta-row">
                      <span>📍</span>
                      <span>{event.venue}</span>
                    </div>
                    {event.organizer && (
                      <div className="el-meta-row">
                        <span>🏛️</span>
                        <span>{event.organizer}</span>
                      </div>
                    )}
                  </div>

                  <div className="el-card-footer">
                    <div className="el-price-seats">
                      {minPrice && (
                        <span className="el-price">
                          {minPrice === "Free" ? "🆓 Free" : `From ${minPrice}`}
                        </span>
                      )}
                      {event.totalSeats > 0 && (
                        <span className={`el-seats ${availableSeats < 20 ? "low" : ""}`}>
                          {isSoldOut ? "No seats left" : `${availableSeats} seats left`}
                        </span>
                      )}
                    </div>

                    <button
                      className={`el-book-btn ${isSoldOut ? "disabled" : ""}`}
                      disabled={isSoldOut}
                      onClick={() => navigate(`/events/${event._id}/book`)}
                    >
                      {isSoldOut ? "Sold Out" : "Book Now →"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
