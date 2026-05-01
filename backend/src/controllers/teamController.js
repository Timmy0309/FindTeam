const Team = require('../models/Team');

// Создание команды (CREATE)
const createTeam = async (req, res) => {
  try {
    const teamData = {
      ...req.body,
      captain_id: req.user.id // Из JWT токена
    };
    const team = await Team.create(teamData);
    res.status(201).json({ success: true, data: team });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Ошибка при создании команды' });
  }
};

// Получение всех команд (READ)
const getTeams = async (req, res) => {
  try {
    const { game, playersNeeded } = req.query;
    const teams = await Team.findAll({ game, playersNeeded });
    res.json({ success: true, data: teams });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Ошибка при получении команд' });
  }
};

// Получение команды по ID (READ)
const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }
    res.json({ success: true, data: team });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ error: 'Ошибка при получении команды' });
  }
};

// Обновление команды (UPDATE)
const updateTeam = async (req, res) => {
  try {
    const team = await Team.update(req.params.id, req.body);
    if (!team) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }
    res.json({ success: true, data: team });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении команды' });
  }
};

// Удаление команды (DELETE)
const deleteTeam = async (req, res) => {
  try {
    const team = await Team.delete(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }
    res.json({ success: true, message: 'Команда удалена' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: 'Ошибка при удалении команды' });
  }
};

// Присоединение к команде
const joinTeam = async (req, res) => {
  try {
    const team = await Team.addMember(req.params.id, req.user.id);
    if (!team) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }
    res.json({ success: true, data: team });
  } catch (error) {
    console.error('Join team error:', error);
    res.status(500).json({ error: 'Ошибка при присоединении к команде' });
  }
};

// Выход из команды
const leaveTeam = async (req, res) => {
  try {
    const team = await Team.removeMember(req.params.id, req.user.id);
    if (!team) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }
    res.json({ success: true, data: team });
  } catch (error) {
    console.error('Leave team error:', error);
    res.status(500).json({ error: 'Ошибка при выходе из команды' });
  }
};

// Получение команд пользователя
const getUserTeams = async (req, res) => {
  try {
    const teams = await Team.findByUser(req.user.id);
    res.json({ success: true, data: teams });
  } catch (error) {
    console.error('Get user teams error:', error);
    res.status(500).json({ error: 'Ошибка при получении команд пользователя' });
  }
};

module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  joinTeam,
  leaveTeam,
  getUserTeams
};