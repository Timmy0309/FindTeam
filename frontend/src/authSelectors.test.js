import { hasRight, hasRole } from './store/selectors/authSelectors';

describe('authSelectors RBAC', () => {
  const baseState = {
    auth: {
      rights: ['can_view_teams', 'can_view_players', 'can_send_messages', 'can_create_teams'],
      roles: ['user'],
    },
  };

  test('hasRight возвращает true при наличии права', () => {
    expect(hasRight(baseState, ['can_view_teams'])).toBe(true);
  });

  test('hasRight возвращает false при отсутствии права', () => {
    expect(hasRight(baseState, ['can_manage_users'])).toBe(false);
  });

  test('hasRole возвращает true для роли user', () => {
    expect(hasRole(baseState, ['user'])).toBe(true);
  });

  test('hasRole возвращает false для роли admin', () => {
    expect(hasRole(baseState, ['admin'])).toBe(false);
  });
});
