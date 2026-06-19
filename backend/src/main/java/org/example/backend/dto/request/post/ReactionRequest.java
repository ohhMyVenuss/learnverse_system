package org.example.backend.dto.request.post;

import org.example.backend.enums.ReactionType;

public record ReactionRequest(Long postId, Long commentId, ReactionType type) {
}
