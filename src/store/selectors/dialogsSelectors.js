export const selectAllDialogs = (state) => state.dialogs.dialogs;
export const selectAllMessages = (state) => state.dialogs.messages;
export const selectActiveDialogId = (state) => state.dialogs.activeDialogId;
export const selectDialogsLoading = (state) => state.dialogs.loading;
export const selectDialogsError = (state) => state.dialogs.error;

export const selectMessagesByDialogId = (state, dialogId) => {
  return state.dialogs.messages[dialogId] || [];
};

export const selectDialogById = (state, dialogId) => {
  return state.dialogs.dialogs.find(dialog => dialog.id === dialogId);
};

export const selectActiveDialog = (state) => {
  const activeId = state.dialogs.activeDialogId;
  if (!activeId) return null;
  return state.dialogs.dialogs.find(dialog => dialog.id === activeId);
};

export const selectActiveDialogMessages = (state) => {
  const activeId = state.dialogs.activeDialogId;
  if (!activeId) return [];
  return state.dialogs.messages[activeId] || [];
};

export const selectHasUnreadMessages = (state, dialogId) => {
  const messages = state.dialogs.messages[dialogId] || [];
  return messages.some(msg => !msg.isRead && msg.isMyMessage === false);
};

export const selectUnreadCount = (state, dialogId) => {
  const messages = state.dialogs.messages[dialogId] || [];
  return messages.filter(msg => !msg.isRead && msg.isMyMessage === false).length;
};

export const selectTotalUnreadCount = (state) => {
  let total = 0;
  Object.keys(state.dialogs.messages).forEach(dialogId => {
    total += selectUnreadCount(state, dialogId);
  });
  return total;
};

export const selectLastMessage = (state, dialogId) => {
  const messages = state.dialogs.messages[dialogId] || [];
  if (messages.length === 0) return null;
  return messages[messages.length - 1];
};

export const selectDialogsWithLastMessages = (state) => {
  return state.dialogs.dialogs.map(dialog => ({
    ...dialog,
    lastMessage: selectLastMessage(state, dialog.id),
    unreadCount: selectUnreadCount(state, dialog.id)
  }));
};

export const selectIsLoadingMessages = (state, dialogId) => {
  return state.dialogs.loading && state.dialogs.activeDialogId === dialogId;
};

export const selectUserOnlineStatus = (state, userId) => {
  return true; // Временно
};