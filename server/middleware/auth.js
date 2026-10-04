import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import env from '../config/env.js';
import { createTtlCache } from '../utils/ttlCache.js';

// The token proves who is calling; the user record adds role and active status.
// Reusing it for a short time saves a database read on every authenticated
// request. Treat req.user as read-only: the same object serves concurrent requests.
const userCache = createTtlCache({ ttlMs: env.AUTH_CACHE_TTL_MS });

const findUser = async (id) => {
  const key = String(id);
  let user = userCache.get(key);
  if (!user) {
    // The password is never selected (see the schema); lean() skips document hydration
    user = await User.findById(id).lean();
    if (user) userCache.set(key, user);
  }
  return user;
};

/** Call after changing a user so their next request sees the new record. */
export const invalidateUserCache = (id) => userCache.delete(String(id));

/**
 * Verify an access token and return the active user it belongs to; throws a 401
 * ApiError otherwise. Shared by HTTP routes and Socket.IO connections.
 */
export const authenticateToken = async (token) => {
  if (!token) {
    throw ApiError.unauthorized('Not authorized. Please log in.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token has expired. Please log in again.');
    }
    throw ApiError.unauthorized('Invalid token.');
  }

  const user = await findUser(decoded.id);
  if (!user) {
    throw ApiError.unauthorized('User belonging to this token no longer exists.');
  }
  if (!user.isActive) {
    throw ApiError.unauthorized('Your account has been deactivated.');
  }
  return user;
};

/**
 * Protect routes — verify JWT and attach user to request
 */
export const protect = asyncHandler(async (req, res, next) => {
  // Extract token from Authorization header
  const header = req.headers.authorization;
  const token = header && header.startsWith('Bearer') ? header.split(' ')[1] : undefined;

  req.user = await authenticateToken(token);
  next();
});

/**
 * Optional auth — if token exists, attach user, but don't require it
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      req.user = await findUser(decoded.id);
    } catch {
      // Token invalid — continue without user
    }
  }
  next();
});
