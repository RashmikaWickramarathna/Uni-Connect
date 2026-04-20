import React from 'react';

import { getImageUrl } from '../../api/societyPortalApi';
import { formatTicketLabel, formatTicketPrice } from '../../utils/ticketUtils';

const CATEGORY_COLORS = {
  Academic: '#2563eb',
  Sports: '#16a34a',
  Cultural: '#d97706',
  Social: '#db2777',
  Workshop: '#7c3aed',
  Other: '#64748b',
};

const STATUS_COLORS = {
  pending: { color: '#d97706', bg: '#fffbeb', border: '#fcd34d', label: 'Pending Approval' },
  approved: { color: '#16a34a', bg: '#f0fdf4', border: '#86efac', label: 'Approved' },
  rejected: { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', label: 'Rejected' },
  cancelled: { color: '#64748b', bg: '#f8fafc', border: '#cbd5e1', label: 'Cancelled' },
};

const themeStyles = {
  surface: 'var(--app-surface-elevated)',
  surfaceMuted: 'var(--app-surface-muted)',
  border: 'var(--app-border)',
  text: 'var(--app-text)',
  muted: 'var(--app-text-muted)',
  primary: 'var(--app-primary)',
};

const cardImageWrap = {
  position: 'relative',
  height: '180px',
  padding: '12px',
  background: themeStyles.surfaceMuted,
  borderBottom: `1px solid ${themeStyles.border}`,
};

const cardImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  display: 'block',
};

function formatEventDate(value) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatEventTime(value) {
  if (!value) return '';
  const [hour, minute] = value.split(':');
  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export default function EventCard({ event, onEdit, onDelete, onGeneratePost }) {
  const status = STATUS_COLORS[event.status] || STATUS_COLORS.pending;
  const categoryColor = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.Other;
  const imageUrl = getImageUrl(event.image);
  const title = event.title || 'Untitled Event';
  const description = event.description || 'No description provided.';
  const venue = event.venue || 'TBA';
  const category = event.category || 'Other';
  const maxParticipants = event.maxParticipants || 100;
  const ticketOptions = Array.isArray(event.tickets) ? event.tickets : [];
  const minPrice = ticketOptions.length
    ? Math.min(...ticketOptions.map((ticket) => Number(ticket?.price) || 0))
    : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = event.date ? new Date(`${event.date}T00:00:00`) : null;
  const daysUntil = eventDate
    ? Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div
      style={{
        background: themeStyles.surface,
        border: `1px solid ${themeStyles.border}`,
        borderRadius: '12px',
        marginBottom: '16px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
        borderLeft: `4px solid ${categoryColor}`,
        transition: 'box-shadow 0.2s ease',
      }}
      onMouseEnter={(eventNode) => {
        eventNode.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={(eventNode) => {
        eventNode.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
    >
      {imageUrl ? (
        <div style={cardImageWrap}>
          <img src={imageUrl} alt={title} style={cardImageStyle} />
          <span
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: categoryColor,
              color: '#fff',
              padding: '3px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            {category}
          </span>
        </div>
      ) : null}

      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {imageUrl ? null : (
                <span
                  style={{
                    background: `${categoryColor}15`,
                    color: categoryColor,
                    padding: '3px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {category}
                </span>
              )}
              <span
                style={{
                  background: status.bg,
                  color: status.color,
                  border: `1px solid ${status.border}`,
                  padding: '3px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                {status.label}
              </span>
              {daysUntil !== null && daysUntil > 0 && daysUntil <= 7 ? (
                <span
                  style={{
                    background: '#fef3c7',
                    color: '#d97706',
                    border: '1px solid #fcd34d',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                </span>
              ) : null}
              {daysUntil === 0 ? (
                <span
                  style={{
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fca5a5',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  Today
                </span>
              ) : null}
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 700, color: themeStyles.text, marginBottom: '6px' }}>
              {title}
            </h3>
            <p style={{ fontSize: '13px', color: themeStyles.muted, marginBottom: '10px', lineHeight: 1.6 }}>
              {description}
            </p>

            <div
              style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                fontSize: '13px',
                color: themeStyles.muted,
                marginBottom: '10px',
              }}
            >
              <span><strong style={{ color: themeStyles.text }}>Date:</strong> {formatEventDate(event.date)}</span>
              <span><strong style={{ color: themeStyles.text }}>Time:</strong> {formatEventTime(event.time)}</span>
              <span><strong style={{ color: themeStyles.text }}>Venue:</strong> {venue}</span>
              <span><strong style={{ color: themeStyles.text }}>Max:</strong> {maxParticipants}</span>
              {minPrice !== null ? (
                <span>
                  <strong style={{ color: themeStyles.text }}>Ticket Price:</strong>{' '}
                  {minPrice === 0 ? 'Free' : `From ${formatTicketPrice(minPrice)}`}
                </span>
              ) : null}
              {event.views > 0 ? (
                <span><strong style={{ color: themeStyles.text }}>Views:</strong> {event.views}</span>
              ) : null}
            </div>

            {ticketOptions.length > 0 ? (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {ticketOptions.map((ticket, index) => (
                  <span
                    key={`${ticket.type}-${index}`}
                    style={{
                      background: 'var(--secondary)',
                      color: 'var(--secondary-foreground)',
                      border: `1px solid ${themeStyles.border}`,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {formatTicketLabel(ticket, index)} - {formatTicketPrice(ticket.price)} - {ticket.totalSeats} seats
                  </span>
                ))}
              </div>
            ) : null}

            {event.tags && event.tags.length > 0 ? (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {event.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      background: themeStyles.surfaceMuted,
                      color: themeStyles.muted,
                      padding: '2px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      border: `1px solid ${themeStyles.border}`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            {event.status === 'rejected' && event.adminReason ? (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '13px',
                  marginBottom: '8px',
                }}
              >
                <strong style={{ color: '#b91c1c' }}>Rejection Reason:</strong>
                <span style={{ color: '#dc2626', marginLeft: '8px' }}>{event.adminReason}</span>
              </div>
            ) : null}
            {event.status === 'rejected' ? (
              <p style={{ fontSize: '12px', color: themeStyles.muted }}>You may edit and resubmit this event.</p>
            ) : null}
            {event.status === 'approved' ? (
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '13px',
                }}
              >
                <span style={{ color: '#15803d' }}>This event is confirmed and approved.</span>
              </div>
            ) : null}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '130px' }}>
            <button
              onClick={() => onEdit(event)}
              disabled={event.status === 'approved'}
              style={{
                padding: '8px 12px',
                background: event.status === 'approved' ? themeStyles.surfaceMuted : themeStyles.surface,
                border: `1px solid ${themeStyles.border}`,
                borderRadius: '7px',
                color: event.status === 'approved' ? 'var(--muted-foreground)' : themeStyles.text,
                cursor: event.status === 'approved' ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(event._id)}
              style={{
                padding: '8px 12px',
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '7px',
                color: '#dc2626',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              Delete
            </button>
            <button
              onClick={() => onGeneratePost(event)}
              style={{
                padding: '8px 12px',
                background: 'var(--secondary)',
                border: `1px solid ${themeStyles.border}`,
                borderRadius: '7px',
                color: themeStyles.primary,
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              Generate Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
