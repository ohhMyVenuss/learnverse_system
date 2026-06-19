package org.example.backend.dto.response.quiz;

public record QuestionResultResponse(
        Long questionId,
        Integer selectedOptionIndex,
        Integer correctAnswerIndex,
        Boolean isCorrect,
        Integer pointsEarned,
        Integer currentTotalScore,
        Integer maxScore
) {
}
