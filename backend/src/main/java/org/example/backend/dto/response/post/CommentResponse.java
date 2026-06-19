package org.example.backend.dto.response.post;

import org.example.backend.enums.ReactionType;
import org.example.backend.enums.Role;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record CommentResponse(
                Long id,
                String content,
                String imageUrl,
                Long userId,
                String userFullName,
                String userAvatarUrl,
                Role userRole,
                LocalDateTime createdAt,
                Boolean bestAnswer,
                Long totalReactions,
                Map<ReactionType, Long> reactionBreakdown,
                boolean isReacted,
                ReactionType myReactionType,
                List<CommentResponse> replies) {
}
