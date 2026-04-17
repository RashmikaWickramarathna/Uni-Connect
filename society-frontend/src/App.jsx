import React, { useState, useEffect } from 'react';
import ApprovalRegistration from './components/ApprovalRegistration';
import EventForm from './components/EventForm';
import EventCard from './components/EventCard';
import EventCalendar from './components/EventCalendar';
import NotificationBanner from './components/NotificationBanner';
import PostGenerator from './components/PostGenerator';
import { getSocietyEvents, createEvent, updateEvent, deleteEvent } from './api';

const DEMO_USER = {
  name: 'Computer Science Society',
  email: 'cssociety@university.edu',
  role: 'society',
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || DEMO_USER;
  } catch {
    return DEMO_USER;
  }
};

const safeText = value => String(value ?? '');

const normalizeStatus = status => {
  const normalized = safeText(status).toLowerCase();
  if (normalized === 'published') return 'approved';
  if (normalized === 'draft') return 'pending';
  return normalized || 'pending';
};

const normalizeEvent = event => ({
  ...event,
  title: safeText(event?.title).trim() || 'Untitled Event',
  description: safeText(event?.description),
  organizer: safeText(event?.organizer).trim() || 'Unknown Society',
  organizerEmail: safeText(event?.organizerEmail).trim().toLowerCase(),
  venue: safeText(event?.venue).trim() || 'TBA',
  category: safeText(event?.category).trim() || 'Other',
  date: safeText(event?.date),
  time: safeText(event?.time),
  status: normalizeStatus(event?.status),
  maxParticipants: Number(event?.maxParticipants) > 0 ? Number(event.maxParticipants) : 100,
  tags: Array.isArray(event?.tags) ? event.tags : [],
  views: Number.isFinite(Number(event?.views)) ? Number(event.views) : 0,
});

const withOwnedEventFields = (formData, currentUser) => {
  const next = new FormData();
  for (const [key, value] of formData.entries()) {
    next.append(key, value);
  }
  if (currentUser?.name) next.set('organizer', currentUser.name);
  if (currentUser?.email) next.set('organizerEmail', currentUser.email);
  return next;
};

