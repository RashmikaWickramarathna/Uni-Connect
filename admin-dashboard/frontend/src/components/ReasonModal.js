import React, { useState } from 'react';

export default function ReasonModal({ type, eventTitle, onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const isDelete = type === 'delete';
  const color = isDelete ? '#dc2626' : '#d97706';
  const bg = isDelete ? '#fef2f2' : '#fffbeb';
  const border = isDelete ? '#fca5a5' : '#fcd34d';

  const handleConfirm = () => {
    if (!reason.trim()) { setError('A reason is required.'); return; }
    if (reason.trim().length < 10) { setError('Reason must be at least 10 characters.'); return; }
    onConfirm(reason.trim());
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:'20px' }}>
      <div style={{ background:'#fff', borderRadius:'16px', padding:'32px', width:'100%', maxWidth:'480px', boxShadow:'0 20px 60px rgba(0,0,0,0.18)' }}>
        <div style={{ background:bg, border:`1px solid ${border}`, borderRadius:'10px', padding:'14px 16px', marginBottom:'22px' }}>
          <p style={{ fontWeight:700, color, fontSize:'15px', marginBottom:'4px' }}>{isDelete ? 'Delete Event' : 'Reject Event'}</p>
          <p style={{ fontSize:'13px', color:'#64748b' }}>You are about to {isDelete ? 'delete' : 'reject'} <strong>"{eventTitle}"</strong></p>
        </div>
        <label style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#374151', marginBottom:'8px' }}>
          Reason * <span style={{ color:'#94a3b8', fontWeight:400 }}>(society will see this)</span>
        </label>
        <textarea
          value={reason} onChange={e => { setReason(e.target.value); setError(''); }}
          placeholder={isDelete ? 'e.g. Event violates university policy...' : 'e.g. Venue is not available, please choose another date...'}
          style={{ width:'100%', minHeight:'110px', padding:'12px 14px', border: error ? '1px solid #dc2626' : '1px solid #e2e8f0', borderRadius:'8px', fontSize:'14px', color:'#0f172a', fontFamily:'Space Grotesk, sans-serif', resize:'vertical', outline:'none' }}
        />
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:'4px' }}>
          {error ? <p style={{ color:'#dc2626', fontSize:'12px' }}>{error}</p> : <p style={{ color:'#94a3b8', fontSize:'11px' }}>Minimum 10 characters</p>}
          <span style={{ fontSize:'11px', color: reason.length < 10 ? '#dc2626' : '#94a3b8' }}>{reason.length} chars</span>
        </div>
        <div style={{ display:'flex', gap:'12px', marginTop:'22px' }}>
          <button onClick={handleConfirm} style={{ flex:1, padding:'11px', background:color, border:'none', borderRadius:'8px', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:'14px', fontFamily:'Space Grotesk, sans-serif' }}>
            Confirm {isDelete ? 'Delete' : 'Reject'}
          </button>
          <button onClick={onCancel} style={{ flex:1, padding:'11px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'8px', color:'#374151', fontWeight:600, cursor:'pointer', fontSize:'14px', fontFamily:'Space Grotesk, sans-serif' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}