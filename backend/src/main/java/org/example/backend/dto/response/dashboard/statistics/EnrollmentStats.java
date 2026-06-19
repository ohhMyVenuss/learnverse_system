package org.example.backend.dto.response.dashboard.statistics;


import java.util.List;

public record EnrollmentStats (
     Long totalEnrollments,
     Long newEnrollmentsThisWeek,
     Long newEnrollmentsThisMonth,
     Double averageProgress,
     List<TopCourseInfo> topCoursesByEnrollments
){}
