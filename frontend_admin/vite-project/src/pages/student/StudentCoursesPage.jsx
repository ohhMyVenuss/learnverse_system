import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '../../contexts/CourseContext.jsx';

function StudentCoursesPage() {
  const { approvedCourses, loading } = useCourses();
  const navigate = useNavigate();
  
  // Filter states
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('all'); // 'all', 'free', 'paid'
  const [priceRange, setPriceRange] = useState(10000); // Giá tối đa 10k VND
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'popular', 'price-low', 'price-high'

  // Extract unique levels, instructors, and categories from ALL courses (for filter options)
  const { levels, instructors, categories, priceStats } = useMemo(() => {
    const levelsMap = new Map();
    const instructorsMap = new Map();
    const categoriesMap = new Map();
    let allCount = 0;
    let freeCount = 0;
    let paidCount = 0;

    approvedCourses.forEach(course => {
      allCount++;
      if (!course.price || course.price === 0) {
        freeCount++;
      } else {
        paidCount++;
      }

      // Count levels
      if (course.level) {
        levelsMap.set(course.level, (levelsMap.get(course.level) || 0) + 1);
      }
      
      // Count instructors
      if (course.teacher) {
        const teacherId = course.teacher.id;
        if (!instructorsMap.has(teacherId)) {
          instructorsMap.set(teacherId, {
            id: teacherId,
            name: course.teacher.fullName || 'Unknown',
            count: 0
          });
        }
        instructorsMap.get(teacherId).count++;
      }

      // Count categories
      if (course.category) {
        const category = course.category;
        categoriesMap.set(category, (categoriesMap.get(category) || 0) + 1);
      }
    });

    return {
      levels: Array.from(levelsMap.entries()).map(([name, count]) => ({ name, count })),
      instructors: Array.from(instructorsMap.values()),
      categories: Array.from(categoriesMap.entries()).map(([name, count]) => ({ name, count })),
      priceStats: { all: allCount, free: freeCount, paid: paidCount }
    };
  }, [approvedCourses]);

  // Filter courses based on selected filters
  const filteredCourses = useMemo(() => {
    return approvedCourses.filter(course => {
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = course.title?.toLowerCase().includes(query);
        const matchesDescription = course.description?.toLowerCase().includes(query);
        const matchesInstructor = course.teacher?.fullName?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDescription && !matchesInstructor) {
          return false;
        }
      }

      // Filter by price
      if (priceFilter === 'free' && course.price > 0) {
        return false;
      }
      if (priceFilter === 'paid' && (!course.price || course.price === 0)) {
        return false;
      }

      // Filter by price range
      if (course.price > priceRange) {
        return false;
      }

      // Filter by level
      if (selectedLevels.length > 0 && !selectedLevels.includes(course.level)) {
        return false;
      }
      
      // Filter by instructor
      if (selectedInstructors.length > 0 && !selectedInstructors.includes(course.teacher?.id)) {
        return false;
      }

      // Filter by category
      if (selectedCategories.length > 0 && !selectedCategories.includes(course.category)) {
        return false;
      }
      
      return true;
    });
  }, [approvedCourses, selectedLevels, selectedInstructors, selectedCategories, searchQuery, priceFilter, priceRange]);

  // Sort filtered courses
  const sortedCourses = useMemo(() => {
    const courses = [...filteredCourses];
    
    switch (sortBy) {
      case 'newest':
        return courses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      case 'popular':
        return courses.sort((a, b) => {
          const enrolledA = a.enrolledCount || 0;
          const enrolledB = b.enrolledCount || 0;
          return enrolledB - enrolledA;
        });
      
      case 'price-low':
        return courses.sort((a, b) => (a.price || 0) - (b.price || 0));
      
      case 'price-high':
        return courses.sort((a, b) => (b.price || 0) - (a.price || 0));
      
      default:
        return courses;
    }
  }, [filteredCourses, sortBy]);

  // Handler functions
  const handleLevelChange = (level) => {
    setSelectedLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const handleInstructorChange = (instructorId) => {
    setSelectedInstructors(prev =>
      prev.includes(instructorId)
        ? prev.filter(id => id !== instructorId)
        : [...prev, instructorId]
    );
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedLevels([]);
    setSelectedInstructors([]);
    setSelectedCategories([]);
    setSearchQuery('');
    setPriceFilter('all');
    setPriceRange(10000);
    setSortBy('newest');
  };

  return (
    <div className="flex gap-6 p-8 bg-[#F5F5F9] min-h-screen">
      {/* Sidebar filters */}
      <aside className="w-72 bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hidden lg:block">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Filters</h2>
          <button 
            onClick={clearFilters}
            className="text-xs text-red-500 hover:underline"
          >
            Clear
          </button>
        </div>

        {/* Categories */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-800">Categories</p>
          </div>
          <div className="space-y-1 text-sm text-gray-700">
            {categories.length > 0 ? (
              categories.slice(0, 5).map(category => (
                <label key={category.name} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    checked={selectedCategories.includes(category.name)}
                    onChange={() => handleCategoryChange(category.name)}
                  />
                  <span>{category.name} ({category.count})</span>
                </label>
              ))
            ) : (
              <p className="text-xs text-gray-400">No categories found</p>
            )}
            {categories.length > 5 && (
              <button className="mt-1 text-xs text-blue-500 hover:underline">
                See more
              </button>
            )}
          </div>
        </section>

        {/* Price */}
        <section className="mb-6">
          <p className="text-sm font-semibold text-gray-800 mb-2">Price</p>
          <div className="space-y-1 text-sm text-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="price" 
                className="text-indigo-500" 
                checked={priceFilter === 'all'}
                onChange={() => setPriceFilter('all')}
              />
              <span>All ({priceStats.all})</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="price" 
                className="text-indigo-500"
                checked={priceFilter === 'free'}
                onChange={() => setPriceFilter('free')}
              />
              <span>Free ({priceStats.free})</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="price" 
                className="text-indigo-500"
                checked={priceFilter === 'paid'}
                onChange={() => setPriceFilter('paid')}
              />
              <span>Paid ({priceStats.paid})</span>
            </label>
          </div>
        </section>

        {/* Instructors */}
        <section className="mb-6">
          <p className="text-sm font-semibold text-gray-800 mb-2">Instructors</p>
          <div className="space-y-1 text-sm text-gray-700">
            {instructors.length > 0 ? (
              instructors.slice(0, 3).map(instructor => (
                <label key={instructor.id} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    checked={selectedInstructors.includes(instructor.id)}
                    onChange={() => handleInstructorChange(instructor.id)}
                  />
                  <span>{instructor.name} ({instructor.count})</span>
                </label>
              ))
            ) : (
              <p className="text-xs text-gray-400">No instructors found</p>
            )}
            {instructors.length > 3 && (
              <button className="mt-1 text-xs text-blue-500 hover:underline">
                See more
              </button>
            )}
          </div>
        </section>

        {/* Range (Price slider) */}
        <section className="mb-6">
          <p className="text-sm font-semibold text-gray-800 mb-2">Range</p>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="10000"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-[#EA454C]"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0₫</span>
              <span>{priceRange.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>
        </section>

        {/* Level */}
        <section className="mb-6">
          <p className="text-sm font-semibold text-gray-800 mb-2">Level</p>
          <div className="space-y-1 text-sm text-gray-700">
            {levels.length > 0 ? (
              levels.map(level => (
                <label key={level.name} className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    checked={selectedLevels.includes(level.name)}
                    onChange={() => handleLevelChange(level.name)}
                  />
                  <span>{level.name} ({level.count})</span>
                </label>
              ))
            ) : (
              <p className="text-xs text-gray-400">No levels found</p>
            )}
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
                {sortedCourses.length > 0 ? `1-${Math.min(9, sortedCourses.length)}` : '0'}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-gray-800">
                {sortedCourses.length}
              </span>{' '}
              results
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="h-9 w-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-700">
              <span className="i-heroicons-squares-2x2 w-4 h-4" />
            </button>
            <select 
              className="h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 bg-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newly Published</option>
              <option value="popular">Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 rounded-lg border border-gray-200 pl-8 pr-3 text-sm bg-white"
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                🔍
              </span>
            </div>
          </div>
        </div>

        {/* Grid list */}
        {loading ? (
          <div className="text-gray-500">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">No courses found matching your filters.</p>
            <button 
              onClick={clearFilters}
              className="text-blue-600 hover:underline text-sm"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedCourses.map((course) => (
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
  );
}

export default StudentCoursesPage;


