package org.example.backend.dto.request.quiz;

import java.util.List;

public record QuestionDTO(
        String questionText,
        List<String> options,
        Integer correctAnswerIndex,
        Integer points
) {}
