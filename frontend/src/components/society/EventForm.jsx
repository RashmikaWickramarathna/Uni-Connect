import React, { useEffect, useRef, useState } from 'react';
import { getImageUrl } from '../../api/societyPortalApi';

const CATS = ['Academic', 'Sports', 'Cultural', 'Social', 'Workshop', 'Other'];
const TICKET_PRICE_OPTIONS = [100, 250, 500, 750, 1000, 2000, 3000, 4000];
const DEFAULT_PAID_TICKET_PRICE = 500;
const MAX_EVENTS_PER_DAY = 10;
const MAX_TAGS = 8;
const MAX_TAG_LENGTH = 24;
const MAX_TICKET_NOTE_LENGTH = 120;

const getGeneralTicket = (editData) =>
  Array.isArray(editData?.tickets)
    ? editData.tickets.find((ticket) => String(ticket?.type).toLowerCase() === 'general')
    : null;

const normalizeText = (value) => String(value || '').trim().replace(/\s+/g, ' ');

const parseTags = (value) =>
  String(value || '')
    .split(',')
    .map((tag) => normalizeText(tag))
    .filter(Boolean);

const getTicketPriceOptions = (price) => {
  const normalizedPrice = Number(price);
  if (Number.isFinite(normalizedPrice) && normalizedPrice > 0 && !TICKET_PRICE_OPTIONS.includes(normalizedPrice)) {
    return [...TICKET_PRICE_OPTIONS, normalizedPrice].sort((left, right) => left - right);
  }

  return TICKET_PRICE_OPTIONS;
};

const buildInitialForm = (editData, currentUser) => {
  const generalTicket = getGeneralTicket(editData);
  const generalTicketPrice = Number(generalTicket?.price);
  const isFreeEvent =
    editData?.isFreeEvent === true ||
    (generalTicket && Number.isFinite(generalTicketPrice) && generalTicketPrice === 0);

  return {
    title: normalizeText(editData?.title || ''),
    description: editData?.description || '',
    date: editData?.date || '',
    time: editData?.time || '',
    venue: normalizeText(editData?.venue || ''),
    category: editData?.category || 'Academic',
    organizer: editData?.organizer || currentUser?.name || '',
    organizerEmail: editData?.organizerEmail || currentUser?.email || '',
    maxParticipants: editData?.maxParticipants || 100,
    ticketMode: isFreeEvent ? 'free' : 'paid',
    generalSeats: generalTicket?.totalSeats || editData?.maxParticipants || 100,
    generalPrice:
      Number.isFinite(generalTicketPrice) && generalTicketPrice > 0
        ? generalTicketPrice
        : DEFAULT_PAID_TICKET_PRICE,
    generalDescription: normalizeText(
      generalTicket?.description || (isFreeEvent ? 'Free admission' : 'General admission')
    ),
    tags: Array.isArray(editData?.tags) ? editData.tags.join(', ') : '',
  };
};

const getExistingEventConflicts = (form, existingEvents, editId) => {
  const normalizedDate = String(form.date || '').trim();
  if (!normalizedDate) {
    return {
      sameDayEvents: [],
      sameVenueEvent: null,
      sameTimeEvent: null,
      duplicateTitleEvent: null,
    };
  }

  const normalizedVenue = normalizeText(form.venue).toLowerCase();
  const normalizedTime = String(form.time || '').trim();
  const normalizedTitle = normalizeText(form.title).toLowerCase();
  const filteredEvents = Array.isArray(existingEvents)
    ? existingEvents.filter((item) => item?.id !== editId && item?.date === normalizedDate)
    : [];

  return {
    sameDayEvents: filteredEvents,
    sameVenueEvent: filteredEvents.find(
      (item) => normalizedVenue && normalizeText(item?.venue).toLowerCase() === normalizedVenue
    ),
    sameTimeEvent: filteredEvents.find(
      (item) => normalizedTime && String(item?.time || '').trim() === normalizedTime
    ),
    duplicateTitleEvent: filteredEvents.find(
      (item) => normalizedTitle && normalizeText(item?.title).toLowerCase() === normalizedTitle
    ),
  };
};

