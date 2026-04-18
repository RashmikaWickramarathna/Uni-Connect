import React, { useEffect, useState } from 'react';
import { getNotifications, markAllRead, markRead } from '../api';

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

  const unread = notifications.filter(notification => !notification.isRead).length;

  const fetchNotifications = async () => {
    if (!userEmail) return;
    try {
      const response = await getNotifications(userEmail);
      setNotifications(response.data || []);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userEmail]);

  useEffect(() => {
    const newestUnread = notifications.find(notification => !notification.isRead);
    if (newestUnread && (!banner || banner._id !== newestUnread._id)) {
      setBanner(newestUnread);
      setTimeout(() => setBanner(null), 6000);
    }
  }, [notifications]);

  const dismiss = async (id) => {
    setBanner(null);
    await markRead(id);
    fetchNotifications();
  };

  const formatTime = value =>
    value
      ? new Date(value).toLocaleDateString('en-US', {
          month:'short',
          day:'numeric',
          hour:'2-digit',
          minute:'2-digit',
        })
      : '';

  return (
    <>
      <div style={{ position:'relative' }}>
        <button
          onClick={() => setShowList(!showList)}
          style={{
            minHeight:'44px',
            background:'rgba(37, 99, 235, 0.08)',
            border:'1px solid rgba(37, 99, 235, 0.16)',
            borderRadius:'14px',
            padding:'8px 14px',
            cursor:'pointer',
            display:'flex',
            alignItems:'center',
            gap:'8px',
            fontSize:'14px',
            fontWeight:700,
            color:'#2563eb',
          }}
        >
          Alerts
          {unread > 0 ? (
            <span style={{ background:'#dc2626', color:'#fff', borderRadius:'50%', fontSize:'11px', fontWeight:700, minWidth:'18px', height:'18px', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px' }}>
              {unread > 9 ? '9+' : unread}
            </span>
          ) : null}
        </button>

        {showList ? (
          <div style={{ position:'absolute', right:0, top:'52px', width:'360px', background:'#fff', border:'1px solid #e2e8f0', borderRadius:'18px', boxShadow:'0 18px 40px rgba(15,23,42,0.16)', zIndex:1000, overflow:'hidden' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', borderBottom:'1px solid #f1f5f9' }}>
              <span style={{ fontWeight:800, fontSize:'14px', color:'#0f172a' }}>Notifications</span>
              {unread > 0 ? (
                <button
                  onClick={async () => {
                    await markAllRead(userEmail);
                    fetchNotifications();
                  }}
                  style={{ fontSize:'12px', color:'#2563eb', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}
                >
                  Mark all read
                </button>
              ) : null}
            </div>

            <div style={{ maxHeight:'380px', overflowY:'auto' }}>
              {notifications.length === 0 ? (
                <p style={{ textAlign:'center', color:'#94a3b8', padding:'24px', fontSize:'13px' }}>No notifications yet</p>
              ) : (
                notifications.map(notification => {
                  const config = typeConfig[notification.type] || typeConfig.reminder;
                  return (
                    <div
                      key={notification._id}
                      onClick={async () => {
                        await markRead(notification._id);
                        fetchNotifications();
                      }}
                      style={{ padding:'12px 16px', background:notification.isRead ? '#fff' : config.bg, borderBottom:'1px solid #f1f5f9', cursor:'pointer', borderLeft:`3px solid ${notification.isRead ? '#e2e8f0' : config.color}` }}
                    >
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'4px' }}>
                        <span style={{ fontSize:'11px', fontWeight:700, color:config.color, background:config.bg, padding:'2px 8px', borderRadius:'20px', border:`1px solid ${config.border}` }}>{config.label}</span>
                        <span style={{ fontSize:'11px', color:'#94a3b8' }}>{formatTime(notification.createdAt)}</span>
                      </div>
                      <p style={{ fontSize:'13px', color:'#374151', lineHeight:1.5 }}>{notification.message}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : null}
      </div>

      {banner ? (() => {
        const config = typeConfig[banner.type] || typeConfig.reminder;
        return (
          <div style={{ position:'fixed', top:'20px', right:'20px', width:'380px', background:config.bg, border:`1px solid ${config.border}`, borderRadius:'16px', padding:'16px 18px', boxShadow:'0 18px 40px rgba(15,23,42,0.18)', zIndex:9999, animation:'slideInRight 0.4s ease' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'6px' }}>
              <span style={{ fontSize:'12px', fontWeight:700, color:config.color }}>{config.label}</span>
              <button onClick={() => dismiss(banner._id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:'18px', lineHeight:1 }}>x</button>
            </div>
            <p style={{ fontSize:'13px', color:'#374151', lineHeight:1.5, marginBottom:'10px' }}>{banner.message}</p>
            <div style={{ height:'3px', background:'#e2e8f0', borderRadius:'2px', overflow:'hidden' }}>
              <div style={{ height:'100%', background:config.color, borderRadius:'2px', animation:'shrink 6s linear forwards' }} />
            </div>
          </div>
        );
      })() : null}

      <style>{`
        @keyframes slideInRight { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes shrink { from { width:100%; } to { width:0%; } }
      `}</style>
    </>
  );
}
