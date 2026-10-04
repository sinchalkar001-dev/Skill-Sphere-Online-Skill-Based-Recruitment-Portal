import { Notification } from '../models/index.js';
import { getIO } from '../config/socket.js';
import { queueEmail } from './email.service.js';

/**
 * Create and send an in-app notification + optional email
 */
export const createNotification = async ({
  recipientId,
  type,
  title,
  message,
  relatedJob = null,
  relatedApplication = null,
  emailData = null,
  emailTemplate = null,
  recipientEmail = null,
}) => {
  try {
    // Create in-app notification
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      relatedJob,
      relatedApplication,
    });

    // Emit via Socket.IO
    try {
      const io = getIO();
      io.to(`user:${recipientId}`).emit('notification', {
        _id: notification._id,
        type,
        title,
        message,
        relatedJob,
        relatedApplication,
        isRead: false,
        createdAt: notification.createdAt,
      });
    } catch {
      // Socket not initialized — skip real-time
    }

    // Queue the email; delivery (and any retries) happens in the background and
    // sets notification.isEmailSent once the mail server accepts it
    if (emailTemplate && recipientEmail && emailData) {
      await queueEmail({
        to: recipientEmail,
        template: emailTemplate,
        data: emailData,
        notificationId: notification._id,
      });
    }

    return notification;
  } catch (error) {
    console.error('Notification creation failed:', error.message);
    return null;
  }
};

/**
 * Get notifications for a user
 */
export const getUserNotifications = async (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ recipient: userId }),
  ]);

  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });

  return { notifications, total, unreadCount };
};

export default { createNotification, getUserNotifications };
