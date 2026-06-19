package org.example.backend.repository;

import org.example.backend.entity.Quiz;
import org.example.backend.enums.DifficultyLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByCreatedByEmailOrderByCreatedAtDesc(String email);
    List<Quiz> findByCreatedByEmailAndDifficultyLevelOrderByCreatedAtDesc(
            String email, DifficultyLevel difficultyLevel);

    // Public quizzes
    @Query("SELECT q FROM Quiz q LEFT JOIN FETCH q.createdBy WHERE q.isPublic = true ORDER BY q.createdAt DESC")
    List<Quiz> findByIsPublicTrueOrderByCreatedAtDesc();

    @Query("SELECT q FROM Quiz q LEFT JOIN FETCH q.createdBy WHERE q.isPublic = true AND LOWER(q.subject) LIKE LOWER(CONCAT('%', :subject, '%')) ORDER BY q.createdAt DESC")
    List<Quiz> findByIsPublicTrueAndSubjectContainingIgnoreCaseOrderByCreatedAtDesc(@Param("subject") String subject);

    @Query("SELECT q FROM Quiz q LEFT JOIN FETCH q.createdBy WHERE q.isPublic = true AND " +
            "(LOWER(q.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(q.subject) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "ORDER BY q.createdAt DESC")
    List<Quiz> searchPublicQuizzes(@Param("keyword") String keyword);
}
