import React, { useState, useEffect, useRef } from 'react';
const cats = ['Academic','Sports','Cultural','Social','Workshop','Other'];

export default function EditEventModal({ event, onSave, onCancel }) {
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    if (event) {
      setForm({ title:event.title||'', description:event.description||'', date:event.date||'', time:event.time||'', venue:event.venue||'', category:event.category||'Academic', organizer:event.organizer||'', organizerEmail:event.organizerEmail||'', maxParticipants:event.maxParticipants||100 });
      setImgPreview(event.image ? `http://localhost:5000/uploads/${event.image}` : null);
    }
  }, [event]);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleImg = e => { const f = e.target.files[0]; if (!f) return; setImgFile(f); setImgPreview(URL.createObjectURL(f)); };

  const handleSave = async () => {
    if (!form.title?.trim() || !form.date || !form.venue?.trim()) { setError('Title, date and venue are required.'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => fd.append(k, form[k]));
      if (imgFile) fd.append('image', imgFile);
      await onSave(event._id, fd);
    } catch (err) {
      setError(err.response?.data?.errors?.[0] || 'Update failed.');
    } finally { setLoading(false); }
  };

  const inp = { width:'100%', padding:'9px 12px', border:'1px solid #e2e8f0', borderRadius:'8px', fontSize:'13px', color:'#0f172a', fontFamily:'Space Grotesk, sans-serif', outline:'none', background:'#fff' };
  const lbl = { display:'block', fontSize:'12px', fontWeight:600, color:'#374151', marginBottom:'5px' };
  const fld = { marginBottom:'14px' };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:'20px' }}>
      <div style={{ background:'#fff', borderRadius:'16px', padding:'28px', width:'100%', maxWidth:'600px', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.18)' }}>
        <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:'18px', fontWeight:800, marginBottom:'20px' }}>Edit Event</h3>
        {error && <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:'8px', padding:'10px 14px', marginBottom:'14px', color:'#b91c1c', fontSize:'13px' }}>{error}</div>}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
          <div style={fld}><label style={lbl}>Title *</label><input style={inp} name="title" value={form.title||''} onChange={handleChange} /></div>
          <div style={fld}><label style={lbl}>Organizer</label><input style={inp} name="organizer" value={form.organizer||''} onChange={handleChange} /></div>
          <div style={fld}><label style={lbl}>Date *</label><input style={inp} type="date" name="date" value={form.date||''} onChange={handleChange} /></div>
          <div style={fld}><label style={lbl}>Time</label><input style={inp} type="time" name="time" value={form.time||''} onChange={handleChange} /></div>
          <div style={fld}><label style={lbl}>Venue *</label><input style={inp} name="venue" value={form.venue||''} onChange={handleChange} /></div>
          <div style={fld}><label style={lbl}>Category</label><select style={inp} name="category" value={form.category||'Academic'} onChange={handleChange}>{cats.map(c=><option key={c}>{c}</option>)}</select></div>
          <div style={{...fld,gridColumn:'1 / -1'}}><label style={lbl}>Organizer Email</label><input style={inp} name="organizerEmail" value={form.organizerEmail||''} onChange={handleChange} /></div>
          <div style={{...fld,gridColumn:'1 / -1'}}><label style={lbl}>Description</label><textarea style={{...inp,resize:'vertical',minHeight:'80px'}} name="description" value={form.description||''} onChange={handleChange} /></div>
          <div style={{...fld,gridColumn:'1 / -1'}}>
            <label style={lbl}>Event Photo</label>
            {imgPreview && <img src={imgPreview} alt="preview" style={{ width:'100%', height:'140px', objectFit:'cover', borderRadius:'8px', marginBottom:'8px' }} />}
            <button type="button" onClick={() => fileRef.current.click()} style={{ padding:'8px 16px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'7px', cursor:'pointer', fontSize:'13px', fontWeight:600, fontFamily:'Space Grotesk, sans-serif' }}>
              {imgPreview ? 'Change Photo' : 'Upload Photo'}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png" onChange={handleImg} style={{ display:'none' }} />
          </div>
        </div>
        <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
          <button onClick={handleSave} disabled={loading} style={{ flex:1, padding:'11px', background:'#2563eb', border:'none', borderRadius:'8px', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:'14px', fontFamily:'Space Grotesk, sans-serif' }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={onCancel} style={{ flex:1, padding:'11px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'8px', color:'#374151', fontWeight:600, cursor:'pointer', fontSize:'14px', fontFamily:'Space Grotesk, sans-serif' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}