import apiClient from './apiClient';

export const profileApi = {
  // Lấy thông tin profile của user đang đăng nhập
  getMyProfile: async () => {
    const response = await apiClient.get('/profile');
    return response.data;
  },

  // Cập nhật profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/profile', profileData);
    return response.data;
  },

  // Lấy posts của user
  getMyPosts: async () => {
    const response = await apiClient.get('/posts/my-posts');
    return response.data;
  },

  // Lấy enrolled courses của user
  getEnrolledCourses: async () => {
    const response = await apiClient.get('/courses/enrolled');
    return response.data;
  },

  // Lấy statistics của user
  getMyStatistics: async () => {
    const response = await apiClient.get('/profile/statistics');
    return response.data;
  },

  // Lấy contribution data cho heatmap
  getMyContributions: async () => {
    const response = await apiClient.get('/profile/contributions');
    return response.data;
  },

  // Lấy profile của user khác (public)
  getUserProfile: async (userId) => {
    const response = await apiClient.get(`/profile/user/${userId}`);
    return response.data;
  }
};
