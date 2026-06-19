import apiClient from './apiClient';

export const courseApi = {
  // PUBLIC
  getApprovedCourses: async () => {
    const { data } = await apiClient.get('/courses');
    return data;
  },

  // TEACHER
  getMyCourses: async () => {
    const { data } = await apiClient.get('/courses/my-courses');
    return data;
  },
  getCourseById: async (courseId) => {
    const { data } = await apiClient.get(`/courses/${courseId}`);
    return data;
  },
  createCourse: async (payload) => {
    const { data } = await apiClient.post('/courses', payload);
    return data;
  },
  addLesson: async (courseId, payload) => {
    const { data } = await apiClient.post(`/courses/${courseId}/lessons`, payload);
    return data;
  },

  addLessonBatch: async (courseId, lessons) => {
    const {data} = await apiClient.post(`/courses/${courseId}/lessons/batch`, { lessons });
    return data;
  },
  updateCourse: async (courseId, payload) => {
    const { data } = await apiClient.put(`/courses/${courseId}`, payload);
    return data;
  },

  // ADMIN
  getPendingCourses: async () => {
    const { data } = await apiClient.get('/courses/pending');
    return data;
  },
  approveCourse: async (courseId) => {
    const { data } = await apiClient.put(`/courses/${courseId}/approve`);
    return data;
  },
  rejectCourse: async (courseId, rejectionReason) => {
    const { data } = await apiClient.put(`/courses/${courseId}/reject`, { rejectionReason });
    return data;
  },

  // STUDENT
  enroll: async (courseId) => {
    const { data } = await apiClient.post(`/courses/${courseId}/enroll`);
    return data;
  },
  getEnrolledCourses: async () => {
    const { data } = await apiClient.get('/courses/enrolled');
    return data;
  },
  checkEnrollmentStatus: async (courseId) => {
    const { data } = await apiClient.get(`/courses/${courseId}/enrollment-status`);
    return data;
  },
  getCourseContent: async (courseId) => {
    const { data } = await apiClient.get(`/courses/${courseId}/content`);
    return data;
  },
  getLessonsByCourse: async (courseId) => {
    const { data } = await apiClient.get(`/courses/${courseId}/lessons`);
    return data;
  },
  updateLesson: async (courseId, lessonId, payload) => {
    const { data } = await apiClient.put(`/courses/${courseId}/lessons/${lessonId}`, payload);
    return data;
  },
  deleteLesson: async (courseId, lessonId) => {
    const { data } = await apiClient.delete(`/courses/${courseId}/lessons/${lessonId}`);
    return data;
  },
  deleteCourse: async (courseId, reason) => {
    const { data } = await apiClient.delete(`/courses/${courseId}`, { data: { rejectionReason: reason } });
    return data;
  },
  getEnrollmentCount: async (courseId) => {
    const { data } = await apiClient.get(`/courses/${courseId}/enrollment-count`);
    return data;
  },
};