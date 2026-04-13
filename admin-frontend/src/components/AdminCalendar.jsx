import React, { useState } from 'react';

const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function AdminCalendar({ events }) {
  const today = new Date();
  const [cur, setCur] = useState({month:today.getMonth(),year:today.getFullYear()});
  const [sel, setSel] = useState(null);
  const {month,year}=cur;
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const todayStr=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const evMap={};
  events.forEach(ev=>{if(!ev.date)return;if(!evMap[ev.date])evMap[ev.date]=[];evMap[ev.date].push(ev);});

  const cells=[];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);

  const getKey=d=>`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const dot=s=>s==='approved'?'#16a34a':s==='rejected'?'#dc2626':'#d97706';
  const selEvs=sel?(evMap[sel]||[]):[];
  const fmtTime=t=>{if(!t)return'';const[h,min]=t.split(':');return`${h%12||12}:${min} ${h>=12?'PM':'AM'}`;};
  const nb={background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:'6px',color:'#374151',cursor:'pointer',width:'30px',height:'30px',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Space Grotesk, sans-serif'};

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:'20px',alignItems:'start'}}>
      <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:'14px',padding:'24px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <h2 style={{fontFamily:'Syne, sans-serif',fontSize:'18px',fontWeight:800,color:'#0f172a'}}>All Events Calendar</h2>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <button style={nb} onClick={()=>setCur(c=>{const d=new Date(c.year,c.month-1);return{month:d.getMonth(),year:d.getFullYear()};})} >&#8249;</button>
            <span style={{fontWeight:700,fontSize:'14px',minWidth:'130px',textAlign:'center',color:'#0f172a'}}>{MONTHS[month]} {year}</span>
            <button style={nb} onClick={()=>setCur(c=>{const d=new Date(c.year,c.month+1);return{month:d.getMonth(),year:d.getFullYear()};})}>&#8250;</button>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'4px',marginBottom:'6px'}}>
          {DAYS.map(d=><div key={d} style={{textAlign:'center',fontSize:'11px',fontWeight:700,color:'#94a3b8',padding:'4px 0'}}>{d}</div>)}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'4px'}}>
          {cells.map((day,idx)=>{
            if(!day) return <div key={`e-${idx}`}/>;
            const key=getKey(day),dayEvs=evMap[key]||[],isToday=key===todayStr,hasEv=dayEvs.length>0,isSel=sel===key;
            return (
              <div key={key} onClick={()=>setSel(isSel?null:key)} style={{minHeight:'50px',padding:'6px 4px',borderRadius:'8px',textAlign:'center',cursor:hasEv?'pointer':'default',background:isSel?'#eff6ff':hasEv?'#f0fdf4':isToday?'#f8fafc':'transparent',border:isSel?'2px solid #2563eb':isToday?'2px solid #2563eb':hasEv?'1px solid #86efac':'1px solid transparent',transition:'all 0.15s'}}>
                <span style={{fontSize:'13px',fontWeight:isToday?800:hasEv?700:400,color:isToday?'#2563eb':hasEv?'#16a34a':'#374151',display:'block'}}>{day}</span>
                {hasEv&&<div style={{display:'flex',justifyContent:'center',gap:'2px',marginTop:'4px',flexWrap:'wrap'}}>
                  {dayEvs.slice(0,3).map((ev,i)=><div key={i} style={{width:'6px',height:'6px',borderRadius:'50%',background:dot(ev.status)}}/>)}
                  {dayEvs.length>3&&<span style={{fontSize:'9px',color:'#94a3b8'}}>+{dayEvs.length-3}</span>}
                </div>}
              </div>
            );
          })}
        </div>
        <div style={{display:'flex',gap:'16px',marginTop:'16px',paddingTop:'14px',borderTop:'1px solid #f1f5f9',justifyContent:'flex-end'}}>
          {[['#d97706','Pending'],['#16a34a','Approved'],['#dc2626','Rejected']].map(([c,l])=>(
            <div key={l} style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'12px',color:'#64748b'}}>
              <div style={{width:'8px',height:'8px',borderRadius:'50%',background:c}}/>{l}
            </div>
          ))}
        </div>
      </div>

      <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:'14px',padding:'20px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)',minHeight:'280px'}}>
        <h3 style={{fontFamily:'Syne, sans-serif',fontSize:'15px',fontWeight:800,marginBottom:'4px',color:'#0f172a'}}>{sel?`Events on ${sel}`:'Select a Date'}</h3>
        <p style={{fontSize:'12px',color:'#94a3b8',marginBottom:'16px'}}>{sel?`${selEvs.length} event(s)`:'Click a highlighted date'}</p>
        {!sel&&<p style={{fontSize:'13px',color:'#cbd5e1',textAlign:'center',paddingTop:'30px'}}>No date selected</p>}
        {sel&&selEvs.length===0&&<p style={{fontSize:'13px',color:'#94a3b8',textAlign:'center',paddingTop:'20px'}}>No events on this date</p>}
        {selEvs.map((ev,i)=>{
          const sc=ev.status==='approved'?'#16a34a':ev.status==='rejected'?'#dc2626':'#d97706';
          return (
            <div key={i} style={{borderLeft:`3px solid ${sc}`,paddingLeft:'12px',marginBottom:'14px',paddingBottom:'14px',borderBottom:i<selEvs.length-1?'1px solid #f1f5f9':'none'}}>
              <div style={{fontWeight:700,fontSize:'14px',color:'#0f172a',marginBottom:'2px'}}>{ev.title}</div>
              <div style={{fontSize:'12px',color:'#64748b',marginBottom:'2px'}}>{fmtTime(ev.time)} — {ev.venue}</div>
              <div style={{fontSize:'11px',color:'#94a3b8',marginBottom:'6px'}}>{ev.organizer}</div>
              <span style={{fontSize:'11px',fontWeight:700,color:sc,background:sc+'15',padding:'2px 10px',borderRadius:'20px'}}>{ev.status.charAt(0).toUpperCase()+ev.status.slice(1)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}