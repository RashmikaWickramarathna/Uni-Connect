import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const getEvents       = ()           => API.get('/events');
export const getAnalytics    = ()           => API.get('/events/analytics');
export const getReminders    = ()           => API.get('/events/reminders');
export const approveEvent    = (id)         => API.patch(`/events/${id}/status`, { status: 'approved', adminReason: null, adminActionAt: new Date() });
export const rejectEvent     = (id, reason) => API.patch(`/events/${id}/status`, { status: 'rejected', adminReason: reason, adminActionAt: new Date() });
export const deleteEvent     = (id, reason) => API.delete(`/events/${id}`, { data: { adminReason: reason } });
export const updateEvent     = (id, data)   => API.put(`/events/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getImageUrl     = (filename)   => filename ? `http://localhost:5000/uploads/${filename}` : null;