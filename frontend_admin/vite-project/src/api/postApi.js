import apiClient from './apiClient';

// API cho community posts (blog/discussion)
export const postApi = {
  // Lấy danh sách bài viết cộng đồng
  getCommunityPosts: async () => {
    const { data } = await apiClient.get('/posts/community');
    return data;
  },

  // Tạo bài viết mới (community-level, không gắn course/lesson)
  createPost: async ({ title, content, imageUrl }) => {
    const { data } = await apiClient.post('/posts', {
      title,
      content,
      imageUrl: imageUrl || null,
      courseId: null,
      lessonId: null,
    });
    return data;
  },

  // Tạo comment cho 1 post
  createComment: async ({ postId, content, imageUrl, parentCommentId = null }) => {
    const { data } = await apiClient.post('/comments', {
      content,
      imageUrl: imageUrl || null,
      postId,
      parentCommentId,
    });
    return data;
  },

  // Reaction (like/tim, v.v.)
  react: async ({ postId, type }) => {
    const { data } = await apiClient.post('/reactions', {
      postId,
      type,
    });
    return data;
  },

  // Đánh dấu comment là best answer
  markBestAnswer: async ({ postId, commentId }) => {
    const { data } = await apiClient.post(`/posts/${postId}/best-answer/${commentId}`);
    return data;
  },

  // Reaction cho comment
  reactComment: async ({ commentId, type }) => {
    const { data } = await apiClient.post(`/comments/${commentId}/reactions`, {
      type,
    });
    return data;
  },

  // Lấy thống kê blog (this week)
  getBlogStats: async () => {
    const { data } = await apiClient.get('/posts/stats');
    return data;
  },

  // Lấy trending topics
  getTrendingTopics: async (limit = 3) => {
    const { data } = await apiClient.get(`/posts/trending-topics?limit=${limit}`);
    return data;
  },

  // Lấy top contributors
  getTopContributors: async (limit = 3) => {
    const { data } = await apiClient.get(`/posts/top-contributors?limit=${limit}`);
    return data;
  },
};

export default postApi;


