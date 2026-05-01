const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate } = require('../middleware/auth');

// Защищенные маршруты
router.post('/', authenticate, messageController.sendMessage); // CREATE
router.get('/dialogs', authenticate, messageController.getUserDialogs); // READ dialogs
router.post('/dialogs', authenticate, messageController.createDialog); // CREATE dialog
router.get('/dialogs/:dialogId', authenticate, messageController.getMessages); // READ messages
router.delete('/messages/:id', authenticate, messageController.deleteMessage); // DELETE

module.exports = router;