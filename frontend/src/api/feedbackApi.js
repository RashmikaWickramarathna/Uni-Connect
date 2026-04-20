import api from "./apiClient";

export const feedbackApi = {
  create: (data) => api.post('/feedback', data),
  getMy: (userId) => api.get(`/feedback/my/${userId}`),
  getAll: () => api.get('/feedback/all'),
  update: (id, data) => api.put(`/feedback/${id}`, data),
  delete: (id) => api.delete(`/feedback/${id}`),
  reply: (id, adminReply) => api.put(`/feedback/${id}/reply`, { adminReply }),
};
