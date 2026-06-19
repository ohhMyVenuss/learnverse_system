import React, { useEffect } from 'react';
import { useCourses } from '../../contexts/CourseContext.jsx';

function StudentDashboard() {
  const { approvedCourses, loading, refreshApproved } = useCourses();

  useEffect(() => {
    refreshApproved();
  }, [refreshApproved]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Student Learning Dashboard</h1>
      {loading ? (
        <div className="text-gray-500">Loading courses...</div>
      ) : approvedCourses.length === 0 ? (
        <div className="text-gray-500">No approved courses available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {approvedCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="font-semibold text-gray-900 mb-1">{course.title}</div>
              <div className="text-sm text-gray-600 mb-2">{course.description}</div>
              <div className="text-sm font-bold text-[#EA454C]">
                {course.price != null ? `$${course.price}` : 'Free'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;