import { createContext, useContext, useState } from 'react';
import { courseApi } from '../api/courseApi';

const TeacherCourseContext = createContext(null);
export const useTeacherCourses = () => useContext(TeacherCourseContext);

export function TeacherCourseProvider({ children }) {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMyCourses = async () => {
    setLoading(true);
    try {
      const data = await courseApi.getMyCourses();
      setMyCourses(data);
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (payload) => {
    await courseApi.createCourse(payload);
    await fetchMyCourses();
  };

  const addLesson = async (courseId, payload) => {
    await courseApi.addLesson(courseId, payload);
    await fetchMyCourses();
  };

  return (
    <TeacherCourseContext.Provider value={{
      myCourses,
      loading,
      fetchMyCourses,
      createCourse,
      addLesson,
    }}>
      {children}
    </TeacherCourseContext.Provider>
  );
}