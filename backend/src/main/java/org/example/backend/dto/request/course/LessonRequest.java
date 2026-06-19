package org.example.backend.dto.request.course;

import java.util.List;

public record LessonRequest(
    String title,
    String content,
    String videoUrl,
    List<FlashcardRequest> flashcards,
    Long quizId
) {
    public record FlashcardRequest(String frontText, String backText) {}
}
