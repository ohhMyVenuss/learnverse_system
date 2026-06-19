package org.example.backend.repository;

import org.example.backend.entity.Course;
import org.example.backend.enums.CourseStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByTeacherId(Long teacherId);
//
//    List<Course> findByStatus (CourseStatus status);
//
//    List<Course> findByTeacherIdAndStatus(Long teacherId, CourseStatus status);

    // Tìm khóa học đã được duyệt (hiển thị công khai)
    List<Course> findByStatusOrderByCreatedAtDesc(CourseStatus status);
}
