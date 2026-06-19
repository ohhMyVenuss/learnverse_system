import apiClient from './apiClient';

export const noteApi = {
  // Lấy hoặc tạo note cho lesson
  getOrCreateNote: async (lessonId) => {
    const { data } = await apiClient.get(`/notes/lesson/${lessonId}`);
    return data;
  },

  // Cập nhật note
  updateNote: async (lessonId, content) => {
    const { data } = await apiClient.put(`/notes/lesson/${lessonId}`, { content });
    return data;
  },

  // Lấy tất cả notes của user trong một course
  getNotesByCourse: async (courseId) => {
    const { data } = await apiClient.get(`/notes/course/${courseId}`);
    return data;
  },

  // Lấy tất cả notes của user
  getAllNotes: async () => {
    const { data } = await apiClient.get('/notes');
    return data;
  },

  // Xóa note
  deleteNote: async (noteId) => {
    const { data } = await apiClient.delete(`/notes/${noteId}`);
    return data;
  },
};

