import rateLimit from 'express-rate-limit';
import env from '../config/env.js';

const windowMinutes = Math.round(env.RATE_LIMIT_WINDOW_MS / 60000);

const createLimiter = (max, message) =>
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max,
    // RATE_LIMIT_ENABLED=false exists for load tests, which send every request from one IP
    skip: () => !env.RATE_LIMIT_ENABLED,
    message: { status: 'error', message },
    standardHeaders: true,
    legacyHeaders: false,
  });

// General API rate limiter
export const apiLimiter = createLimiter(
  env.RATE_LIMIT_MAX,
  `Too many requests. Please try again after ${windowMinutes} minutes.`
);

// Strict rate limiter for auth routes
export const authLimiter = createLimiter(
  env.AUTH_RATE_LIMIT_MAX,
  `Too many login attempts. Please try again after ${windowMinutes} minutes.`
);
