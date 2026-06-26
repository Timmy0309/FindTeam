const Team = require('../models/Team');
const Game = require('../models/Game');
const Message = require('../models/Message');

const createTeam = async (req, res) => {
  try {
    const { name, game, description, max_players } = req.body;

    if (!name?.trim() || !game?.trim()) {
      return res.status(400).json({ error: 'Укажите название команды и игру' });
    }

    const gameRecord = await Game.findOrCreate(game);

    const team = await Team.create({
      name: name.trim(),
      game: gameRecord.name,
      description,
      max_players: Number(max_players) || 5,
      captain_id: req.user.id,
    });

    await Message.createTeamDialog(team.id, team.name);

    const fullTeam = await Team.findById(team.id);
    res.status(201).json({ success: true, data: fullTeam });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Ошибка при создании команды' });
  }
};

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

const updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }
    if (Number(team.captain_id) !== Number(req.user.id)) {
      return res.status(403).json({ error: 'Только капитан может редактировать команду' });
    }

    const updated = await Team.update(req.params.id, req.body);
    const fullTeam = await Team.findById(updated.id);
    res.json({ success: true, data: fullTeam });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении команды' });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }
    if (Number(team.captain_id) !== Number(req.user.id)) {
      return res.status(403).json({ error: 'Только капитан может удалить команду' });
    }

    await Team.delete(req.params.id);
    res.json({ success: true, message: 'Команда удалена' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: 'Ошибка при удалении команды' });
  }
};

const joinTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }

    if (Team.isMember(team, req.user.id)) {
      return res.status(400).json({ error: 'Вы уже в этой команде' });
    }

    const updated = await Team.addMember(req.params.id, req.user.id);
    const fullTeam = await Team.findById(updated.id);
    res.json({ success: true, data: fullTeam });
  } catch (error) {
    console.error('Join team error:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Ошибка при присоединении к команде',
    });
  }
};

const leaveTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }

    if (!Team.isMember(team, req.user.id)) {
      return res.status(400).json({ error: 'Вы не состоите в этой команде' });
    }

    if (Number(team.captain_id) === Number(req.user.id)) {
      return res.status(400).json({
        error: 'Капитан не может покинуть команду. Удалите команду или передайте капитанство',
      });
    }

    const updated = await Team.removeMember(req.params.id, req.user.id);
    const fullTeam = await Team.findById(updated.id);
    res.json({ success: true, data: fullTeam });
  } catch (error) {
    console.error('Leave team error:', error);
    res.status(500).json({ error: 'Ошибка при выходе из команды' });
  }
};

const getUserTeams = async (req, res) => {
  try {
    const teams = await Team.findByUser(req.user.id);
    res.json({ success: true, data: teams });
  } catch (error) {
    console.error('Get user teams error:', error);
    res.status(500).json({ error: 'Ошибка при получении команд пользователя' });
  }
};

const getTeamMembers = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }

    const isMember = Team.isMember(team, req.user.id);
    const canViewPlayers = (req.user.rights || []).includes('can_view_players');
    const isAdmin = (req.user.roles || []).includes('admin');

    if (!isMember && !canViewPlayers && !isAdmin) {
      return res.status(403).json({ error: 'Нет доступа к списку участников' });
    }

    const memberIds = team.members || [];
    if (memberIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const { pool } = require('../config/database');
    const showEmail = isAdmin || isMember;
    const fields = showEmail ? 'id, name, email, avatar' : 'id, name, avatar';
    const result = await pool.query(
      `SELECT ${fields} FROM users WHERE id = ANY($1::INTEGER[])`,
      [memberIds]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ error: 'Ошибка при получении участников' });
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
  getUserTeams,
  getTeamMembers,
};
