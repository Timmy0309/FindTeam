const Game = require('../models/Game');

const getGames = async (req, res) => {
  try {
    const games = await Game.findAll();
    res.json({ success: true, data: games });
  } catch (error) {
    console.error('Get games error:', error);
    res.status(500).json({ error: 'Ошибка при получении игр' });
  }
};

const getPopularGames = async (req, res) => {
  try {
    const games = await Game.findPopular();
    res.json({ success: true, data: games });
  } catch (error) {
    console.error('Get popular games error:', error);
    res.status(500).json({ error: 'Ошибка при получении популярных игр' });
  }
};

module.exports = { getGames, getPopularGames };
