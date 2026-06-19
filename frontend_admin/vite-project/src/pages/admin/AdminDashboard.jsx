import React, { useEffect, useState } from 'react';
import { 
  FiUsers, FiBook, FiUserCheck, FiDollarSign, 
  FiClock, FiCheckCircle, FiXCircle, 
  FiTrendingUp, FiTrendingDown, FiEye, FiTrash2,
  FiFileText, FiMessageSquare, FiBarChart2
} from 'react-icons/fi';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { useAdminCourses } from '../../contexts/AdminCourseContext.jsx';
import { adminApi } from '../../api/adminApi';
import RejectCourseModal from '../../components/RejectCourseModal';
import DeleteCourseModal from '../../components/DeleteCourseModal';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const { pendingCourses, approvedCourses, loading, fetchPending, fetchApproved, approveCourse, rejectCourse, deleteCourse } = useAdminCourses();
  const [rejectModal, setRejectModal] = useState({ isOpen: false, course: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, course: null });
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'pending', 'approved'
  const [dashboardStats, setDashboardStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPending();
    fetchApproved();
    fetchDashboardStats();
  }, [fetchPending, fetchApproved]);

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const data = await adminApi.getDashboardStats();
      setDashboardStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleApprove = async (courseId) => {
    if (window.confirm('Bạn có chắc chắn muốn phê duyệt khóa học này?')) {
      await approveCourse(courseId);
      await fetchDashboardStats(); // Refresh stats
    }
  };

  const handleRejectClick = (course) => {
    setRejectModal({ isOpen: true, course });
  };

  const handleRejectConfirm = async (reason) => {
    await rejectCourse(rejectModal.course.id, reason);
    setRejectModal({ isOpen: false, course: null });
    await fetchDashboardStats(); // Refresh stats
  };

  const handleDeleteClick = (course) => {
    setDeleteModal({ isOpen: true, course });
  };

  const handleDeleteConfirm = async (reason) => {
    await deleteCourse(deleteModal.course.id, reason);
    setDeleteModal({ isOpen: false, course: null });
    await fetchDashboardStats(); // Refresh stats
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const formatPercentage = (num) => {
    if (!num) return '0%';
    return num.toFixed(1) + '%';
  };

  if (statsLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!dashboardStats) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center py-12 text-red-600">
          Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.
        </div>
      </div>
    );
  }

  const { overview, courseStats, paymentStats, userStats, enrollmentStats, blogStats } = dashboardStats;

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Tổng quan và quản lý hệ thống</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiBarChart2 className="inline mr-2" />
          Tổng quan
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'pending'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiClock className="inline mr-2" />
          Chờ duyệt ({pendingCourses.length})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'approved'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FiCheckCircle className="inline mr-2" />
          Đã duyệt ({approvedCourses.length})
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng người dùng</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(overview.totalUsers)}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiUsers className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng khóa học</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(overview.totalCourses)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiBook className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng đăng ký</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(overview.totalEnrollments)}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FiUserCheck className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng doanh thu</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(overview.totalRevenue)}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FiDollarSign className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Course Statistics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FiBook className="mr-2" />
                Thống kê khóa học
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Tổng số khóa học</span>
                  <span className="font-semibold text-gray-900">{formatNumber(courseStats.totalCourses)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-gray-600 flex items-center">
                    <FiClock className="mr-2" />
                    Chờ duyệt
                  </span>
                  <span className="font-semibold text-yellow-700">{formatNumber(courseStats.pendingCourses)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-600 flex items-center">
                    <FiCheckCircle className="mr-2" />
                    Đã duyệt
                  </span>
                  <span className="font-semibold text-green-700">{formatNumber(courseStats.approvedCourses)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-gray-600 flex items-center">
                    <FiXCircle className="mr-2" />
                    Bị từ chối
                  </span>
                  <span className="font-semibold text-red-700">{formatNumber(courseStats.rejectedCourses)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-600">Mới trong tuần</span>
                  <span className="font-semibold text-blue-700">{formatNumber(courseStats.newCoursesThisWeek)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-600">Mới trong tháng</span>
                  <span className="font-semibold text-blue-700">{formatNumber(courseStats.newCoursesThisMonth)}</span>
                </div>
              </div>
            </div>

            {/* Payment Statistics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FiDollarSign className="mr-2" />
                Thống kê thanh toán
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Tổng giao dịch</span>
                  <span className="font-semibold text-gray-900">{formatNumber(paymentStats.totalTransactions)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-600">Thành công</span>
                  <span className="font-semibold text-green-700">{formatNumber(paymentStats.successfulTransactions)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-gray-600">Đang chờ</span>
                  <span className="font-semibold text-yellow-700">{formatNumber(paymentStats.pendingTransactions)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-gray-600">Thất bại</span>
                  <span className="font-semibold text-red-700">{formatNumber(paymentStats.failedTransactions)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-600">Tỷ lệ thành công</span>
                  <span className="font-semibold text-blue-700">{formatPercentage(paymentStats.successRate)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-600">Doanh thu tuần này</span>
                  <span className="font-semibold text-purple-700">{formatCurrency(paymentStats.revenueThisWeek)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-600">Doanh thu tháng này</span>
                  <span className="font-semibold text-purple-700">{formatCurrency(paymentStats.revenueThisMonth)}</span>
                </div>
              </div>
            </div>

            {/* User Statistics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FiUsers className="mr-2" />
                Thống kê người dùng
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Tổng người dùng</span>
                  <span className="font-semibold text-gray-900">{formatNumber(userStats.totalUsers)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-600">Học viên</span>
                  <span className="font-semibold text-blue-700">{formatNumber(userStats.totalStudents)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-600">Giáo viên</span>
                  <span className="font-semibold text-green-700">{formatNumber(userStats.totalTeachers)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-600">Quản trị viên</span>
                  <span className="font-semibold text-purple-700">{formatNumber(userStats.totalAdmins)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-gray-600">Mới trong tuần</span>
                  <span className="font-semibold text-yellow-700">{formatNumber(userStats.newUsersThisWeek)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-gray-600">Mới trong tháng</span>
                  <span className="font-semibold text-yellow-700">{formatNumber(userStats.newUsersThisMonth)}</span>
                </div>
              </div>
              
              {/* Top Teachers */}
              {userStats.topTeachers && userStats.topTeachers.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Top giáo viên</h3>
                  <div className="space-y-2">
                    {userStats.topTeachers.slice(0, 5).map((teacher) => (
                      <div key={teacher.teacherId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{teacher.teacherName}</p>
                          <p className="text-xs text-gray-500">{teacher.teacherEmail}</p>
                        </div>
                        <span className="text-sm font-semibold text-green-600">{teacher.approvedCoursesCount} khóa</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Enrollment Statistics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FiUserCheck className="mr-2" />
                Thống kê đăng ký
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Tổng đăng ký</span>
                  <span className="font-semibold text-gray-900">{formatNumber(enrollmentStats.totalEnrollments)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-600">Mới trong tuần</span>
                  <span className="font-semibold text-blue-700">{formatNumber(enrollmentStats.newEnrollmentsThisWeek)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-600">Mới trong tháng</span>
                  <span className="font-semibold text-blue-700">{formatNumber(enrollmentStats.newEnrollmentsThisMonth)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-600">Tiến độ trung bình</span>
                  <span className="font-semibold text-green-700">{formatPercentage(enrollmentStats.averageProgress)}</span>
                </div>
              </div>
              
              {/* Top Courses by Enrollments */}
              {enrollmentStats.topCoursesByEnrollments && enrollmentStats.topCoursesByEnrollments.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Top khóa học</h3>
                  <div className="space-y-2">
                    {enrollmentStats.topCoursesByEnrollments.slice(0, 5).map((course) => (
                      <div key={course.courseId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{course.courseTitle}</p>
                          <p className="text-xs text-gray-500">{formatCurrency(course.revenue)}</p>
                        </div>
                        <span className="text-sm font-semibold text-blue-600 ml-2">{course.enrollmentCount} học viên</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Blog Statistics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FiFileText className="mr-2" />
                Thống kê Blog/Community
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Tổng bài viết</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(blogStats.totalPosts)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Tổng bình luận</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(blogStats.totalComments)}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Bài viết tuần này</p>
                  <p className="text-2xl font-bold text-blue-700">{formatNumber(blogStats.postsThisWeek)}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Bình luận tuần này</p>
                  <p className="text-2xl font-bold text-blue-700">{formatNumber(blogStats.commentsThisWeek)}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Bài viết tháng này</p>
                  <p className="text-2xl font-bold text-purple-700">{formatNumber(blogStats.postsThisMonth)}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Bình luận tháng này</p>
                  <p className="text-2xl font-bold text-purple-700">{formatNumber(blogStats.commentsThisMonth)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Course Status Pie Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FiBook className="mr-2" />
                Phân bổ khóa học theo trạng thái
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Đã duyệt', value: courseStats.approvedCourses, color: '#10b981' },
                      { name: 'Chờ duyệt', value: courseStats.pendingCourses, color: '#f59e0b' },
                      { name: 'Bị từ chối', value: courseStats.rejectedCourses, color: '#ef4444' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Đã duyệt', value: courseStats.approvedCourses, color: '#10b981' },
                      { name: 'Chờ duyệt', value: courseStats.pendingCourses, color: '#f59e0b' },
                      { name: 'Bị từ chối', value: courseStats.rejectedCourses, color: '#ef4444' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Payment Status Pie Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FiDollarSign className="mr-2" />
                Phân bổ giao dịch theo trạng thái
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Thành công', value: paymentStats.successfulTransactions, color: '#10b981' },
                      { name: 'Đang chờ', value: paymentStats.pendingTransactions, color: '#f59e0b' },
                      { name: 'Thất bại', value: paymentStats.failedTransactions, color: '#ef4444' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Thành công', value: paymentStats.successfulTransactions, color: '#10b981' },
                      { name: 'Đang chờ', value: paymentStats.pendingTransactions, color: '#f59e0b' },
                      { name: 'Thất bại', value: paymentStats.failedTransactions, color: '#ef4444' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* User Role Pie Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FiUsers className="mr-2" />
                Phân bổ người dùng theo vai trò
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Học viên', value: userStats.totalStudents, color: '#3b82f6' },
                      { name: 'Giáo viên', value: userStats.totalTeachers, color: '#10b981' },
                      { name: 'Quản trị viên', value: userStats.totalAdmins, color: '#8b5cf6' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Học viên', value: userStats.totalStudents, color: '#3b82f6' },
                      { name: 'Giáo viên', value: userStats.totalTeachers, color: '#10b981' },
                      { name: 'Quản trị viên', value: userStats.totalAdmins, color: '#8b5cf6' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Courses Bar Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FiTrendingUp className="mr-2" />
                Top khóa học theo số đăng ký
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={enrollmentStats.topCoursesByEnrollments.slice(0, 5).map(course => ({
                    name: course.courseTitle.length > 20 ? course.courseTitle.substring(0, 20) + '...' : course.courseTitle,
                    enrollments: course.enrollmentCount,
                    revenue: course.revenue || 0
                  }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="enrollments" fill="#3b82f6" name="Số đăng ký" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Teachers Bar Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FiUsers className="mr-2" />
                Top giáo viên theo số khóa học đã duyệt
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={userStats.topTeachers.slice(0, 10).map(teacher => ({
                    name: teacher.teacherName.length > 15 ? teacher.teacherName.substring(0, 15) + '...' : teacher.teacherName,
                    courses: teacher.approvedCoursesCount
                  }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="courses" fill="#10b981" name="Số khóa học" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Comparison Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FiDollarSign className="mr-2" />
                So sánh doanh thu
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: 'Tổng doanh thu', value: paymentStats.totalRevenue || 0 },
                    { name: 'Doanh thu tuần này', value: paymentStats.revenueThisWeek || 0 },
                    { name: 'Doanh thu tháng này', value: paymentStats.revenueThisMonth || 0 }
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} labelFormatter={(label) => label} />
                  <Legend />
                  <Bar dataKey="value" fill="#f59e0b" name="Doanh thu (₫)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : activeTab === 'pending' ? (
        loading ? (
          <div className="text-gray-500 text-center py-12">Đang tải danh sách khóa học...</div>
        ) : pendingCourses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <FiCheckCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Không có khóa học nào đang chờ duyệt.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {course.thumbnail && (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {course.description || course.overview || 'Không có mô tả'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Giáo viên: {course.teacher?.fullName || course.teacher?.email || 'Unknown'}</span>
                          {course.category && <span>• {course.category}</span>}
                          {course.level && <span>• {course.level}</span>}
                        </div>
                        {course.price != null && course.price > 0 && (
                          <div className="mt-2 text-sm font-medium text-gray-700">
                            Giá: {course.price.toLocaleString('vi-VN')} ₫
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      title="Xem chi tiết"
                    >
                      <FiEye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleApprove(course.id)}
                      className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
                    >
                      <FiCheckCircle className="w-4 h-4" />
                      Duyệt
                    </button>
                    <button
                      onClick={() => handleRejectClick(course)}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                      <FiXCircle className="w-4 h-4" />
                      Từ chối
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        loading ? (
          <div className="text-gray-500 text-center py-12">Đang tải danh sách khóa học...</div>
        ) : approvedCourses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <FiCheckCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Không có khóa học nào đã được duyệt.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {approvedCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {course.thumbnail && (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                            Đã duyệt
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {course.description || course.overview || 'Không có mô tả'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Giáo viên: {course.teacher?.fullName || course.teacher?.email || 'Unknown'}</span>
                          {course.category && <span>• {course.category}</span>}
                          {course.level && <span>• {course.level}</span>}
                        </div>
                        {course.price != null && course.price > 0 && (
                          <div className="mt-2 text-sm font-medium text-gray-700">
                            Giá: {course.price.toLocaleString('vi-VN')} ₫
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      title="Xem chi tiết"
                    >
                      <FiEye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(course)}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Reject Modal */}
      <RejectCourseModal
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal({ isOpen: false, course: null })}
        onConfirm={handleRejectConfirm}
        courseTitle={rejectModal.course?.title || ''}
      />

      {/* Delete Modal */}
      <DeleteCourseModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, course: null })}
        onConfirm={handleDeleteConfirm}
        courseTitle={deleteModal.course?.title || ''}
      />
    </div>
  );
}

export default AdminDashboard;
