import React, { useEffect, useState } from 'react';
import { getAnalytics } from '../api';

const CC = { Academic:'#2563eb', Sports:'#16a34a', Cultural:'#d97706', Social:'#db2777', Workshop:'#7c3aed', Other:'#64748b' };
const MN = {'01':'Jan','02':'Feb','03':'Mar','04':'Apr','05':'May','06':'Jun','07':'Jul','08':'Aug','09':'Sep','10':'Oct','11':'Nov','12':'Dec'};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics().then(r=>{setData(r.data);setLoading(false);}).catch(()=>setLoading(false));
  }, []);

  if (loading) return <div style={{textAlign:'center',padding:'60px',color:'#94a3b8',fontSize:'15px'}}>Loading analytics...</div>;
  if (!data) return <div style={{textAlign:'center',padding:'60px',color:'#dc2626'}}>Failed to load analytics.</div>;

  const approvalRate = data.total>0 ? Math.round((data.approved/data.total)*100) : 0;
  const monthEntries = Object.entries(data.byMonth);
  const maxMonth = Math.max(...monthEntries.map(([,v])=>v),1);
  const catEntries = Object.entries(data.byCategory);
  const maxCat = Math.max(...catEntries.map(([,v])=>v),1);

  return (
    <div>
      {/* Top cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'24px'}}>
        {[
          {label:'Total Events',value:data.total,color:'#2563eb',sub:`${data.pending} pending review`},
          {label:'Approved',value:data.approved,color:'#16a34a',sub:`${approvalRate}% approval rate`},
          {label:'Rejected',value:data.rejected,color:'#dc2626',sub:`${data.total>0?Math.round((data.rejected/data.total)*100):0}% rejection rate`},
          {label:'Upcoming (30d)',value:data.upcoming,color:'#7c3aed',sub:'approved events'},
        ].map(s=>(
          <div key={s.label} style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:'12px',padding:'20px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)',borderTop:`3px solid ${s.color}`}}>
            <div style={{fontSize:'28px',fontWeight:800,color:s.color,fontFamily:'Syne, sans-serif'}}>{s.value}</div>
            <div style={{fontSize:'13px',color:'#64748b',marginTop:'4px'}}>{s.label}</div>
            {s.sub&&<div style={{fontSize:'11px',color:'#94a3b8',marginTop:'4px'}}>{s.sub}</div>}
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'24px'}}>
        {/* Events by Month bar chart */}
        <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:'12px',padding:'22px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
          <h3 style={{fontFamily:'Syne, sans-serif',fontSize:'15px',fontWeight:800,marginBottom:'20px',color:'#0f172a'}}>Events by Month</h3>
          <div style={{display:'flex',alignItems:'flex-end',gap:'10px',height:'160px'}}>
            {monthEntries.map(([key,count])=>{
              const [,month]=key.split('-');
              const heightPct=(count/maxMonth)*100;
              return (
                <div key={key} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'6px',height:'100%',justifyContent:'flex-end'}}>
                  <span style={{fontSize:'11px',fontWeight:700,color:'#2563eb'}}>{count>0?count:''}</span>
                  <div style={{width:'100%',background:'linear-gradient(180deg,#3b82f6,#2563eb)',borderRadius:'4px 4px 0 0',height:`${heightPct}%`,minHeight:count>0?'4px':'0',transition:'height 0.4s ease'}}/>
                  <span style={{fontSize:'10px',color:'#94a3b8',fontWeight:600}}>{MN[month]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Events by Category */}
        <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:'12px',padding:'22px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
          <h3 style={{fontFamily:'Syne, sans-serif',fontSize:'15px',fontWeight:800,marginBottom:'20px',color:'#0f172a'}}>Events by Category</h3>
          {catEntries.length===0&&<p style={{color:'#94a3b8',fontSize:'13px'}}>No data yet.</p>}
          {catEntries.map(([cat,count])=>{
            const color=CC[cat]||'#64748b';
            const widthPct=(count/maxCat)*100;
            return (
              <div key={cat} style={{marginBottom:'14px'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'5px'}}>
                  <span style={{fontSize:'13px',fontWeight:600,color:'#374151'}}>{cat}</span>
                  <span style={{fontSize:'13px',fontWeight:700,color}}>{count}</span>
                </div>
                <div style={{background:'#f1f5f9',borderRadius:'4px',height:'8px',overflow:'hidden'}}>
                  <div style={{width:`${widthPct}%`,background:color,height:'100%',borderRadius:'4px',transition:'width 0.4s ease'}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
        {/* Status breakdown */}
        <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:'12px',padding:'22px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
          <h3 style={{fontFamily:'Syne, sans-serif',fontSize:'15px',fontWeight:800,marginBottom:'16px',color:'#0f172a'}}>Status Breakdown</h3>
          {[
            {label:'Pending',count:data.pending,color:'#d97706',bg:'#fffbeb'},
            {label:'Approved',count:data.approved,color:'#16a34a',bg:'#f0fdf4'},
            {label:'Rejected',count:data.rejected,color:'#dc2626',bg:'#fef2f2'},
          ].map(s=>(
            <div key={s.label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 14px',background:s.bg,borderRadius:'8px',marginBottom:'8px'}}>
              <span style={{fontSize:'14px',fontWeight:600,color:s.color}}>{s.label}</span>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{background:'#e2e8f0',borderRadius:'4px',height:'6px',width:'100px',overflow:'hidden'}}>
                  <div style={{width:`${data.total>0?(s.count/data.total)*100:0}%`,background:s.color,height:'100%',borderRadius:'4px'}}/>
                </div>
                <span style={{fontSize:'14px',fontWeight:800,color:s.color,minWidth:'24px',textAlign:'right'}}>{s.count}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Top societies */}
        <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:'12px',padding:'22px',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
          <h3 style={{fontFamily:'Syne, sans-serif',fontSize:'15px',fontWeight:800,marginBottom:'16px',color:'#0f172a'}}>Top Societies</h3>
          {data.topSocieties.length===0&&<p style={{color:'#94a3b8',fontSize:'13px'}}>No data yet.</p>}
          {data.topSocieties.map((s,i)=>(
            <div key={s.email} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:i<data.topSocieties.length-1?'1px solid #f1f5f9':'none'}}>
              <div>
                <div style={{fontSize:'13px',fontWeight:700,color:'#0f172a'}}>{s.name}</div>
                <div style={{fontSize:'11px',color:'#94a3b8'}}>{s.email}</div>
                <div style={{display:'flex',gap:'8px',marginTop:'3px'}}>
                  <span style={{fontSize:'11px',color:'#16a34a',fontWeight:600}}>{s.approved} approved</span>
                  <span style={{fontSize:'11px',color:'#dc2626',fontWeight:600}}>{s.rejected} rejected</span>
                </div>
              </div>
              <span style={{fontSize:'22px',fontWeight:800,color:'#2563eb',fontFamily:'Syne, sans-serif'}}>{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}