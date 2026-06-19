package org.example.backend.dto.response.dashboard;

public record UserStatisticsResponse (
     Long postsCount,          // Số bài viết
     Long commentsCount,       // Số comment
     Long coursesApprovedCount, // Số course được duyệt (cho instructor)
     Long totalContributions   // Tổng contributions
){}

