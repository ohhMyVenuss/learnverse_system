import React from 'react';
function InstructorDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-blue-600"> Instructor Management</h1>
      <p>Manage your courses and students here.</p>
      {/* Nút Upload khóa học */}
      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">Upload New Course</button>
    </div>
  );
}
export default InstructorDashboard;