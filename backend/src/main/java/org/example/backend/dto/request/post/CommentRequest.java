package org.example.backend.dto.request.post;

public record CommentRequest(String content, String imageUrl, Long postId, Long parentCommentId) {
}
