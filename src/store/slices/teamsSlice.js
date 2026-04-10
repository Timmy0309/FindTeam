import { createSlice } from '@reduxjs/toolkit';

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
    fetchTeamsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTeamsSuccess: (state, action) => {
      state.loading = false;
      state.teams = action.payload;
    },
    fetchTeamsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    createTeamStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createTeamSuccess: (state, action) => {
      state.loading = false;
      state.teams.push(action.payload);
    },
    createTeamFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    joinTeam: (state, action) => {
      const team = state.teams.find(t => t.id === action.payload.teamId);
      if (team && !team.members.includes(action.payload.userId)) {
        team.members.push(action.payload.userId);
        team.currentPlayers += 1;
      }
    },
    
    leaveTeam: (state, action) => {
      const team = state.teams.find(t => t.id === action.payload.teamId);
      if (team) {
        team.members = team.members.filter(m => m !== action.payload.userId);
        team.currentPlayers -= 1;
      }
    },
    
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  fetchTeamsStart,
  fetchTeamsSuccess,
  fetchTeamsFailure,
  createTeamStart,
  createTeamSuccess,
  createTeamFailure,
  joinTeam,
  leaveTeam,
  setFilters,
  clearError
} = teamsSlice.actions;

export default teamsSlice.reducer;