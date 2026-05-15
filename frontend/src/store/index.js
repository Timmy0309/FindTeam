import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import teamsReducer from './slices/teamsSlice';
import dialogsReducer from './slices/dialogsSlice';
import gamesReducer from './slices/gamesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    teams: teamsReducer,
    dialogs: dialogsReducer,
    games: gamesReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});
