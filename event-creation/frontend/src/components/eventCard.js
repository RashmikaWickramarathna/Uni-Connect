import React from 'react';

const categoryColors = {
  Academic: '#2563eb', Sports: '#16a34a', Cultural: '#d97706',
  Social: '#db2777', Workshop: '#7c3aed', Other: '#64748b',
};

const statusConfig = {
  pending:  { color: '#d97706', bg: '#fffbeb', border: '#fcd34d', label: 'Pending' },
  approved: { color: '#16a34a', bg: '#f0fdf4', border: '#86efac', label: 'Approved' },
  rejected: { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', label: 'Rejected' },
};

export default function EventCard({ event, onEdit, onApprove, onReject, onDelete }) {
  const status = statusConfig[event.status] || statusConfig.pending;
  const catColor = categoryColors[event.category] || '#64748b';

  const formatDate = (d) => {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    return new Date(y, m - 1, day).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
  };

  const formatTime = (t) => {
    if (!t) return '';
    const [h, min] = t.split(':');
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${min} ${ampm}`;
  };

  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e2e8f0',
      borderRadius: '12px', padding: '20px 22px', marginBottom: '14px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      borderLeft: `4px solid ${catColor}`,
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          {/* Badges */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{
              background: catColor + '15', color: catColor,
              padding: '3px 12px', borderRadius: '20px',
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.03em',
            }}>{event.category}</span>
            <span style={{
              background: status.bg, color: status.color,
              border: `1px solid ${status.border}`,
              padding: '3px 12px', borderRadius: '20px',
              fontSize: '11px', fontWeight: 700,
            }}>{status.label}</span>
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: '16px', fontWeight: 700, color: '#0f172a',
            marginBottom: '6px', fontFamily: 'Syne, sans-serif',
          }}>
            {event.title}
          </h3>

          {/* Description */}
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px', lineHeight: 1.6 }}>
            {event.description}
          </p>

          {/* Meta info */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: '#94a3b8' }}>
            <span><strong style={{ color: '#374151' }}>Date:</strong> {formatDate(event.date)}</span>
            <span><strong style={{ color: '#374151' }}>Time:</strong> {formatTime(event.time)}</span>
            <span><strong style={{ color: '#374151' }}>Venue:</strong> {event.venue}</span>
            <span><strong style={{ color: '#374151' }}>Organizer:</strong> {event.organizer}</span>
            <span><strong style={{ color: '#374151' }}>Max:</strong> {event.maxParticipants} participants</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '110px' }}>
          <button onClick={() => onEdit(event)} style={actionBtn('#f8fafc', '#374151', '#e2e8f0')}>Edit</button>
         
          <button onClick={() => onDelete(event._id)} style={actionBtn('#fef2f2', '#dc2626', '#fca5a5')}>Delete</button>
        </div>
      </div>
    </div>
  );
}

const actionBtn = (bg, color, border) => ({
  padding: '8px 14px', background: bg,
  border: `1px solid ${border}`, borderRadius: '7px',
  color, cursor: 'pointer', fontSize: '13px', fontWeight: 600,
  fontFamily: 'Space Grotesk, sans-serif',
  transition: 'opacity 0.15s', textAlign: 'center',
});