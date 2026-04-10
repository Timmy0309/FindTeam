export const selectAllTeams = (state) => state.teams.teams;
export const selectTeamsLoading = (state) => state.teams.loading;
export const selectTeamsError = (state) => state.teams.error;
export const selectTeamsFilters = (state) => state.teams.filters;

export const selectFilteredTeams = (state) => {
  const { teams, filters } = state.teams;
  let filtered = [...teams];
  
  if (filters.game !== 'all') {
    filtered = filtered.filter(team => team.game === filters.game);
  }
  
  if (filters.playersNeeded !== 'all') {
    filtered = filtered.filter(team => {
      const needed = team.maxPlayers - team.currentPlayers;
      if (filters.playersNeeded === '1-2') return needed <= 2;
      if (filters.playersNeeded === '3-5') return needed >= 3 && needed <= 5;
      if (filters.playersNeeded === '5+') return needed > 5;
      return true;
    });
  }
  
  return filtered;
};

export const selectUserTeams = (state, userId) => {
  return state.teams.teams.filter(team => team.members.includes(userId));
};