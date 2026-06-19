import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlay, FiClock, FiUser, FiCheckCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { courseApi } from '../../api/courseApi';

function GoLearningPage() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCourses, setExpandedCourses] = useState({}); // Track which courses have expanded lessons
  const [courseLessons, setCourseLessons] = useState({}); // Store lessons for each course
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEnrolledCourses() {
      try {
        setLoading(true);
        const courses = await courseApi.getEnrolledCourses();
        setEnrolledCourses(courses || []);
        
        // Fetch lessons for each course
        const lessonsMap = {};
        for (const course of courses || []) {
          try {
            const lessons = await courseApi.getLessonsByCourse(course.id);
            lessonsMap[course.id] = lessons || [];
          } catch (error) {
            console.error(`Error fetching lessons for course ${course.id}:`, error);
            lessonsMap[course.id] = [];
          }
        }
        setCourseLessons(lessonsMap);
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        setEnrolledCourses([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEnrolledCourses();
  }, []);

  const toggleCourseLessons = (courseId) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  if (loading) {
    return (
      <div className="bg-[#F5F5F9] min-h-screen py-8 px-4 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Đang tải khóa học của bạn...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F5F9] min-h-screen py-8 px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Go Learning</h1>
          <p className="text-gray-600">
            Tiếp tục học tập với {enrolledCourses.length} khóa học đã đăng ký
          </p>
        </div>

        {/* Courses Grid */}
        {enrolledCourses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <FiCheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có khóa học nào
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn chưa đăng ký khóa học nào. Hãy khám phá và đăng ký các khóa học mới!
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-3 rounded-full bg-[#EA454C] text-white font-semibold hover:bg-[#d93e45] transition-colors"
            >
              Khám phá khóa học
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/courses/${course.id}`)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all hover:-translate-y-1"
              >
                {/* Thumbnail */}
                <div className="relative h-48 w-full bg-gray-100">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
                      No thumbnail
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="bg-white/90 rounded-full p-4">
                      <FiPlay className="w-8 h-8 text-[#EA454C]" />
                    </div>
                  </div>
                  <span className="absolute left-3 top-3 bg-white/90 text-xs font-medium text-gray-800 px-2 py-1 rounded-full">
                    {course.category || 'Programming'}
                  </span>
                  <span className="absolute right-3 top-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                    <FiCheckCircle className="w-3 h-3" />
                    Đã đăng ký
                  </span>
                </div>

                {/* Body */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiUser className="w-3 h-3" />
                      {course.teacher?.fullName || 'Unknown Instructor'}
                    </span>
                    <span>{course.level || 'Beginner'}</span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-2">
                    {course.description || course.overview}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-xs text-yellow-500">
                      <span>★</span>
                      <span className="font-semibold text-gray-800">4.0</span>
                      <span className="text-gray-400">(15)</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <FiClock className="w-3 h-3" />
                      <span>9h 30min</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/courses/${course.id}`);
                    }}
                    className="w-full mt-4 py-2.5 rounded-full bg-[#EA454C] text-white text-sm font-semibold hover:bg-[#d93e45] transition-colors flex items-center justify-center gap-2"
                  >
                    <FiPlay className="w-4 h-4" />
                    Tiếp tục học
                  </button>

                  {/* Course Content Section */}
                  {courseLessons[course.id] && courseLessons[course.id].length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCourseLessons(course.id);
                        }}
                        className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 hover:text-[#EA454C] transition-colors"
                      >
                        <span>Nội dung khóa học ({courseLessons[course.id].length} bài học)</span>
                        {expandedCourses[course.id] ? (
                          <FiChevronUp className="w-4 h-4" />
                        ) : (
                          <FiChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      
                      {expandedCourses[course.id] && (
                        <div className="mt-3 space-y-2">
                          {courseLessons[course.id].map((lesson, index) => (
                            <button
                              key={lesson.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/learn/${course.id}/lesson/${lesson.id}`);
                              }}
                              className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                            >
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#EA454C] text-white flex items-center justify-center text-xs font-semibold">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {lesson.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Bài học {index + 1} / {courseLessons[course.id].length}
                                </p>
                              </div>
                              <FiPlay className="w-4 h-4 text-[#EA454C] flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GoLearningPage;