const validate = (form, imgFile, existingEvents, editData) => {
  const errors = {};
  const normalizedTitle = normalizeText(form.title);
  const normalizedVenue = normalizeText(form.venue);
  const normalizedDescription = String(form.description || '').trim();
  const normalizedTicketNote = normalizeText(form.generalDescription);
  const tagList = parseTags(form.tags);
  const maxParticipants = Number(form.maxParticipants);
  const generalSeats = Number(form.generalSeats);
  const conflicts = getExistingEventConflicts(form, existingEvents, editData?._id);

  if (!normalizedTitle) errors.title = 'Title is required.';
  else if (normalizedTitle.length < 5) errors.title = 'Title needs at least 5 characters.';
  else if (normalizedTitle.length > 100) errors.title = `Title too long (${normalizedTitle.length}/100).`;
  else if (conflicts.duplicateTitleEvent) {
    errors.title = `"${conflicts.duplicateTitleEvent.title}" is already scheduled by your society on ${form.date}.`;
  }

  if (!form.organizer.trim()) errors.organizer = 'Organizer name is required.';

  if (!form.organizerEmail.trim()) errors.organizerEmail = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.organizerEmail.trim())) {
    errors.organizerEmail = 'Invalid email. Must contain @ (e.g. name@gmail.com).';
  }

  if (!form.date) errors.date = 'Date is required.';
  else {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    if (form.date <= todayStr) errors.date = 'Date must be at least one day in the future.';
    else if (conflicts.sameDayEvents.length >= MAX_EVENTS_PER_DAY) {
      errors.date = `Only ${MAX_EVENTS_PER_DAY} events can be scheduled by your society on one day.`;
    }
  }

  if (!form.time) errors.time = 'Time is required.';
  else if (!/^\d{2}:\d{2}$/.test(String(form.time || '').trim())) {
    errors.time = 'Time must be in HH:MM format.';
  } else if (conflicts.sameTimeEvent) {
    errors.time = `"${conflicts.sameTimeEvent.title}" is already planned at ${form.time} on ${form.date}.`;
  }

  if (!normalizedVenue) errors.venue = 'Venue is required.';
  else if (normalizedVenue.length < 3) errors.venue = 'Venue needs at least 3 characters.';
  else if (normalizedVenue.length > 120) errors.venue = 'Venue cannot exceed 120 characters.';
  else if (conflicts.sameVenueEvent) {
    errors.venue = `"${conflicts.sameVenueEvent.title}" already uses "${conflicts.sameVenueEvent.venue}" on ${form.date}.`;
  }

  if (!normalizedDescription) errors.description = 'Description is required.';
  else if (normalizedDescription.length < 20) {
    errors.description = `Too short (${normalizedDescription.length}/20 min chars).`;
  } else if (normalizedDescription.length > 1000) {
    errors.description = `Too long (${normalizedDescription.length}/1000 max).`;
  }

  if (form.ticketMode === 'paid') {
    const generalPrice = Number(form.generalPrice);
    if (!Number.isFinite(generalPrice) || generalPrice <= 0) {
      errors.generalPrice = 'Select a valid ticket price.';
    }
  }

  if (!Number.isInteger(maxParticipants) || maxParticipants < 1 || maxParticipants > 10000) {
    errors.maxParticipants = 'Max participants must be between 1 and 10000.';
  }

  if (!Number.isInteger(generalSeats) || generalSeats < 1 || generalSeats > 10000) {
    errors.generalSeats = 'General ticket seats must be between 1 and 10000.';
  } else if (Number.isInteger(maxParticipants) && generalSeats > maxParticipants) {
    errors.generalSeats = 'General ticket seats cannot exceed max participants.';
  }

  if (normalizedTicketNote.length > MAX_TICKET_NOTE_LENGTH) {
    errors.generalDescription = `Ticket note is too long (${normalizedTicketNote.length}/${MAX_TICKET_NOTE_LENGTH}).`;
  }

  if (tagList.length > MAX_TAGS) {
    errors.tags = `Only ${MAX_TAGS} tags are allowed.`;
  } else {
    const invalidTag = tagList.find((tag) => tag.length > MAX_TAG_LENGTH);
    const duplicateTags = tagList.filter(
      (tag, index) => tagList.findIndex((item) => item.toLowerCase() === tag.toLowerCase()) !== index
    );

    if (invalidTag) {
      errors.tags = `Each tag must be ${MAX_TAG_LENGTH} characters or fewer.`;
    } else if (duplicateTags.length > 0) {
      errors.tags = `Duplicate tags are not allowed: ${[...new Set(duplicateTags)].join(', ')}.`;
    }
  }

  if (imgFile) {
    if (!['image/jpeg', 'image/png'].includes(imgFile.type)) {
      errors.image = 'Only JPG and PNG allowed.';
    } else if (imgFile.size > 2 * 1024 * 1024) {
      errors.image = `File too large (${(imgFile.size / 1024 / 1024).toFixed(1)}MB). Max 2MB.`;
    }
  }

  return errors;
};

