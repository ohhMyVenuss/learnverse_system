package org.example.backend.dto.response.quiz;

import org.example.backend.enums.DifficultyLevel;

import java.time.LocalDateTime;
import java.util.List;

public record QuizResponse(
        Long id,
        String title,
        String description,
        String originalFileName,
        String fileUrl,
        String fileType,
        Integer numberOfQuestions,
        DifficultyLevel difficultyLevel,
        String subject,
        Boolean isPublic,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        // Thông tin người tạo (chỉ có trong public quizzes)
        Long createdById,
        String createdByFullName,
        String createdByEmail,
        // Danh sách câu hỏi (optional, có thể null)
        List<QuestionResponse> questions
) {
}
