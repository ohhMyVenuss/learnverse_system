package org.example.backend.dto.response.dashboard.statistics;


import java.util.List;
import java.util.Map;

public record CourseStats (Long totalCourses, Long pendingCourses, Long approvedCourses, Long rejectedCourses, Long newCoursesThisWeek, Long newCoursesThisMonth, Map<String, Long> coursesByCategory, Map<String, Long> coursesByLevel, List<TopCourseInfo> topCoursesByEnrollments){}
