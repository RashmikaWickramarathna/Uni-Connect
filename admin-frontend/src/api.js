import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getAllEvents  = ()            => API.get('/events');
export const getAnalytics = ()            => API.get('/events/analytics');
export const getReminders = ()            => API.get('/events/reminders');
export const approveEvent = (id)          => API.patch(`/events/${id}/status`, { status:'approved' });
export const rejectEvent  = (id, reason)  => API.patch(`/events/${id}/status`, { status:'rejected', adminReason:reason });
export const deleteEvent  = (id, reason)  => API.delete(`/events/${id}`, { data:{ adminReason:reason, deletedBy:'admin' } });
export const updateEvent  = (id, data)    => API.put(`/events/${id}`, data, { headers:{'Content-Type':'multipart/form-data'} });
export const getImageUrl  = (f)           => f ? `http://localhost:5000/uploads/${f}` : null;