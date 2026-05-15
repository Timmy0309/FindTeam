import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = !!localStorage.getItem('token');
    const isAuthRoute = ['/login', '/register'].includes(window.location.pathname);

    if (error.response?.status === 401 && hadToken && !isAuthRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const userAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const gameAPI = {
  getGames: () => api.get('/games'),
  getPopularGames: () => api.get('/games/popular'),
};

export const teamAPI = {
  createTeam: (teamData) => api.post('/teams', teamData),
  getTeams: (filters) => api.get('/teams', { params: filters }),
  getTeam: (id) => api.get(`/teams/${id}`),
  getTeamMembers: (id) => api.get(`/teams/${id}/members`),
  updateTeam: (id, teamData) => api.put(`/teams/${id}`, teamData),
  deleteTeam: (id) => api.delete(`/teams/${id}`),
  joinTeam: (id) => api.post(`/teams/${id}/join`),
  leaveTeam: (id) => api.post(`/teams/${id}/leave`),
  getUserTeams: () => api.get('/teams/my'),
};

export const messageAPI = {
  sendMessage: (data) => api.post('/messages', data),
  getMessages: (dialogId) => api.get(`/messages/dialogs/${dialogId}`),
  createDialog: (user2Id) => api.post('/messages/dialogs', { user2_id: user2Id }),
  getTeamDialog: (teamId) => api.get(`/messages/team/${teamId}`),
  getUserDialogs: () => api.get('/messages/dialogs'),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
};

export default api;
