import React, { useRef } from 'react';
import { getImageUrl } from '../../api/societyPortalApi';

const CC = { Academic:'#2563eb', Sports:'#16a34a', Cultural:'#d97706', Social:'#db2777', Workshop:'#7c3aed', Other:'#64748b' };

export default function PostGenerator({ event, onClose }) {
  const posterRef = useRef();
  if (!event) return null;

  const color = CC[event.category] || '#2563eb';
  const image = getImageUrl(event.image);
  const formatDate = value => {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      weekday:'long',
      month:'long',
      day:'numeric',
      year:'numeric',
    });
  };
  const formatTime = value => {
    if (!value) return '';
    const [hour, minute] = value.split(':');
    return `${hour % 12 || 12}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<html><head><title>Event Poster - ${event.title}</title><style>*{margin:0;padding:0;box-sizing:border-box;font-family:Arial,sans-serif !important;}body{font-family:Arial,sans-serif;}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style></head><body>${posterRef.current.innerHTML}</body></html>`);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 600);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:'20px', overflowY:'auto' }}>
      <div style={{ background:'#fff', borderRadius:'20px', padding:'28px', width:'100%', maxWidth:'620px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          <h3 style={{ fontSize:'18px', fontWeight:800, color:'#0f172a' }}>Event Poster Preview</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:'16px', cursor:'pointer', color:'#64748b', fontWeight:700 }}>Close</button>
        </div>

        <div ref={posterRef}>
          <div style={{ width:'100%', background:`linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`, borderRadius:'16px', overflow:'hidden' }}>
            <div style={{ padding:'32px 32px 24px', color:'#fff' }}>
              <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.12em', opacity:0.82, marginBottom:'10px', textTransform:'uppercase' }}>
                {event.category} Event | Uni-Connect
              </div>
              <h1 style={{ fontSize:'34px', fontWeight:800, lineHeight:1.2, marginBottom:'14px' }}>{event.title}</h1>
              <p style={{ fontSize:'14px', opacity:0.92, lineHeight:1.7, maxWidth:'480px' }}>{event.description}</p>
            </div>

            {image ? <img src={image} alt={event.title} style={{ width:'100%', height:'240px', objectFit:'cover', display:'block' }} /> : null}

            <div style={{ background:'rgba(255,255,255,0.13)', padding:'26px 32px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                {[
                  { label:'Date', value:formatDate(event.date) },
                  { label:'Time', value:formatTime(event.time) },
                  { label:'Venue', value:event.venue },
                  { label:'Capacity', value:`${event.maxParticipants} participants` },
                ].map(item => (
                  <div key={item.label} style={{ background:'rgba(255,255,255,0.15)', borderRadius:'10px', padding:'14px' }}>
                    <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.7)', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'4px' }}>{item.label}</div>
                    <div style={{ fontSize:'14px', color:'#fff', fontWeight:600 }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {event.tags && event.tags.length > 0 ? (
                <div style={{ marginTop:'14px', display:'flex', gap:'8px', flexWrap:'wrap' }}>
                  {event.tags.map((tag, index) => (
                    <span key={index} style={{ background:'rgba(255,255,255,0.2)', color:'#fff', padding:'4px 12px', borderRadius:'20px', fontSize:'11px', fontWeight:600 }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div style={{ background:'rgba(0,0,0,0.2)', padding:'16px 32px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.7)', marginBottom:'2px' }}>Organized by</div>
                <div style={{ fontSize:'15px', color:'#fff', fontWeight:700 }}>{event.organizer}</div>
              </div>
              <div style={{ background:'rgba(255,255,255,0.2)', borderRadius:'8px', padding:'8px 16px' }}>
                <div style={{ fontSize:'13px', color:'#fff', fontWeight:700 }}>Uni-Connect Platform</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display:'flex', gap:'12px', marginTop:'20px' }}>
          <button onClick={handlePrint} style={{ flex:1, padding:'12px', background:'#2563eb', border:'none', borderRadius:'10px', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:'14px' }}>
            Print / Save as PDF
          </button>
          <button onClick={onClose} style={{ flex:1, padding:'12px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'10px', color:'#374151', fontWeight:600, cursor:'pointer', fontSize:'14px' }}>
            Close
          </button>
        </div>
        <p style={{ fontSize:'12px', color:'#94a3b8', textAlign:'center', marginTop:'10px' }}>Use the browser print dialog to save as PDF.</p>
      </div>
    </div>
  );
}
