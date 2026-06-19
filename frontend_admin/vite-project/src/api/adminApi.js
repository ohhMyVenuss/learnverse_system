import apiClient from './apiClient';

export const adminApi = {
  getDashboardStats: async () => {
    const { data } = await apiClient.get('/admin/dashboard');
    return data;
  },
};

