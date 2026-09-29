import client from './client';

export const notificationsApi = {
  getAll: (params) => client.get('/notifications', { params }),
  markAsRead: (id) => client.patch(`/notifications/${id}/read`),
  markAllAsRead: () => client.patch('/notifications/read-all'),
  getUnreadCount: () => client.get('/notifications/unread-count'),
};

export default notificationsApi;
