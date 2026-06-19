package org.example.backend.dto.response.community;

public record TrendingTopicResponse(
        Long id,
        String title,
        String description,
        Long postCount
) {
}
