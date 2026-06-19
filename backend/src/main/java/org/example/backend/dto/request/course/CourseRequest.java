package org.example.backend.dto.request.course;

public record CourseRequest(
        String title,
        String description,
        Double price,
        String thumbnail,
        String category,
        String level,
        String overview,
        String includes
) {
}
