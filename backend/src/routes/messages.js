const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate, requireRight } = require('../middleware/auth');

router.use(authenticate);
router.use(requireRight('can_send_messages'));

router.post('/', messageController.sendMessage);
router.get('/dialogs', messageController.getUserDialogs);
router.post('/dialogs', messageController.createDialog);
router.get('/team/:teamId', messageController.getTeamDialog);
router.get('/dialogs/:dialogId', messageController.getMessages);
router.delete('/:id', messageController.deleteMessage);

module.exports = router;
