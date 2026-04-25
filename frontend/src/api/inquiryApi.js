import api from './axios';

export const inquiryApi = {
  create: (data) => api.post('/inquiries', data),
  getMy: (userId) => api.get(`/inquiries/my/${userId}`),
  getAll: () => api.get('/inquiries/all'),
  update: (id, data) => api.put(`/inquiries/${id}`, data),
  delete: (id) => api.delete(`/inquiries/${id}`),
  reply: (id, adminReply) => api.put(`/inquiries/${id}/reply`, { adminReply }),
};