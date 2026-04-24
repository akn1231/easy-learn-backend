const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { unauthorized } = require('../utils/response');

async function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return unauthorized(res, 'Authentication required');
  }

  const token = header.split(' ')[1];

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return unauthorized(res, 'Invalid or expired token');
  }

  const user = await User.findById(payload.id).select('-password');

  if (!user || !user.isActive) {
    return unauthorized(res, 'User no longer exists or is inactive');
  }

  req.user = user;
  next();
}

async function optionalAuthenticate(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const token = header.split(' ')[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.id).select('-password');
      if (user && user.isActive) req.user = user;
    } catch {
      // Invalid token — proceed as guest
    }
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { authenticate, optionalAuthenticate, requireRole };
