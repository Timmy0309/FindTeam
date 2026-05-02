import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { messageAPI } from '../../services/api';

// Асинхронные действия для работы с API

// Получение всех диалогов пользователя (READ)
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

// Получение сообщений конкретного диалога (READ)
export const fetchMessages = createAsyncThunk(
  'dialogs/fetchMessages',
  async (dialogId, { rejectWithValue }) => {
    try {
      const response = await messageAPI.getMessages(dialogId);
      return { dialogId, messages: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка загрузки сообщений');
    }
  }
);

// Отправка нового сообщения (CREATE)
export const sendMessageToAPI = createAsyncThunk(
  'dialogs/sendMessage',
  async ({ dialog_id, message }, { rejectWithValue }) => {
    try {
      const response = await messageAPI.sendMessage({ dialog_id, message });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка отправки сообщения');
    }
  }
);

// Создание нового диалога (CREATE)
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

// Удаление сообщения (DELETE)
export const deleteMessageFromAPI = createAsyncThunk(
  'dialogs/deleteMessage',
  async (messageId, { rejectWithValue }) => {
    try {
      await messageAPI.deleteMessage(messageId);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Ошибка удаления сообщения');
    }
  }
);

const initialState = {
  dialogs: [],           // Список диалогов из API
  messages: {},          // Объект с сообщениями: { dialogId: [messages] }
  activeDialogId: null,
  loading: false,
  error: null
};

const dialogsSlice = createSlice({
  name: 'dialogs',
  initialState,
  reducers: {
    setActiveDialog: (state, action) => {
      state.activeDialogId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Оптимистичное обновление для нового сообщения (без ожидания ответа от сервера)
    addMessageOptimistic: (state, action) => {
      const { dialogId, message } = action.payload;
      if (!state.messages[dialogId]) {
        state.messages[dialogId] = [];
      }
      
      const newMessage = {
        id: Date.now(),
        dialog_id: dialogId,
        message: message.message,
        user_id: message.user_id,
        is_my_message: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        created_at: new Date().toISOString()
      };
      
      state.messages[dialogId].push(newMessage);
      
      // Обновляем последнее сообщение в диалоге
      const dialog = state.dialogs.find(d => d.id === parseInt(dialogId));
      if (dialog) {
        dialog.last_message = message.message;
        dialog.last_message_time = new Date().toISOString();
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Получение диалогов
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
      
      // Получение сообщений
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
      
      // Отправка сообщения
      .addCase(sendMessageToAPI.fulfilled, (state, action) => {
        const newMessage = action.payload;
        const dialogId = newMessage.dialog_id;
        
        if (!state.messages[dialogId]) {
          state.messages[dialogId] = [];
        }
        
        // Заменяем оптимистичное сообщение на реальное от сервера
        // Ищем последнее сообщение с таким же текстом и временем
        const lastMessage = state.messages[dialogId][state.messages[dialogId].length - 1];
        if (lastMessage && lastMessage.message === newMessage.message && !lastMessage.id) {
          state.messages[dialogId][state.messages[dialogId].length - 1] = newMessage;
        } else {
          state.messages[dialogId].push(newMessage);
        }
        
        // Обновляем последнее сообщение в диалоге
        const dialog = state.dialogs.find(d => d.id === dialogId);
        if (dialog) {
          dialog.last_message = newMessage.message;
          dialog.last_message_time = newMessage.created_at;
        }
      })
      .addCase(sendMessageToAPI.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Создание диалога
      .addCase(createDialog.fulfilled, (state, action) => {
        state.dialogs.unshift(action.payload);
      })
      
      // Удаление сообщения
      .addCase(deleteMessageFromAPI.fulfilled, (state, action) => {
        const messageId = action.payload;
        // Удаляем сообщение из всех диалогов
        for (const dialogId in state.messages) {
          state.messages[dialogId] = state.messages[dialogId].filter(m => m.id !== messageId);
        }
      });
  }
});

export const { setActiveDialog, clearError, addMessageOptimistic } = dialogsSlice.actions;
export default dialogsSlice.reducer;