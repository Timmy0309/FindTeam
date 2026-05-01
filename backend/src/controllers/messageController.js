const Message = require('../models/Message');

// Создание сообщения (CREATE)
const sendMessage = async (req, res) => {
  try {
    const { dialog_id, message } = req.body;
    const messageData = {
      dialog_id,
      user_id: req.user.id,
      message,
      is_my_message: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const newMessage = await Message.create(messageData);
    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Ошибка при отправке сообщения' });
  }
};

// Получение сообщений диалога (READ)
const getMessages = async (req, res) => {
  try {
    const messages = await Message.findByDialog(req.params.dialogId);
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Ошибка при получении сообщений' });
  }
};

// Создание диалога
const createDialog = async (req, res) => {
  try {
    const { user2_id } = req.body;
    const dialog = await Message.createDialog(req.user.id, user2_id);
    res.status(201).json({ success: true, data: dialog });
  } catch (error) {
    console.error('Create dialog error:', error);
    res.status(500).json({ error: 'Ошибка при создании диалога' });
  }
};

// Получение диалогов пользователя (READ)
const getUserDialogs = async (req, res) => {
  try {
    const dialogs = await Message.getUserDialogs(req.user.id);
    res.json({ success: true, data: dialogs });
  } catch (error) {
    console.error('Get dialogs error:', error);
    res.status(500).json({ error: 'Ошибка при получении диалогов' });
  }
};

// Удаление сообщения (DELETE)
const deleteMessage = async (req, res) => {
  try {
    const message = await Message.delete(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Сообщение не найдено' });
    }
    res.json({ success: true, message: 'Сообщение удалено' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Ошибка при удалении сообщения' });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  createDialog,
  getUserDialogs,
  deleteMessage
};