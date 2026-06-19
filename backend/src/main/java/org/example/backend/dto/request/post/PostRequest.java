package org.example.backend.dto.request.post;

public record PostRequest(String title, String content, String imageUrl, Long courseId, Long lessonId) {
}
