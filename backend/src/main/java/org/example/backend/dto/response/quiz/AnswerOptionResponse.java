package org.example.backend.dto.response.quiz;

public record AnswerOptionResponse(
        Long id,
        String optionText,
        Integer optionIndex
) {
}
