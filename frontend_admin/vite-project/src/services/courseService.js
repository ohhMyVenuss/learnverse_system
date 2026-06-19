import { courseApi } from '../api/courseApi';

// Service kết nối FE với BE cho các thao tác khóa học
const courseService = {
  // Lấy danh sách khóa học của giảng viên từ backend
  async getInstructorCourses() {
    try {
      const courses = await courseApi.getMyCourses();
      return { success: true, data: courses };
    } catch (error) {
      console.error('Error fetching instructor courses:', error);
      return { success: false, error };
    }
  },

  // Tạo khóa học + thêm các bài học (curriculum)
  async createCourse(finalData) {
    try {
      // Payload cho CourseRequest trên backend
      const coursePayload = {
        title: finalData.title,
        description: finalData.overview || finalData.title || 'No description yet',
        price: Number(finalData.price) || 0,
        thumbnail: finalData.thumbnail || '',
        category: finalData.category || '',
        level: finalData.level || 'Beginner',
        overview: finalData.overview || '',
        includes: finalData.includes || '',
      };

      // 1. Tạo khóa học
      const createdCourse = await courseApi.createCourse(coursePayload);

      // 2. Thêm lesson cho từng lecture trong curriculum (nếu có) - Sử dụng batch API để tối ưu
      if (finalData.curriculum && Array.isArray(finalData.curriculum)) {
        // Thu thập tất cả lessons từ tất cả sections
        const allLessons = [];
        for (const section of finalData.curriculum) {
          if (!section.lectures) continue;

          for (const lecture of section.lectures) {
            if (!lecture.title && !lecture.videoUrl) continue;
            allLessons.push({
              title: lecture.title || 'Lesson',
              content: lecture.content || lecture.title || '',
              videoUrl: lecture.videoUrl || '',
              flashcards: lecture.flashcards || [],
              quizId: lecture.quizId || null,
            });
          }
        }

        // Gọi batch API một lần thay vì nhiều lần
        if (allLessons.length > 0) {
          // Kiểm tra xem function có tồn tại không
          if (typeof courseApi.addLessonsBatch !== 'function') {
            console.error('addLessonsBatch is not a function. Available methods:', Object.keys(courseApi));
            // Fallback: Add từng lesson một
            for (const lesson of allLessons) {
              await courseApi.addLesson(createdCourse.id, lesson);
            }
          } else {
            await courseApi.addLessonsBatch(createdCourse.id, allLessons);
          }
        }
      }

      return { success: true, course: createdCourse };
    } catch (error) {
      console.error('Error creating course:', error);
      return { success: false, error };
    }
  },

  async getCourseDetail(courseId) {
    try {
      const course = await courseApi.getCourseById(courseId);
      return { success: true, data: course };
    } catch (error) {
      console.error('Error fetching course detail:', error);
      return { success: false, error };
    }
  },

  async updateCourse(courseId, payload) {
    try {
      const coursePayload = {
        title: payload.title,
        description: payload.overview || payload.description || payload.title || 'No description yet',
        price: Number(payload.price) || 0,
        thumbnail: payload.thumbnail || '',
        category: payload.category || '',
        level: payload.level || 'Beginner',
        overview: payload.overview || '',
        includes: payload.includes || '',
      };
      const updated = await courseApi.updateCourse(courseId, coursePayload);
      return { success: true, data: updated };
    } catch (error) {
      console.error('Error updating course:', error);
      return { success: false, error };
    }
  },

  async previewCourseContent(courseId) {
    try {
      const content = await courseApi.getCourseContent(courseId);
      return content;
    } catch (error) {
      console.error('Error getting course content:', error);
      throw error;
    }
  },

  async updateLesson(courseId, lessonId, payload) {
    try {
      const lesson = await courseApi.updateLesson(courseId, lessonId, payload);
      return { success: true, data: lesson };
    } catch (error) {
      console.error('Error updating lesson:', error);
      return { success: false, error };
    }
  },

  async deleteLesson(courseId, lessonId) {
    try {
      await courseApi.deleteLesson(courseId, lessonId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting lesson:', error);
      return { success: false, error };
    }
  },
};

export default courseService;