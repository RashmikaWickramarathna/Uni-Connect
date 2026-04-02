import React, { useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

export default function EventCalendar({ events }) {
  const today = new Date();
  const [current, setCurrent] = useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  });
  const [selectedDate, setSelectedDate] = useState(null);

  const { month, year } = current;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build a map of date -> events
  const eventMap = {};
  events.forEach(ev => {
    if (ev.date) {
      if (!eventMap[ev.date]) eventMap[ev.date] = [];
      eventMap[ev.date].push(ev);
    }
  });

  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const getDateKey = (day) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const statusColor = (status) => {
    if (status === 'approved') return '#16a34a';
    if (status === 'rejected') return '#dc2626';
    return '#d97706';
  };

  const selectedEvents = selectedDate ? (eventMap[selectedDate] || []) : [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>

      {/* Calendar */}
      <div style={{
        background: '#ffffff', border: '1px solid #e2e8f0',
        borderRadius: '14px', padding: '24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        {/* Month navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '19px', fontWeight: 800, color: '#0f172a' }}>
            Event Calendar
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setCurrent(c => {
              const d = new Date(c.year, c.month - 1);
              return { month: d.getMonth(), year: d.getFullYear() };
            })} style={navBtn}>&#8249;</button>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a', minWidth: '140px', textAlign: 'center' }}>
              {MONTHS[month]} {year}
            </span>
            <button onClick={() => setCurrent(c => {
              const d = new Date(c.year, c.month + 1);
              return { month: d.getMonth(), year: d.getFullYear() };
            })} style={navBtn}>&#8250;</button>
          </div>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '6px' }}>
          {DAYS.map(d => (
            <div key={d} style={{
              textAlign: 'center', fontSize: '12px', fontWeight: 700,
              color: '#94a3b8', padding: '6px 0',
            }}>{d}</div>
          ))}
        </div>

        {/* Date cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} />;
            const dateKey = getDateKey(day);
            const dayEvents = eventMap[dateKey] || [];
            const isToday = dateKey === todayStr;
            const hasEvent = dayEvents.length > 0;
            const isSelected = selectedDate === dateKey;

            return (
              <div
                key={dateKey}
                onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                style={{
                  minHeight: '52px', padding: '6px 4px',
                  borderRadius: '8px', textAlign: 'center',
                  cursor: hasEvent ? 'pointer' : 'default',
                  background: isSelected
                    ? '#eff6ff'
                    : hasEvent
                    ? '#f0fdf4'
                    : isToday
                    ? '#f8fafc'
                    : 'transparent',
                  border: isSelected
                    ? '2px solid #2563eb'
                    : isToday
                    ? '2px solid #2563eb'
                    : hasEvent
                    ? '1px solid #86efac'
                    : '1px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{
                  fontSize: '13px',
                  fontWeight: isToday ? 800 : hasEvent ? 700 : 400,
                  color: isToday ? '#2563eb' : hasEvent ? '#16a34a' : '#374151',
                  display: 'block',
                }}>{day}</span>

                {/* Event dots */}
                {hasEvent && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', marginTop: '4px', flexWrap: 'wrap' }}>
                    {dayEvents.slice(0, 3).map((ev, i) => (
                      <div key={i} style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: statusColor(ev.status),
                      }} />
                    ))}
                    {dayEvents.length > 3 && (
                      <span style={{ fontSize: '9px', color: '#94a3b8' }}>+{dayEvents.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '18px', marginTop: '18px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', justifyContent: 'flex-end' }}>
          {[['#d97706','Pending'],['#16a34a','Approved'],['#dc2626','Rejected']].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />
              {l}
            </div>
          ))}
        </div>
      </div>

      {/* Side panel — shows events for selected date */}
      <div style={{
        background: '#ffffff', border: '1px solid #e2e8f0',
        borderRadius: '14px', padding: '22px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        minHeight: '300px',
      }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
          {selectedDate ? `Events on ${selectedDate}` : 'Select a Date'}
        </h3>
        <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '18px' }}>
          {selectedDate ? `${selectedEvents.length} event(s) scheduled` : 'Click on a highlighted date to view events'}
        </p>

        {!selectedDate && (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#cbd5e1' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>&#128197;</div>
            <p style={{ fontSize: '13px' }}>No date selected</p>
          </div>
        )}

        {selectedDate && selectedEvents.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>
            <p style={{ fontSize: '13px' }}>No events on this date</p>
          </div>
        )}

        {selectedEvents.map((ev, i) => {
          const sc = ev.status === 'approved' ? '#16a34a' : ev.status === 'rejected' ? '#dc2626' : '#d97706';
          return (
            <div key={i} style={{
              borderLeft: `3px solid ${sc}`,
              paddingLeft: '12px', marginBottom: '14px',
              paddingBottom: '14px',
              borderBottom: i < selectedEvents.length - 1 ? '1px solid #f1f5f9' : 'none',
            }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', marginBottom: '3px' }}>
                {ev.title}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>
                {ev.time} — {ev.venue}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                {ev.organizer}
              </div>
              <span style={{
                fontSize: '11px', fontWeight: 700,
                color: sc,
                background: sc + '15',
                padding: '2px 10px', borderRadius: '20px',
              }}>
                {ev.status.charAt(0).toUpperCase() + ev.status.slice(1)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const navBtn = {
  background: '#f8fafc', border: '1px solid #e2e8f0',
  borderRadius: '6px', color: '#374151', cursor: 'pointer',
  width: '32px', height: '32px', fontSize: '18px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1,
};