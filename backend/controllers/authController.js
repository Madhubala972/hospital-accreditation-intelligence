const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { jwtSecret, jwtExpiresIn } = require('../config/externalApis');
const { getMongoStatus } = require('../config/db');
const { DEMO_USERS } = require('../middleware/auth');
const logger = require('../utils/logger');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
};

// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check MongoDB first if connected
    if (getMongoStatus()) {
      try {
        const user = await User.findOne({ email: cleanEmail });
        if (user) {
          const isMatch = await user.matchPassword(password);
          if (isMatch) {
            const token = generateToken(user);
            return res.json({
              success: true,
              token,
              user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
              },
            });
          }
        }
      } catch (err) {
        logger.warn(`Auth MongoDB check error: ${err.message}`);
      }
    }

    // Demo account fallback / quick access for demo password "password123" or any demo user
    const demoUser = DEMO_USERS.find((u) => u.email === cleanEmail);
    if (demoUser && (password === 'password123' || password === 'admin123' || password === 'demo')) {
      const token = generateToken(demoUser);
      return res.json({
        success: true,
        token,
        user: demoUser,
      });
    }

    // Auto demo login for first time test convenience
    if (demoUser) {
      const token = generateToken(demoUser);
      return res.json({
        success: true,
        token,
        user: demoUser,
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  } catch (error) {
    logger.error('Login error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

// @route GET /api/auth/demo-accounts
const getDemoAccounts = async (req, res) => {
  res.json({
    success: true,
    accounts: DEMO_USERS.map((u) => ({
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      defaultPassword: 'password123',
    })),
  });
};

module.exports = {
  login,
  getMe,
  getDemoAccounts,
};
