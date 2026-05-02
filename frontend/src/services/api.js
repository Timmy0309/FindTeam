import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API для пользователей
export const userAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (credentials) => api.post('/users/login', credentials),
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// API для команд
export const teamAPI = {
  createTeam: (teamData) => api.post('/teams', teamData),
  getTeams: (filters) => api.get('/teams', { params: filters }),
  getTeam: (id) => api.get(`/teams/${id}`),
  updateTeam: (id, teamData) => api.put(`/teams/${id}`, teamData),
  deleteTeam: (id) => api.delete(`/teams/${id}`),
  joinTeam: (id) => api.post(`/teams/${id}/join`),
  leaveTeam: (id) => api.post(`/teams/${id}/leave`),
  getUserTeams: () => api.get('/teams/my'),
};

// API для сообщений
export const messageAPI = {
  sendMessage: (data) => api.post('/messages', data),
  getMessages: (dialogId) => api.get(`/messages/dialogs/${dialogId}`),
  createDialog: (user2Id) => api.post('/messages/dialogs', { user2_id: user2Id }),
  getUserDialogs: () => api.get('/messages/dialogs'),
  deleteMessage: (id) => api.delete(`/messages/messages/${id}`),
};

export default api;