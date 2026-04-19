import React, { useEffect, useRef, useState } from "react";

import { getImageUrl } from "../../api/societyPortalApi";
import {
  createDefaultPaidTiers,
  createFreeTicketTier,
  formatTicketLabel,
  sumTicketSeats,
} from "../../utils/ticketUtils";

const CATS = ["Academic", "Cultural", "Sports", "Tech", "Workshop", "Seminar", "Social", "Other"];
const MAX_EVENTS_PER_DAY = 10;
const MAX_TAGS = 8;
const MAX_TAG_LENGTH = 24;

const normalizeText = (value) => String(value || "").trim().replace(/\s+/g, " ");

const parseTags = (value) =>
  String(value || "")
    .split(",")
    .map((tag) => normalizeText(tag))
    .filter(Boolean);

const createTierDraft = (ticket, index) => ({
  id: `${ticket?.type || `tier_${index + 1}`}-${index}`,
  type: String(ticket?.type || `tier_${index + 1}`).trim() || `tier_${index + 1}`,
  label: formatTicketLabel(ticket, index),
  price: Number(ticket?.price) || 0,
  totalSeats: Number(ticket?.totalSeats) || 0,
});

const createEmptyTier = (index) => ({
  id: `new-tier-${index + 1}-${Date.now()}`,
  type: `tier_${index + 1}`,
  label: `Tier ${index + 1}`,
  price: 0,
  totalSeats: 0,
});

const buildInitialTiers = (editData) => {
  if (Array.isArray(editData?.tickets) && editData.tickets.length > 0) {
    return editData.tickets.map((ticket, index) => createTierDraft(ticket, index));
  }

  return createDefaultPaidTiers().map((ticket, index) => createTierDraft(ticket, index));
};

const buildInitialForm = (editData, currentUser) => {
  const maxParticipants = Number(editData?.maxParticipants) || 100;
  const ticketTiers = buildInitialTiers(editData);
  const isFreeEvent =
    editData?.isFreeEvent === true ||
    (Array.isArray(editData?.tickets) &&
      editData.tickets.length > 0 &&
      editData.tickets.every((ticket) => Number(ticket?.price || 0) === 0));

  return {
    title: normalizeText(editData?.title || ""),
    description: editData?.description || "",
    date: editData?.date || "",
    time: editData?.time || "",
    venue: normalizeText(editData?.venue || ""),
    category: editData?.category || "Academic",
    organizer: editData?.organizer || currentUser?.name || "",
    organizerEmail: editData?.organizerEmail || currentUser?.email || "",
    maxParticipants,
    ticketMode: isFreeEvent ? "free" : "paid",
    ticketTiers,
    tags: Array.isArray(editData?.tags) ? editData.tags.join(", ") : "",
  };
};

