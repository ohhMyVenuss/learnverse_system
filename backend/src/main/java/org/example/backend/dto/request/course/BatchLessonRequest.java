package org.example.backend.dto.request.course;

import java.util.List;

public record BatchLessonRequest(List<LessonRequest> lessons) {
}

