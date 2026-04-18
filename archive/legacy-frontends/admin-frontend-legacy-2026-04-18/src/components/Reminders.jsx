import React, { useEffect, useState } from 'react';
import { getReminders } from '../api';

export default function Reminders({ events }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReminders()
      .then(response => {
        setHistory(response.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const upcoming = events
    .filter(event => event.status === 'approved' && event.date > todayStr)
    .map(event => ({
      ...event,
      daysUntil: Math.ceil((new Date(`${event.date}T00:00:00`) - today) / (1000 * 60 * 60 * 24)),
    }))
    .filter(event => event.daysUntil <= 30)
    .sort((left, right) => left.daysUntil - right.daysUntil);

  const urgent = upcoming.filter(event => event.daysUntil <= 7);
  const soon = upcoming.filter(event => event.daysUntil > 7);

  const urgencyColor = days => (days <= 1 ? '#dc2626' : days <= 3 ? '#d97706' : '#2563eb');
  const urgencyBackground = days => (days <= 1 ? '#fef2f2' : days <= 3 ? '#fffbeb' : '#eff6ff');
  const urgencyBorder = days => (days <= 1 ? '#fca5a5' : days <= 3 ? '#fcd34d' : '#bfdbfe');
  const urgencyLabel = days => (days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`);
  const formatDate = date => {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  const formatDateTime = value =>
    value
      ? new Date(value).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '';

  return (
    <div>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '22px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Upcoming Within 7 Days</h3>
          <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
            {urgent.length} events
          </span>
        </div>

        {urgent.length === 0 && <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No urgent upcoming events.</p>}

        {urgent.map(event => (
          <div
            key={event._id}
            style={{
              background: urgencyBackground(event.daysUntil),
              border: `1px solid ${urgencyBorder(event.daysUntil)}`,
              borderRadius: '10px',
              padding: '14px 16px',
              marginBottom: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', marginBottom: '3px' }}>{event.title || 'Untitled Event'}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{formatDate(event.date)} - {event.venue || 'TBA'}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                {event.organizer || 'Unknown Society'} | {event.organizerEmail || 'No email available'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ background: urgencyColor(event.daysUntil), color: '#fff', padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                {urgencyLabel(event.daysUntil)}
              </span>
              {(event.reminderSent7Days || event.reminderSent1Day) && <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>Reminder sent</span>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '22px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Upcoming in 8-30 Days</h3>
          <span style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
            {soon.length} events
          </span>
        </div>

        {soon.length === 0 && <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No events in this period.</p>}

        {soon.map(event => (
          <div key={event._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>{event.title || 'Untitled Event'}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{formatDate(event.date)} - {event.venue || 'TBA'}</div>
            </div>
            <span style={{ background: '#eff6ff', color: '#2563eb', padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
              In {event.daysUntil} days
            </span>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Reminder History</h3>
        <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>Auto-reminders run daily at 8:00 AM - 7 days and 1 day before each approved event. Societies are notified automatically.</p>
        {loading && <p style={{ color: '#94a3b8', fontSize: '13px' }}>Loading...</p>}
        {!loading && history.length === 0 && <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No reminders sent yet.</p>}

        {history.map(reminder => (
          <div key={reminder._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid #f1f5f9', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a', marginBottom: '2px' }}>{reminder.eventTitle}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{reminder.message}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>To: {reminder.organizerEmail}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <span
                style={{
                  background: reminder.reminderType === '1_day' ? '#fef2f2' : '#eff6ff',
                  color: reminder.reminderType === '1_day' ? '#dc2626' : '#2563eb',
                  border: `1px solid ${reminder.reminderType === '1_day' ? '#fca5a5' : '#bfdbfe'}`,
                  padding: '2px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                {reminder.reminderType === '7_days' ? '7-day reminder' : '1-day reminder'}
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>{formatDateTime(reminder.sentAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
