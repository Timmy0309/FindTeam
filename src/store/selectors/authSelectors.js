export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectUserRoles = (state) => state.auth.roles;
export const selectUserRights = (state) => state.auth.rights;

export const hasRole = (state, roles) => {
  return roles.some(role => state.auth.roles.includes(role));
};

export const hasRight = (state, rights) => {
  return rights.some(right => state.auth.rights.includes(right));
};

export const isAuthenticated = (state) => state.auth.isAuthenticated;