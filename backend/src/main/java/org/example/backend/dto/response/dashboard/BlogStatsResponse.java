package org.example.backend.dto.response.dashboard;


public record BlogStatsResponse (
     Long postsCount,      // Số bài viết trong tuần này
     Long commentsCount    // Số comment trong tuần này
){}

