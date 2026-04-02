import React, { useEffect, useState } from 'react';
import { getReminders } from '../api';

export default function Reminders({ events }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getReminders()
      .then((res) => {
        setHistory(Array.isArray(res.data) ? res.data : []);
        setError(null);
      })
      .catch((err) => {
        setError('Failed to load reminder history');
      })
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const inNDays = (n) => formatDate(new Date(now.getTime() + n * 24 * 60 * 60 * 1000));

  const dueIn7 = events.filter((e) => e.status === 'approved' && e.date === inNDays(7) && !e.reminderSent7Days);
  const dueIn1 = events.filter((e) => e.status === 'approved' && e.date === inNDays(1) && !e.reminderSent1Day);

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', minHeight: '460px' }}>
      <h2 style={{ marginBottom: '14px', color: '#0f172a' }}>Reminders</h2>

      <div style={{ marginBottom: '18px' }}>
        <strong>Upcoming reminders:</strong>
        <div style={{ marginTop: '8px', fontSize: '14px' }}>
          <p>Due in 7 days: {dueIn7.length} event(s)</p>
          <p>Due in 1 day: {dueIn1.length} event(s)</p>
        </div>
      </div>

      <div style={{ marginBottom: '12px', fontWeight: 600 }}>History (latest 50)</div>

      {loading ? (
        <div>Loading reminder history...</div>
      ) : error ? (
        <div style={{ color: '#b91c1c' }}>{error}</div>
      ) : history.length === 0 ? (
        <div style={{ color: '#64748b' }}>No reminders tracked yet.</div>
      ) : (
        <div style={{ maxHeight: '290px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#334155' }}>
                <th style={{ padding: '8px 6px' }}>When</th>
                <th style={{ padding: '8px 6px' }}>Type</th>
                <th style={{ padding: '8px 6px' }}>Event</th>
                <th style={{ padding: '8px 6px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((r) => (
                <tr key={r._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px' }}>{new Date(r.sentAt).toLocaleString()}</td>
                  <td style={{ padding: '6px' }}>{r.reminderType}</td>
                  <td style={{ padding: '6px' }}>{r.eventTitle}</td>
                  <td style={{ padding: '6px' }}>{r.eventDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
