export const getDialogDisplay = (dialog, currentUserId) => {
  if (dialog.type === 'team') {
    return {
      name: `👥 ${dialog.team_name || 'Командный чат'}`,
      avatar: '👥',
      game: dialog.team_game,
      isTeam: true,
    };
  }

  const isUser1 = Number(dialog.user1_id) === Number(currentUserId);
  return {
    name: isUser1 ? dialog.user2_name : dialog.user1_name,
    avatar: isUser1 ? dialog.user2_avatar : dialog.user1_avatar,
    otherUserId: isUser1 ? dialog.user2_id : dialog.user1_id,
    isTeam: false,
  };
};
