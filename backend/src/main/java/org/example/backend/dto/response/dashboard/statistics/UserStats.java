package org.example.backend.dto.response.dashboard.statistics;

import java.util.List;
public record UserStats (
    Long totalUsers,
    Long totalStudents,
    Long totalTeachers,
    Long totalAdmins,
    Long newUsersThisWeek,
    Long newUsersThisMonth,
    List<TopTeacherInfo> topTeachers
){}
