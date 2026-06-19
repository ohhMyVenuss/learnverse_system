package org.example.backend.dto.response.quiz;

import java.util.List;

public record QuestionResponse(
        Long id,
        String questionText,
        Integer correctAnswerIndex,
        Integer points,
        Integer questionOrder,
        List<AnswerOptionResponse> options
) {
}
