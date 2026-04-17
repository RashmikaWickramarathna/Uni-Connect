import React, { useState, useEffect } from 'react';
import AdminEventCard from './components/AdminEventCard';
import AdminCalendar from './components/AdminCalendar';
import Analytics from './components/Analytics';
import Reminders from './components/Reminders';
import ReasonModal from './components/ReasonModal';
import { getAllEvents, approveEvent, rejectEvent, deleteEvent } from './api';

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

export default function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),4000); };

  const fetchEvents = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try { const r=await getAllEvents(); setEvents((r.data || []).map(normalizeEvent)); }
    catch { showToast('Failed to load events.','error'); }
    finally { if (showLoading) setLoading(false); }
  };

  useEffect(() => {
    fetchEvents();

    const handleFocus = () => {
      fetchEvents(false);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleApprove = async (id) => {
    try {
      const r=await approveEvent(id);
      setEvents(p=>p.map(e=>e._id===id?normalizeEvent(r.data):e));
      showToast('Event approved! Society has been notified.');
    } catch(err) { showToast(err.response?.data?.errors?.[0]||'Failed.','error'); }
  };

  const handleRejectConfirm = async (reason) => {
    try {
      const r=await rejectEvent(rejectModal._id,reason);
      setEvents(p=>p.map(e=>e._id===rejectModal._id?normalizeEvent(r.data):e));
      showToast('Event rejected. Society notified with reason.','warning');
    } catch(err) { showToast(err.response?.data?.errors?.[0]||'Failed.','error'); }
    finally { setRejectModal(null); }
  };

  const handleDeleteConfirm = async (reason) => {
    try {
      await deleteEvent(deleteModal._id,reason);
      setEvents(p=>p.filter(e=>e._id!==deleteModal._id));
      showToast('Event deleted. Society notified.','warning');
    } catch(err) { showToast(err.response?.data?.errors?.[0]||'Failed.','error'); }
    finally { setDeleteModal(null); }
  };

  const stats = {
    total:    events.length,
    pending:  events.filter(e=>e.status==='pending').length,
    approved: events.filter(e=>e.status==='approved').length,
    rejected: events.filter(e=>e.status==='rejected').length,
  };

  let filtered = filter==='all' ? events : events.filter(e=>e.status===filter);
  if (search.trim()) {
    const searchValue = search.toLowerCase();
    filtered = filtered.filter(e=>
      safeText(e.title).toLowerCase().includes(searchValue) ||
      safeText(e.organizer).toLowerCase().includes(searchValue) ||
      safeText(e.venue).toLowerCase().includes(searchValue) ||
      safeText(e.organizerEmail).toLowerCase().includes(searchValue)
    );
  }

  const tabs = [
    {key:'dashboard',label:'Event Management'},
    {key:'analytics',label:'Analytics'},
    {key:'reminders',label:'Reminders'},
    {key:'calendar', label:'Calendar'},
  ];

  const tStyle = t => t==='error'
    ? {bg:'#fef2f2',border:'#fca5a5',color:'#b91c1c'}
    : t==='warning'
    ? {bg:'#fffbeb',border:'#fcd34d',color:'#92400e'}
    : {bg:'#f0fdf4',border:'#86efac',color:'#15803d'};

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',display:'flex'}}>

      {/* Toast */}
      {toast&&(()=>{const ts=tStyle(toast.type);return(
        <div style={{position:'fixed',top:'20px',right:'20px',zIndex:9999,background:ts.bg,border:`1px solid ${ts.border}`,borderRadius:'10px',padding:'12px 20px',color:ts.color,fontSize:'14px',fontWeight:600,boxShadow:'0 4px 20px rgba(0,0,0,0.08)',animation:'slideIn 0.3s ease',maxWidth:'380px'}}>
          {toast.msg}
        </div>
      );})()}

      {/* Modals */}
      {rejectModal&&<ReasonModal type="reject" eventTitle={rejectModal.title} onConfirm={handleRejectConfirm} onCancel={()=>setRejectModal(null)}/>}
      {deleteModal&&<ReasonModal type="delete" eventTitle={deleteModal.title} onConfirm={handleDeleteConfirm} onCancel={()=>setDeleteModal(null)}/>}

      {/* Sidebar */}
      <aside style={{width:'230px',background:'#fff',borderRight:'1px solid #e2e8f0',padding:'28px 16px',display:'flex',flexDirection:'column',position:'fixed',top:0,left:0,bottom:0,boxShadow:'2px 0 8px rgba(0,0,0,0.04)',zIndex:100}}>
        <div style={{marginBottom:'32px',paddingLeft:'8px'}}>
          <div style={{fontFamily:'Syne, sans-serif',fontSize:'22px',fontWeight:800,color:'#0f172a'}}>UniEvents</div>
          <div style={{fontSize:'11px',color:'#dc2626',fontWeight:700,letterSpacing:'0.05em',marginTop:'2px'}}>ADMIN PANEL</div>
        </div>

        {tabs.map(t=>(
          <button key={t.key} onClick={()=>setActiveTab(t.key)}
            style={{display:'flex',alignItems:'center',padding:'10px 14px',borderRadius:'8px',border:'none',cursor:'pointer',textAlign:'left',background:activeTab===t.key?'#eff6ff':'transparent',color:activeTab===t.key?'#2563eb':'#64748b',fontFamily:'Space Grotesk, sans-serif',fontSize:'14px',fontWeight:600,borderLeft:activeTab===t.key?'3px solid #2563eb':'3px solid transparent',marginBottom:'4px',transition:'all 0.15s'}}>
            {t.label}
            {t.key==='dashboard'&&stats.pending>0&&<span style={{marginLeft:'auto',background:'#dc2626',color:'#fff',borderRadius:'50%',fontSize:'11px',fontWeight:700,width:'18px',height:'18px',display:'flex',alignItems:'center',justifyContent:'center'}}>{stats.pending}</span>}
          </button>
        ))}

        {/* Stats */}
        <div style={{marginTop:'auto',padding:'16px',background:'#f8fafc',borderRadius:'10px',border:'1px solid #e2e8f0'}}>
          <div style={{fontSize:'10px',color:'#94a3b8',marginBottom:'10px',fontWeight:700,letterSpacing:'0.08em'}}>OVERVIEW</div>
          {[['Total',stats.total,'#2563eb'],['Pending',stats.pending,'#d97706'],['Approved',stats.approved,'#16a34a'],['Rejected',stats.rejected,'#dc2626']].map(([l,v,c])=>(
            <div key={l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
              <span style={{fontSize:'13px',color:'#64748b'}}>{l}</span>
              <span style={{fontSize:'13px',fontWeight:700,color:'#fff',background:c,borderRadius:'20px',padding:'1px 10px',minWidth:'26px',textAlign:'center'}}>{v}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main style={{marginLeft:'230px',padding:'36px 40px',flex:1}}>
        <div style={{marginBottom:'28px',paddingBottom:'20px',borderBottom:'1px solid #e2e8f0'}}>
          <h1 style={{fontFamily:'Syne, sans-serif',fontSize:'26px',fontWeight:800,color:'#0f172a'}}>
            {{dashboard:'Event Management',analytics:'Analytics',reminders:'Reminders',calendar:'Calendar'}[activeTab]}
          </h1>
          <p style={{color:'#94a3b8',marginTop:'4px',fontSize:'14px'}}>Admin Panel — University Event Management System</p>
        </div>

        {/* DASHBOARD */}
        {activeTab==='dashboard'&&(
          <>
            {/* Stat cards — clickable to filter */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'28px'}}>
              {[
                {label:'Total Events',value:stats.total,color:'#2563eb',f:'all'},
                {label:'Pending Review',value:stats.pending,color:'#d97706',f:'pending'},
                {label:'Approved',value:stats.approved,color:'#16a34a',f:'approved'},
                {label:'Rejected',value:stats.rejected,color:'#dc2626',f:'rejected'},
              ].map(s=>(
                <div key={s.label} onClick={()=>setFilter(s.f)} style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:'12px',padding:'20px 22px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)',borderTop:`3px solid ${s.color}`,cursor:'pointer',transition:'box-shadow 0.2s'}}
                  onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'}
                  onMouseLeave={e=>e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.04)'}>
                  <div style={{fontSize:'28px',fontWeight:800,color:s.color,fontFamily:'Syne, sans-serif'}}>{s.value}</div>
                  <div style={{fontSize:'13px',color:'#64748b',marginTop:'4px'}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Search + filter */}
            <div style={{display:'flex',gap:'12px',marginBottom:'20px',flexWrap:'wrap',alignItems:'center'}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by title, society, venue, email..."
                style={{flex:1,minWidth:'200px',padding:'9px 14px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'14px',color:'#0f172a',fontFamily:'Space Grotesk, sans-serif',outline:'none',background:'#fff'}}/>
              <div style={{display:'flex',gap:'6px'}}>
                {['all','pending','approved','rejected'].map(f=>(
                  <button key={f} onClick={()=>setFilter(f)} style={{padding:'7px 14px',borderRadius:'6px',border:filter===f?'1px solid #2563eb':'1px solid #e2e8f0',background:filter===f?'#2563eb':'#fff',color:filter===f?'#fff':'#64748b',fontSize:'13px',fontWeight:600,fontFamily:'Space Grotesk, sans-serif',cursor:'pointer',transition:'all 0.15s'}}>
                    {f==='all'?`All (${stats.total})`:f.charAt(0).toUpperCase()+f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {stats.pending>0&&filter==='all'&&(
              <div style={{background:'#fffbeb',border:'1px solid #fcd34d',borderRadius:'10px',padding:'12px 18px',marginBottom:'20px',fontSize:'13px',color:'#92400e',fontWeight:600}}>
                {stats.pending} event{stats.pending>1?'s':''} waiting for your review. Approve or reject with a reason — the society will be notified automatically.
              </div>
            )}

            {loading?(
              <div style={{textAlign:'center',color:'#94a3b8',padding:'60px',fontSize:'15px'}}>Loading events...</div>
            ):filtered.length===0?(
              <div style={{textAlign:'center',padding:'60px',background:'#fff',borderRadius:'14px',border:'1px dashed #e2e8f0',color:'#94a3b8'}}>
                <div style={{fontSize:'40px',marginBottom:'12px'}}>📭</div>
                <p style={{fontSize:'16px',fontWeight:600}}>{search?'No events match your search':'No events found'}</p>
              </div>
            ):filtered.map(ev=>(
              <AdminEventCard key={ev._id} event={ev}
                onApprove={handleApprove}
                onReject={setRejectModal}
                onDelete={setDeleteModal}
                onEdit={()=>{}}
              />
            ))}
          </>
        )}

        {activeTab==='analytics'&&<Analytics/>}
        {activeTab==='reminders'&&<Reminders events={events}/>}
        {activeTab==='calendar' &&<AdminCalendar events={events}/>}
      </main>

      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateX(16px);}to{opacity:1;transform:translateX(0);} }
        button:hover{opacity:0.88;}
      `}</style>
    </div>
  );
}
