require('dotenv').config();

module.exports = {
  pythonAiServiceUrl: process.env.PYTHON_AI_URL || 'http://127.0.0.1:5001',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: 'gemini-1.5-flash',
  externalApiKey: process.env.EXTERNAL_API_KEY || '',
  jwtSecret: process.env.JWT_SECRET || 'hospital_intelligence_secret_2026',
  jwtExpiresIn: '7d'
};