export default function App() {
  const [user, setUser] = useState(getStoredUser);
  const [approvalToken, setApprovalToken] = useState(
    () => new URLSearchParams(window.location.search).get('approvalToken')
  );
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filter, setFilter] = useState('all');
  const [editData, setEditData] = useState(null);
  const [toast, setToast] = useState(null);
  const [postEvent, setPostEvent] = useState(null);
  const [search, setSearch] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const clearApprovalToken = () => {
    setApprovalToken(null);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleRegistrationComplete = (registeredSociety) => {
    const nextUser = {
      name: registeredSociety?.societyName || DEMO_USER.name,
      email: registeredSociety?.officialEmail || DEMO_USER.email,
      role: 'society',
    };

    localStorage.setItem('user', JSON.stringify(nextUser));
    setUser(nextUser);
    clearApprovalToken();
    showToast(
      registeredSociety?.message || 'Society account created successfully.'
    );
  };

  const fetchEvents = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await getSocietyEvents(user.email, user.name);
      setEvents((res.data || []).map(normalizeEvent));
    } catch {
      showToast('Failed to load events.', 'error');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (approvalToken) return undefined;

    fetchEvents();

    const handleFocus = () => {
      fetchEvents(false);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [approvalToken, user.email, user.name]);

  const handleCreate = async (formData) => {
    const res = await createEvent(withOwnedEventFields(formData, user));
    setEvents(p => [normalizeEvent(res.data), ...p]);
    showToast('Event created! Waiting for admin approval.');
    setActiveTab('dashboard');
  };

  const handleUpdate = async (formData) => {
    const res = await updateEvent(editData._id, withOwnedEventFields(formData, user));
    setEvents(p => p.map(e => e._id === editData._id ? normalizeEvent(res.data) : e));
    setEditData(null);
    showToast('Event updated successfully!');
    setActiveTab('dashboard');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    await deleteEvent(id);
    setEvents(p => p.filter(e => e._id !== id));
    showToast('Event deleted.', 'warning');
  };

  const handleEdit = (event) => { setEditData(event); setActiveTab('create'); };

  const stats = {
    total:    events.length,
    pending:  events.filter(e => e.status === 'pending').length,
    approved: events.filter(e => e.status === 'approved').length,
    rejected: events.filter(e => e.status === 'rejected').length,
  };

  const bookedDates = events.map(e => ({ date: e.date, title: e.title, id: e._id }));

  // Filter and search
  let filtered = filter === 'all' ? events : events.filter(e => e.status === filter);
  if (search.trim()) {
    const searchValue = search.toLowerCase();
    filtered = filtered.filter(e =>
      safeText(e.title).toLowerCase().includes(searchValue) ||
      safeText(e.venue).toLowerCase().includes(searchValue) ||
      safeText(e.category).toLowerCase().includes(searchValue)
    );
  }

  const tabs = [
    { key: 'dashboard', label: 'My Events' },
    { key: 'create', label: editData ? 'Edit Event' : 'Create Event' },
    { key: 'calendar', label: 'Calendar' },
  ];

  const toastStyle = t => t === 'error'
    ? { bg: '#fef2f2', border: '#fca5a5', color: '#b91c1c' }
    : t === 'warning'
    ? { bg: '#fffbeb', border: '#fcd34d', color: '#92400e' }
    : { bg: '#f0fdf4', border: '#86efac', color: '#15803d' };

  // Upcoming events in next 7 days
  const today = new Date(); today.setHours(0,0,0,0);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const upcomingSoon = events.filter(e => {
    if (e.status !== 'approved' || !e.date) return false;
    const diff = Math.ceil((new Date(e.date+'T00:00:00') - today) / (1000*60*60*24));
    return diff >= 0 && diff <= 7;
  });

  if (approvalToken) {
    return (
      <ApprovalRegistration
        token={approvalToken}
        onRegistered={handleRegistrationComplete}
        onDismiss={clearApprovalToken}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex' }}>

      {/* Toast */}
      {toast && (() => { const ts = toastStyle(toast.type); return (
        <div style={{ position:'fixed', top:'20px', right:'20px', zIndex:9990, background:ts.bg, border:`1px solid ${ts.border}`, borderRadius:'10px', padding:'12px 20px', color:ts.color, fontSize:'14px', fontWeight:600, boxShadow:'0 4px 20px rgba(0,0,0,0.08)', animation:'slideIn 0.3s ease', maxWidth:'380px' }}>
          {toast.msg}
        </div>
      ); })()}

      {/* Post Generator Modal */}
      {postEvent && <PostGenerator event={postEvent} onClose={() => setPostEvent(null)} />}

      {/* Sidebar */}
      <aside style={{ width:'230px', background:'#fff', borderRight:'1px solid #e2e8f0', padding:'28px 16px', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, bottom:0, boxShadow:'2px 0 8px rgba(0,0,0,0.04)', zIndex:100 }}>
        <div style={{ marginBottom:'28px', paddingLeft:'8px' }}>
          <div style={{ fontFamily:'Syne, sans-serif', fontSize:'22px', fontWeight:800, color:'#0f172a' }}>UniEvents</div>
          <div style={{ fontSize:'11px', color:'#2563eb', fontWeight:700, letterSpacing:'0.05em', marginTop:'2px' }}>SOCIETY PORTAL</div>
        </div>

        {tabs.map(t => (
          <button key={t.key} onClick={() => { setActiveTab(t.key); if (t.key !== 'create') setEditData(null); }}
            style={{ display:'flex', alignItems:'center', padding:'10px 14px', borderRadius:'8px', border:'none', cursor:'pointer', textAlign:'left', background:activeTab===t.key?'#eff6ff':'transparent', color:activeTab===t.key?'#2563eb':'#64748b', fontFamily:'Space Grotesk, sans-serif', fontSize:'14px', fontWeight:600, borderLeft:activeTab===t.key?'3px solid #2563eb':'3px solid transparent', marginBottom:'4px', transition:'all 0.15s' }}>
            {t.label}
          </button>
        ))}

        {/* Upcoming soon banner in sidebar */}
        {upcomingSoon.length > 0 && (
          <div style={{ margin:'16px 0', padding:'12px', background:'#fffbeb', borderRadius:'10px', border:'1px solid #fcd34d' }}>
            <div style={{ fontSize:'11px', color:'#92400e', fontWeight:700, marginBottom:'6px' }}>UPCOMING SOON</div>
            {upcomingSoon.slice(0,2).map(ev => (
              <div key={ev._id} style={{ fontSize:'12px', color:'#374151', marginBottom:'4px' }}>
                <strong>{ev.title}</strong>
                <div style={{ color:'#64748b', fontSize:'11px' }}>{ev.date}</div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div style={{ marginTop:'auto', padding:'16px', background:'#f8fafc', borderRadius:'10px', border:'1px solid #e2e8f0' }}>
          <div style={{ fontSize:'10px', color:'#94a3b8', marginBottom:'10px', fontWeight:700, letterSpacing:'0.08em' }}>MY EVENTS</div>
          {[['Total',stats.total,'#2563eb'],['Pending',stats.pending,'#d97706'],['Approved',stats.approved,'#16a34a'],['Rejected',stats.rejected,'#dc2626']].map(([l,v,c]) => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
              <span style={{ fontSize:'13px', color:'#64748b' }}>{l}</span>
              <span style={{ fontSize:'13px', fontWeight:700, color:'#fff', background:c, borderRadius:'20px', padding:'1px 10px', minWidth:'26px', textAlign:'center' }}>{v}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft:'230px', padding:'36px 40px', flex:1 }}>

        {/* Header */}
        <div style={{ marginBottom:'28px', paddingBottom:'20px', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h1 style={{ fontFamily:'Syne, sans-serif', fontSize:'26px', fontWeight:800, color:'#0f172a' }}>
              {{ dashboard:'My Events', create:editData?'Edit Event':'Create Event', calendar:'Event Calendar' }[activeTab]}
            </h1>
            <p style={{ color:'#94a3b8', marginTop:'4px', fontSize:'14px' }}>Welcome, {user.name}</p>
          </div>
          <NotificationBanner userEmail={user.email} />
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stat cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'28px' }}>
              {[
                { label:'Total Events', value:stats.total, color:'#2563eb', icon:'📋' },
                { label:'Pending', value:stats.pending, color:'#d97706', icon:'⏳' },
                { label:'Approved', value:stats.approved, color:'#16a34a', icon:'✅' },
                { label:'Rejected', value:stats.rejected, color:'#dc2626', icon:'❌' },
              ].map(s => (
                <div key={s.label} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'12px', padding:'20px 22px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', borderTop:`3px solid ${s.color}`, cursor:'pointer' }}
                  onClick={() => { setFilter(s.label.toLowerCase() === 'total events' ? 'all' : s.label.toLowerCase()); }}>
                  <div style={{ fontSize:'24px', marginBottom:'8px' }}>{s.icon}</div>
                  <div style={{ fontSize:'28px', fontWeight:800, color:s.color, fontFamily:'Syne, sans-serif' }}>{s.value}</div>
                  <div style={{ fontSize:'13px', color:'#64748b', marginTop:'4px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Search and filter */}
            <div style={{ display:'flex', gap:'12px', marginBottom:'20px', flexWrap:'wrap', alignItems:'center' }}>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search events by title, venue, category..."
                style={{ flex:1, minWidth:'200px', padding:'9px 14px', border:'1px solid #e2e8f0', borderRadius:'8px', fontSize:'14px', color:'#0f172a', fontFamily:'Space Grotesk, sans-serif', outline:'none', background:'#fff' }}
              />
              <div style={{ display:'flex', gap:'6px' }}>
                {['all','pending','approved','rejected'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding:'7px 14px', borderRadius:'6px', border:filter===f?'1px solid #2563eb':'1px solid #e2e8f0', background:filter===f?'#2563eb':'#fff', color:filter===f?'#fff':'#64748b', fontSize:'13px', fontWeight:600, fontFamily:'Space Grotesk, sans-serif', cursor:'pointer', transition:'all 0.15s' }}>
                    {f === 'all' ? `All (${stats.total})` : f.charAt(0).toUpperCase()+f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Rejected banner */}
            {stats.rejected > 0 && (
              <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:'10px', padding:'12px 18px', marginBottom:'20px', fontSize:'13px', color:'#b91c1c', fontWeight:600 }}>
                {stats.rejected} event{stats.rejected>1?'s were':' was'} rejected. Check the rejection reason and edit to resubmit.
              </div>
            )}

            {loading ? (
              <div style={{ textAlign:'center', color:'#94a3b8', padding:'60px', fontSize:'15px' }}>Loading your events...</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px', background:'#fff', borderRadius:'14px', border:'1px dashed #e2e8f0', color:'#94a3b8' }}>
                <div style={{ fontSize:'40px', marginBottom:'12px' }}>📭</div>
                <p style={{ fontSize:'16px', fontWeight:600 }}>{search ? 'No events match your search' : filter==='all'?'No events yet':'No '+filter+' events'}</p>
                {!search && filter==='all' && <p style={{ fontSize:'13px', marginTop:'6px' }}>Click "Create Event" in the sidebar to get started</p>}
              </div>
            ) : (
              filtered.map(ev => (
                <EventCard
                  key={ev._id}
                  event={ev}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onGeneratePost={setPostEvent}
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
            currentUser={user}
          />
        )}

        {/* CALENDAR TAB */}
        {activeTab === 'calendar' && <EventCalendar events={events} />}

      </main>

      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
        button:hover { opacity: 0.88; }
      `}</style>
    </div>
  );
}
