import mongoose from 'mongoose';
import env from './env.js';
import { syncDatabase } from '../services/database.service.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      // Mongoose 8 defaults are good, but let's be explicit
      maxPoolSize: env.MONGODB_POOL_SIZE,
      minPoolSize: Math.min(5, env.MONGODB_POOL_SIZE),
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✓ MongoDB connected: ${conn.connection.host}`);

    if (env.SYNC_INDEXES) {
      await syncDatabase({ log: (message) => console.log(`  ${message}`) });
    }

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    return conn;
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
