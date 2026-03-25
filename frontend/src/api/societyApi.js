import apiClient from "./apiClient";

export const submitSocietyRequest = async (payload) => {
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

export const approveSociety = (id) => {
  return apiClient.post(`/societies/approve/${id}`);
};