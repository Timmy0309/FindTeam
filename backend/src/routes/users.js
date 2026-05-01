const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// Публичные маршруты
router.post('/register', userController.register);
router.post('/login', userController.login);

// Защищенные маршруты (требуют авторизации)
router.get('/', authenticate, userController.getUsers);
router.get('/:id', authenticate, userController.getUserById);
router.put('/:id', authenticate, userController.updateUser);
router.delete('/:id', authenticate, userController.deleteUser);

module.exports = router;