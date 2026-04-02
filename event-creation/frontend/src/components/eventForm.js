import React, { useState, useEffect, useRef } from 'react';

const categories = ['Academic', 'Sports', 'Cultural', 'Social', 'Workshop', 'Other'];

const initialState = {
  title: '',
  description: '',
  date: '',
  time: '',
  venue: '',
  category: 'Academic',
  organizer: '',
  organizerEmail: '',
  maxParticipants: 100,
};

// ── FRONTEND VALIDATION ──────────────────────────────────────────────────────
// These rules run in the browser before anything is sent to the backend.
// No backend packages (multer, path, fs) are used here — those only belong in the backend.

const validate = (form, imageFile) => {
  const errors = {};

  // Title: minimum 5, maximum 100 characters
  if (!form.title.trim()) {
    errors.title = "Event title is required.";
  } else if (form.title.trim().length < 5) {
    errors.title = "Title must be at least 5 characters.";
  } else if (form.title.trim().length > 100) {
    errors.title = `Title is too long (${form.title.trim().length}/100 characters).`;
  }

  // Organizer name
  if (!form.organizer.trim()) {
    errors.organizer = "Organizer name is required.";
  }

  // Email — must contain @ and follow valid format
  if (!form.organizerEmail.trim()) {
    errors.organizerEmail = "Organizer email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.organizerEmail.trim())) {
    errors.organizerEmail = "Invalid email address. Make sure it contains '@'.";
  }

  // Date — must not be today or in the past
  if (!form.date) {
    errors.date = "Event date is required.";
  } else {
    const now = new Date();
    const todayStr =
      now.getFullYear() +
      '-' + String(now.getMonth() + 1).padStart(2, '0') +
      '-' + String(now.getDate()).padStart(2, '0');
    if (form.date <= todayStr) {
      errors.date = "Event date must be at least one day in the future. Today and past dates are not allowed.";
    }
  }

  // Time
  if (!form.time) {
    errors.time = "Event time is required.";
  }

  // Venue
  if (!form.venue.trim()) {
    errors.venue = "Venue is required.";
  }

  // Description: minimum 20, maximum 1000 characters
  if (!form.description.trim()) {
    errors.description = "Description is required.";
  } else if (form.description.trim().length < 20) {
    errors.description = `Description too short (${form.description.trim().length}/20 minimum characters).`;
  } else if (form.description.trim().length > 1000) {
    errors.description = `Description too long (${form.description.trim().length}/1000 maximum characters).`;
  }

  // Image file — only JPG and PNG, max 2MB
  if (imageFile) {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(imageFile.type)) {
      errors.image = "Only JPG and PNG files are allowed.";
    } else if (imageFile.size > 2 * 1024 * 1024) {
      errors.image = `File is too large (${(imageFile.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 2MB.`;
    }
  }

  return errors;
};

// ── COMPONENT ────────────────────────────────────────────────────────────────

