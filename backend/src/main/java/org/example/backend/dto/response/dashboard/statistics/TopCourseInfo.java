package org.example.backend.dto.response.dashboard.statistics;

public record TopCourseInfo (Long courseId, String courseTitle, Long enrollmentCount, Double revenue){}
