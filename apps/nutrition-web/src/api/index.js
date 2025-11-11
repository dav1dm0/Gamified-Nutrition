import axios from 'axios';
import { AUTH_TOKEN_KEY } from '../constants';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) { config.headers.Authorization = `Bearer ${token}`; }
  return config;
});

// Response interceptor for auth token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // clear stored token on 401
      localStorage.removeItem(AUTH_TOKEN_KEY);
      delete api.defaults.headers.common['Authorization'];
    }
    return Promise.reject(error);
  }
);

export function setAuthToken(token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  delete api.defaults.headers.common['Authorization'];
}

// Auth endpoints
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const logout = () => api.post('/auth/logout');

// User endpoints
export const getUserProfile = () => api.get('/users/me');
export const deleteUserAccount = () => api.delete('/users/delete');

export const setPet = (petType) => api.put('/users/preferences', { petType });
export const getUserPreferences = () => api.get('/users/preferences')
export const updateUserPreferences = (prefs) => api.put('/users/preferences', prefs);

// Points
export const completeMeal = () => api.post('/points/complete');
export const getPoints = () => api.get('/points');

// Leaderboard
export const getLeaderboard = () => api.get('/leaderboard');




