import React, { useState, useEffect } from 'react';
import { getNotifications, markRead, markAllRead } from '../api';

const typeConfig = {
  approved: { bg:'#f0fdf4', border:'#86efac', color:'#16a34a', label:'Approved' },
  rejected: { bg:'#fef2f2', border:'#fca5a5', color:'#dc2626', label:'Rejected' },
  deleted:  { bg:'#fef2f2', border:'#fca5a5', color:'#dc2626', label:'Deleted' },
  reminder: { bg:'#eff6ff', border:'#bfdbfe', color:'#2563eb', label:'Reminder' },
  upcoming: { bg:'#fdf4ff', border:'#e9d5ff', color:'#7c3aed', label:'Upcoming' },
};

export default function NotificationBanner({ userEmail }) {
  const [notifications, setNotifications] = useState([]);
  const [banner, setBanner] = useState(null);
  const [showList, setShowList] = useState(false);

  const unread = notifications.filter(n => !n.isRead).length;

  const fetch = async () => {
    if (!userEmail) return;
    try { const r = await getNotifications(userEmail); setNotifications(r.data); }
    catch {}
  };

  useEffect(() => { fetch(); const iv = setInterval(fetch, 30000); return () => clearInterval(iv); }, [userEmail]);

  useEffect(() => {
    const newN = notifications.find(n => !n.isRead);
    if (newN && (!banner || banner._id !== newN._id)) {
      setBanner(newN);
      setTimeout(() => setBanner(null), 6000);
    }
  }, [notifications]);

  const dismiss = async (id) => {
    setBanner(null);
    await markRead(id);
    fetch();
  };

  const fmtTime = dt => dt ? new Date(dt).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '';

  return (
    <>
      <div style={{ position:'relative' }}>
        <button onClick={() => setShowList(!showList)} style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'8px 14px', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', fontFamily:'Space Grotesk, sans-serif', fontSize:'14px', color:'#374151' }}>
          🔔
          {unread > 0 && (
            <span style={{ background:'#dc2626', color:'#fff', borderRadius:'50%', fontSize:'11px', fontWeight:700, minWidth:'18px', height:'18px', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px' }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {showList && (
          <div style={{ position:'absolute', right:0, top:'44px', width:'360px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:'12px', boxShadow:'0 8px 30px rgba(0,0,0,0.12)', zIndex:1000, overflow:'hidden' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', borderBottom:'1px solid #f1f5f9' }}>
              <span style={{ fontWeight:700, fontSize:'14px', fontFamily:'Syne, sans-serif', color:'#0f172a' }}>Notifications</span>
              {unread > 0 && (
                <button onClick={async () => { await markAllRead(userEmail); fetch(); }} style={{ fontSize:'12px', color:'#2563eb', background:'none', border:'none', cursor:'pointer', fontWeight:600, fontFamily:'Space Grotesk, sans-serif' }}>Mark all read</button>
              )}
            </div>
            <div style={{ maxHeight:'380px', overflowY:'auto' }}>
              {notifications.length === 0 && <p style={{ textAlign:'center', color:'#94a3b8', padding:'24px', fontSize:'13px' }}>No notifications yet</p>}
              {notifications.map(n => {
                const cfg = typeConfig[n.type] || typeConfig.reminder;
                return (
                  <div key={n._id} onClick={async () => { await markRead(n._id); fetch(); }}
                    style={{ padding:'12px 16px', background:n.isRead?'#fff':cfg.bg, borderBottom:'1px solid #f1f5f9', cursor:'pointer', borderLeft:`3px solid ${n.isRead?'#e2e8f0':cfg.color}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'4px' }}>
                      <span style={{ fontSize:'11px', fontWeight:700, color:cfg.color, background:cfg.bg, padding:'2px 8px', borderRadius:'20px', border:`1px solid ${cfg.border}` }}>{cfg.label}</span>
                      <span style={{ fontSize:'11px', color:'#94a3b8' }}>{fmtTime(n.createdAt)}</span>
                    </div>
                    <p style={{ fontSize:'13px', color:'#374151', lineHeight:1.5 }}>{n.message}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sliding banner */}
      {banner && (() => {
        const cfg = typeConfig[banner.type] || typeConfig.reminder;
        return (
          <div style={{ position:'fixed', top:'20px', right:'20px', width:'380px', background:cfg.bg, border:`1px solid ${cfg.border}`, borderRadius:'12px', padding:'16px 18px', boxShadow:'0 8px 30px rgba(0,0,0,0.15)', zIndex:9999, animation:'slideInRight 0.4s ease' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px' }}>
              <span style={{ fontSize:'12px', fontWeight:700, color:cfg.color }}>{cfg.label}</span>
              <button onClick={() => dismiss(banner._id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:'18px', lineHeight:1 }}>×</button>
            </div>
            <p style={{ fontSize:'13px', color:'#374151', lineHeight:1.5, marginBottom:'10px' }}>{banner.message}</p>
            <div style={{ height:'3px', background:'#e2e8f0', borderRadius:'2px', overflow:'hidden' }}>
              <div style={{ height:'100%', background:cfg.color, borderRadius:'2px', animation:'shrink 6s linear forwards' }} />
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes slideInRight { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes shrink { from { width:100%; } to { width:0%; } }
      `}</style>
    </>
  );
}