export default function EventForm({ onSubmit, editData, onCancelEdit, existingEvents, currentUser }) {
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
      setImgPrev(getImageUrl(editData.image));
    } else {
      setForm(buildInitialForm(null, currentUser));
      setImgPrev(null);
    }

    setImgFile(null);
    setErrs({});
    setServerErrs([]);
  }, [editData, currentUser]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => {
      if (name === 'ticketMode') {
        return {
          ...previous,
          ticketMode: value,
          generalPrice:
            value === 'paid' && Number(previous.generalPrice) <= 0
              ? DEFAULT_PAID_TICKET_PRICE
              : previous.generalPrice,
          generalDescription:
            previous.generalDescription.trim() ||
            (value === 'free' ? 'Free admission' : 'General admission'),
        };
      }

      return { ...previous, [name]: value };
    });

    if (serverErrs.length > 0) {
      setServerErrs([]);
    }

    if (Object.keys(errs).length > 0) {
      const nextForm = (() => {
        if (name === 'ticketMode') {
          return {
            ...form,
            ticketMode: value,
            generalPrice:
              value === 'paid' && Number(form.generalPrice) <= 0
                ? DEFAULT_PAID_TICKET_PRICE
                : form.generalPrice,
            generalDescription:
              normalizeText(form.generalDescription) || (value === 'free' ? 'Free admission' : 'General admission'),
          };
        }

        return { ...form, [name]: value };
      })();
      const nextErrors = validate(nextForm, imgFile, existingEvents, editData);
      setErrs(nextErrors);
    }
  };

  const onImg = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setErrs((previous) => ({ ...previous, image: 'Only JPG/PNG.' }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrs((previous) => ({
        ...previous,
        image: `Too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 2MB.`,
      }));
      return;
    }

    setImgFile(file);
    setImgPrev(URL.createObjectURL(file));
    setErrs((previous) => ({ ...previous, image: '' }));
  };

  const onSubmitForm = async (event) => {
    event.preventDefault();
    setServerErrs([]);

    const errors = validate(form, imgFile, existingEvents, editData);
    if (Object.keys(errors).length > 0) {
      setErrs(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      const isFreeEvent = form.ticketMode === 'free';
      const normalizedForm = {
        ...form,
        title: normalizeText(form.title),
        venue: normalizeText(form.venue),
        description: String(form.description || '').trim(),
        generalDescription: normalizeText(form.generalDescription),
        tags: parseTags(form.tags).join(', '),
      };
      const ticketSeats = Math.max(1, Number(form.generalSeats) || Number(form.maxParticipants) || 100);
      const ticketPrice = isFreeEvent
        ? 0
        : Math.max(1, Number(form.generalPrice) || DEFAULT_PAID_TICKET_PRICE);

      Object.entries(normalizedForm).forEach(([key, value]) => {
        if (['ticketMode', 'generalSeats', 'generalPrice', 'generalDescription'].includes(key)) return;
        formData.append(key, value);
      });
      formData.set('isFreeEvent', String(isFreeEvent));
      formData.set(
        'tickets',
        JSON.stringify([
          {
            type: 'general',
            price: ticketPrice,
            totalSeats: ticketSeats,
            description:
              normalizeText(form.generalDescription) || (isFreeEvent ? 'Free admission' : 'General admission'),
          },
        ])
      );
      formData.set('maxParticipants', String(Number(form.maxParticipants) || ticketSeats));
      if (imgFile) formData.append('image', imgFile);

      await onSubmit(formData);

      if (!editData) {
        setForm(buildInitialForm(null, currentUser));
        setImgFile(null);
        setImgPrev(null);
        if (fileRef.current) fileRef.current.value = '';
        setErrs({});
      }
    } catch (error) {
      const data = error.response?.data;
      setServerErrs(data?.errors || [data?.message || 'Something went wrong.']);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const inp = (name) => ({
    width: '100%',
    padding: '10px 14px',
    background: '#fff',
    border: `1px solid ${errs[name] ? '#dc2626' : '#e2e8f0'}`,
    borderRadius: '8px',
    fontSize: '14px',
    color: '#0f172a',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    outline: 'none',
  });

  const lbl = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
  };

  const fld = { marginBottom: '18px' };
  const ticketModeOptions = getTicketPriceOptions(form.generalPrice);
  const previewFrame = {
    width: '100%',
    height: '180px',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };
  const previewImage = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
  };

  const errTxt = (name) =>
    errs[name] ? (
      <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px', fontWeight: 500 }}>
        {errs[name]}
      </p>
    ) : null;

  const charCount = (value, max) => (
    <span
      style={{
        fontSize: '11px',
        color: (value || '').length > max ? '#dc2626' : '#94a3b8',
        float: 'right',
      }}
    >
      {(value || '').length}/{max}
    </span>
  );

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '30px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}
    >
      <h2
        style={{
          fontSize: '20px',
          fontWeight: 800,
          marginBottom: '4px',
          color: '#0f172a',
        }}
      >
        {editData ? 'Edit Event' : 'Create New Event'}
      </h2>
      <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>
        Fill in all details to schedule your university event
      </p>

      {serverErrs.length > 0 ? (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '20px',
          }}
        >
          <p style={{ fontWeight: 700, color: '#b91c1c', fontSize: '13px', marginBottom: '8px' }}>
            Please fix these errors:
          </p>
          <ul style={{ paddingLeft: '18px' }}>
            {serverErrs.map((message, index) => (
              <li
                key={index}
                style={{ color: '#b91c1c', fontSize: '13px', marginBottom: '4px' }}
              >
                {message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <form onSubmit={onSubmitForm} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <div style={fld}>
            <label style={lbl}>Event Title * {charCount(form.title, 100)}</label>
            <input
              style={inp('title')}
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="e.g. Annual Science Fair"
              maxLength={100}
            />
            {errTxt('title')}
          </div>

          <div style={fld}>
            <label style={lbl}>Organizer / Society Name *</label>
            <input
              style={inp('organizer')}
              name="organizer"
              value={form.organizer}
              onChange={onChange}
              placeholder="e.g. Computer Science Society"
              readOnly
            />
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
              Linked to the signed-in society account.
            </p>
            {errTxt('organizer')}
          </div>

          <div style={{ ...fld, gridColumn: '1 / -1' }}>
            <label style={lbl}>Society Email *</label>
            <input
              style={inp('organizerEmail')}
              name="organizerEmail"
              value={form.organizerEmail}
              onChange={onChange}
              placeholder="e.g. cssociety@university.edu"
              type="email"
              readOnly
            />
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
              Linked to the signed-in society email. Max 10 events per society per day.
            </p>
            {errTxt('organizerEmail')}
          </div>

          <div style={fld}>
            <label style={lbl}>Event Date *</label>
            <input style={inp('date')} type="date" name="date" value={form.date} onChange={onChange} />
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
              Must be a future date. Venue conflicts, same-time conflicts, and daily limits are checked.
            </p>
            {errTxt('date')}
          </div>

          <div style={fld}>
            <label style={lbl}>Event Time *</label>
            <input style={inp('time')} type="time" name="time" value={form.time} onChange={onChange} />
            {errTxt('time')}
          </div>

          <div style={fld}>
            <label style={lbl}>Venue *</label>
            <input
              style={inp('venue')}
              name="venue"
              value={form.venue}
              onChange={onChange}
              placeholder="e.g. Main Auditorium"
              maxLength={120}
            />
            {errTxt('venue')}
          </div>

          <div style={fld}>
            <label style={lbl}>Category</label>
            <select style={inp('category')} name="category" value={form.category} onChange={onChange}>
              {CATS.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>

          <div style={fld}>
            <label style={lbl}>Max Participants</label>
            <input
              style={inp('maxParticipants')}
              type="number"
              name="maxParticipants"
              value={form.maxParticipants}
              onChange={onChange}
              min={1}
              max={10000}
              step={1}
            />
            {errTxt('maxParticipants')}
          </div>

          <div style={{ ...fld, gridColumn: '1 / -1' }}>
            <label style={lbl}>Ticket Access *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                {
                  value: 'free',
                  title: 'Free Ticket',
                  description: 'Students can book instantly without payment.',
                },
                {
                  value: 'paid',
                  title: 'Paid Ticket',
                  description: 'Students must complete the payment step before booking.',
                },
              ].map((option) => {
                const isSelected = form.ticketMode === option.value;
                return (
                  <label
                    key={option.value}
                    style={{
                      border: `1px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                      background: isSelected ? '#eff6ff' : '#fff',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      display: 'flex',
                      gap: '10px',
                      cursor: 'pointer',
                      alignItems: 'flex-start',
                    }}
                  >
                    <input
                      type="radio"
                      name="ticketMode"
                      value={option.value}
                      checked={isSelected}
                      onChange={onChange}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                        {option.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                        {option.description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
              This choice decides whether the student sees the payment step.
            </p>
          </div>

          {form.ticketMode === 'paid' ? (
            <div style={fld}>
              <label style={lbl}>Ticket Price (LKR) *</label>
              <select
                style={inp('generalPrice')}
                name="generalPrice"
                value={form.generalPrice}
                onChange={onChange}
              >
                {ticketModeOptions.map((price) => (
                  <option key={price} value={price}>
                    Rs. {Number(price).toLocaleString()}
                  </option>
                ))}
              </select>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                Students will pay this amount before the booking is confirmed.
              </p>
              {errTxt('generalPrice')}
            </div>
          ) : (
            <div style={fld}>
              <label style={lbl}>Ticket Price</label>
              <div
                style={{
                  ...inp('generalPrice'),
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: '42px',
                }}
              >
                Free event
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                Students can continue without entering payment details.
              </p>
            </div>
          )}

          <div style={fld}>
            <label style={lbl}>General Ticket Seats *</label>
            <input
              style={inp('generalSeats')}
              type="number"
              name="generalSeats"
              value={form.generalSeats}
              onChange={onChange}
              min={1}
              max={10000}
              step={1}
            />
            {errTxt('generalSeats')}
          </div>

          <div style={{ ...fld, gridColumn: '1 / -1' }}>
            <label style={lbl}>Ticket Note</label>
            <input
              style={inp('generalDescription')}
              name="generalDescription"
              value={form.generalDescription}
              onChange={onChange}
              placeholder={form.ticketMode === 'free' ? 'e.g. Free admission' : 'e.g. General admission'}
              maxLength={MAX_TICKET_NOTE_LENGTH}
            />
            {errTxt('generalDescription')}
          </div>

          <div style={{ ...fld, gridColumn: '1 / -1' }}>
            <label style={lbl}>Tags (optional - comma separated)</label>
            <input
              style={inp('tags')}
              name="tags"
              value={form.tags}
              onChange={onChange}
              placeholder="e.g. science, technology, competition"
              maxLength={MAX_TAGS * (MAX_TAG_LENGTH + 2)}
            />
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
              Add up to {MAX_TAGS} unique tags to help others find your event.
            </p>
            {errTxt('tags')}
          </div>

          <div style={{ ...fld, gridColumn: '1 / -1' }}>
            <label style={lbl}>Description * {charCount(form.description, 1000)}</label>
            <textarea
              style={{ ...inp('description'), resize: 'vertical', minHeight: '100px' }}
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Describe the event in detail (min 20, max 1000 characters)"
              maxLength={1000}
            />
            {form.description.length > 0 && form.description.length < 20 ? (
              <p style={{ fontSize: '11px', color: '#d97706', marginTop: '4px' }}>
                {20 - form.description.length} more characters needed
              </p>
            ) : null}
            {errTxt('description')}
          </div>

          <div style={{ ...fld, gridColumn: '1 / -1' }}>
            <label style={lbl}>Event Photo (JPG or PNG - max 2MB)</label>
            {imgPrev ? (
              <div>
                <div style={previewFrame}>
                  <img src={imgPrev} alt="Preview" style={previewImage} />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button type="button" onClick={() => fileRef.current?.click()} style={secBtn}>
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImgFile(null);
                      setImgPrev(null);
                      if (fileRef.current) fileRef.current.value = '';
                    }}
                    style={{ ...secBtn, color: '#dc2626', borderColor: '#fca5a5' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${errs.image ? '#dc2626' : '#e2e8f0'}`,
                  borderRadius: '10px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: '#f8fafc',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.borderColor = '#2563eb';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.borderColor = errs.image ? '#dc2626' : '#e2e8f0';
                }}
              >
                <div style={{ fontSize: '28px', color: '#cbd5e1', marginBottom: '8px' }}>+</div>
                <p style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
                  Click to upload event photo
                </p>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  JPG or PNG only - max 2MB
                </p>
              </div>
            )}
            {errTxt('image')}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={onImg}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '11px 28px',
              background: loading ? '#93c5fd' : '#2563eb',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            {loading ? 'Saving...' : editData ? 'Update Event' : 'Create Event'}
          </button>
          {editData ? (
            <button type="button" onClick={onCancelEdit} style={secBtn}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}

const secBtn = {
  padding: '10px 20px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  color: '#374151',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 600,
};