export default function EventForm({ onSubmit, editData, onCancelEdit, bookedDates }) {
  const [form, setForm] = useState(initialState);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverErrors, setServerErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    if (editData) {
      setForm({
        title: editData.title || '',
        description: editData.description || '',
        date: editData.date || '',
        time: editData.time || '',
        venue: editData.venue || '',
        category: editData.category || 'Academic',
        organizer: editData.organizer || '',
        organizerEmail: editData.organizerEmail || '',
        maxParticipants: editData.maxParticipants || 100,
      });
      if (editData.image) {
        setImagePreview(`http://localhost:5000/uploads/${editData.image}`);
      } else {
        setImagePreview(null);
      }
    } else {
      setForm(initialState);
      setImagePreview(null);
    }
    setImageFile(null);
    setFieldErrors({});
    setServerErrors([]);
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error for this field as user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size immediately when user picks file
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setFieldErrors(prev => ({ ...prev, image: "Only JPG and PNG files are allowed." }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFieldErrors(prev => ({
        ...prev,
        image: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 2MB.`
      }));
      return;
    }

    setImageFile(file);
    // createObjectURL makes a temporary local URL so we can preview the image
    setImagePreview(URL.createObjectURL(file));
    setFieldErrors(prev => ({ ...prev, image: '' }));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerErrors([]);

    // Run frontend validations
    const errors = validate(form, imageFile);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Check date conflict in the already-loaded events list
    const isEdit = !!editData;
    const conflictDate = bookedDates.find(
      d => d.date === form.date && (!isEdit || d.id !== editData._id)
    );
    if (conflictDate) {
      setFieldErrors(prev => ({
        ...prev,
        date: `"${conflictDate.title}" is already scheduled on this date. Please choose a different date.`,
      }));
      return;
    }

    setLoading(true);
    try {
      // FormData is needed to send both text fields and a file in one request
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
      });
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await onSubmit(formData);

      if (!editData) {
        setForm(initialState);
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setFieldErrors({});
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        setServerErrors(data.errors);
      } else {
        setServerErrors([data?.message || 'Something went wrong. Please try again.']);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  // ── STYLES ────────────────────────────────────────────────────────────────

  const inputBase = {
    width: '100%', padding: '10px 14px',
    background: '#ffffff', borderRadius: '8px',
    fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px',
    outline: 'none', transition: 'border-color 0.2s', color: '#0f172a',
  };

  const inputStyle = (fieldName) => ({
    ...inputBase,
    border: fieldErrors[fieldName] ? '1px solid #dc2626' : '1px solid #e2e8f0',
  });

  const labelStyle = {
    display: 'block', marginBottom: '6px',
    fontSize: '13px', color: '#374151', fontWeight: 600,
  };

  const fieldStyle = { marginBottom: '18px' };

  const errorText = (fieldName) =>
    fieldErrors[fieldName] ? (
      <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px', fontWeight: 500 }}>
        {fieldErrors[fieldName]}
      </p>
    ) : null;

  const charCount = (value, max) => {
    const len = (value || '').length;
    const over = len > max;
    return (
      <span style={{ fontSize: '11px', color: over ? '#dc2626' : '#94a3b8', float: 'right' }}>
        {len}/{max}
      </span>
    );
  };

  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e2e8f0',
      borderRadius: '14px', padding: '30px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '19px', marginBottom: '4px', color: '#0f172a' }}>
        {editData ? 'Edit Event' : 'Create New Event'}
      </h2>
      <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>
        {editData ? 'Update the event details below' : 'Fill in all fields to schedule a new university event'}
      </p>

      {/* Server errors box */}
      {serverErrors.length > 0 && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fca5a5',
          borderRadius: '10px', padding: '14px 18px', marginBottom: '22px',
        }}>
          <p style={{ fontWeight: 700, color: '#b91c1c', fontSize: '13px', marginBottom: '8px' }}>
            Please fix the following errors:
          </p>
          <ul style={{ paddingLeft: '18px' }}>
            {serverErrors.map((e, i) => (
              <li key={i} style={{ color: '#b91c1c', fontSize: '13px', marginBottom: '4px' }}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>

          {/* Title */}
          <div style={fieldStyle}>
            <label style={labelStyle}>
              Event Title * {charCount(form.title, 100)}
            </label>
            <input style={inputStyle('title')} name="title" value={form.title}
              onChange={handleChange} placeholder="e.g. Annual Science Fair (min 5 chars)" maxLength={100} />
            {errorText('title')}
          </div>

          {/* Organizer */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Organizer / Society Name *</label>
            <input style={inputStyle('organizer')} name="organizer" value={form.organizer}
              onChange={handleChange} placeholder="e.g. Computer Science Society" />
            {errorText('organizer')}
          </div>

          {/* Email — full width */}
          <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Society Email Address *</label>
            <input style={inputStyle('organizerEmail')} name="organizerEmail"
              value={form.organizerEmail} onChange={handleChange}
              placeholder="e.g. cssociety@university.edu" type="email" />
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
              Must be a valid email with @. One society can create max 10 events per day.
            </p>
            {errorText('organizerEmail')}
          </div>

          {/* Date */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Event Date *</label>
            <input style={inputStyle('date')} type="date" name="date"
              value={form.date} onChange={handleChange} />
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
              Must be a future date — today and past dates are not allowed.
            </p>
            {errorText('date')}
          </div>

          {/* Time */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Event Time *</label>
            <input style={inputStyle('time')} type="time" name="time"
              value={form.time} onChange={handleChange} />
            {errorText('time')}
          </div>

          {/* Venue */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Venue *</label>
            <input style={inputStyle('venue')} name="venue" value={form.venue}
              onChange={handleChange} placeholder="e.g. Main Auditorium" />
            {errorText('venue')}
          </div>

          {/* Category */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Category</label>
            <select style={inputStyle('category')} name="category"
              value={form.category} onChange={handleChange}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Max Participants */}
          <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Max Participants</label>
            <input style={inputStyle('maxParticipants')} type="number"
              name="maxParticipants" value={form.maxParticipants}
              onChange={handleChange} min={1} />
            {errorText('maxParticipants')}
          </div>

          {/* Description */}
          <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>
              Description * {charCount(form.description, 1000)}
            </label>
            <textarea
              style={{ ...inputStyle('description'), resize: 'vertical', minHeight: '100px' }}
              name="description" value={form.description} onChange={handleChange}
              placeholder="Describe the event in detail (min 20 characters, max 1000)" maxLength={1000}
            />
            {form.description.length > 0 && form.description.length < 20 && (
              <p style={{ fontSize: '11px', color: '#d97706', marginTop: '4px' }}>
                {20 - form.description.length} more characters needed
              </p>
            )}
            {errorText('description')}
          </div>

          {/* Image Upload */}
          <div style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Event Photo (optional)</label>

            {imagePreview ? (
              <div>
                <img src={imagePreview} alt="Preview" style={{
                  width: '100%', maxHeight: '220px', objectFit: 'cover',
                  borderRadius: '10px',
                  border: fieldErrors.image ? '2px solid #dc2626' : '1px solid #e2e8f0',
                  display: 'block',
                }} />
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button type="button" onClick={() => fileInputRef.current.click()} style={secondaryBtn}>
                    Change Photo
                  </button>
                  <button type="button" onClick={handleRemoveImage}
                    style={{ ...secondaryBtn, color: '#dc2626', borderColor: '#fca5a5' }}>
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current.click()}
                style={{
                  border: fieldErrors.image ? '2px dashed #dc2626' : '2px dashed #e2e8f0',
                  borderRadius: '10px', padding: '36px 20px',
                  textAlign: 'center', cursor: 'pointer',
                  background: '#f8fafc', transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#2563eb'}
                onMouseLeave={e => e.currentTarget.style.borderColor = fieldErrors.image ? '#dc2626' : '#e2e8f0'}
              >
                <div style={{ fontSize: '28px', color: '#cbd5e1', marginBottom: '8px' }}>+</div>
                <p style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
                  Click to upload event photo
                </p>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  JPG or PNG only — maximum 2MB
                </p>
              </div>
            )}

            {errorText('image')}

            {/* Hidden file input — triggered by clicking the box above */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>

        </div>

        {/* Submit buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button type="submit" disabled={loading} style={{
            padding: '11px 28px', background: loading ? '#93c5fd' : '#2563eb',
            border: 'none', borderRadius: '8px', color: '#fff',
            fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px', fontFamily: 'Space Grotesk, sans-serif',
          }}>
            {loading ? 'Saving...' : editData ? 'Update Event' : 'Create Event'}
          </button>
          {editData && (
            <button type="button" onClick={onCancelEdit} style={secondaryBtn}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

const secondaryBtn = {
  padding: '10px 20px', background: '#f8fafc',
  border: '1px solid #e2e8f0', borderRadius: '8px',
  color: '#374151', cursor: 'pointer', fontSize: '13px',
  fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif',
};