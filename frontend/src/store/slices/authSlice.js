import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userAPI } from '../../services/api';

// Асинхронные действия
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await userAPI.login(credentials);
      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { user, token };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка входа');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await userAPI.register(userData);
      const { user, token } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { user, token };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка регистрации');
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  roles: JSON.parse(localStorage.getItem('user'))?.roles || ['user'],
  rights: JSON.parse(localStorage.getItem('user'))?.rights || ['can_view_teams', 'can_view_players', 'can_send_messages']
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.roles = [];
      state.rights = [];
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Логин
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.roles = action.payload.user.roles;
        state.rights = action.payload.user.rights;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Регистрация
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.roles = action.payload.user.roles;
        state.rights = action.payload.user.rights;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;