import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiCheckCircle, FiClock, FiXCircle, FiPlay } from 'react-icons/fi';
import courseService from '../../services/courseService';
import { courseApi } from '../../api/courseApi';
import { useAuth } from '../../hooks/useAuth';
import PaymentModal from '../../components/PaymentModal';
import { profileApi } from '../../api/profileApi';

function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [instructorBio, setInstructorBio] = useState('');
  const [instructorAvatar, setInstructorAvatar] = useState(null);
  
  // Kiểm tra xem user hiện tại có phải là owner của course không
  const isOwner = user && course && (
    user.role === 'instructor' && 
    course.teacher && 
    (course.teacher.id === user.id || course.teacher.email === user.email)
  );

  const includesList =
    (course?.includes && course.includes.split('\n').filter((line) => line.trim().length > 0)) || [];

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const detailRes = await courseService.getCourseDetail(courseId);
        if (detailRes.success) {
          setCourse(detailRes.data);
        }
        const lessonsData = await courseApi.getLessonsByCourse(courseId);
        setLessons(lessonsData || []);
        
        // Kiểm tra enrollment status nếu user là student
        if (user?.role === 'student') {
          try {
            const enrollmentStatus = await courseApi.checkEnrollmentStatus(courseId);
            setIsEnrolled(enrollmentStatus);
          } catch (error) {
            console.error('Error checking enrollment status:', error);
            setIsEnrolled(false);
          }
        }
        
        // Lấy số lượng học sinh đã đăng ký
        try {
          const count = await courseApi.getEnrollmentCount(courseId);
          setEnrollmentCount(count || 0);
        } catch (error) {
          console.error('Error loading enrollment count:', error);
        }
        
        // Lấy bio và avatar của instructor nếu có
        if (detailRes.data?.teacher?.id) {
          try {
            const instructorId = detailRes.data.teacher.id;
            const instructorProfile = await profileApi.getUserProfile(instructorId);
            if (instructorProfile) {
              if (instructorProfile.bio) {
                setInstructorBio(instructorProfile.bio);
              }
              if (instructorProfile.avatarUrl) {
                setInstructorAvatar(instructorProfile.avatarUrl);
              }
            }
          } catch (error) {
            console.error('Error loading instructor profile:', error);
          }
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [courseId, user]);

  function handleEnrollClick() {
    // Kiểm tra xem khóa học có phải trả phí không
    if (course.price && course.price > 0) {
      // Mở modal thanh toán
      setShowPaymentModal(true);
    } else {
      // Khóa học miễn phí, enroll trực tiếp
      handleFreeEnroll();
    }
  }

  async function handleFreeEnroll() {
    try {
      setEnrolling(true);
      await courseApi.enroll(courseId);
      setIsEnrolled(true);
      // eslint-disable-next-line no-alert
      alert('Đăng ký khóa học thành công!');
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert(e?.response?.data || 'Đăng ký thất bại');
    } finally {
      setEnrolling(false);
    }
  }

  function handlePaymentComplete() {
    // Sau khi thanh toán thành công, cập nhật trạng thái
    setShowPaymentModal(false);
    setIsEnrolled(true);
    // eslint-disable-next-line no-alert
    alert('Thanh toán thành công! Bạn đã được ghi danh vào khóa học.');
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Course not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F5F9] min-h-screen py-8 px-4 md:px-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)] gap-8">
        {/* Left content */}
        <section className="space-y-6">
          {/* Header */}
          <header className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <p className="text-xs uppercase text-gray-500 mb-2">
              {course.category || 'Web Development'}
            </p>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {course.title}
              </h1>
              {isOwner && course.status && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  course.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  course.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  course.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {course.status === 'APPROVED' && <FiCheckCircle className="inline mr-1" />}
                  {course.status === 'PENDING' && <FiClock className="inline mr-1" />}
                  {course.status === 'REJECTED' && <FiXCircle className="inline mr-1" />}
                  {course.status}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {course.overview || course.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
              <span>{lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'}</span>
              <span>·</span>
              <span>{enrollmentCount} {enrollmentCount === 1 ? 'student' : 'students'} enrolled</span>
              <span className="ml-auto inline-flex items-center gap-2 text-xs text-gray-600">
                {instructorAvatar ? (
                  <img 
                    src={instructorAvatar} 
                    alt={course.teacher?.fullName || 'Instructor'}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="h-8 w-8 rounded-full bg-gray-200" />
                )}
                <span>{course.teacher?.fullName || 'Instructor'}</span>
              </span>
            </div>
          </header>

          {/* Overview */}
          <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Overview
            </h2>
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <h3 className="font-semibold mb-1">Course Description</h3>
                <p>
                  {course.overview ||
                    course.description ||
                    'This course will help you learn modern web development concepts.'}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">What you&apos;ll learn</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Understand core web development concepts</li>
                  <li>Build responsive web interfaces</li>
                  <li>Work with modern JavaScript frameworks</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Requirements</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Basic computer skills</li>
                  <li>Internet connection</li>
                  <li>Willingness to learn</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Course content */}
          <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Course Content
              </h2>
              <p className="text-xs text-gray-500">
                {lessons.length} Lectures
              </p>
            </div>
            <div className="divide-y divide-gray-100">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className={`flex items-center justify-between py-4 text-sm text-gray-700 ${
                    isEnrolled || isOwner ? 'hover:bg-gray-50 cursor-pointer' : ''
                  } transition-colors`}
                  onClick={() => {
                    // Chỉ cho phép click nếu đã đăng ký hoặc là owner
                    if (isEnrolled || isOwner) {
                      navigate(`/learn/${courseId}/lesson/${lesson.id}`);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#EA454C] text-white flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FiPlay className="w-4 h-4 text-[#EA454C]" />
                        <span className="font-medium text-gray-900">{lesson.title}</span>
                      </div>
                      {lesson.content && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {lesson.content}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {isEnrolled || isOwner ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/learn/${courseId}/lesson/${lesson.id}`);
                        }}
                        className="px-4 py-2 rounded-lg bg-[#EA454C] text-white text-sm font-semibold hover:bg-[#d93e45] transition-colors flex items-center gap-2"
                      >
                        <FiPlay className="w-3 h-3" />
                        Xem bài học
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="text-blue-500 hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Có thể mở preview modal hoặc yêu cầu đăng ký
                            alert('Vui lòng đăng ký khóa học để xem nội dung đầy đủ');
                          }}
                        >
                          Preview
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {lessons.length === 0 && (
                <p className="text-sm text-gray-500 py-4">
                  Khóa học này chưa có bài học nào.
                </p>
              )}
            </div>
          </section>

          {/* About instructor */}
          <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                About the instructor
              </h2>
            </div>
            <div className="flex items-center gap-4">
              {instructorAvatar ? (
                <img 
                  src={instructorAvatar} 
                  alt={course.teacher?.fullName || 'Instructor'}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-200" />
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {course.teacher?.fullName || 'Instructor'}
                </p>
                <p className="text-xs text-gray-500">
                  {course.teacher?.role === 'TEACHER' ? 'Instructor' : course.teacher?.role || 'Instructor'}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              {instructorBio || 'UI/UX Designer, with 7+ Years Experience. Guarantee of High Quality Work.'}
            </p>
          </section>

          {/* Comments */}
          <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Post a comment
            </h2>
            <form className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Name"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <input
                type="text"
                placeholder="Subject"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <textarea
                rows="4"
                placeholder="Comment"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="button"
                className="px-5 py-2 rounded-full bg-[#3B2BFF] text-white text-sm font-semibold"
              >
                Submit
              </button>
            </form>
          </section>
        </section>

        {/* Right sidebar */}
        <aside className="space-y-4">
          {/* Pricing card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-40 w-full bg-gray-100">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
                  Course thumbnail
                </div>
              )}
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xl font-bold text-emerald-500">
                  {course.price != null && course.price > 0
                    ? `${course.price.toLocaleString('vi-VN')} ₫`
                    : 'MIỄN PHÍ'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 h-10 rounded-full border border-gray-200 text-sm text-gray-700"
                >
                  Add to Wishlist
                </button>
                <button
                  type="button"
                  className="h-10 w-10 rounded-full border border-gray-200 text-sm text-gray-700"
                >
                  ↗
                </button>
              </div>
              {isOwner ? (
                <button
                  type="button"
                  onClick={() => navigate(`/instructor/courses/${course.id}/edit`)}
                  className="w-full h-10 rounded-full bg-[#EA454C] text-white text-sm font-semibold hover:bg-[#d93e45] transition-colors flex items-center justify-center gap-2"
                >
                  <FiEdit2 />
                  Chỉnh sửa khóa học
                </button>
              ) : isEnrolled ? (
                <button
                  type="button"
                  onClick={() => navigate(`/courses/${courseId}`)}
                  className="w-full h-10 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FiCheckCircle />
                  Đã đăng ký - Bắt đầu học
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEnrollClick}
                  disabled={enrolling}
                  className="w-full h-10 rounded-full bg-[#3B2BFF] text-white text-sm font-semibold disabled:opacity-60 hover:bg-[#2B1BEF] transition-colors"
                >
                  {enrolling ? 'Đang xử lý...' : 'Enroll Now'}
                </button>
              )}
            </div>
          </div>

          {/* Includes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Includes</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              {includesList.length > 0 ? (
                includesList.map((item) => <li key={item}>{item}</li>)
              ) : (
                <>
                  <li>11 hours on-demand video</li>
                  <li>Full lifetime access</li>
                  <li>Access on mobile and TV</li>
                  <li>Certificate of completion</li>
                </>
              )}
            </ul>
          </div>

          {/* Course features */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-2 text-sm text-gray-700">
            <h3 className="text-sm font-semibold text-gray-900">
              Course Features
            </h3>
            <p>Enrolled: {enrollmentCount} students</p>
            <p>Duration: 20 hours</p>
            <p>Level: {course.level || 'Beginner'}</p>
          </div>
        </aside>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        course={course}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
}

export default CourseDetailPage;


