import { Notification } from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { parsePagination, paginationMeta } from '../utils/helpers.js';

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 * @access  Protected
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ recipient: req.user._id }),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);

  res.json({
    status: 'success',
    data: { notifications, unreadCount },
    pagination: paginationMeta(total, page, limit),
  });
});

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Protected
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  notification.isRead = true;
  await notification.save();

  res.json({
    status: 'success',
    data: { notification },
  });
});

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Protected
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({
    status: 'success',
    message: 'All notifications marked as read',
  });
});

/**
 * @desc    Get unread count
 * @route   GET /api/notifications/unread-count
 * @access  Protected
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  res.json({
    status: 'success',
    data: { unreadCount: count },
  });
});
