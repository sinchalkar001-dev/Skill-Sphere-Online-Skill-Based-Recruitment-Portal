import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import env from '../config/env.js';
import { createNotification } from '../services/notification.service.js';
import { trackSkillUsage } from '../services/skill.service.js';
import { invalidateUserCache } from '../middleware/auth.js';

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRY,
  });
  const refreshToken = jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
  });
  return { accessToken, refreshToken };
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, company } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('An account with this email already exists');
  }

  // Create user
  const userData = { name, email, password, role };
  if (role === 'recruiter' && company) {
    userData.company = company;
  }

  const user = await User.create(userData);

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Send welcome notification
  await createNotification({
    recipientId: user._id,
    type: 'welcome',
    title: 'Welcome to Skill Sphere!',
    message: `Welcome ${name}! Your ${role} account has been created successfully.`,
    emailTemplate: 'welcome',
    recipientEmail: email,
    emailData: { name, role },
  });

  res.status(201).json({
    status: 'success',
    message: 'Registration successful',
    data: {
      user: user.toSafeJSON(),
      accessToken,
      refreshToken,
    },
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password field
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.unauthorized('Your account has been deactivated');
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  res.json({
    status: 'success',
    message: 'Login successful',
    data: {
      user: user.toSafeJSON(),
      accessToken,
      refreshToken,
    },
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Protected
 */
export const logout = asyncHandler(async (req, res) => {
  // In a production app, you'd blacklist the token or use a token store
  res.json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Protected
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.json({
    status: 'success',
    data: { user: user.toSafeJSON() },
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Protected
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'name', 'bio', 'phone', 'location', 'skills', 'experience',
    'portfolio', 'projects', 'avatar', 'company',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  invalidateUserCache(user._id);

  if (user.role === 'candidate' && updates.skills !== undefined) {
    await trackSkillUsage('candidateCount', req.user.skills, user.skills);
  }

  res.json({
    status: 'success',
    message: 'Profile updated successfully',
    data: { user: user.toSafeJSON() },
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Protected
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
  invalidateUserCache(user._id);

  // Generate new tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  res.json({
    status: 'success',
    message: 'Password changed successfully',
    data: { accessToken, refreshToken },
  });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 * @access  Public (with refresh token)
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw ApiError.badRequest('Refresh token is required');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const tokens = generateTokens(user._id);

    res.json({
      status: 'success',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    });
  } catch (error) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }
});
