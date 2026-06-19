import apiClient from './apiClient';

export const quizApi = {
  // Tạo quiz từ file (PDF/Word) - Upload trực tiếp lên backend
  generateQuiz: async (formData) => {
    // Không set Content-Type header - axios sẽ tự động set multipart/form-data với boundary
    const { data } = await apiClient.post('/quizzes/generate', formData, {
      timeout: 300000, // 5 phút cho AI processing
    });
    return data;
  },

  // Lấy quiz theo ID
  getQuizById: async (quizId) => {
    const { data } = await apiClient.get(`/quizzes/${quizId}`);
    return data;
  },

  // Lấy danh sách quiz của user
  getMyQuizzes: async () => {
    try {
      const { data } = await apiClient.get('/quizzes/my-quizzes');
      // Đảm bảo luôn trả về array
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.data)) {
        return data.data;
      } else {
        console.warn('API trả về dữ liệu không đúng định dạng, trả về mảng rỗng');
        return [];
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      // Trả về mảng rỗng thay vì throw error
      return [];
    }
  },

  // Bắt đầu làm bài quiz
  startQuizAttempt: async (quizId) => {
    const { data } = await apiClient.post(`/quizzes/${quizId}/start`);
    return data;
  },

  // Submit đáp án cho một câu hỏi
  submitQuestionAnswer: async (attemptId, questionId, selectedOptionIndex) => {
    const { data } = await apiClient.post(
      `/quizzes/attempts/${attemptId}/questions/${questionId}/answer`,
      null,
      {
        params: { selectedOptionIndex },
      }
    );
    return data;
  },

  // Hoàn thành quiz
  completeQuiz: async (attemptId) => {
    const { data } = await apiClient.post(`/quizzes/attempts/${attemptId}/complete`);
    return data;
  },

  // Lấy lịch sử làm bài của một quiz
  getQuizAttemptHistory: async (quizId) => {
    const { data } = await apiClient.get(`/quizzes/${quizId}/attempts`);
    return data;
  },

  // Lấy danh sách quiz công khai
  getPublicQuizzes: async (subject = null, search = null) => {
    try {
      const params = {};
      if (subject) params.subject = subject;
      if (search) params.search = search;
      
      const { data } = await apiClient.get('/quizzes/public', { params });
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching public quizzes:', error);
      return [];
    }
  },

  // Cập nhật quiz (subject, isPublic)
  updateQuiz: async (quizId, subject = null, isPublic = null) => {
    try {
      const params = {};
      if (subject !== null) params.subject = subject;
      if (isPublic !== null) params.isPublic = isPublic;
      
      const { data } = await apiClient.put(`/quizzes/${quizId}`, null, { params });
      return data;
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  },
};

