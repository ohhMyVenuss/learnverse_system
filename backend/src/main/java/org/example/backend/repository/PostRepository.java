package org.example.backend.repository;

import org.example.backend.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByCourseIdIsNullAndLessonIdIsNullOrderByCreatedAtDesc();
    List<Post> findByCourseIdAndLessonIdIsNullOrderByCreatedAtDesc(Long courseId);
    List<Post> findByLessonIdOrderByCreatedAtDesc(Long lessonId);
    List<Post> findByCourseId(Long courseId);
    List<Post> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Count posts created this week (community posts only)
    @Query("SELECT COUNT(p) FROM Post p WHERE p.course IS NULL AND p.lesson IS NULL AND p.createdAt >= :startOfWeek")
    Long countCommunityPostsThisWeek(@Param("startOfWeek") LocalDateTime startOfWeek);

    // Get top posts by reactions (for trending topics)
    @Query("SELECT p FROM Post p WHERE p.course IS NULL AND p.lesson IS NULL ORDER BY SIZE(p.reactions) DESC")
    List<Post> findTopCommunityPostsByReactions();
}
