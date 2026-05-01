const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authenticate } = require('../middleware/auth');

// Защищенные маршруты
router.post('/', authenticate, teamController.createTeam); // CREATE
router.get('/', authenticate, teamController.getTeams); // READ
router.get('/my', authenticate, teamController.getUserTeams); // READ user's teams
router.get('/:id', authenticate, teamController.getTeamById); // READ one
router.put('/:id', authenticate, teamController.updateTeam); // UPDATE
router.delete('/:id', authenticate, teamController.deleteTeam); // DELETE
router.post('/:id/join', authenticate, teamController.joinTeam);
router.post('/:id/leave', authenticate, teamController.leaveTeam);

module.exports = router;