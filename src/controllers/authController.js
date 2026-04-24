const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { success, badRequest, unauthorized } = require('../utils/response');

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

async function register(req, res) {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return badRequest(res, 'An account with this email already exists');
  }

  const user = await User.create({ name, email, password, role: 'user' });
  const token = signToken(user._id);

  return res.status(201).json({ success: true, message: 'Account created', token, user: user.toPublic() });
}

async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return unauthorized(res, 'Invalid email or password');
  }

  if (!user.isActive) {
    return unauthorized(res, 'Your account has been deactivated');
  }

  const token = signToken(user._id);

  // Flat response so the frontend store can destructure { token, user } directly
  return res.status(200).json({ success: true, message: 'Login successful', token, user: user.toPublic() });
}

async function logout(_req, res) {
  return success(res, null, 'Logged out successfully');
}

async function getMe(req, res) {
  return success(res, req.user.toPublic());
}

module.exports = { register, login, logout, getMe };
