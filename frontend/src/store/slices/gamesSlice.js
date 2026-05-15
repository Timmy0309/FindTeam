import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { gameAPI } from '../../services/api';

export const fetchGames = createAsyncThunk(
  'games/fetchGames',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gameAPI.getGames();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка загрузки игр');
    }
  }
);

export const fetchPopularGames = createAsyncThunk(
  'games/fetchPopularGames',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gameAPI.getPopularGames();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка загрузки популярных игр');
    }
  }
);

const gamesSlice = createSlice({
  name: 'games',
  initialState: {
    games: [],
    popularGames: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGames.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.loading = false;
        state.games = action.payload;
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPopularGames.fulfilled, (state, action) => {
        state.popularGames = action.payload;
      });
  },
});

export const { clearError } = gamesSlice.actions;
export default gamesSlice.reducer;
