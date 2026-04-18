import React, { useState, useEffect, useRef } from 'react';

const CATS = ['Academic','Sports','Cultural','Social','Workshop','Other'];

const buildInitialForm = (editData, currentUser) => ({
  title: editData?.title || '',
  description: editData?.description || '',
  date: editData?.date || '',
  time: editData?.time || '',
  venue: editData?.venue || '',
  category: editData?.category || 'Academic',
  organizer: editData?.organizer || currentUser?.name || '',
  organizerEmail: editData?.organizerEmail || currentUser?.email || '',
  maxParticipants: editData?.maxParticipants || 100,
  tags: (editData?.tags || []).join(', '),
});

const validate = (form, imgFile) => {
  const e = {};
  if (!form.title.trim()) e.title = "Title is required.";
  else if (form.title.trim().length < 5) e.title = "Title needs at least 5 characters.";
  else if (form.title.trim().length > 100) e.title = `Title too long (${form.title.trim().length}/100).`;

  if (!form.organizer.trim()) e.organizer = "Organizer name is required.";

  if (!form.organizerEmail.trim()) e.organizerEmail = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.organizerEmail.trim()))
    e.organizerEmail = "Invalid email. Must contain @ (e.g. name@gmail.com).";

  if (!form.date) e.date = "Date is required.";
  else {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    if (form.date <= todayStr) e.date = "Date must be at least one day in the future.";
  }

  if (!form.time) e.time = "Time is required.";
  if (!form.venue.trim()) e.venue = "Venue is required.";

  if (!form.description.trim()) e.description = "Description is required.";
  else if (form.description.trim().length < 20) e.description = `Too short (${form.description.trim().length}/20 min chars).`;
  else if (form.description.trim().length > 1000) e.description = `Too long (${form.description.trim().length}/1000 max).`;

  if (imgFile) {
    if (!["image/jpeg","image/png"].includes(imgFile.type)) e.image = "Only JPG and PNG allowed.";
    else if (imgFile.size > 2*1024*1024) e.image = `File too large (${(imgFile.size/1024/1024).toFixed(1)}MB). Max 2MB.`;
  }
  return e;
};

