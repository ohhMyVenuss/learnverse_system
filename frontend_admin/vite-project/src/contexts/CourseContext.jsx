import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { courseApi } from '../api/courseApi';

const CourseContext = createContext(null);
export const useCourses = () => useContext(CourseContext);

export function CourseProvider({ children }) {
  const [approvedCourses, setApprovedCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshApproved = useCallback(async () => {
    setLoading(true);
    try {
      const data = await courseApi.getApprovedCourses();
      setApprovedCourses(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshApproved();
  }, [refreshApproved]);

  return (
    <CourseContext.Provider value={{ approvedCourses, loading, refreshApproved }}>
      {children}
    </CourseContext.Provider>
  );
}