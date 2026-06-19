package org.example.backend.repository;

import org.example.backend.entity.UserAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserAnswerRepository extends JpaRepository<UserAnswer, Long> {
    Optional<UserAnswer> findByAttemptIdAndQuestionId(Long attemptId, Long questionId);
}

