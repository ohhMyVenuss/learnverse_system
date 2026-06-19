package org.example.backend.dto.response.dashboard.statistics;

public record BlogStats (
     Long totalPosts,
     Long totalComments,
     Long postsThisWeek,
     Long commentsThisWeek,
     Long postsThisMonth,
     Long commentsThisMonth
){}
