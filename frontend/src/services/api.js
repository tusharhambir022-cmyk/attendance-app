import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// AUTH
export const login = (email, password) =>
  api.post('/auth/login', { email, password });

// ATTENDANCE
export const checkIn = () => api.post('/attendance/check-in');
export const checkOut = () => api.post('/attendance/check-out');
export const getTodayAttendance = () => api.get('/attendance/today');
export const getMyAttendance = (start, end) =>
  api.get('/attendance/my', { params: { start, end } });
export const getMyMonthSummary = (month, year) =>
  api.get('/attendance/my/summary', { params: { month, year } });

// ADMIN ATTENDANCE
export const getAllTodayAttendance = () => api.get('/attendance/admin/today');
export const getAllAttendance = (start, end) =>
  api.get('/attendance/admin/all', { params: { start, end } });

// LEAVES
export const applyLeave = (data) => api.post('/leaves/apply', data);
export const getMyLeaves = () => api.get('/leaves/my');
export const getLeaveBalance = () => api.get('/leaves/balance');

// ADMIN LEAVES
export const getAllLeaves = () => api.get('/admin/leaves');
export const getPendingLeaves = () => api.get('/admin/leaves/pending');
export const reviewLeave = (id, data) =>
  api.patch(`/admin/leaves/${id}/review`, data);

// ADMIN USERS
export const getAllDevelopers = () => api.get('/admin/developers');
export const createUser = (data) => api.post('/admin/users', data);
export const toggleUserStatus = (id) => api.patch(`/admin/users/${id}/toggle`);

// USER
export const getProfile = () => api.get('/user/profile');

export default api;
