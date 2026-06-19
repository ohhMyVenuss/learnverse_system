import apiClient from './apiClient';

export const notificationApi = {
  // Lấy tất cả thông báo của user
  getMyNotifications: async () => {
    const { data } = await apiClient.get('/notifications');
    return data;
  },

  // Lấy thông báo chưa đọc
  getUnreadNotifications: async () => {
    const { data } = await apiClient.get('/notifications/unread');
    return data;
  },

  // Đếm số thông báo chưa đọc
  getUnreadCount: async () => {
    const { data } = await apiClient.get('/notifications/unread-count');
    return data;
  },

  // Đánh dấu thông báo là đã đọc
  markAsRead: async (notificationId) => {
    const { data } = await apiClient.put(`/notifications/${notificationId}/read`);
    return data;
  },

  // Đánh dấu tất cả thông báo là đã đọc
  markAllAsRead: async () => {
    const { data } = await apiClient.put('/notifications/read-all');
    return data;
  },
};

