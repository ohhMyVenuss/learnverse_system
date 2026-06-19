package org.example.backend.repository;

import org.example.backend.entity.Course;
import org.example.backend.entity.Enrollment;
import org.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    Optional<Enrollment> findByUserAndCourse(User user, Course course);

    List<Enrollment> findByUserIdOrderByIdDesc(Long userId);

    boolean existsByUserIdAndCourseId(Long id, Long id1);

    List<Enrollment> findByCourse(Course course);

    // Count enrollments by course
    Long countByCourse(Course course);
}
