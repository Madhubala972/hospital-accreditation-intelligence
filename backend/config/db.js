const mongoose = require('mongoose');
const logger = require('../utils/logger');

let isMongoConnected = false;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_accreditation';
    
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });

    isMongoConnected = true;
    logger.info(`MongoDB Connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
  } catch (error) {
    isMongoConnected = false;
    logger.warn(`MongoDB Connection Failed (${error.message}). Falling back to in-memory JSON registry mode.`);
  }
};

const getMongoStatus = () => isMongoConnected;

module.exports = { connectDB, getMongoStatus };
