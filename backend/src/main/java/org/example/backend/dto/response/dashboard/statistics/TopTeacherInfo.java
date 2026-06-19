package org.example.backend.dto.response.dashboard.statistics;
public record TopTeacherInfo (
     Long teacherId,
     String teacherName,
     String teacherEmail,
     Long approvedCoursesCount
){}
