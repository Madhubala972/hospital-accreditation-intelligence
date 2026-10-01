const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { connectDB } = require('./config/db');
const logger = require('./utils/logger');
const schedulerService = require('./services/schedulerService');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const metricRoutes = require('./routes/metricRoutes');
const pathwayRoutes = require('./routes/pathwayRoutes');
const benchmarkRoutes = require('./routes/benchmarkRoutes');
const riskRoutes = require('./routes/riskRoutes');
const simulationRoutes = require('./routes/simulationRoutes');
const alertRoutes = require('./routes/alertRoutes');
const reportRoutes = require('./routes/reportRoutes');
const aiRoutes = require('./routes/aiRoutes');
const capaRoutes = require('./routes/capaRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Hospital Accreditation Intelligence Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/metrics', metricRoutes);
app.use('/api/pathways', pathwayRoutes);
app.use('/api/benchmarks', benchmarkRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/capa', capaRoutes);

// Serve Frontend Static Production Build
const frontendBuildPath = path.join(__dirname, '../frontend/build');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));

  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  app.use(notFound);
}

// Error Middleware
app.use(errorHandler);

// Start Server
const startServer = async () => {
  await connectDB();
  schedulerService.start();

  app.listen(PORT, () => {
    logger.info(`Hospital Accreditation Intelligence Platform running on http://localhost:${PORT}`);
  });
};

startServer();

module.exports = app;
