import api from "./apiClient";

export const authApi = {
  signup: (data) => api.post('/users/signup', data),
  login: (data) => api.post('/users/login', data),
  getUser: (userId) => api.get(`/users/${userId}`),
  updateUser: (userId, data) => api.put(`/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
  forgotPassword: (email) => api.post('/users/forgot-password', { email }),
  verifyOTP: (data) => api.post('/users/verify-otp', data),
  resetPassword: (data) => api.put('/users/reset-password', data),
};
