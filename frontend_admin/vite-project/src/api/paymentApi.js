// src/api/paymentApi.js
import apiClient from './apiClient';

export const paymentApi = {
  // Tạo payment link và QR code
  createPayment: async (courseId) => {
    const response = await apiClient.post('/payments', { courseId });
    return response.data;
  },

  // Lấy lịch sử thanh toán
  getPaymentHistory: async () => {
    const response = await apiClient.get('/payments/history');
    return response.data;
  },

  // Lấy giỏ hàng (PENDING & SUCCESS)
  getCart: async () => {
    const response = await apiClient.get('/payments/cart');
    return response.data;
  },

  // Kiểm tra trạng thái payment
  checkPaymentStatus: async (paymentId) => {
    const response = await apiClient.get(`/payments/${paymentId}/status`);
    return response.data;
  }
};
