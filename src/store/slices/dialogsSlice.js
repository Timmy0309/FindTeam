import { createSlice } from '@reduxjs/toolkit';
import { dialogsData, messagesData } from '../../data/messagesData';

const initialState = {
  dialogs: dialogsData,
  messages: messagesData,
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
    
    sendMessage: (state, action) => {
      const { dialogId, message, author, isMyMessage } = action.payload;
      if (!state.messages[dialogId]) {
        state.messages[dialogId] = [];
      }
      
      const newMessage = {
        id: Date.now(),
        message: message,
        author: author,
        isMyMessage: isMyMessage || true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      state.messages[dialogId].push(newMessage);
      
      const dialog = state.dialogs.find(d => d.id === dialogId);
      if (dialog) {
        dialog.lastMessage = message;
      }
    },
    
    loadMessagesStart: (state) => {
      state.loading = true;
    },
    loadMessagesSuccess: (state, action) => {
      state.loading = false;
      state.messages[action.payload.dialogId] = action.payload.messages;
    },
    loadMessagesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    clearMessages: (state, action) => {
      if (state.messages[action.payload]) {
        state.messages[action.payload] = [];
      }
    }
  }
});

export const {
  setActiveDialog,
  sendMessage,
  loadMessagesStart,
  loadMessagesSuccess,
  loadMessagesFailure,
  clearMessages
} = dialogsSlice.actions;

export default dialogsSlice.reducer;