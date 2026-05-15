const Message = require('../models/Message');
const Team = require('../models/Team');
const User = require('../models/User');

const sendMessage = async (req, res) => {
  try {
    const { dialog_id, message } = req.body;

    if (!dialog_id || !message?.trim()) {
      return res.status(400).json({ error: 'Укажите диалог и текст сообщения' });
    }

    const dialog = await Message.findDialogById(dialog_id);
    const hasAccess = await Message.userHasDialogAccess(dialog, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Нет доступа к этому диалогу' });
    }

    const newMessage = await Message.create({
      dialog_id,
      user_id: req.user.id,
      message: message.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    res.status(201).json({
      success: true,
      data: { ...newMessage, is_my_message: true },
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Ошибка при отправке сообщения' });
  }
};

const getMessages = async (req, res) => {
  try {
    const dialogId = req.params.dialogId;
    const dialog = await Message.findDialogById(dialogId);

    if (!dialog) {
      return res.status(404).json({ error: 'Диалог не найден' });
    }

    const hasAccess = await Message.userHasDialogAccess(dialog, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Нет доступа к этому диалогу' });
    }

    const messages = await Message.findByDialog(dialogId, req.user.id);
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Ошибка при получении сообщений' });
  }
};

const createDialog = async (req, res) => {
  try {
    const user2Id = Number(req.body.user2_id);
    if (!user2Id) {
      return res.status(400).json({ error: 'Укажите собеседника' });
    }

    const otherUser = await User.findById(user2Id);
    if (!otherUser) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const dialog = await Message.createDialog(req.user.id, user2Id);
    res.status(201).json({ success: true, data: dialog });
  } catch (error) {
    console.error('Create dialog error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Ошибка при создании диалога',
    });
  }
};

const getTeamDialog = async (req, res) => {
  try {
    const teamId = req.params.teamId;
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }
    if (!Team.isMember(team, req.user.id)) {
      return res.status(403).json({ error: 'Вы не состоите в этой команде' });
    }

    let dialog = await Message.getTeamDialog(teamId);
    if (!dialog) {
      dialog = await Message.createTeamDialog(teamId, team.name);
    }

    res.json({ success: true, data: dialog });
  } catch (error) {
    console.error('Get team dialog error:', error);
    res.status(500).json({ error: 'Ошибка при получении командного чата' });
  }
};

const getUserDialogs = async (req, res) => {
  try {
    const dialogs = await Message.getUserDialogs(req.user.id);
    res.json({ success: true, data: dialogs });
  } catch (error) {
    console.error('Get dialogs error:', error);
    res.status(500).json({ error: 'Ошибка при получении диалогов' });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const message = await Message.delete(req.params.id, req.user.id);
    if (!message) {
      return res.status(404).json({ error: 'Сообщение не найдено' });
    }
    res.json({ success: true, message: 'Сообщение удалено' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Ошибка при удалении сообщения',
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  createDialog,
  getTeamDialog,
  getUserDialogs,
  deleteMessage,
};
