import { Notification } from '../models/index.js';
import { getIO } from '../config/socket.js';
import { sendEmail } from './email.service.js';

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
        id: notification._id,
        type,
        title,
        message,
        createdAt: notification.createdAt,
      });
    } catch {
      // Socket not initialized — skip real-time
    }

    // Send email notification
    if (emailTemplate && recipientEmail && emailData) {
      const sent = await sendEmail(recipientEmail, emailTemplate, emailData);
      if (sent) {
        notification.isEmailSent = true;
        await notification.save();
      }
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
