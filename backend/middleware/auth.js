const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/externalApis');
const User = require('../models/User');
const { getMongoStatus } = require('../config/db');

// In-memory demo user cache for fallback mode
const DEMO_USERS = [
  { id: 'usr-1', name: 'Dr. Sarah Jenkins', email: 'officer@hospital.org', role: 'Accreditation Officer', department: 'Quality & Accreditation' },
  { id: 'usr-2', name: 'Admin Administrator', email: 'admin@hospital.org', role: 'Admin', department: 'Executive Management' },
  { id: 'usr-3', name: 'James Martinez', email: 'quality@hospital.org', role: 'Quality Manager', department: 'Clinical Quality' },
  { id: 'usr-4', name: 'Elena Rostova', email: 'analyst@hospital.org', role: 'Analyst', department: 'Data Intelligence' }
];

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, jwtSecret);

      if (getMongoStatus()) {
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
          return next();
        }
      }

      // Fallback user matching
      const foundDemo = DEMO_USERS.find((u) => u.email === decoded.email || u.id === decoded.id);
      req.user = foundDemo || { id: decoded.id, email: decoded.email, role: decoded.role || 'Accreditation Officer', name: decoded.name || 'Accreditation Officer' };
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token validation failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no bearer token provided' });
  }
};

module.exports = { protect, DEMO_USERS };
