import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getSocietyEvents   = (email) => API.get(`/events?role=society&email=${email}`);
export const createEvent        = (data)  => API.post('/events', data, { headers:{'Content-Type':'multipart/form-data'} });
export const updateEvent        = (id, d) => API.put(`/events/${id}`, d, { headers:{'Content-Type':'multipart/form-data'} });
export const deleteEvent        = (id)    => API.delete(`/events/${id}`, { data:{ deletedBy:'society' } });
export const getNotifications   = (email) => API.get(`/events/notifications/${email}`);
export const markRead           = (id)    => API.patch(`/events/notifications/${id}/read`);
export const markAllRead        = (email) => API.patch(`/events/notifications/read-all/${email}`);
export const getImageUrl        = (f)     => f ? `http://localhost:5000/uploads/${f}` : null;