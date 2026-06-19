package org.example.backend.dto.response.dashboard;


import org.example.backend.dto.response.dashboard.statistics.*;

public record AdminDashboardResponse(
        OverviewStats overview,
        CourseStats courseStats,
        PaymentStats paymentStats,
        UserStats userStats,
        EnrollmentStats enrollmentStats,
        BlogStats blogStats
) {}
