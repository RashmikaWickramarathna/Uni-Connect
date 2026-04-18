import apiClient from "./apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const FILE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllEvents = () =>
  apiClient.get("/events", { headers: authHeaders() });

export const getAnalytics = () =>
  apiClient.get("/events/analytics", { headers: authHeaders() });

export const getReminders = () =>
  apiClient.get("/events/reminders", { headers: authHeaders() });

export const approveEvent = (id) =>
  apiClient.patch(
    `/events/${id}/status`,
    { status: "approved" },
    { headers: authHeaders() }
  );

export const rejectEvent = (id, reason) =>
  apiClient.patch(
    `/events/${id}/status`,
    { status: "rejected", adminReason: reason },
    { headers: authHeaders() }
  );

export const deleteEvent = (id, reason) =>
  apiClient.delete(`/events/${id}`, {
    headers: authHeaders(),
    data: { adminReason: reason, deletedBy: "admin" },
  });

export const updateEvent = (id, data) =>
  apiClient.put(`/events/${id}`, data, {
    headers: {
      ...authHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });

export const getImageUrl = (fileName) =>
  fileName ? `${FILE_BASE_URL}/uploads/${fileName}` : null;
