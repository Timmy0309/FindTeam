const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authenticate } = require('../middleware/auth');

router.get('/', teamController.getTeams);
router.get('/my', authenticate, teamController.getUserTeams);
router.get('/:id/members', teamController.getTeamMembers);
router.get('/:id', teamController.getTeamById);

router.post('/', authenticate, teamController.createTeam);
router.put('/:id', authenticate, teamController.updateTeam);
router.delete('/:id', authenticate, teamController.deleteTeam);
router.post('/:id/join', authenticate, teamController.joinTeam);
router.post('/:id/leave', authenticate, teamController.leaveTeam);

module.exports = router;
