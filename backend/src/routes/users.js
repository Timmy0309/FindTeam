const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {
  authenticate,
  requireRight,
  requireSelfOrAdmin,
  requireSelfOrAdminOrRight,
} = require('../middleware/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);

router.get('/', authenticate, requireRight('can_view_players'), userController.getUsers);
router.get(
  '/:id',
  authenticate,
  requireSelfOrAdminOrRight('can_view_players'),
  userController.getUserById
);
router.put('/:id', authenticate, requireSelfOrAdmin, userController.updateUser);
router.delete('/:id', authenticate, requireSelfOrAdmin, userController.deleteUser);

module.exports = router;
