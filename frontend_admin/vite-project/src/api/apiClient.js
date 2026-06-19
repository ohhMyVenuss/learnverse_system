import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
console.log('API_BASE_URL:', API_BASE_URL); // Debug log

if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn('VITE_API_BASE_URL không được cấu hình. Sử dụng giá trị mặc định:', API_BASE_URL);
  console.warn('Tạo file .env trong thư mục vite-project với nội dung: VITE_API_BASE_URL=http://localhost:8080/api');
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 phút - tăng timeout mặc định cho các request dài
  // Không set Content-Type mặc định - axios sẽ tự động set dựa trên data type
  // FormData sẽ tự động có Content-Type: multipart/form-data với boundary
  // JSON sẽ tự động có Content-Type: application/json
});

// Setup interceptors
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Chỉ set Content-Type cho JSON requests, không set cho FormData
    if (!(config.data instanceof FormData) && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;