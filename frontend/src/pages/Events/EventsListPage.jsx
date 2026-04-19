import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getImageUrl } from "../../api/societyPortalApi";
import { formatTicketPrice } from "../../utils/ticketUtils";
import "./EventsListPage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const CATEGORY_OPTIONS = [
  { key: "all", label: "All" },
  { key: "academic", label: "Academic" },
  { key: "cultural", label: "Cultural" },
  { key: "sports", label: "Sports" },
  { key: "tech", label: "Tech" },
  { key: "workshop", label: "Workshop" },
  { key: "seminar", label: "Seminar" },
  { key: "social", label: "Social" },
  { key: "other", label: "Other" },
];

const CATEGORY_COLORS = {
  academic: { bg: "#dbeafe", color: "#1d4ed8" },
  cultural: { bg: "#fce7f3", color: "#be185d" },
  sports: { bg: "#dcfce7", color: "#15803d" },
  tech: { bg: "#ede9fe", color: "#7c3aed" },
  workshop: { bg: "#ffedd5", color: "#c2410c" },
  seminar: { bg: "#fef9c3", color: "#a16207" },
  social: { bg: "#e0f2fe", color: "#0369a1" },
  other: { bg: "#f1f5f9", color: "#475569" },
};

const normalizeCategoryKey = (value) => String(value || "other").trim().toLowerCase();

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-LK", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatTime = (event) => {
  if (String(event?.time || "").trim()) {
    const [hour = "00", minute = "00"] = String(event.time).split(":");
    const hourValue = Number(hour) || 0;
    return `${hourValue % 12 || 12}:${minute} ${hourValue >= 12 ? "PM" : "AM"}`;
  }

  return new Date(event?.date).toLocaleTimeString("en-LK", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getMinTicketPrice = (tickets) => {
  if (!Array.isArray(tickets) || tickets.length === 0) return null;
  return Math.min(...tickets.map((ticket) => Number(ticket?.price) || 0));
};

const getDisplayImage = (event) => getImageUrl(event?.bannerImage || event?.image);

export default function EventsListPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    fetch(`${API_BASE}/events/public`)
      .then((response) => response.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          setError("Failed to load events.");
          return;
        }

        const seen = new Set();
        const uniqueEvents = data.filter((event) => {
          if (seen.has(event._id)) return false;
          seen.add(event._id);
          return true;
        });

        setEvents(uniqueEvents);
      })
      .catch(() => setError("Cannot connect to server. Make sure your backend is running."))
      .finally(() => setLoading(false));
  }, []);

  const filteredEvents = useMemo(() => {
    const searchValue = search.toLowerCase();

    return events.filter((event) => {
      const matchSearch =
        event.title?.toLowerCase().includes(searchValue) ||
        event.venue?.toLowerCase().includes(searchValue) ||
        event.organizer?.toLowerCase().includes(searchValue) ||
        event.description?.toLowerCase().includes(searchValue);
      const matchCategory =
        category === "all" || normalizeCategoryKey(event.category) === normalizeCategoryKey(category);

      return matchSearch && matchCategory;
    });
  }, [category, events, search]);

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
      <div className="el-header">
        <div className="el-header-text">
          <h1 className="el-title">Upcoming Events</h1>
        </div>
        <div className="el-count-badge">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="el-controls">
        <div className="el-search-wrap">
          <span className="el-search-icon">🔍</span>
          <input
            className="el-search"
            type="text"
            placeholder="Search events, venues, organizers..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search ? (
            <button className="el-search-clear" onClick={() => setSearch("")} type="button">
              ✕
            </button>
          ) : null}
        </div>

        <div className="el-categories">
          {CATEGORY_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`el-cat-btn ${category === option.key ? "active" : ""}`}
              onClick={() => setCategory(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="el-error">
          <span>⚠</span> {error}
        </div>
      ) : null}

      {filteredEvents.length === 0 ? (
        <div className="el-empty">
          <div className="el-empty-icon">📭</div>
          <h3>No events found</h3>
          <p>
            {events.length === 0
              ? "No events have been published yet."
              : "Try adjusting your search or category filter."}
          </p>
          <button
            className="el-clear-btn"
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("all");
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="el-grid">
          {filteredEvents.map((event) => {
            const categoryKey = normalizeCategoryKey(event.category);
            const categoryStyle = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.other;
            const availableSeats = Number.isFinite(Number(event.availableSeats))
              ? Math.max(Number(event.availableSeats), 0)
              : Math.max(Number(event.totalSeats || 0) - Number(event.bookedSeats || 0), 0);
            const isSoldOut = Number(event.totalSeats || 0) > 0 && availableSeats <= 0;
            const minPrice = getMinTicketPrice(event.tickets);
            const imageUrl = getDisplayImage(event);

            return (
              <article key={event._id} className="el-card">
                <div className="el-card-banner">
                  {imageUrl ? (
                    <img src={imageUrl} alt={event.title} className="el-banner-img" />
                  ) : (
                    <div className="el-banner-placeholder">
                      <span>🎓</span>
                    </div>
                  )}

                  <div className="el-card-overlay" />
                  <div className="el-card-badges">
                    <span
                      className="el-cat-badge"
                      style={{ background: categoryStyle.bg, color: categoryStyle.color }}
                    >
                      {CATEGORY_OPTIONS.find((option) => option.key === categoryKey)?.label || "Other"}
                    </span>
                    {event.isFeatured ? <span className="el-featured-badge">Featured</span> : null}
                    {isSoldOut ? <span className="el-soldout-badge">Sold Out</span> : null}
                  </div>
                </div>

                <div className="el-card-content">
                  <h3 className="el-card-title">{event.title}</h3>
                  {(event.shortDescription || event.description) ? (
                    <p className="el-card-desc">
                      {(event.shortDescription || event.description).slice(0, 120)}
                      {(event.shortDescription || event.description).length > 120 ? "..." : ""}
                    </p>
                  ) : null}

                  <div className="el-card-meta">
                    <div className="el-meta-row">
                      <span>📅</span>
                      <span>
                        {formatDate(event.date)} at {formatTime(event)}
                      </span>
                    </div>
                    <div className="el-meta-row">
                      <span>📍</span>
                      <span>{event.venue}</span>
                    </div>
                    {event.organizer ? (
                      <div className="el-meta-row">
                        <span>🏛️</span>
                        <span>{event.organizer}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="el-ticket-summary">
                    <span>{event.tickets?.length || 1} ticket option{event.tickets?.length === 1 ? "" : "s"}</span>
                    <span>{minPrice === 0 ? "Includes free access" : "Choose your preferred price tier"}</span>
                  </div>

                  <div className="el-card-footer">
                    <div className="el-price-seats">
                      {minPrice !== null ? (
                        <span className="el-price">
                          {minPrice === 0 ? "Free" : `From ${formatTicketPrice(minPrice)}`}
                        </span>
                      ) : null}
                      {Number(event.totalSeats || 0) > 0 ? (
                        <span className={`el-seats ${availableSeats < 20 ? "low" : ""}`}>
                          {isSoldOut ? "No seats left" : `${availableSeats} seats left`}
                        </span>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      className={`el-book-btn ${isSoldOut ? "disabled" : ""}`}
                      disabled={isSoldOut}
                      onClick={() => navigate(`/events/${event._id}/book`)}
                    >
                      {isSoldOut ? "Sold Out" : "Book Now"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
