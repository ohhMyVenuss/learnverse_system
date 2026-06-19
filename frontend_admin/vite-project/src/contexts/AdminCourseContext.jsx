import { createContext, useContext, useState, useCallback } from 'react';
import { courseApi } from '../api/courseApi';

const AdminCourseContext = createContext(null);
export const useAdminCourses = () => useContext(AdminCourseContext);

export function AdminCourseProvider({ children }) {
  const [pendingCourses, setPendingCourses] = useState([]);
  const [approvedCourses, setApprovedCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const data = await courseApi.getPendingCourses();
      setPendingCourses(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchApproved = useCallback(async () => {
    setLoading(true);
    try {
      const data = await courseApi.getApprovedCourses();
      setApprovedCourses(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const approveCourse = useCallback(async (courseId) => {
    await courseApi.approveCourse(courseId);
    await Promise.all([fetchPending(), fetchApproved()]);
  }, [fetchPending, fetchApproved]);

  const rejectCourse = useCallback(async (courseId, reason) => {
    await courseApi.rejectCourse(courseId, reason);
    await fetchPending();
  }, [fetchPending]);

  const deleteCourse = useCallback(async (courseId, reason) => {
    await courseApi.deleteCourse(courseId, reason);
    await fetchApproved();
  }, [fetchApproved]);

  return (
    <AdminCourseContext.Provider value={{
      pendingCourses,
      approvedCourses,
      loading,
      fetchPending,
      fetchApproved,
      approveCourse,
      rejectCourse,
      deleteCourse,
    }}>
      {children}
    </AdminCourseContext.Provider>
  );
}