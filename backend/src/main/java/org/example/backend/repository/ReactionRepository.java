package org.example.backend.repository;

import org.example.backend.entity.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    Optional<Reaction> findByUserIdAndPostId(Long userId, Long postId);

    Long countByPostId(Long postId);

    List<Reaction> findByPostId(Long postId);

    Optional<Reaction> findByUserIdAndCommentId(Long userId, Long commentId);

    Long countByCommentId(Long commentId);

    List<Reaction> findByCommentId(Long commentId);
}
