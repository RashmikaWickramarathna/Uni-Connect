import React from 'react';
import { getImageUrl } from '../../api/societyPortalApi';
import { formatTicketLabel, formatTicketPrice } from '../../utils/ticketUtils';

const CC = { Academic:'#2563eb', Sports:'#16a34a', Cultural:'#d97706', Social:'#db2777', Workshop:'#7c3aed', Other:'#64748b' };
const SC = {
  pending:  { color:'#d97706', bg:'#fffbeb', border:'#fcd34d', label:'Pending Approval' },
  approved: { color:'#16a34a', bg:'#f0fdf4', border:'#86efac', label:'Approved' },
  rejected: { color:'#dc2626', bg:'#fef2f2', border:'#fca5a5', label:'Rejected' },
  cancelled: { color:'#64748b', bg:'#f8fafc', border:'#cbd5e1', label:'Cancelled' },
};

export default function EventCard({ event, onEdit, onDelete, onGeneratePost }) {
  const st = SC[event.status] || SC.pending;
  const cc = CC[event.category] || '#64748b';
  const img = getImageUrl(event.image);
  const title = event.title || 'Untitled Event';
  const description = event.description || 'No description provided.';
  const venue = event.venue || 'TBA';
  const category = event.category || 'Other';
  const maxParticipants = event.maxParticipants || 100;
  const ticketOptions = Array.isArray(event.tickets) ? event.tickets : [];
  const minPrice = ticketOptions.length
    ? Math.min(...ticketOptions.map((ticket) => Number(ticket?.price) || 0))
    : null;

  const fmtDate = d => { if(!d) return ''; const [y,m,day]=d.split('-'); return new Date(y,m-1,day).toLocaleDateString('en-US',{weekday:'short',month:'long',day:'numeric',year:'numeric'}); };
  const fmtTime = t => { if(!t) return ''; const [h,min]=t.split(':'); return `${h%12||12}:${min} ${h>=12?'PM':'AM'}`; };

  const daysUntil = () => {
    if (!event.date) return null;
    const today = new Date(); today.setHours(0,0,0,0);
    const ev = new Date(event.date+'T00:00:00');
    return Math.ceil((ev-today)/(1000*60*60*24));
  };
  const days = daysUntil();
  const cardImageWrap = {
    position:'relative',
    height:'180px',
    padding:'12px',
    background:'#f8fafc',
    borderBottom:'1px solid #e2e8f0',
  };
  const cardImageStyle = {
    width:'100%',
    height:'100%',
    objectFit:'contain',
    display:'block',
  };

  return (
    <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:'12px',marginBottom:'16px',overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.04)',borderLeft:`4px solid ${cc}`,transition:'box-shadow 0.2s'}}
      onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'}
      onMouseLeave={e=>e.currentTarget.style.boxShadow='0 1px 4px rgba(0,0,0,0.04)'}>

      {img && (
        <div style={cardImageWrap}>
          <img src={img} alt={title} style={cardImageStyle} />
          <span style={{position:'absolute',top:'10px',left:'10px',background:cc,color:'#fff',padding:'3px 12px',borderRadius:'20px',fontSize:'11px',fontWeight:700}}>{category}</span>
        </div>
      )}

      <div style={{padding:'18px 20px'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:'16px',flexWrap:'wrap'}}>
          <div style={{flex:1}}>
            <div style={{display:'flex',gap:'8px',marginBottom:'8px',flexWrap:'wrap',alignItems:'center'}}>
              {!img && <span style={{background:cc+'15',color:cc,padding:'3px 12px',borderRadius:'20px',fontSize:'11px',fontWeight:700}}>{category}</span>}
              <span style={{background:st.bg,color:st.color,border:`1px solid ${st.border}`,padding:'3px 12px',borderRadius:'20px',fontSize:'11px',fontWeight:700}}>{st.label}</span>
              {days!==null&&days>0&&days<=7&&<span style={{background:'#fef3c7',color:'#d97706',border:'1px solid #fcd34d',padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:700}}>{days===1?'Tomorrow':`In ${days} days`}</span>}
              {days===0&&<span style={{background:'#fef2f2',color:'#dc2626',border:'1px solid #fca5a5',padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:700}}>Today</span>}
            </div>

            <h3 style={{fontSize:'16px',fontWeight:700,color:'#0f172a',marginBottom:'6px'}}>{title}</h3>
            <p style={{fontSize:'13px',color:'#64748b',marginBottom:'10px',lineHeight:1.6}}>{description}</p>

            <div style={{display:'flex',gap:'16px',flexWrap:'wrap',fontSize:'13px',color:'#94a3b8',marginBottom:'10px'}}>
              <span><strong style={{color:'#374151'}}>Date:</strong> {fmtDate(event.date)}</span>
              <span><strong style={{color:'#374151'}}>Time:</strong> {fmtTime(event.time)}</span>
              <span><strong style={{color:'#374151'}}>Venue:</strong> {venue}</span>
              <span><strong style={{color:'#374151'}}>Max:</strong> {maxParticipants}</span>
              {minPrice !== null &&(
                <span>
                  <strong style={{color:'#374151'}}>Ticket Price:</strong>{' '}
                  {minPrice === 0 ? 'Free' : `From ${formatTicketPrice(minPrice)}`}
                </span>
              )}
              {event.views>0&&<span><strong style={{color:'#374151'}}>Views:</strong> {event.views}</span>}
            </div>

            {ticketOptions.length > 0 && (
              <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'10px'}}>
                {ticketOptions.map((ticket, index) => (
                  <span
                    key={`${ticket.type}-${index}`}
                    style={{background:'#eef2ff',color:'#3730a3',padding:'4px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:700}}
                  >
                    {formatTicketLabel(ticket, index)} • {formatTicketPrice(ticket.price)} • {ticket.totalSeats} seats
                  </span>
                ))}
              </div>
            )}

            {event.tags&&event.tags.length>0&&(
              <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'10px'}}>
                {event.tags.map((t,i)=><span key={i} style={{background:'#f1f5f9',color:'#64748b',padding:'2px 10px',borderRadius:'20px',fontSize:'11px'}}>{t}</span>)}
              </div>
            )}

            {event.status==='rejected'&&event.adminReason&&(
              <div style={{background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:'8px',padding:'10px 14px',fontSize:'13px',marginBottom:'8px'}}>
                <strong style={{color:'#b91c1c'}}>Rejection Reason:</strong>
                <span style={{color:'#dc2626',marginLeft:'8px'}}>{event.adminReason}</span>
              </div>
            )}
            {event.status==='rejected'&&<p style={{fontSize:'12px',color:'#64748b'}}>You may edit and resubmit this event.</p>}
            {event.status==='approved'&&(
              <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:'8px',padding:'10px 14px',fontSize:'13px'}}>
                <span style={{color:'#15803d'}}>This event is confirmed and approved.</span>
              </div>
            )}
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:'8px',minWidth:'130px'}}>
            <button onClick={()=>onEdit(event)} disabled={event.status==='approved'} style={{padding:'8px 12px',background:event.status==='approved'?'#f1f5f9':'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'7px',color:event.status==='approved'?'#cbd5e1':'#374151',cursor:event.status==='approved'?'not-allowed':'pointer',fontSize:'13px',fontWeight:600,textAlign:'center'}}>
              Edit
            </button>
            <button onClick={()=>onDelete(event._id)} style={{padding:'8px 12px',background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:'7px',color:'#dc2626',cursor:'pointer',fontSize:'13px',fontWeight:600,textAlign:'center'}}>Delete</button>
            <button onClick={()=>onGeneratePost(event)} style={{padding:'8px 12px',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'7px',color:'#2563eb',cursor:'pointer',fontSize:'13px',fontWeight:600,textAlign:'center'}}>Generate Post</button>
          </div>
        </div>
      </div>
    </div>
  );
}