export default function EventForm({ onSubmit, editData, onCancelEdit, bookedDates, currentUser }) {
  const [form, setForm] = useState(buildInitialForm(editData, currentUser));
  const [errs, setErrs] = useState({});
  const [serverErrs, setServerErrs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imgFile, setImgFile] = useState(null);
  const [imgPrev, setImgPrev] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    if (editData) {
      setForm(buildInitialForm(editData, currentUser));
      setImgPrev(editData.image ? `http://localhost:5000/uploads/${editData.image}` : null);
    } else {
      setForm(buildInitialForm(null, currentUser));
      setImgPrev(null);
    }
    setImgFile(null); setErrs({}); setServerErrs([]);
  }, [editData, currentUser]);

  const onChange = e => {
    const { name, value } = e.target;
    setForm(p => ({...p, [name]:value}));
    if (errs[name]) setErrs(p => ({...p, [name]:''}));
  };

  const onImg = e => {
    const f = e.target.files[0]; if (!f) return;
    if (!["image/jpeg","image/png"].includes(f.type)) { setErrs(p=>({...p,image:"Only JPG/PNG."})); return; }
    if (f.size > 2*1024*1024) { setErrs(p=>({...p,image:`Too large (${(f.size/1024/1024).toFixed(1)}MB). Max 2MB.`})); return; }
    setImgFile(f); setImgPrev(URL.createObjectURL(f)); setErrs(p=>({...p,image:''}));
  };

  const onSubmitForm = async e => {
    e.preventDefault(); setServerErrs([]);
    const errors = validate(form, imgFile);
    if (Object.keys(errors).length > 0) { setErrs(errors); window.scrollTo({top:0,behavior:'smooth'}); return; }

    const isEdit = !!editData;
    const conflict = bookedDates?.find(d => d.date===form.date && (!isEdit||d.id!==editData._id));
    if (conflict) { setErrs(p=>({...p,date:`"${conflict.title}" already on this date.`})); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => fd.append(k, form[k]));
      if (imgFile) fd.append('image', imgFile);
      await onSubmit(fd);
      if (!editData) { setForm(buildInitialForm(null, currentUser)); setImgFile(null); setImgPrev(null); if(fileRef.current) fileRef.current.value=''; setErrs({}); }
    } catch(err) {
      const d = err.response?.data;
      setServerErrs(d?.errors||[d?.message||'Something went wrong.']);
      window.scrollTo({top:0,behavior:'smooth'});
    } finally { setLoading(false); }
  };

  const inp = name => ({ width:'100%', padding:'10px 14px', background:'#fff', border:`1px solid ${errs[name]?'#dc2626':'#e2e8f0'}`, borderRadius:'8px', fontSize:'14px', color:'#0f172a', fontFamily:'Space Grotesk, sans-serif', outline:'none' });
  const lbl = { display:'block', fontSize:'13px', fontWeight:600, color:'#374151', marginBottom:'6px' };
  const fld = { marginBottom:'18px' };
  const errTxt = name => errs[name] ? <p style={{color:'#dc2626',fontSize:'12px',marginTop:'5px',fontWeight:500}}>{errs[name]}</p> : null;
  const charCount = (val, max) => <span style={{fontSize:'11px',color:(val||'').length>max?'#dc2626':'#94a3b8',float:'right'}}>{(val||'').length}/{max}</span>;

  return (
    <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:'14px',padding:'30px',boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
      <h2 style={{fontFamily:'Syne, sans-serif',fontSize:'20px',fontWeight:800,marginBottom:'4px',color:'#0f172a'}}>
        {editData ? 'Edit Event' : 'Create New Event'}
      </h2>
      <p style={{fontSize:'13px',color:'#94a3b8',marginBottom:'24px'}}>Fill in all details to schedule your university event</p>

      {serverErrs.length > 0 && (
        <div style={{background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:'10px',padding:'14px 18px',marginBottom:'20px'}}>
          <p style={{fontWeight:700,color:'#b91c1c',fontSize:'13px',marginBottom:'8px'}}>Please fix these errors:</p>
          <ul style={{paddingLeft:'18px'}}>{serverErrs.map((e,i)=><li key={i} style={{color:'#b91c1c',fontSize:'13px',marginBottom:'4px'}}>{e}</li>)}</ul>
        </div>
      )}

      <form onSubmit={onSubmitForm} noValidate>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 20px'}}>

          <div style={fld}>
            <label style={lbl}>Event Title * {charCount(form.title,100)}</label>
            <input style={inp('title')} name="title" value={form.title} onChange={onChange} placeholder="e.g. Annual Science Fair" maxLength={100} />
            {errTxt('title')}
          </div>

          <div style={fld}>
            <label style={lbl}>Organizer / Society Name *</label>
            <input style={inp('organizer')} name="organizer" value={form.organizer} onChange={onChange} placeholder="e.g. Computer Science Society" readOnly />
            <p style={{fontSize:'11px',color:'#94a3b8',marginTop:'4px'}}>Linked to the signed-in society account.</p>
            {errTxt('organizer')}
          </div>

          <div style={{...fld,gridColumn:'1 / -1'}}>
            <label style={lbl}>Society Email *</label>
            <input style={inp('organizerEmail')} name="organizerEmail" value={form.organizerEmail} onChange={onChange} placeholder="e.g. cssociety@university.edu" type="email" readOnly />
            <p style={{fontSize:'11px',color:'#94a3b8',marginTop:'4px'}}>Linked to the signed-in society email. Max 10 events per society per day.</p>
            {errTxt('organizerEmail')}
          </div>

          <div style={fld}>
            <label style={lbl}>Event Date *</label>
            <input style={inp('date')} type="date" name="date" value={form.date} onChange={onChange} />
            <p style={{fontSize:'11px',color:'#94a3b8',marginTop:'4px'}}>Must be a future date. Same date and same venue cannot be used twice.</p>
            {errTxt('date')}
          </div>

          <div style={fld}>
            <label style={lbl}>Event Time *</label>
            <input style={inp('time')} type="time" name="time" value={form.time} onChange={onChange} />
            {errTxt('time')}
          </div>

          <div style={fld}>
            <label style={lbl}>Venue *</label>
            <input style={inp('venue')} name="venue" value={form.venue} onChange={onChange} placeholder="e.g. Main Auditorium" />
            {errTxt('venue')}
          </div>

          <div style={fld}>
            <label style={lbl}>Category</label>
            <select style={inp('category')} name="category" value={form.category} onChange={onChange}>
              {CATS.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>

          <div style={fld}>
            <label style={lbl}>Max Participants</label>
            <input style={inp('maxParticipants')} type="number" name="maxParticipants" value={form.maxParticipants} onChange={onChange} min={1} />
          </div>

          <div style={{...fld,gridColumn:'1 / -1'}}>
            <label style={lbl}>Tags (optional — comma separated)</label>
            <input style={inp('tags')} name="tags" value={form.tags} onChange={onChange} placeholder="e.g. science, technology, competition" />
            <p style={{fontSize:'11px',color:'#94a3b8',marginTop:'4px'}}>Add tags to help others find your event</p>
          </div>

          <div style={{...fld,gridColumn:'1 / -1'}}>
            <label style={lbl}>Description * {charCount(form.description,1000)}</label>
            <textarea style={{...inp('description'),resize:'vertical',minHeight:'100px'}} name="description" value={form.description} onChange={onChange} placeholder="Describe the event in detail (min 20, max 1000 characters)" maxLength={1000} />
            {form.description.length > 0 && form.description.length < 20 && (
              <p style={{fontSize:'11px',color:'#d97706',marginTop:'4px'}}>{20-form.description.length} more characters needed</p>
            )}
            {errTxt('description')}
          </div>

          <div style={{...fld,gridColumn:'1 / -1'}}>
            <label style={lbl}>Event Photo (JPG or PNG — max 2MB)</label>
            {imgPrev ? (
              <div>
                <img src={imgPrev} alt="Preview" style={{width:'100%',maxHeight:'220px',objectFit:'cover',borderRadius:'10px',border:'1px solid #e2e8f0',display:'block'}} />
                <div style={{display:'flex',gap:'10px',marginTop:'8px'}}>
                  <button type="button" onClick={() => fileRef.current.click()} style={secBtn}>Change Photo</button>
                  <button type="button" onClick={() => {setImgFile(null);setImgPrev(null);if(fileRef.current)fileRef.current.value='';}} style={{...secBtn,color:'#dc2626',borderColor:'#fca5a5'}}>Remove</button>
                </div>
              </div>
            ) : (
              <div onClick={() => fileRef.current.click()} style={{border:`2px dashed ${errs.image?'#dc2626':'#e2e8f0'}`,borderRadius:'10px',padding:'36px 20px',textAlign:'center',cursor:'pointer',background:'#f8fafc'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#2563eb'}
                onMouseLeave={e=>e.currentTarget.style.borderColor=errs.image?'#dc2626':'#e2e8f0'}>
                <div style={{fontSize:'28px',color:'#cbd5e1',marginBottom:'8px'}}>+</div>
                <p style={{fontSize:'14px',color:'#64748b',fontWeight:600}}>Click to upload event photo</p>
                <p style={{fontSize:'12px',color:'#94a3b8',marginTop:'4px'}}>JPG or PNG only — max 2MB</p>
              </div>
            )}
            {errTxt('image')}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png" onChange={onImg} style={{display:'none'}} />
          </div>
        </div>

        <div style={{display:'flex',gap:'12px',marginTop:'8px'}}>
          <button type="submit" disabled={loading} style={{padding:'11px 28px',background:loading?'#93c5fd':'#2563eb',border:'none',borderRadius:'8px',color:'#fff',fontWeight:700,cursor:loading?'not-allowed':'pointer',fontSize:'14px',fontFamily:'Space Grotesk, sans-serif'}}>
            {loading ? 'Saving...' : editData ? 'Update Event' : 'Create Event'}
          </button>
          {editData && <button type="button" onClick={onCancelEdit} style={secBtn}>Cancel</button>}
        </div>
      </form>
    </div>
  );
}

const secBtn = { padding:'10px 20px', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:'8px', color:'#374151', cursor:'pointer', fontSize:'13px', fontWeight:600, fontFamily:'Space Grotesk, sans-serif' };
