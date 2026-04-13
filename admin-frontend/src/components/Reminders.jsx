import React, { useEffect, useState } from 'react';
import { getReminders } from '../api';

export default function Reminders({ events }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReminders().then(r=>{setHistory(r.data);setLoading(false);}).catch(()=>setLoading(false));
  }, []);

  const today = new Date(); today.setHours(0,0,0,0);
  const todayStr=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const upcoming = events
    .filter(e=>e.status==='approved'&&e.date>todayStr)
    .map(e=>({...e,daysUntil:Math.ceil((new Date(e.date+'T00:00:00')-today)/(1000*60*60*24))}))
    .filter(e=>e.daysUntil<=30)
    .sort((a,b)=>a.daysUntil-b.daysUntil);

  const urgent=upcoming.filter(e=>e.daysUntil<=7);
  const soon=upcoming.filter(e=>e.daysUntil>7);

  const urgColor=d=>d<=1?'#dc2626':d<=3?'#d97706':'#2563eb';
  const urgBg=d=>d<=1?'#fef2f2':d<=3?'#fffbeb':'#eff6ff';
  const urgBorder=d=>d<=1?'#fca5a5':d<=3?'#fcd34d':'#bfdbfe';
  const urgLabel=d=>d===0?'Today':d===1?'Tomorrow':`In ${d} days`;
  const fmtDate=d=>{if(!d)return'';const[y,m,day]=d.split('-');return new Date(y,m-1,day).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});};
  const fmtDT=dt=>dt?new Date(dt).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'';

  return (
    <div>
      {/* Urgent */}
      <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:'12px',padding:'22px',marginBottom:'20px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
          <h3 style={{fontFamily:'Syne, sans-serif',fontSize:'16px',fontWeight:800,color:'#0f172a'}}>Upcoming Within 7 Days</h3>
          <span style={{background:'#fef2f2',color:'#dc2626',border:'1px solid #fca5a5',padding:'3px 12px',borderRadius:'20px',fontSize:'12px',fontWeight:700}}>{urgent.length} events</span>
        </div>
        {urgent.length===0&&<p style={{color:'#94a3b8',fontSize:'13px',textAlign:'center',padding:'20px 0'}}>No urgent upcoming events.</p>}
        {urgent.map(ev=>(
          <div key={ev._id} style={{background:urgBg(ev.daysUntil),border:`1px solid ${urgBorder(ev.daysUntil)}`,borderRadius:'10px',padding:'14px 16px',marginBottom:'10px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'10px'}}>
            <div>
              <div style={{fontWeight:700,fontSize:'14px',color:'#0f172a',marginBottom:'3px'}}>{ev.title}</div>
              <div style={{fontSize:'12px',color:'#64748b'}}>{fmtDate(ev.date)} — {ev.venue}</div>
              <div style={{fontSize:'12px',color:'#94a3b8',marginTop:'2px'}}>{ev.organizer} · {ev.organizerEmail}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <span style={{background:urgColor(ev.daysUntil),color:'#fff',padding:'5px 14px',borderRadius:'20px',fontSize:'12px',fontWeight:700,display:'block',marginBottom:'4px'}}>{urgLabel(ev.daysUntil)}</span>
              {(ev.reminderSent7Days||ev.reminderSent1Day)&&<span style={{fontSize:'11px',color:'#16a34a',fontWeight:600}}>Reminder sent</span>}
            </div>
          </div>
        ))}
      </div>

      {/* 8-30 days */}
      <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:'12px',padding:'22px',marginBottom:'20px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
          <h3 style={{fontFamily:'Syne, sans-serif',fontSize:'16px',fontWeight:800,color:'#0f172a'}}>Upcoming in 8-30 Days</h3>
          <span style={{background:'#eff6ff',color:'#2563eb',border:'1px solid #bfdbfe',padding:'3px 12px',borderRadius:'20px',fontSize:'12px',fontWeight:700}}>{soon.length} events</span>
        </div>
        {soon.length===0&&<p style={{color:'#94a3b8',fontSize:'13px',textAlign:'center',padding:'20px 0'}}>No events in this period.</p>}
        {soon.map(ev=>(
          <div key={ev._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #f1f5f9',flexWrap:'wrap',gap:'8px'}}>
            <div>
              <div style={{fontWeight:600,fontSize:'14px',color:'#0f172a'}}>{ev.title}</div>
              <div style={{fontSize:'12px',color:'#64748b'}}>{fmtDate(ev.date)} — {ev.venue}</div>
            </div>
            <span style={{background:'#eff6ff',color:'#2563eb',padding:'3px 12px',borderRadius:'20px',fontSize:'12px',fontWeight:700}}>In {ev.daysUntil} days</span>
          </div>
        ))}
      </div>

      {/* Reminder history */}
      <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:'12px',padding:'22px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
        <h3 style={{fontFamily:'Syne, sans-serif',fontSize:'16px',fontWeight:800,color:'#0f172a',marginBottom:'6px'}}>Reminder History</h3>
        <p style={{fontSize:'12px',color:'#94a3b8',marginBottom:'16px'}}>Auto-reminders run daily at 8:00 AM — 7 days and 1 day before each approved event. Societies are notified automatically.</p>
        {loading&&<p style={{color:'#94a3b8',fontSize:'13px'}}>Loading...</p>}
        {!loading&&history.length===0&&<p style={{color:'#94a3b8',fontSize:'13px',textAlign:'center',padding:'20px 0'}}>No reminders sent yet.</p>}
        {history.map(r=>(
          <div key={r._id} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'12px 0',borderBottom:'1px solid #f1f5f9',gap:'12px',flexWrap:'wrap'}}>
            <div>
              <div style={{fontWeight:600,fontSize:'13px',color:'#0f172a',marginBottom:'2px'}}>{r.eventTitle}</div>
              <div style={{fontSize:'12px',color:'#64748b'}}>{r.message}</div>
              <div style={{fontSize:'11px',color:'#94a3b8',marginTop:'2px'}}>To: {r.organizerEmail}</div>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <span style={{background:r.reminderType==='1_day'?'#fef2f2':'#eff6ff',color:r.reminderType==='1_day'?'#dc2626':'#2563eb',border:`1px solid ${r.reminderType==='1_day'?'#fca5a5':'#bfdbfe'}`,padding:'2px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:700,display:'block',marginBottom:'4px'}}>
                {r.reminderType==='7_days'?'7-day reminder':'1-day reminder'}
              </span>
              <span style={{fontSize:'11px',color:'#94a3b8'}}>{fmtDT(r.sentAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}