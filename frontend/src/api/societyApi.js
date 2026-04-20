import apiClient from "./apiClient";

export const submitSocietyRequest = async (payload) => {
  // If a FormData is passed (file upload), send as multipart/form-data
  if (payload instanceof FormData || (payload && typeof payload.get === "function")) {
    const res = await apiClient.post("/society-requests/submit", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }

  const res = await apiClient.post("/society-requests/submit", payload);
  return res.data;
};

export const getAllSocietyRequests = async () => {
  const res = await apiClient.get("/society-requests");
  return res.data;
};

export const getSocietyRequestById = async (id) => {
  const res = await apiClient.get(`/society-requests/${id}`);
  return res.data;
};

export const approveSocietyRequest = async (id) => {
  const res = await apiClient.post(`/society-approval/approve/${id}`);
  return res.data;
};

export const rejectSocietyRequest = async (id, reason) => {
  const res = await apiClient.post(`/society-approval/reject/${id}`, { reason });
  return res.data;
};

export const verifyApprovalToken = async (token) => {
  const res = await apiClient.get(`/society-approval/verify/${token}`);
  return res.data;
};

export const registerApprovedSociety = async (payload) => {
  const res = await apiClient.post("/society-requests/register-approved", payload);
  return res.data;
};

export const verifyEventToken = async (token) => {
  const res = await apiClient.get(`/events/verify-event-token/${token}`);
  return res.data;
};

export const createEvent = async (token, eventData) => {
  const res = await apiClient.post(`/events/${token}`, eventData);
  return res.data;
};

export const sendEventLink = async (id, adminName) => {
  const res = await apiClient.post(`/society-approval/send-event-link/${id}`, { adminName });
  return res.data;
};

