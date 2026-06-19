package org.example.backend.repository;

import org.example.backend.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByUserIdOrderByCompletedAtDesc(Long userId);
    List<QuizAttempt> findByQuizIdOrderByCompletedAtDesc(Long quizId);
    Optional<QuizAttempt> findFirstByQuizIdAndUserIdOrderByStartedAtDesc(Long quizId, Long userId);
    List<QuizAttempt> findByQuizIdAndUserId(Long quizId, Long userId);
}

