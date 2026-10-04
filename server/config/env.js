import dotenv from 'dotenv';
dotenv.config();

const int = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const NODE_ENV = process.env.NODE_ENV || 'development';

const env = {
  PORT: int(process.env.PORT, 5000),
  NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/skill-sphere',
  MONGODB_POOL_SIZE: int(process.env.MONGODB_POOL_SIZE, 20),
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_key',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '30d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: int(process.env.EMAIL_PORT, 587),
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
  SENDER_EMAIL: process.env.SENDER_EMAIL || 'noreply@skillsphere.com',
  SENDER_NAME: process.env.SENDER_NAME || 'Skill Sphere',

  // Email delivery retries (see services/email.service.js)
  EMAIL_MAX_ATTEMPTS: int(process.env.EMAIL_MAX_ATTEMPTS, 5),
  EMAIL_RETRY_BASE_MS: int(process.env.EMAIL_RETRY_BASE_MS, 30_000),
  EMAIL_WORKER_INTERVAL_MS: int(process.env.EMAIL_WORKER_INTERVAL_MS, 30_000),

  // How long an authenticated user's record is reused before being re-read (0 disables)
  AUTH_CACHE_TTL_MS: int(process.env.AUTH_CACHE_TTL_MS, 30_000),

  // Rate limiting, per IP per window
  RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED !== 'false',
  RATE_LIMIT_WINDOW_MS: int(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  RATE_LIMIT_MAX: int(process.env.RATE_LIMIT_MAX, 1000),
  AUTH_RATE_LIMIT_MAX: int(process.env.AUTH_RATE_LIMIT_MAX, 20),

  // Reconcile MongoDB indexes with the schemas on startup. On by default outside
  // production; in production run `npm run db:sync` during deploys instead.
  SYNC_INDEXES: process.env.SYNC_INDEXES
    ? process.env.SYNC_INDEXES === 'true'
    : NODE_ENV !== 'production',

  isDev: NODE_ENV === 'development',
  isProd: NODE_ENV === 'production',
};

export default env;
