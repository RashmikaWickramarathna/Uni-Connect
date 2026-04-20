import apiClient from "./apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const FILE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getSocietyEvents = (email, organizer) => {
  const params = new URLSearchParams({ role: "society" });
  if (email) params.set("email", email);
  if (organizer) params.set("organizer", organizer);
  return apiClient.get(`/events?${params.toString()}`, { headers: authHeaders() });
};

export const createEvent = (data) =>
  apiClient.post("/events", data, {
    headers: {
      ...authHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });

export const updateEvent = (id, data) =>
  apiClient.put(`/events/${id}`, data, {
    headers: {
      ...authHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });

export const deleteEvent = (id) =>
  apiClient.delete(`/events/${id}`, {
    headers: authHeaders(),
    data: { deletedBy: "society" },
  });

export const getNotifications = (email) =>
  apiClient.get(`/events/notifications/${email}`, { headers: authHeaders() });

export const markRead = (id) =>
  apiClient.patch(`/events/notifications/${id}/read`, null, { headers: authHeaders() });

export const markAllRead = (email) =>
  apiClient.patch(`/events/notifications/read-all/${email}`, null, { headers: authHeaders() });

export const getImageUrl = (fileName) =>
  fileName ? `${FILE_BASE_URL}/uploads/${fileName}` : null;

export const verifyApprovalToken = (token) =>
  apiClient.get(`/society-approval/verify/${token}`, { headers: authHeaders() });

export const registerApprovedSociety = (payload) =>
  apiClient.post("/society-requests/register-approved", payload, {
    headers: authHeaders(),
  });

export const loginSociety = (payload) =>
  apiClient.post("/society-auth/login", payload);
