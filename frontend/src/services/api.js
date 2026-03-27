// src/services/api.js
// UniConnect – Centralized API Service

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ── Generic fetch wrapper ─────────────────────
async function request(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Request failed");
  return data;
}

// ════════════════════════════════════════════
//  💳  PAYMENT API
// ════════════════════════════════════════════
export const paymentAPI = {
  savePayment: (body) =>
    request("/payments/save", { method: "POST", body: JSON.stringify(body) }),

  getHistory: (studentId) =>
    request(`/payments/history/${studentId}`),

  getById: (id) =>
    request(`/payments/${id}`),

  confirmPayment: (id, body) =>
    request(`/payments/${id}/confirm`, { method: "PATCH", body: JSON.stringify(body) }),

  getStats: () =>
    request("/payments/stats"),

  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/payments/all?${query}`);
  },
};

// ════════════════════════════════════════════
//  🎟️  TICKET API
// ════════════════════════════════════════════
export const ticketAPI = {
  // Book a ticket
  book: (body) =>
    request("/tickets/book", { method: "POST", body: JSON.stringify(body) }),

  // Get all tickets for a student
  getByStudent: (studentId) =>
    request(`/tickets/student/${studentId}`),

  // Get all tickets for an event
  getByEvent: (eventId) =>
    request(`/tickets/event/${eventId}`),

  // Get single ticket by ticket number
  getByNumber: (ticketNumber) =>
    request(`/tickets/${ticketNumber}`),

  // Cancel a ticket
  cancel: (ticketNumber, reason) =>
    request(`/tickets/${ticketNumber}/cancel`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),

  // Check in a ticket (admin)
  checkIn: (ticketNumber) =>
    request(`/tickets/${ticketNumber}/checkin`, { method: "PATCH" }),

  // Ticket stats (admin)
  getStats: () =>
    request("/tickets/stats"),
};

// ════════════════════════════════════════════
//  📅  EVENT API
// ════════════════════════════════════════════
export const eventAPI = {
  // Get all published upcoming events
  getAll: () =>
    request("/tickets/events"),

  // Get single event by ID
  getById: (eventId) =>
    request(`/tickets/events/${eventId}`),

  // Create event (admin/testing)
  create: (body) =>
    request("/tickets/events", { method: "POST", body: JSON.stringify(body) }),
};