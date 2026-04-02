import React, { useState, useEffect } from 'react';
import EventForm from './components/EventForm';
import EventCard from './components/EventCard';
import EventCalendar from './components/EventCalendar';
import { getEvents, createEvent, updateEvent, updateStatus, deleteEvent } from './api';

export default function App() {
  const [events, setEvents] = useState([]);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('dashboard');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchEvents = async () => {
    try {
      const res = await getEvents();
      setEvents(res.data);
    } catch {
      showToast('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleCreate = async (formData) => {
    const res = await createEvent(formData);
    setEvents(prev => [res.data, ...prev]);
    showToast('Event created successfully!');
  };

  const handleUpdate = async (formData) => {
    const res = await updateEvent(editData._id, formData);
    setEvents(prev => prev.map(e => e._id === editData._id ? res.data : e));
    setEditData(null);
    showToast('Event updated successfully!');
  };

  const handleApprove = async (id) => {
    const res = await updateStatus(id, 'approved');
    setEvents(prev => prev.map(e => e._id === id ? res.data : e));
    showToast('Event approved!');
  };

  const handleReject = async (id) => {
    const res = await updateStatus(id, 'rejected');
    setEvents(prev => prev.map(e => e._id === id ? res.data : e));
    showToast('Event rejected.', 'warning');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    await deleteEvent(id);
    setEvents(prev => prev.filter(e => e._id !== id));
    showToast('Event deleted.', 'warning');
  };

  const bookedDates = events.map(e => ({ date: e.date, title: e.title, id: e._id }));
  const filtered = filter === 'all' ? events : events.filter(e => e.status === filter);

  const stats = {
    total: events.length,
    pending: events.filter(e => e.status === 'pending').length,
    approved: events.filter(e => e.status === 'approved').length,
    rejected: events.filter(e => e.status === 'rejected').length,
  };

  const sidebarItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'create', label: 'Create Event' },
    { key: 'calendar', label: 'Calendar' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: toast.type === 'error' ? '#fef2f2' : toast.type === 'warning' ? '#fffbeb' : '#f0fdf4',
          border: `1px solid ${toast.type === 'error' ? '#fca5a5' : toast.type === 'warning' ? '#fcd34d' : '#86efac'}`,
          borderRadius: '10px', padding: '12px 20px',
          color: toast.type === 'error' ? '#b91c1c' : toast.type === 'warning' ? '#92400e' : '#15803d',
          fontSize: '14px', fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          animation: 'slideIn 0.3s ease',
        }}>{toast.msg}</div>
      )}

      {/* Sidebar */}
      <aside style={{
        width: '230px', background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        padding: '28px 16px',
        display: 'flex', flexDirection: 'column', gap: '4px',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
      }}>
        <div style={{ marginBottom: '32px', paddingLeft: '8px' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
            UniConnect
          </div>
          <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600, letterSpacing: '0.05em', marginTop: '2px' }}>
            EVENT CREATION
          </div>
        </div>

        {sidebarItems.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            display: 'flex', alignItems: 'center', padding: '10px 14px',
            borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left',
            background: activeTab === tab.key ? '#eff6ff' : 'transparent',
            color: activeTab === tab.key ? '#2563eb' : '#64748b',
            fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', fontWeight: 600,
            transition: 'all 0.15s',
            borderLeft: activeTab === tab.key ? '3px solid #2563eb' : '3px solid transparent',
          }}>
            {tab.label}
          </button>
        ))}

        {/* Stats box */}
        <div style={{ marginTop: 'auto', padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '10px', fontWeight: 700, letterSpacing: '0.08em' }}>
            OVERVIEW
          </div>
          {[
            ['Total', stats.total, '#2563eb'],
            ['Pending', stats.pending, '#d97706'],
            ['Approved', stats.approved, '#16a34a'],
            ['Rejected', stats.rejected, '#dc2626'],
          ].map(([l, v, c]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>{l}</span>
              <span style={{
                fontSize: '13px', fontWeight: 700, color: '#fff',
                background: c, borderRadius: '20px',
                padding: '1px 10px', minWidth: '26px', textAlign: 'center',
              }}>{v}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: '230px', padding: '36px 40px', flex: 1 }}>

        {/* Page Header */}
        <div style={{ marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>
            {activeTab === 'dashboard' ? 'Event Dashboard' : activeTab === 'create' ? (editData ? 'Edit Event' : 'Create Event') : 'Event Calendar'}
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '4px', fontSize: '14px' }}>
            University Event Management System
          </p>
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
              {[
                { label: 'Total Events', value: stats.total, color: '#2563eb', bg: '#eff6ff' },
                { label: 'Pending', value: stats.pending, color: '#d97706', bg: '#fffbeb' },
                { label: 'Approved', value: stats.approved, color: '#16a34a', bg: '#f0fdf4' },
                { label: 'Rejected', value: stats.rejected, color: '#dc2626', bg: '#fef2f2' },
              ].map(s => (
                <div key={s.label} style={{
                  background: '#ffffff', border: '1px solid #e2e8f0',
                  borderRadius: '12px', padding: '20px 22px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: s.color, fontFamily: 'Syne, sans-serif' }}>{s.value}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{s.label}</div>
                  <div style={{ marginTop: '10px', height: '3px', borderRadius: '2px', background: s.bg }}>
                    <div style={{ height: '100%', width: `${stats.total ? (s.value / stats.total) * 100 : 0}%`, background: s.color, borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
              {['all', 'pending', 'approved', 'rejected'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '7px 18px', borderRadius: '6px',
                  border: filter === f ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                  background: filter === f ? '#2563eb' : '#ffffff',
                  color: filter === f ? '#ffffff' : '#64748b',
                  fontSize: '13px', fontWeight: 600,
                  fontFamily: 'Space Grotesk, sans-serif',
                  transition: 'all 0.15s',
                }}>
                  {f === 'all' ? `All (${stats.total})` : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Event List */}
            {loading ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px', fontSize: '15px' }}>
                Loading events...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '60px', background: '#ffffff',
                borderRadius: '14px', border: '1px dashed #e2e8f0', color: '#94a3b8',
              }}>
                <p style={{ fontSize: '16px', fontWeight: 600 }}>No events found</p>
                <p style={{ fontSize: '13px', marginTop: '6px' }}>Create your first event using the sidebar</p>
              </div>
            ) : (
              filtered.map(event => (
                <EventCard key={event._id} event={event}
                  onEdit={(ev) => { setEditData(ev); setActiveTab('create'); }}
                  
                onDelete={handleDelete}
                />
              ))
            )}
          </>
        )}

        {/* CREATE / EDIT TAB */}
        {activeTab === 'create' && (
          <EventForm
            onSubmit={editData ? handleUpdate : handleCreate}
            editData={editData}
            onCancelEdit={() => { setEditData(null); setActiveTab('dashboard'); }}
            bookedDates={bookedDates}
          />
        )}

        {/* CALENDAR TAB */}
        {activeTab === 'calendar' && (
          <EventCalendar events={events} />
        )}
      </main>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        button:hover { opacity: 0.88; }
      `}</style>
    </div>
  );
}