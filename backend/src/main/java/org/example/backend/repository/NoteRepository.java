package org.example.backend.repository;

import org.example.backend.entity.Lesson;
import org.example.backend.entity.Note;
import org.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NoteRepository extends JpaRepository<Note, Long> {
    // Tìm note của user cho một lesson cụ thể
    Optional<Note> findByUserAndLesson(User user, Lesson lesson);

//    // Lấy tất cả notes của user cho một lesson
//    List<Note> findByUserAndLessonOrderByCreatedAtDesc(User user, Lesson lesson);

    // Lấy tất cả notes của user
    List<Note> findByUserOrderByCreatedAtDesc(User user);

    // Lấy tất cả notes của user trong một course
    List<Note> findByUserAndLessonCourseIdOrderByCreatedAtDesc(User user, Long courseId);
}

