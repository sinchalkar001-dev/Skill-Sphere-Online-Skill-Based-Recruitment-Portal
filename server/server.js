import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import { createServer } from 'http';

import env from './config/env.js';
import connectDB from './config/db.js';
import { initializeSocket } from './config/socket.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// ── Create Express app ──
const app = express();
const httpServer = createServer(app);

// ── Initialize Socket.IO ──
const io = initializeSocket(httpServer);

// ── Security Middleware ──
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(hpp());
app.use(mongoSanitize());

// ── Body Parsers ──
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Rate Limiting ──
app.use('/api', apiLimiter);

// ── Health Check ──
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ── API Routes ──
app.use('/api', routes);

// ── Error Handling ──
app.use(notFound);
app.use(errorHandler);

// ── Start Server ──
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    httpServer.listen(env.PORT, () => {
      console.log(`\n🚀 Skill Sphere Server`);
      console.log(`   Environment: ${env.NODE_ENV}`);
      console.log(`   Port: ${env.PORT}`);
      console.log(`   Frontend: ${env.FRONTEND_URL}`);
      console.log(`   Health: http://localhost:${env.PORT}/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// ── Graceful Shutdown ──
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

startServer();
