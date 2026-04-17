import React from 'react';
import { getImageUrl } from '../api';

const CC = { Academic:'#2563eb', Sports:'#16a34a', Cultural:'#d97706', Social:'#db2777', Workshop:'#7c3aed', Other:'#64748b' };
const SC = {
  pending:  { color:'#d97706', bg:'#fffbeb', border:'#fcd34d', label:'Pending' },
  approved: { color:'#16a34a', bg:'#f0fdf4', border:'#86efac', label:'Approved' },
  rejected: { color:'#dc2626', bg:'#fef2f2', border:'#fca5a5', label:'Rejected' },
};

export default function AdminEventCard({ event, onApprove, onReject, onDelete, onEdit }) {
  const st = SC[event.status] || SC.pending;
  const cc = CC[event.category] || '#64748b';
  const img = getImageUrl(event.image);

  const fmtDate = d => { if(!d) return ''; const [y,m,day]=d.split('-'); return new Date(y,m-1,day).toLocaleDateString('en-US',{weekday:'short',month:'long',day:'numeric',year:'numeric'}); };
  const fmtTime = t => { if(!t) return ''; const [h,min]=t.split(':'); return `${h%12||12}:${min} ${h>=12?'PM':'AM'}`; };
  const fmtDT   = dt => dt ? new Date(dt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '';

  const days = (() => {
    if (!event.date) return null;
    const today = new Date(); today.setHours(0,0,0,0);
    return Math.ceil((new Date(event.date+'T00:00:00') - today) / (1000*60*60*24));
  })();

  return (
    <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'12px', marginBottom:'16px', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', borderLeft:`4px solid ${cc}`, transition:'box-shadow 0.2s' }}
      onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'}
      onMouseLeave={e=>e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.04)'}>

      {img && (
        <div style={{ position:'relative' }}>
          <img src={img} alt={event.title} style={{ width:'100%', height:'180px', objectFit:'cover', display:'block' }} />
          <span style={{ position:'absolute', top:'10px', left:'10px', background:cc, color:'#fff', padding:'3px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:700 }}>{event.category}</span>
        </div>
      )}

      <div style={{ padding:'18px 20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', gap:'16px', flexWrap:'wrap' }}>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', gap:'8px', marginBottom:'8px', flexWrap:'wrap', alignItems:'center' }}>
              {!img && <span style={{ background:cc+'15', color:cc, padding:'3px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:700 }}>{event.category}</span>}
              <span style={{ background:st.bg, color:st.color, border:`1px solid ${st.border}`, padding:'3px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:700 }}>{st.label}</span>
              {days!==null&&days>=0&&days<=7&&<span style={{ background:'#fef3c7', color:'#d97706', border:'1px solid #fcd34d', padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:700 }}>{days===0?'Today':days===1?'Tomorrow':`In ${days} days`}</span>}
            </div>

            <h3 style={{ fontSize:'16px', fontWeight:700, color:'#0f172a', marginBottom:'4px', fontFamily:'Syne, sans-serif' }}>{event.title}</h3>
            <p style={{ fontSize:'13px', color:'#64748b', marginBottom:'10px', lineHeight:1.6 }}>{event.description}</p>

            <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', fontSize:'13px', color:'#94a3b8', marginBottom:'10px' }}>
              <span><strong style={{ color:'#374151' }}>Date:</strong> {fmtDate(event.date)}</span>
              <span><strong style={{ color:'#374151' }}>Time:</strong> {fmtTime(event.time)}</span>
              <span><strong style={{ color:'#374151' }}>Venue:</strong> {event.venue}</span>
              <span><strong style={{ color:'#374151' }}>Max:</strong> {event.maxParticipants}</span>
              {event.views>0&&<span><strong style={{ color:'#374151' }}>Views:</strong> {event.views}</span>}
            </div>

            <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'10px 14px', fontSize:'13px', display:'flex', gap:'20px', flexWrap:'wrap' }}>
              <span><strong style={{ color:'#374151' }}>Society:</strong> {event.organizer}</span>
              <span><strong style={{ color:'#374151' }}>Email:</strong> {event.organizerEmail}</span>
              <span><strong style={{ color:'#374151' }}>Submitted:</strong> {fmtDT(event.createdAt)}</span>
            </div>

            {event.tags&&event.tags.length>0&&(
              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginTop:'8px' }}>
                {event.tags.map((t,i)=><span key={i} style={{ background:'#f1f5f9', color:'#64748b', padding:'2px 10px', borderRadius:'20px', fontSize:'11px' }}>#{t}</span>)}
              </div>
            )}

            {event.status==='rejected'&&event.adminReason&&(
              <div style={{ marginTop:'10px', background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:'8px', padding:'10px 14px', fontSize:'13px' }}>
                <strong style={{ color:'#b91c1c' }}>Rejection Reason:</strong>
                <span style={{ color:'#dc2626', marginLeft:'8px' }}>{event.adminReason}</span>
                {event.adminActionAt&&<span style={{ color:'#94a3b8', fontSize:'11px', marginLeft:'10px' }}>— {fmtDT(event.adminActionAt)}</span>}
              </div>
            )}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'8px', minWidth:'110px' }}>
            {event.status!=='approved'&&<button onClick={()=>onApprove(event._id)} style={btn('#f0fdf4','#16a34a','#86efac')}>Approve</button>}
            {event.status!=='rejected'&&<button onClick={()=>onReject(event)} style={btn('#fffbeb','#d97706','#fcd34d')}>Reject</button>}
            <button onClick={()=>onEdit(event)} style={btn('#f8fafc','#374151','#e2e8f0')}>Edit</button>
            <button onClick={()=>onDelete(event)} style={btn('#fef2f2','#dc2626','#fca5a5')}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const btn = (bg,color,border) => ({ padding:'8px 12px', background:bg, border:`1px solid ${border}`, borderRadius:'7px', color, cursor:'pointer', fontSize:'13px', fontWeight:600, fontFamily:'Space Grotesk, sans-serif', textAlign:'center' });