import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import teamsReducer from './slices/teamsSlice';
import dialogsReducer from './slices/dialogsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    teams: teamsReducer,
    dialogs: dialogsReducer
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;