import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiEye, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import courseService from '../../services/courseService';
import { courseApi } from '../../api/courseApi';

// Component con: Badge trạng thái (Status Badge)
const StatusBadge = ({ status }) => {
  // status từ backend: PENDING, APPROVED, REJECTED
  const normalized = status?.toLowerCase();
  const styles = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    draft: 'bg-gray-100 text-gray-700',
    rejected: 'bg-red-100 text-red-700',
  };

  const icons = {
    approved: <FiCheckCircle className="mr-1" />,
    pending: <FiClock className="mr-1" />,
    draft: <FiEdit2 className="mr-1" />,
    rejected: <FiXCircle className="mr-1" />,
  };

  return (
    <span
      className={`flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
        styles[normalized] || styles.draft
      }`}
    >
      {icons[normalized]} {normalized}
    </span>
  );
};

function MyCoursesPage() {
  const [activeTab, setActiveTab] = useState('my-courses'); // 'my-courses' hoặc 'browse'
  const [myCourses, setMyCourses] = useState([]);
  const [approvedCourses, setApprovedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load dữ liệu khi vào trang
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Load khóa học của giáo viên
        const myRes = await courseService.getInstructorCourses();
        if (myRes.success) {
          setMyCourses(myRes.data);
        }
        // Load khóa học đã được phê duyệt
        const approvedData = await courseApi.getApprovedCourses();
        setApprovedCourses(approvedData || []);
      } catch (err) {
        setError('Không tải được danh sách khóa học');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-8 font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-500 mt-1">Manage your content and explore approved courses</p>
        </div>
        <Link 
          to="/instructor/courses/create" 
          className="bg-[#EA454C] text-white px-5 py-3 rounded-xl font-bold flex items-center shadow-lg hover:bg-[#d93e45] transition-all"
        >
          <FiPlus className="mr-2" /> Create New Course
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('my-courses')}
          className={`px-6 py-3 font-semibold text-sm transition-colors relative ${
            activeTab === 'my-courses'
              ? 'text-[#EA454C]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My Courses
          {activeTab === 'my-courses' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EA454C]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-6 py-3 font-semibold text-sm transition-colors relative ${
            activeTab === 'browse'
              ? 'text-[#EA454C]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Browse Approved Courses
          {activeTab === 'browse' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EA454C]" />
          )}
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'my-courses' ? (
        /* My Courses Table */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-10 text-center text-gray-500">Loading your courses...</div>
          ) : error ? (
            <div className="p-10 text-center text-red-500">{error}</div>
          ) : myCourses.length === 0 ? (
            <div className="p-20 text-center">
              <img
                src="https://cdni.iconscout.com/illustration/premium/thumb/empty-state-2130362-1800926.png"
                alt="Empty"
                className="w-48 h-48 mx-auto opacity-50"
              />
              <p className="text-gray-500 mt-4">You haven't created any courses yet.</p>
              <Link
                to="/instructor/courses/create"
                className="mt-4 inline-block bg-[#EA454C] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#d93e45] transition-colors"
              >
                Create Your First Course
              </Link>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                  <th className="px-6 py-4">Course Info</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Students</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myCourses.map((course) => {
                  const createdDate = course.createdAt
                    ? course.createdAt.split('T')[0]
                    : '';
                  const displayStatus = course.status;

                  return (
                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="h-12 w-20 flex-shrink-0 rounded-lg object-cover border border-gray-200 mr-4"
                            />
                          ) : (
                            <div className="h-12 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 mr-4 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                              IMG
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900 line-clamp-1">{course.title}</div>
                            <div className="text-xs text-gray-500">
                              {course.category || 'Uncategorized'} • {createdDate}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">
                        {course.price != null && course.price > 0
                          ? `${course.price.toLocaleString('vi-VN')} ₫`
                          : 'Miễn phí'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={displayStatus} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">N/A</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className="text-gray-400 hover:text-[#EA454C] transition-colors p-2"
                          title="Edit"
                          onClick={() => navigate(`/instructor/courses/${course.id}/edit`)}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="text-gray-400 hover:text-blue-600 transition-colors p-2"
                          title="Xem chi tiết"
                          onClick={() => navigate(`/courses/${course.id}`)}
                        >
                          <FiEye />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        /* Browse Approved Courses - Same layout as StudentCoursesPage */
        <div className="bg-[#F5F5F9] -m-8 p-8 min-h-screen">
          <div className="flex gap-6 max-w-7xl mx-auto">
            {/* Sidebar filters */}
            <aside className="w-72 bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hidden lg:block">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Filters</h2>
                <button className="text-xs text-red-500 hover:underline">Clear</button>
              </div>

              {/* Categories */}
              <section className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-800">Categories</p>
                </div>
                <div className="space-y-1 text-sm text-gray-700">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span>Backend (3)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span>Frontend (2)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span>Programming (6)</span>
                  </label>
                  <button className="mt-1 text-xs text-blue-500 hover:underline">
                    See more
                  </button>
                </div>
              </section>

              {/* Price */}
              <section className="mb-6">
                <p className="text-sm font-semibold text-gray-800 mb-2">Price</p>
                <div className="space-y-1 text-sm text-gray-700">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="price" className="text-indigo-500" />
                    <span>All (10)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="price" className="text-indigo-500" />
                    <span>Free (5)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="price" className="text-indigo-500" />
                    <span>Paid (3)</span>
                  </label>
                </div>
              </section>

              {/* Instructors */}
              <section className="mb-6">
                <p className="text-sm font-semibold text-gray-800 mb-2">Instructors</p>
                <div className="space-y-1 text-sm text-gray-700">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span>Keny White (10)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span>Hinata Hyuga (5)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span>John Doe (3)</span>
                  </label>
                  <button className="mt-1 text-xs text-blue-500 hover:underline">
                    See more
                  </button>
                </div>
              </section>

              {/* Range (Price slider) */}
              <section className="mb-6">
                <p className="text-sm font-semibold text-gray-800 mb-2">Range</p>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    className="w-full accent-[#EA454C]"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>$0</span>
                    <span>$69850</span>
                  </div>
                </div>
              </section>

              {/* Level */}
              <section className="mb-6">
                <p className="text-sm font-semibold text-gray-800 mb-2">Level</p>
                <div className="space-y-1 text-sm text-gray-700">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span>Beginner</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span>Intermediate</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span>Advanced</span>
                  </label>
                </div>
              </section>

              {/* Reviews */}
              <section className="mb-2">
                <p className="text-sm font-semibold text-gray-800 mb-2">Reviews</p>
                <div className="space-y-1 text-sm text-gray-700">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <label key={stars} className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span className="text-yellow-400 text-xs">
                        {'★'.repeat(stars)}
                        <span className="text-gray-300">
                          {'★'.repeat(5 - stars)}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            </aside>

            {/* Main content */}
            <main className="flex-1">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">
                    Showing{' '}
                    <span className="font-semibold text-gray-800">
                      {approvedCourses.length > 0 ? `1-${Math.min(9, approvedCourses.length)}` : '0'}
                    </span>{' '}
                    of{' '}
                    <span className="font-semibold text-gray-800">
                      {approvedCourses.length}
                    </span>{' '}
                    results
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-700">
                    <span className="i-heroicons-squares-2x2 w-4 h-4" />
                  </button>
                  <select className="h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 bg-white">
                    <option>Newly Published</option>
                    <option>Popular</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search"
                      className="h-9 rounded-lg border border-gray-200 pl-8 pr-3 text-sm bg-white"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                      🔍
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid list */}
              {isLoading ? (
                <div className="text-gray-500">Loading courses...</div>
              ) : approvedCourses.length === 0 ? (
                <div className="text-gray-500">No approved courses available.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {approvedCourses.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-left hover:shadow-md transition-shadow"
                    >
                      {/* Thumbnail */}
                      <div className="relative h-40 w-full bg-gray-100">
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
                        <span className="absolute left-3 top-3 bg-white/90 text-xs font-medium text-gray-800 px-2 py-1 rounded-full">
                          {course.category || 'Programming'}
                        </span>
                        <button
                          type="button"
                          className="absolute right-3 top-3 h-8 w-8 rounded-full bg-white/90 flex items-center justify-center text-gray-500"
                        >
                          ♥
                        </button>
                      </div>

                      {/* Body */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>By {course.teacher?.fullName || 'Unknown Instructor'}</span>
                          <span>{course.level || 'Beginner'}</span>
                        </div>

                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                          {course.title}
                        </h3>

                        <p className="text-xs text-gray-500 line-clamp-2">
                          {course.description}
                        </p>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1 text-xs text-yellow-500">
                            <span>★</span>
                            <span className="font-semibold text-gray-800">4.8</span>
                            <span className="text-gray-400">(120)</span>
                          </div>
                          <div className="text-sm font-bold text-[#EA454C]">
                            {course.price != null && course.price > 0
                              ? `${course.price.toLocaleString('vi-VN')} ₫`
                              : 'Miễn phí'}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Pagination (simple static) */}
              <div className="flex items-center justify-center gap-2 mt-8">
                <button className="h-8 w-8 rounded-full border border-gray-200 text-xs text-gray-500">
                  1
                </button>
                <button className="h-8 w-8 rounded-full bg-[#EA454C] text-xs text-white">
                  2
                </button>
                <button className="h-8 w-8 rounded-full border border-gray-200 text-xs text-gray-500">
                  3
                </button>
              </div>
            </main>
          </div>
        </div>
      )}

    </div>
  );
}

export default MyCoursesPage;