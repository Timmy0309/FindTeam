import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { teamAPI } from '../../services/api';

// Асинхронные действия для CRUD операций
export const fetchTeams = createAsyncThunk(
  'teams/fetchTeams',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await teamAPI.getTeams(filters);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка загрузки команд');
    }
  }
);

export const createTeam = createAsyncThunk(
  'teams/createTeam',
  async (teamData, { rejectWithValue }) => {
    try {
      const response = await teamAPI.createTeam(teamData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка создания команды');
    }
  }
);

export const updateTeam = createAsyncThunk(
  'teams/updateTeam',
  async ({ id, teamData }, { rejectWithValue }) => {
    try {
      const response = await teamAPI.updateTeam(id, teamData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка обновления команды');
    }
  }
);

export const deleteTeam = createAsyncThunk(
  'teams/deleteTeam',
  async (id, { rejectWithValue }) => {
    try {
      await teamAPI.deleteTeam(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка удаления команды');
    }
  }
);

export const joinTeam = createAsyncThunk(
  'teams/joinTeam',
  async (id, { rejectWithValue }) => {
    try {
      const response = await teamAPI.joinTeam(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка присоединения к команде');
    }
  }
);

export const leaveTeam = createAsyncThunk(
  'teams/leaveTeam',
  async (id, { rejectWithValue }) => {
    try {
      const response = await teamAPI.leaveTeam(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка выхода из команды');
    }
  }
);

const initialState = {
  teams: [],
  userTeams: [],
  loading: false,
  error: null,
  filters: {
    game: 'all',
    playersNeeded: 'all'
  }
};

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Teams
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Team
      .addCase(createTeam.fulfilled, (state, action) => {
        state.teams.unshift(action.payload);
      })
      // Update Team
      .addCase(updateTeam.fulfilled, (state, action) => {
        const index = state.teams.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.teams[index] = action.payload;
        }
      })
      // Delete Team
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.teams = state.teams.filter(t => t.id !== action.payload);
      })
      // Join Team
      .addCase(joinTeam.fulfilled, (state, action) => {
        const index = state.teams.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.teams[index] = action.payload;
        }
      })
      // Leave Team
      .addCase(leaveTeam.fulfilled, (state, action) => {
        const index = state.teams.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.teams[index] = action.payload;
        }
      });
  }
});

export const { setFilters, clearError } = teamsSlice.actions;
export default teamsSlice.reducer;