const getExistingEventConflicts = (form, existingEvents, editId) => {
  const normalizedDate = String(form.date || "").trim();
  if (!normalizedDate) {
    return {
      sameDayEvents: [],
      sameVenueEvent: null,
      sameTimeEvent: null,
      duplicateTitleEvent: null,
    };
  }

  const normalizedVenue = normalizeText(form.venue).toLowerCase();
  const normalizedTime = String(form.time || "").trim();
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
      (item) => normalizedTime && String(item?.time || "").trim() === normalizedTime
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
  const normalizedDescription = String(form.description || "").trim();
  const tagList = parseTags(form.tags);
  const maxParticipants = Number(form.maxParticipants);
  const conflicts = getExistingEventConflicts(form, existingEvents, editData?._id);

  if (!normalizedTitle) errors.title = "Title is required.";
  else if (normalizedTitle.length < 5) errors.title = "Title needs at least 5 characters.";
  else if (normalizedTitle.length > 100) errors.title = "Title cannot exceed 100 characters.";
  else if (conflicts.duplicateTitleEvent) {
    errors.title = `"${conflicts.duplicateTitleEvent.title}" is already scheduled by your society on ${form.date}.`;
  }

  if (!form.organizer.trim()) errors.organizer = "Organizer name is required.";

  if (!form.organizerEmail.trim()) errors.organizerEmail = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.organizerEmail.trim())) {
    errors.organizerEmail = "Invalid email. Must contain @ (e.g. name@gmail.com).";
  }

  if (!form.date) errors.date = "Date is required.";
  else {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;
    if (form.date <= todayStr) errors.date = "Date must be at least one day in the future.";
    else if (conflicts.sameDayEvents.length >= MAX_EVENTS_PER_DAY) {
      errors.date = `Only ${MAX_EVENTS_PER_DAY} events can be scheduled by your society on one day.`;
    }
  }

  if (!form.time) errors.time = "Time is required.";
  else if (!/^\d{2}:\d{2}$/.test(String(form.time || "").trim())) {
    errors.time = "Time must be in HH:MM format.";
  } else if (conflicts.sameTimeEvent) {
    errors.time = `"${conflicts.sameTimeEvent.title}" is already planned at ${form.time} on ${form.date}.`;
  }

  if (!normalizedVenue) errors.venue = "Venue is required.";
  else if (normalizedVenue.length < 3) errors.venue = "Venue needs at least 3 characters.";
  else if (normalizedVenue.length > 120) errors.venue = "Venue cannot exceed 120 characters.";
  else if (conflicts.sameVenueEvent) {
    errors.venue = `"${conflicts.sameVenueEvent.title}" already uses "${conflicts.sameVenueEvent.venue}" on ${form.date}.`;
  }

  if (!normalizedDescription) errors.description = "Description is required.";
  else if (normalizedDescription.length < 20) {
    errors.description = `Too short (${normalizedDescription.length}/20 min chars).`;
  } else if (normalizedDescription.length > 1000) {
    errors.description = `Too long (${normalizedDescription.length}/1000 max).`;
  }

  if (!Number.isInteger(maxParticipants) || maxParticipants < 1 || maxParticipants > 10000) {
    errors.maxParticipants = "Max participants must be between 1 and 10000.";
  }

  if (form.ticketMode === "paid") {
    if (!Array.isArray(form.ticketTiers) || form.ticketTiers.length === 0) {
      errors.ticketTiers = "Add at least one paid ticket tier.";
    } else {
      const labelSet = new Set();
      const typeSet = new Set();
      let totalAssignedSeats = 0;

      form.ticketTiers.forEach((ticket, index) => {
        const label = normalizeText(ticket.label);
        const type = String(ticket.type || "").trim();
        const price = Number(ticket.price);
        const seats = Number(ticket.totalSeats);

        totalAssignedSeats += Number.isFinite(seats) ? seats : 0;

        if (!label || label.length < 2) {
          errors[`ticket_label_${index}`] = "Label must be at least 2 characters.";
        } else if (label.length > 60) {
          errors[`ticket_label_${index}`] = "Label cannot exceed 60 characters.";
        } else if (labelSet.has(label.toLowerCase())) {
          errors[`ticket_label_${index}`] = "Each ticket label should be unique.";
        } else {
          labelSet.add(label.toLowerCase());
        }

        if (!type) {
          errors[`ticket_type_${index}`] = "Ticket type is missing.";
        } else if (typeSet.has(type)) {
          errors[`ticket_type_${index}`] = "Ticket tier type must be unique.";
        } else {
          typeSet.add(type);
        }

        if (!Number.isFinite(price) || price <= 0) {
          errors[`ticket_price_${index}`] = "Price must be greater than 0.";
        }

        if (!Number.isInteger(seats) || seats < 1 || seats > 10000) {
          errors[`ticket_seats_${index}`] = "Seats must be between 1 and 10000.";
        }
      });

      if (Number.isInteger(maxParticipants) && totalAssignedSeats > maxParticipants) {
        errors.ticketSeats = "Total ticket seats cannot exceed max participants.";
      }
    }
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
      errors.tags = `Duplicate tags are not allowed: ${[...new Set(duplicateTags)].join(", ")}.`;
    }
  }

  if (imgFile) {
    if (!["image/jpeg", "image/png"].includes(imgFile.type)) {
      errors.image = "Only JPG and PNG allowed.";
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
  const fileRef = useRef(null);

  useEffect(() => {
    const nextForm = buildInitialForm(editData, currentUser);
    setForm(nextForm);
    setImgPrev(editData?.image ? getImageUrl(editData.image) : null);
    setImgFile(null);
    setErrs({});
    setServerErrs([]);
  }, [editData, currentUser]);

  const refreshValidation = (nextForm, nextImage = imgFile) => {
    if (Object.keys(errs).length > 0) {
      setErrs(validate(nextForm, nextImage, existingEvents, editData));
    }
  };

  const onChange = (event) => {
    const { name, value } = event.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);
    if (serverErrs.length > 0) setServerErrs([]);
    refreshValidation(nextForm);
  };

  const updateTicketTier = (index, field, value) => {
    const nextTiers = form.ticketTiers.map((ticket, tierIndex) =>
      tierIndex === index ? { ...ticket, [field]: value } : ticket
    );
    const nextForm = { ...form, ticketTiers: nextTiers };
    setForm(nextForm);
    refreshValidation(nextForm);
  };

  const addTicketTier = () => {
    const nextTiers = [...form.ticketTiers, createEmptyTier(form.ticketTiers.length)];
    const nextForm = { ...form, ticketTiers: nextTiers };
    setForm(nextForm);
    refreshValidation(nextForm);
  };

  const removeTicketTier = (index) => {
    const nextTiers = form.ticketTiers.filter((_, tierIndex) => tierIndex !== index);
    const nextForm = {
      ...form,
      ticketTiers: nextTiers.length > 0 ? nextTiers : [createEmptyTier(0)],
    };
    setForm(nextForm);
    refreshValidation(nextForm);
  };

  const onImg = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setErrs((previous) => ({ ...previous, image: "Only JPG/PNG." }));
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
    const nextErrors = validate(form, file, existingEvents, editData);
    setErrs(nextErrors);
  };

  const onSubmitForm = async (event) => {
    event.preventDefault();
    setServerErrs([]);

    const errors = validate(form, imgFile, existingEvents, editData);
    if (Object.keys(errors).length > 0) {
      setErrs(errors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);

    try {
      const isFreeEvent = form.ticketMode === "free";
      const safeMaxParticipants = Math.max(1, Number(form.maxParticipants) || 100);
      const normalizedForm = {
        ...form,
        title: normalizeText(form.title),
        venue: normalizeText(form.venue),
        description: String(form.description || "").trim(),
        tags: parseTags(form.tags).join(", "),
      };

      const tickets = isFreeEvent
        ? [createFreeTicketTier(safeMaxParticipants)]
        : form.ticketTiers.map((ticket, index) => ({
            type: String(ticket.type || `tier_${index + 1}`).trim(),
            label: normalizeText(ticket.label) || `Tier ${index + 1}`,
            price: Math.max(1, Number(ticket.price) || 0),
            totalSeats: Math.max(1, Number(ticket.totalSeats) || 0),
            description: "",
          }));

      const formData = new FormData();
      Object.entries(normalizedForm).forEach(([key, value]) => {
        if (["ticketMode", "ticketTiers"].includes(key)) return;
        formData.append(key, value);
      });
      formData.set("isFreeEvent", String(isFreeEvent));
      formData.set("maxParticipants", String(safeMaxParticipants));
      formData.set("tickets", JSON.stringify(tickets));

      if (imgFile) {
        formData.append("image", imgFile);
      }

      await onSubmit(formData);

      if (!editData) {
        setForm(buildInitialForm(null, currentUser));
        setImgFile(null);
        setImgPrev(null);
        if (fileRef.current) fileRef.current.value = "";
        setErrs({});
      }
    } catch (error) {
      const data = error.response?.data;
      setServerErrs(data?.errors || [data?.message || "Something went wrong."]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const totalAssignedSeats = sumTicketSeats(form.ticketTiers);
  const remainingSeats = Math.max(Number(form.maxParticipants || 0) - totalAssignedSeats, 0);

  const panelStyle = {
    background: "var(--app-surface)",
    border: "1px solid var(--app-border)",
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "var(--shadow-md)",
    color: "var(--app-text)",
  };

  const cardStyle = {
    border: "1px solid var(--app-border)",
    background: "var(--app-surface-muted)",
    borderRadius: "16px",
    padding: "16px",
  };

  const inp = (name) => ({
    width: "100%",
    padding: "10px 14px",
    background: "var(--app-surface)",
    border: `1px solid ${errs[name] ? "var(--app-danger)" : "var(--app-border)"}`,
    borderRadius: "10px",
    fontSize: "14px",
    color: "var(--app-text)",
    outline: "none",
  });

  const lbl = {
    display: "block",
    fontSize: "13px",
    fontWeight: 700,
    color: "var(--app-text)",
    marginBottom: "6px",
  };

  const noteStyle = {
    fontSize: "12px",
    color: "var(--app-text-muted)",
    marginTop: "6px",
  };

  const errTxt = (name) =>
    errs[name] ? (
      <p style={{ color: "var(--app-danger)", fontSize: "12px", marginTop: "5px", fontWeight: 600 }}>
        {errs[name]}
      </p>
    ) : null;

  const charCount = (value, max) => (
    <span
      style={{
        fontSize: "11px",
        color: (value || "").length > max ? "var(--app-danger)" : "var(--app-text-muted)",
        float: "right",
      }}
    >
      {(value || "").length}/{max}
    </span>
  );

  return (
    <div style={panelStyle}>
      <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "4px", color: "var(--app-text)" }}>
        {editData ? "Edit Event" : "Create New Event"}
      </h2>
      <p style={{ fontSize: "13px", color: "var(--app-text-muted)", marginBottom: "24px" }}>
        Fill in all details to schedule your university event and configure ticket pricing tiers.
      </p>

      {serverErrs.length > 0 ? (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.26)",
            borderRadius: "14px",
            padding: "14px 18px",
            marginBottom: "20px",
          }}
        >
          <p style={{ fontWeight: 700, color: "var(--app-danger)", fontSize: "13px", marginBottom: "8px" }}>
            Please fix these errors:
          </p>
          <ul style={{ paddingLeft: "18px", color: "var(--app-danger)" }}>
            {serverErrs.map((message, index) => (
              <li key={index} style={{ fontSize: "13px", marginBottom: "4px" }}>
                {message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <form onSubmit={onSubmitForm} noValidate>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
          <div style={{ marginBottom: "18px" }}>
            <label style={lbl}>Event Title * {charCount(form.title, 100)}</label>
            <input
              style={inp("title")}
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="e.g. Annual Science Fair"
              maxLength={100}
            />
            {errTxt("title")}
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={lbl}>Organizer / Society Name *</label>
            <input
              style={inp("organizer")}
              name="organizer"
              value={form.organizer}
              onChange={onChange}
              readOnly
            />
            <p style={noteStyle}>Linked to the signed-in society account.</p>
            {errTxt("organizer")}
          </div>

          <div style={{ marginBottom: "18px", gridColumn: "1 / -1" }}>
            <label style={lbl}>Society Email *</label>
            <input
              style={inp("organizerEmail")}
              name="organizerEmail"
              value={form.organizerEmail}
              onChange={onChange}
              type="email"
              readOnly
            />
            <p style={noteStyle}>
              Linked to the signed-in society email. Max {MAX_EVENTS_PER_DAY} events per society
              per day.
            </p>
            {errTxt("organizerEmail")}
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={lbl}>Event Date *</label>
            <input style={inp("date")} type="date" name="date" value={form.date} onChange={onChange} />
            <p style={noteStyle}>
              Must be a future date. Venue conflicts and same-time conflicts are checked.
            </p>
            {errTxt("date")}
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={lbl}>Event Time *</label>
            <input style={inp("time")} type="time" name="time" value={form.time} onChange={onChange} />
            {errTxt("time")}
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={lbl}>Venue *</label>
            <input
              style={inp("venue")}
              name="venue"
              value={form.venue}
              onChange={onChange}
              placeholder="e.g. Main Auditorium"
              maxLength={120}
            />
            {errTxt("venue")}
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={lbl}>Category</label>
            <select style={inp("category")} name="category" value={form.category} onChange={onChange}>
              {CATS.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={lbl}>Max Participants</label>
            <input
              style={inp("maxParticipants")}
              type="number"
              name="maxParticipants"
              value={form.maxParticipants}
              onChange={onChange}
              min={1}
              max={10000}
              step={1}
            />
            {errTxt("maxParticipants")}
          </div>

          <div style={{ marginBottom: "18px", gridColumn: "1 / -1" }}>
            <label style={lbl}>Ticket Access *</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                {
                  value: "free",
                  title: "Free Ticket",
                  description: "Students can book instantly without payment.",
                },
                {
                  value: "paid",
                  title: "Paid Ticket",
                  description: "Add price tiers and students will choose a seat bracket before payment.",
                },
              ].map((option) => {
                const isSelected = form.ticketMode === option.value;
                return (
                  <label
                    key={option.value}
                    style={{
                      border: `1px solid ${isSelected ? "var(--app-primary)" : "var(--app-border)"}`,
                      background: isSelected ? "rgba(37, 99, 235, 0.08)" : "var(--app-surface)",
                      borderRadius: "14px",
                      padding: "14px 16px",
                      display: "flex",
                      gap: "10px",
                      cursor: "pointer",
                      alignItems: "flex-start",
                    }}
                  >
                    <input
                      type="radio"
                      name="ticketMode"
                      value={option.value}
                      checked={isSelected}
                      onChange={onChange}
                      style={{ marginTop: "3px" }}
                    />
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--app-text)" }}>
                        {option.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--app-text-muted)", marginTop: "4px" }}>
                        {option.description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            <p style={noteStyle}>This decides whether students go through a payment step.</p>
          </div>

          <div style={{ marginBottom: "18px", gridColumn: "1 / -1" }}>
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "14px" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "var(--app-text)" }}>
                    Ticket Configuration
                  </h3>
                  <p style={{ ...noteStyle, marginTop: "4px" }}>
                    {form.ticketMode === "paid"
                      ? "Create multiple paid ticket brackets like Rs. 250 x 30, Rs. 500 x 30, and so on."
                      : "Free mode uses one free pass based on your max participant count."}
                  </p>
                </div>

                {form.ticketMode === "paid" ? (
                  <button
                    type="button"
                    onClick={addTicketTier}
                    style={{
                      padding: "10px 16px",
                      background: "var(--app-primary)",
                      border: "none",
                      borderRadius: "10px",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    Add Ticket Tier
                  </button>
                ) : null}
              </div>

              {form.ticketMode === "paid" ? (
                <>
                  <div
                    style={{
                      display: "grid",
                      gap: "12px",
                    }}
                  >
                    {form.ticketTiers.map((ticket, index) => (
                      <div
                        key={ticket.id}
                        style={{
                          border: "1px solid var(--app-border)",
                          borderRadius: "14px",
                          background: "var(--app-surface)",
                          padding: "14px",
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1.6fr 1fr 1fr auto",
                            gap: "10px",
                            alignItems: "end",
                          }}
                        >
                          <div>
                            <label style={lbl}>Ticket Label</label>
                            <input
                              style={inp(`ticket_label_${index}`)}
                              value={ticket.label}
                              onChange={(event) => updateTicketTier(index, "label", event.target.value)}
                              placeholder={`Tier ${index + 1}`}
                              maxLength={60}
                            />
                            {errTxt(`ticket_label_${index}`)}
                          </div>

                          <div>
                            <label style={lbl}>Price (LKR)</label>
                            <input
                              style={inp(`ticket_price_${index}`)}
                              type="number"
                              min={1}
                              step={1}
                              value={ticket.price}
                              onChange={(event) => updateTicketTier(index, "price", event.target.value)}
                            />
                            {errTxt(`ticket_price_${index}`)}
                          </div>

                          <div>
                            <label style={lbl}>Seats</label>
                            <input
                              style={inp(`ticket_seats_${index}`)}
                              type="number"
                              min={1}
                              step={1}
                              value={ticket.totalSeats}
                              onChange={(event) => updateTicketTier(index, "totalSeats", event.target.value)}
                            />
                            {errTxt(`ticket_seats_${index}`)}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeTicketTier(index)}
                            style={{
                              minHeight: "42px",
                              padding: "0 14px",
                              background: "rgba(239, 68, 68, 0.08)",
                              border: "1px solid rgba(239, 68, 68, 0.24)",
                              borderRadius: "10px",
                              color: "var(--app-danger)",
                              cursor: "pointer",
                              fontWeight: 700,
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: "14px",
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        padding: "8px 12px",
                        borderRadius: "999px",
                        background: "rgba(37, 99, 235, 0.08)",
                        color: "var(--app-primary)",
                        fontWeight: 700,
                        fontSize: "13px",
                      }}
                    >
                      Assigned seats: {totalAssignedSeats}
                    </span>
                    <span
                      style={{
                        padding: "8px 12px",
                        borderRadius: "999px",
                        background: "rgba(16, 185, 129, 0.08)",
                        color: "var(--app-success)",
                        fontWeight: 700,
                        fontSize: "13px",
                      }}
                    >
                      Remaining seats: {remainingSeats}
                    </span>
                  </div>
                  {errTxt("ticketTiers")}
                  {errTxt("ticketSeats")}
                </>
              ) : (
                <div
                  style={{
                    border: "1px solid var(--app-border)",
                    borderRadius: "14px",
                    background: "var(--app-surface)",
                    padding: "16px",
                    display: "grid",
                    gap: "8px",
                  }}
                >
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--app-text)" }}>Free Pass</div>
                  <div style={{ fontSize: "13px", color: "var(--app-text-muted)" }}>
                    Students can book without payment. Total seats will follow your max participant count.
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--app-primary)", fontWeight: 700 }}>
                    Seats available: {Math.max(1, Number(form.maxParticipants) || 100)}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: "18px", gridColumn: "1 / -1" }}>
            <label style={lbl}>Tags (optional - comma separated)</label>
            <input
              style={inp("tags")}
              name="tags"
              value={form.tags}
              onChange={onChange}
              placeholder="e.g. science, technology, competition"
              maxLength={MAX_TAGS * (MAX_TAG_LENGTH + 2)}
            />
            <p style={noteStyle}>Add up to {MAX_TAGS} unique tags to help others find your event.</p>
            {errTxt("tags")}
          </div>

          <div style={{ marginBottom: "18px", gridColumn: "1 / -1" }}>
            <label style={lbl}>Description * {charCount(form.description, 1000)}</label>
            <textarea
              style={{ ...inp("description"), resize: "vertical", minHeight: "120px" }}
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Describe the event in detail (min 20, max 1000 characters)"
              maxLength={1000}
            />
            {form.description.length > 0 && form.description.length < 20 ? (
              <p style={{ fontSize: "11px", color: "var(--app-warning)", marginTop: "4px" }}>
                {20 - form.description.length} more characters needed
              </p>
            ) : null}
            {errTxt("description")}
          </div>

          <div style={{ marginBottom: "18px", gridColumn: "1 / -1" }}>
            <label style={lbl}>Event Photo (JPG or PNG - max 2MB)</label>
            {imgPrev ? (
              <div>
                <div
                  style={{
                    width: "100%",
                    height: "220px",
                    padding: "12px",
                    background: "var(--app-surface-muted)",
                    borderRadius: "14px",
                    border: "1px solid var(--app-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={imgPrev}
                    alt="Preview"
                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button type="button" onClick={() => fileRef.current?.click()} style={secondaryBtn}>
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImgFile(null);
                      setImgPrev(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    style={{ ...secondaryBtn, color: "var(--app-danger)", borderColor: "rgba(239, 68, 68, 0.22)" }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${errs.image ? "var(--app-danger)" : "var(--app-border)"}`,
                  borderRadius: "14px",
                  padding: "36px 20px",
                  textAlign: "center",
                  cursor: "pointer",
                  background: "var(--app-surface-muted)",
                }}
              >
                <div style={{ fontSize: "28px", color: "var(--app-text-muted)", marginBottom: "8px" }}>+</div>
                <p style={{ fontSize: "14px", color: "var(--app-text)", fontWeight: 700 }}>
                  Click to upload event photo
                </p>
                <p style={{ fontSize: "12px", color: "var(--app-text-muted)", marginTop: "4px" }}>
                  JPG or PNG only - max 2MB
                </p>
              </div>
            )}
            {errTxt("image")}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={onImg}
              style={{ display: "none" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "11px 28px",
              background: loading ? "#93c5fd" : "var(--app-primary)",
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "14px",
            }}
          >
            {loading ? "Saving..." : editData ? "Update Event" : "Create Event"}
          </button>
          {editData ? (
            <button type="button" onClick={onCancelEdit} style={secondaryBtn}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}

const secondaryBtn = {
  padding: "10px 18px",
  background: "var(--app-surface)",
  border: "1px solid var(--app-border)",
  borderRadius: "10px",
  color: "var(--app-text)",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 700,
};
