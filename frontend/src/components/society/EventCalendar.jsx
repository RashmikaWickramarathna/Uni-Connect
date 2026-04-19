import React, { useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const themeStyles = {
  surface: 'var(--app-surface-elevated)',
  surfaceMuted: 'var(--app-surface-muted)',
  border: 'var(--app-border)',
  text: 'var(--app-text)',
  muted: 'var(--app-text-muted)',
  primary: 'var(--app-primary)',
  success: 'var(--app-success)',
  warning: 'var(--app-warning)',
  danger: 'var(--app-danger)',
};

function getStatusColor(status) {
  if (status === 'approved') return themeStyles.success;
  if (status === 'rejected') return themeStyles.danger;
  return themeStyles.warning;
}

function formatEventTime(value) {
  if (!value) return '';
  const [hour, minute] = value.split(':');
  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export default function EventCalendar({ events }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const { month, year } = currentMonth;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`;

  const eventMap = {};
  events.forEach((event) => {
    if (!event.date) return;
    if (!eventMap[event.date]) {
      eventMap[event.date] = [];
    }
    eventMap[event.date].push(event);
  });

  const cells = [];
  for (let index = 0; index < firstDay; index += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }

  const getDateKey = (day) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const selectedEvents = selectedDate ? eventMap[selectedDate] || [] : [];

  const navButtonStyle = {
    background: themeStyles.surfaceMuted,
    border: `1px solid ${themeStyles.border}`,
    borderRadius: '6px',
    color: themeStyles.text,
    cursor: 'pointer',
    width: '30px',
    height: '30px',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 300px)',
        gap: '20px',
        alignItems: 'start',
      }}
    >
      <div
        style={{
          background: themeStyles.surface,
          border: `1px solid ${themeStyles.border}`,
          borderRadius: '14px',
          padding: '24px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: themeStyles.text }}>
            My Event Calendar
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              style={navButtonStyle}
              onClick={() =>
                setCurrentMonth((current) => {
                  const nextDate = new Date(current.year, current.month - 1);
                  return { month: nextDate.getMonth(), year: nextDate.getFullYear() };
                })
              }
            >
              &#8249;
            </button>
            <span
              style={{
                fontWeight: 700,
                fontSize: '14px',
                minWidth: '130px',
                textAlign: 'center',
                color: themeStyles.text,
              }}
            >
              {MONTHS[month]} {year}
            </span>
            <button
              style={navButtonStyle}
              onClick={() =>
                setCurrentMonth((current) => {
                  const nextDate = new Date(current.year, current.month + 1);
                  return { month: nextDate.getMonth(), year: nextDate.getFullYear() };
                })
              }
            >
              &#8250;
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '6px' }}>
          {DAYS.map((day) => (
            <div
              key={day}
              style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: themeStyles.muted, padding: '4px 0' }}
            >
              {day}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {cells.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} />;
            }

            const dateKey = getDateKey(day);
            const dayEvents = eventMap[dateKey] || [];
            const isToday = dateKey === todayKey;
            const hasEvents = dayEvents.length > 0;
            const isSelected = selectedDate === dateKey;

            return (
              <div
                key={dateKey}
                onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                style={{
                  minHeight: '50px',
                  padding: '6px 4px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  cursor: hasEvents ? 'pointer' : 'default',
                  background: isSelected
                    ? 'var(--accent)'
                    : hasEvents
                      ? 'rgba(16, 185, 129, 0.12)'
                      : isToday
                        ? themeStyles.surfaceMuted
                        : 'transparent',
                  border: isSelected
                    ? `2px solid ${themeStyles.primary}`
                    : isToday
                      ? `2px solid ${themeStyles.primary}`
                      : hasEvents
                        ? '1px solid rgba(16, 185, 129, 0.32)'
                        : '1px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: isToday ? 800 : hasEvents ? 700 : 400,
                    color: isToday ? themeStyles.primary : hasEvents ? themeStyles.success : themeStyles.text,
                    display: 'block',
                  }}
                >
                  {day}
                </span>
                {hasEvents ? (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '4px', flexWrap: 'wrap' }}>
                    {dayEvents.slice(0, 3).map((event, dotIndex) => (
                      <div
                        key={dotIndex}
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: getStatusColor(event.status),
                        }}
                      />
                    ))}
                    {dayEvents.length > 3 ? (
                      <span style={{ fontSize: '9px', color: themeStyles.muted }}>
                        +{dayEvents.length - 3}
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '16px',
            paddingTop: '14px',
            borderTop: `1px solid ${themeStyles.border}`,
            justifyContent: 'flex-end',
          }}
        >
          {[
            [themeStyles.warning, 'Pending'],
            [themeStyles.success, 'Approved'],
            [themeStyles.danger, 'Rejected'],
          ].map(([color, label]) => (
            <div
              key={label}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: themeStyles.muted }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          background: themeStyles.surface,
          border: `1px solid ${themeStyles.border}`,
          borderRadius: '14px',
          padding: '20px',
          boxShadow: 'var(--shadow-md)',
          minHeight: '280px',
        }}
      >
        <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '4px', color: themeStyles.text }}>
          {selectedDate ? `Events on ${selectedDate}` : 'Select a Date'}
        </h3>
        <p style={{ fontSize: '12px', color: themeStyles.muted, marginBottom: '16px' }}>
          {selectedDate ? `${selectedEvents.length} event(s)` : 'Click a highlighted date'}
        </p>
        {!selectedDate ? (
          <p style={{ fontSize: '13px', color: themeStyles.muted, textAlign: 'center', paddingTop: '30px' }}>
            No date selected
          </p>
        ) : null}
        {selectedDate && selectedEvents.length === 0 ? (
          <p style={{ fontSize: '13px', color: themeStyles.muted, textAlign: 'center', paddingTop: '20px' }}>
            No events on this date
          </p>
        ) : null}
        {selectedEvents.map((event, index) => {
          const statusColor = getStatusColor(event.status);

          return (
            <div
              key={event._id || index}
              style={{
                borderLeft: `3px solid ${statusColor}`,
                paddingLeft: '12px',
                marginBottom: '14px',
                paddingBottom: '14px',
                borderBottom: index < selectedEvents.length - 1 ? `1px solid ${themeStyles.border}` : 'none',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '14px', color: themeStyles.text, marginBottom: '2px' }}>
                {event.title}
              </div>
              <div style={{ fontSize: '12px', color: themeStyles.muted, marginBottom: '2px' }}>
                {formatEventTime(event.time)} - {event.venue}
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: statusColor,
                  background: `${statusColor}20`,
                  padding: '2px 10px',
                  borderRadius: '20px',
                }}
              >
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
              {event.status === 'rejected' && event.adminReason ? (
                <p style={{ fontSize: '11px', color: themeStyles.danger, marginTop: '4px' }}>
                  Reason: {event.adminReason}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
