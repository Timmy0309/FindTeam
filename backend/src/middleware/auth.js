const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    req.user = {
      id: user.id,
      roles: user.roles || ['user'],
      rights: user.rights || [],
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Неверный токен' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  const userRoles = req.user?.roles || [];
  const hasRole = roles.some((role) => userRoles.includes(role));

  if (!hasRole) {
    return res.status(403).json({ error: 'Недостаточно прав: требуется роль ' + roles.join(' или ') });
  }

  next();
};

const requireRight = (...rights) => (req, res, next) => {
  const userRights = req.user?.rights || [];
  const hasAllRights = rights.every((right) => userRights.includes(right));

  if (!hasAllRights) {
    return res.status(403).json({ error: 'Недостаточно прав: требуется ' + rights.join(', ') });
  }

  next();
};

const requireSelfOrAdmin = (req, res, next) => {
  const targetId = Number(req.params.id);
  const isAdmin = (req.user?.roles || []).includes('admin');
  const isSelf = Number(req.user?.id) === targetId;

  if (isAdmin || isSelf) {
    return next();
  }

  return res.status(403).json({ error: 'Можно изменять только свой профиль' });
};

const requireSelfOrAdminOrRight = (right) => (req, res, next) => {
  const targetId = Number(req.params.id);
  const isAdmin = (req.user?.roles || []).includes('admin');
  const isSelf = Number(req.user?.id) === targetId;
  const hasRight = (req.user?.rights || []).includes(right);

  if (isAdmin || isSelf || hasRight) {
    return next();
  }

  return res.status(403).json({ error: 'Недостаточно прав для просмотра профиля' });
};

module.exports = {
  authenticate,
  requireRole,
  requireRight,
  requireSelfOrAdmin,
  requireSelfOrAdminOrRight,
};
