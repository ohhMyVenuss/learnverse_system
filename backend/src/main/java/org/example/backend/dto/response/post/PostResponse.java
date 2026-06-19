package org.example.backend.dto.response.post;

import org.example.backend.enums.ReactionType;
import org.example.backend.enums.Role;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record PostResponse(
                Long id,
                String title,
                String content,
                Long userId,
                String userFullName,
                String userAvatarUrl,
                Role userRole,
                Long courseId,
                Long lessonId,
                String imageUrl,
                Long totalReactions,
                Map<ReactionType, Long> reactionBreakdown,
                Long totalComments,
                boolean isReacted,
                ReactionType myReactionType,
                Long bestAnswerId,
                List<CommentResponse> comments,
                LocalDateTime createdAt) {
}
