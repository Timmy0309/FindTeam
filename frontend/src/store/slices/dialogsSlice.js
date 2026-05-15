import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { messageAPI } from '../../services/api';

const dialogKey = (id) => String(id);

export const fetchDialogs = createAsyncThunk(
  'dialogs/fetchDialogs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await messageAPI.getUserDialogs();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка загрузки диалогов');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'dialogs/fetchMessages',
  async (dialogId, { rejectWithValue }) => {
    try {
      const response = await messageAPI.getMessages(dialogId);
      return { dialogId: dialogKey(dialogId), messages: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка загрузки сообщений');
    }
  }
);

export const sendMessageToAPI = createAsyncThunk(
  'dialogs/sendMessage',
  async ({ dialog_id, message, tempId }, { rejectWithValue }) => {
    try {
      const response = await messageAPI.sendMessage({ dialog_id, message });
      return { ...response.data.data, tempId };
    } catch (error) {
      return rejectWithValue({
        error: error.response?.data?.error || 'Ошибка отправки',
        tempId,
        dialogId: dialog_id,
      });
    }
  }
);

export const createDialog = createAsyncThunk(
  'dialogs/createDialog',
  async (user2Id, { rejectWithValue }) => {
    try {
      const response = await messageAPI.createDialog(user2Id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка создания диалога');
    }
  }
);

export const openTeamChat = createAsyncThunk(
  'dialogs/openTeamChat',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await messageAPI.getTeamDialog(teamId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка открытия командного чата');
    }
  }
);

export const deleteMessageFromAPI = createAsyncThunk(
  'dialogs/deleteMessage',
  async ({ messageId, dialogId }, { rejectWithValue }) => {
    try {
      await messageAPI.deleteMessage(messageId);
      return { messageId, dialogId: dialogKey(dialogId) };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка удаления сообщения');
    }
  }
);

const initialState = {
  dialogs: [],
  messages: {},
  activeDialogId: null,
  loading: false,
  error: null,
};

const dialogsSlice = createSlice({
  name: 'dialogs',
  initialState,
  reducers: {
    setActiveDialog: (state, action) => {
      state.activeDialogId = action.payload ? dialogKey(action.payload) : null;
    },
    clearError: (state) => {
      state.error = null;
    },
    addMessageOptimistic: (state, action) => {
      const { dialogId, message, tempId } = action.payload;
      const key = dialogKey(dialogId);

      if (!state.messages[key]) {
        state.messages[key] = [];
      }

      state.messages[key].push({
        id: tempId,
        tempId,
        dialog_id: Number(dialogId),
        message: message.message,
        user_id: message.user_id,
        is_my_message: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        created_at: new Date().toISOString(),
        pending: true,
      });

      const dialog = state.dialogs.find((d) => d.id === Number(dialogId));
      if (dialog) {
        dialog.last_message = message.message;
        dialog.last_message_time = new Date().toISOString();
      }
    },
    removeOptimisticMessage: (state, action) => {
      const { dialogId, tempId } = action.payload;
      const key = dialogKey(dialogId);
      state.messages[key] = (state.messages[key] || []).filter((m) => m.tempId !== tempId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDialogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDialogs.fulfilled, (state, action) => {
        state.loading = false;
        state.dialogs = action.payload;
      })
      .addCase(fetchDialogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { dialogId, messages } = action.payload;
        state.messages[dialogId] = messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendMessageToAPI.fulfilled, (state, action) => {
        const newMessage = action.payload;
        const key = dialogKey(newMessage.dialog_id);

        if (!state.messages[key]) {
          state.messages[key] = [];
        }

        const idx = state.messages[key].findIndex((m) => m.tempId === newMessage.tempId);
        if (idx !== -1) {
          state.messages[key][idx] = { ...newMessage, pending: false };
        } else {
          state.messages[key].push(newMessage);
        }

        const dialog = state.dialogs.find((d) => d.id === newMessage.dialog_id);
        if (dialog) {
          dialog.last_message = newMessage.message;
          dialog.last_message_time = newMessage.created_at;
        }
      })
      .addCase(sendMessageToAPI.rejected, (state, action) => {
        state.error = action.payload?.error || action.payload;
        const { dialogId, tempId } = action.payload || {};
        if (dialogId && tempId) {
          const key = dialogKey(dialogId);
          state.messages[key] = (state.messages[key] || []).filter((m) => m.tempId !== tempId);
        }
      })
      .addCase(createDialog.fulfilled, (state, action) => {
        const index = state.dialogs.findIndex((d) => d.id === action.payload.id);
        if (index === -1) {
          state.dialogs.unshift(action.payload);
        } else {
          state.dialogs[index] = action.payload;
        }
      })
      .addCase(openTeamChat.fulfilled, (state, action) => {
        const exists = state.dialogs.find((d) => d.id === action.payload.id);
        if (!exists) {
          state.dialogs.unshift(action.payload);
        }
      })
      .addCase(deleteMessageFromAPI.fulfilled, (state, action) => {
        const { messageId, dialogId } = action.payload;
        state.messages[dialogId] = (state.messages[dialogId] || []).filter(
          (m) => m.id !== messageId
        );
      });
  },
});

export const { setActiveDialog, clearError, addMessageOptimistic, removeOptimisticMessage } =
  dialogsSlice.actions;
export default dialogsSlice.reducer;
