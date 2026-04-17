import React, { useRef } from 'react';
import { getImageUrl } from '../api';

const CC = { Academic:'#2563eb', Sports:'#16a34a', Cultural:'#d97706', Social:'#db2777', Workshop:'#7c3aed', Other:'#64748b' };

export default function PostGenerator({ event, onClose }) {
  const posterRef = useRef();
  if (!event) return null;
  const cc = CC[event.category] || '#2563eb';
  const img = getImageUrl(event.image);
  const fmtDate = d => { if(!d) return ''; const [y,m,day]=d.split('-'); return new Date(y,m-1,day).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}); };
  const fmtTime = t => { if(!t) return ''; const [h,min]=t.split(':'); return `${h%12||12}:${min} ${h>=12?'PM':'AM'}`; };

  const handlePrint = () => {
    const win = window.open('','_blank');
    win.document.write(`<html><head><title>Event Poster - ${event.title}</title><style>*{margin:0;padding:0;box-sizing:border-box;font-family:Arial,sans-serif !important;}body{font-family:Arial,sans-serif;}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style></head><body>${posterRef.current.innerHTML}</body></html>`);
    win.document.close();
    setTimeout(()=>{win.print();win.close();},600);
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000,padding:'20px',overflowY:'auto'}}>
      <div style={{background:'#fff',borderRadius:'16px',padding:'28px',width:'100%',maxWidth:'620px',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <h3 style={{fontFamily:'Syne, sans-serif',fontSize:'18px',fontWeight:800,color:'#0f172a'}}>Event Poster Preview</h3>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:'22px',cursor:'pointer',color:'#64748b'}}>×</button>
        </div>

        <div ref={posterRef}>
          <div style={{width:'100%',background:`linear-gradient(135deg, ${cc} 0%, ${cc}cc 100%)`,borderRadius:'12px',overflow:'hidden',fontFamily:'Space Grotesk, sans-serif'}}>
            <div style={{padding:'32px 32px 24px',color:'#fff'}}>
              <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'0.12em',opacity:0.8,marginBottom:'10px',textTransform:'uppercase'}}>{event.category} Event · UniEvents</div>
              <h1 style={{fontFamily:'Syne, sans-serif',fontSize:'34px',fontWeight:800,lineHeight:1.2,marginBottom:'14px'}}>{event.title}</h1>
              <p style={{fontSize:'14px',opacity:0.9,lineHeight:1.7,maxWidth:'480px'}}>{event.description}</p>
            </div>
            {img&&<img src={img} alt={event.title} style={{width:'100%',height:'240px',objectFit:'cover',display:'block'}}/>}
            <div style={{background:'rgba(255,255,255,0.13)',padding:'26px 32px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
                {[{label:'Date',value:fmtDate(event.date)},{label:'Time',value:fmtTime(event.time)},{label:'Venue',value:event.venue},{label:'Capacity',value:`${event.maxParticipants} participants`}].map(item=>(
                  <div key={item.label} style={{background:'rgba(255,255,255,0.15)',borderRadius:'10px',padding:'14px'}}>
                    <div style={{fontSize:'10px',color:'rgba(255,255,255,0.7)',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'4px'}}>{item.label}</div>
                    <div style={{fontSize:'14px',color:'#fff',fontWeight:600}}>{item.value}</div>
                  </div>
                ))}
              </div>
              {event.tags&&event.tags.length>0&&(
                <div style={{marginTop:'14px',display:'flex',gap:'8px',flexWrap:'wrap'}}>
                  {event.tags.map((t,i)=><span key={i} style={{background:'rgba(255,255,255,0.2)',color:'#fff',padding:'4px 12px',borderRadius:'20px',fontSize:'11px',fontWeight:600}}>#{t}</span>)}
                </div>
              )}
            </div>
            <div style={{background:'rgba(0,0,0,0.2)',padding:'16px 32px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:'11px',color:'rgba(255,255,255,0.7)',marginBottom:'2px'}}>Organized by</div>
                <div style={{fontSize:'15px',color:'#fff',fontWeight:700}}>{event.organizer}</div>
              </div>
              <div style={{background:'rgba(255,255,255,0.2)',borderRadius:'8px',padding:'8px 16px'}}>
                <div style={{fontSize:'13px',color:'#fff',fontWeight:700}}>UniEvents Platform</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{display:'flex',gap:'12px',marginTop:'20px'}}>
          <button onClick={handlePrint} style={{flex:1,padding:'12px',background:'#2563eb',border:'none',borderRadius:'8px',color:'#fff',fontWeight:700,cursor:'pointer',fontSize:'14px',fontFamily:'Space Grotesk, sans-serif'}}>Print / Save as PDF</button>
          <button onClick={onClose} style={{flex:1,padding:'12px',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'8px',color:'#374151',fontWeight:600,cursor:'pointer',fontSize:'14px',fontFamily:'Space Grotesk, sans-serif'}}>Close</button>
        </div>
        <p style={{fontSize:'12px',color:'#94a3b8',textAlign:'center',marginTop:'10px'}}>Use browser print dialog to save as PDF</p>
      </div>
    </div>
  );
}
