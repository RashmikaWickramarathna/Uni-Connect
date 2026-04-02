import React, { useState, useEffect } from 'react';
import AdminEventCard from './components/AdminEventCard';
import AdminCalendar from './components/AdminCalendar';
import Analytics from './components/Analytics';
import Reminders from './components/Reminders';
import ReasonModal from './components/ReasonModal';
import EditEventModal from './components/EditEventModal';
import { getEvents, approveEvent, rejectEvent, deleteEvent, updateEvent } from './api';

export default function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [toast, setToast] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editModal, setEditModal] = useState(null);

  const showToast = (msg, type='success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchEvents = async () => {
    try { const r = await getEvents(); setEvents(r.data); }
    catch { showToast('Failed to load events.','error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleApprove = async (id) => {
    try {
      const r = await approveEvent(id);
      setEvents(p => p.map(e => e._id===id ? r.data : e));
      showToast('Event approved successfully!');
    } catch (err) { showToast(err.response?.data?.errors?.[0]||'Approval failed.','error'); }
  };

  const handleRejectConfirm = async (reason) => {
    try {
      const r = await rejectEvent(rejectModal._id, reason);
      setEvents(p => p.map(e => e._id===rejectModal._id ? r.data : e));
      showToast('Event rejected. Society notified with reason.','warning');
    } catch (err) { showToast(err.response?.data?.errors?.[0]||'Rejection failed.','error'); }
    finally { setRejectModal(null); }
  };

  const handleDeleteConfirm = async (reason) => {
    try {
      await deleteEvent(deleteModal._id, reason);
      setEvents(p => p.filter(e => e._id!==deleteModal._id));
      showToast('Event deleted.','warning');
    } catch (err) { showToast(err.response?.data?.errors?.[0]||'Delete failed.','error'); }
    finally { setDeleteModal(null); }
  };

  const handleEditSave = async (id, formData) => {
    const r = await updateEvent(id, formData);
    setEvents(p => p.map(e => e._id===id ? r.data : e));
    setEditModal(null);
    showToast('Event updated successfully!');
  };

  const stats = {
    total: events.length,
    pending: events.filter(e=>e.status==='pending').length,
    approved: events.filter(e=>e.status==='approved').length,
    rejected: events.filter(e=>e.status==='rejected').length,
  };

  const filtered = events.filter(e => {
    const statusMatch = filter === 'all' || e.status === filter;
    const dateMatch = !dateFilter || e.date === dateFilter;
    return statusMatch && dateMatch;
  });

  const tabs = [
    { key:'dashboard', label:'Dashboard' },
    { key:'analytics', label:'Analytics' },
    { key:'reminders', label:'Reminders' },
    { key:'calendar',  label:'Calendar' },
  ];

  const toastColor = t => t==='error'?{bg:'#fef2f2',border:'#fca5a5',color:'#b91c1c'}:t==='warning'?{bg:'#fffbeb',border:'#fcd34d',color:'#92400e'}:{bg:'#f0fdf4',border:'#86efac',color:'#15803d'};

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', display:'flex' }}>

      {/* Toast */}
      {toast && (() => { const c=toastColor(toast.type); return (
        <div style={{ position:'fixed', top:'20px', right:'20px', zIndex:9999, background:c.bg, border:`1px solid ${c.border}`, borderRadius:'10px', padding:'12px 20px', color:c.color, fontSize:'14px', fontWeight:600, boxShadow:'0 4px 20px rgba(0,0,0,0.08)', animation:'slideIn 0.3s ease', maxWidth:'380px' }}>
          {toast.msg}
        </div>
      );})()}

      {/* Modals */}
      {rejectModal && <ReasonModal type="reject" eventTitle={rejectModal.title} onConfirm={handleRejectConfirm} onCancel={() => setRejectModal(null)} />}
      {deleteModal && <ReasonModal type="delete" eventTitle={deleteModal.title} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteModal(null)} />}
      {editModal   && <EditEventModal event={editModal} onSave={handleEditSave} onCancel={() => setEditModal(null)} />}

      {/* Sidebar */}
      <aside style={{ width:'230px', background:'#fff', borderRight:'1px solid #e2e8f0', padding:'28px 16px', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, bottom:0, boxShadow:'2px 0 8px rgba(0,0,0,0.04)' }}>
        <div style={{ marginBottom:'32px', paddingLeft:'8px' }}>
          <div style={{ fontFamily:'Syne, sans-serif', fontSize:'22px', fontWeight:800, color:'#0f172a' }}>Uni Connect</div>
          <div style={{ fontSize:'11px', color:'#dc2626', fontWeight:700, letterSpacing:'0.05em', marginTop:'2px' }}>ADMIN PANEL</div>
        </div>

        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ display:'flex', alignItems:'center', padding:'10px 14px', borderRadius:'8px', border:'none', cursor:'pointer', textAlign:'left', background:activeTab===t.key?'#eff6ff':'transparent', color:activeTab===t.key?'#2563eb':'#64748b', fontFamily:'Space Grotesk, sans-serif', fontSize:'14px', fontWeight:600, borderLeft:activeTab===t.key?'3px solid #2563eb':'3px solid transparent', marginBottom:'4px', transition:'all 0.15s' }}>
            {t.label}
          </button>
        ))}

        {/* Stats */}
        <div style={{ marginTop:'auto', padding:'16px', background:'#f8fafc', borderRadius:'10px', border:'1px solid #e2e8f0' }}>
          <div style={{ fontSize:'10px', color:'#94a3b8', marginBottom:'10px', fontWeight:700, letterSpacing:'0.08em' }}>OVERVIEW</div>
          {[['Total',stats.total,'#2563eb'],['Pending',stats.pending,'#d97706'],['Approved',stats.approved,'#16a34a'],['Rejected',stats.rejected,'#dc2626']].map(([l,v,c]) => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
              <span style={{ fontSize:'13px', color:'#64748b' }}>{l}</span>
              <span style={{ fontSize:'13px', fontWeight:700, color:'#fff', background:c, borderRadius:'20px', padding:'1px 10px', minWidth:'26px', textAlign:'center' }}>{v}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft:'230px', padding:'36px 40px', flex:1 }}>
        <div style={{ marginBottom:'28px', paddingBottom:'20px', borderBottom:'1px solid #e2e8f0' }}>
          <h1 style={{ fontFamily:'Syne, sans-serif', fontSize:'26px', fontWeight:800, color:'#0f172a' }}>
            {{ dashboard:'Event Management', analytics:'Analytics', reminders:'Reminders', calendar:'Calendar' }[activeTab]}
          </h1>
          <p style={{ color:'#94a3b8', marginTop:'4px', fontSize:'14px' }}>Admin Panel — University Event Management System</p>
        </div>

        {/* DASHBOARD */}
        {activeTab==='dashboard' && (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'28px' }}>
              {[{label:'Total Events',value:stats.total,color:'#2563eb'},{label:'Pending Review',value:stats.pending,color:'#d97706'},{label:'Approved',value:stats.approved,color:'#16a34a'},{label:'Rejected',value:stats.rejected,color:'#dc2626'}].map(s => (
                <div key={s.label} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'12px', padding:'20px 22px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', borderTop:`3px solid ${s.color}` }}>
                  <div style={{ fontSize:'28px', fontWeight:800, color:s.color, fontFamily:'Syne, sans-serif' }}>{s.value}</div>
                  <div style={{ fontSize:'13px', color:'#64748b', marginTop:'4px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', gap:'6px', marginBottom:'20px' }}>
              {['all','pending','approved','rejected'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ padding:'7px 18px', borderRadius:'6px', border:filter===f?'1px solid #2563eb':'1px solid #e2e8f0', background:filter===f?'#2563eb':'#fff', color:filter===f?'#fff':'#64748b', fontSize:'13px', fontWeight:600, fontFamily:'Space Grotesk, sans-serif', cursor:'pointer', transition:'all 0.15s' }}>
                  {f==='all'?`All (${stats.total})`:f.charAt(0).toUpperCase()+f.slice(1)}
                </button>
              ))}
            </div>

            <div style={{ display:'flex', gap:'10px', alignItems:'center', marginBottom:'20px' }}>
              <label style={{ fontSize:'13px', color:'#475569', fontWeight:600 }}>Search by date:</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ padding:'8px 10px', border:'1px solid #cbd5e1', borderRadius:'8px', background:'#fff', color:'#0f172a' }}
              />
              {dateFilter && (
                <button onClick={() => setDateFilter('')} style={{ padding:'8px 12px', borderRadius:'8px', border:'1px solid #e2e8f0', background:'#f8fafc', color:'#475569', cursor:'pointer' }}>
                  Clear
                </button>
              )}
            </div>

            {stats.pending>0 && filter==='all' && (
              <div style={{ background:'#fffbeb', border:'1px solid #fcd34d', borderRadius:'10px', padding:'12px 18px', marginBottom:'20px', fontSize:'13px', color:'#92400e', fontWeight:600 }}>
                {stats.pending} event{stats.pending>1?'s':''} waiting for your review.
              </div>
            )}

            {loading ? (
              <div style={{ textAlign:'center', color:'#94a3b8', padding:'60px' }}>Loading events...</div>
            ) : filtered.length===0 ? (
              <div style={{ textAlign:'center', padding:'60px', background:'#fff', borderRadius:'14px', border:'1px dashed #e2e8f0', color:'#94a3b8' }}>
                <p style={{ fontSize:'16px', fontWeight:600 }}>No events found</p>
              </div>
            ) : filtered.map(ev => (
              <AdminEventCard key={ev._id} event={ev}
                onApprove={handleApprove}
                onReject={setRejectModal}
                onDelete={setDeleteModal}
                onEdit={setEditModal}
              />
            ))}
          </>
        )}

        {activeTab==='analytics' && <Analytics />}
        {activeTab==='reminders' && <Reminders events={events} />}
        {activeTab==='calendar'  && <AdminCalendar events={events} />}
      </main>

      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
      `}</style>
    </div>
  );
}