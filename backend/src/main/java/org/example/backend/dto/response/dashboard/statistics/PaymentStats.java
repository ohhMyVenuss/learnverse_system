package org.example.backend.dto.response.dashboard.statistics;
public record PaymentStats (
     Long totalTransactions,
     Long successfulTransactions,
     Long pendingTransactions,
     Long failedTransactions,
     Double totalRevenue,
     Double revenueThisWeek,
     Double revenueThisMonth,
     Double successRate // Percentage
){}
