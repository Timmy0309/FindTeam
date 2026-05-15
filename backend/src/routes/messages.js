const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/', messageController.sendMessage);
router.get('/dialogs', messageController.getUserDialogs);
router.post('/dialogs', messageController.createDialog);
router.get('/team/:teamId', messageController.getTeamDialog);
router.get('/dialogs/:dialogId', messageController.getMessages);
router.delete('/:id', messageController.deleteMessage);

module.exports = router;
