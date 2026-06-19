package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.response.quiz.QuestionResultResponse;
import org.example.backend.dto.response.quiz.QuizResponse;
import org.example.backend.entity.Quiz;
import org.example.backend.entity.QuizAttempt;
import org.example.backend.enums.DifficultyLevel;
import org.example.backend.service.QuizService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping(value = "/generate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> generateQuiz(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("numberOfQuestions") int numberOfQuestions,
            @RequestParam("difficultyLevel") String difficultyLevelStr,
            @RequestParam(value = "cloudinaryUrl", required = false) String cloudinaryUrl,
            @RequestParam(value = "subject", required = false) String subject,
            @RequestParam(value = "isPublic", required = false) Boolean isPublic,
            Principal principal) {
        try {
            DifficultyLevel difficultyLevel = DifficultyLevel.valueOf(
                    difficultyLevelStr.toUpperCase());

            Quiz quiz = quizService.generateQuizFromDocument(
                    file, title, description, numberOfQuestions,
                    difficultyLevel, cloudinaryUrl, subject, isPublic, principal.getName());

            return ResponseEntity.ok(quiz);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Dữ liệu không hợp lệ: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi tạo quiz: " + e.getMessage());
        }
    }

    @GetMapping("/{quizId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Quiz> getQuiz(@PathVariable Long quizId) {
        try {
            return ResponseEntity.ok(quizService.getQuizById(quizId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/my-quizzes")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Quiz>> getMySavedQuizzes(Principal principal) {
        return ResponseEntity.ok(quizService.getMySavedQuizzes(principal.getName()));
    }

    @PostMapping("/{quizId}/start")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuizAttempt> startQuiz(
            @PathVariable Long quizId,
            Principal principal) {
        try {
            return ResponseEntity.ok(
                    quizService.startQuizAttempt(quizId, principal.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/attempts/{attemptId}/questions/{questionId}/answer")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuestionResultResponse> submitQuestionAnswer(
            @PathVariable Long attemptId,
            @PathVariable Long questionId,
            @RequestParam("selectedOptionIndex") Integer selectedOptionIndex,
            Principal principal) {
        try {
            return ResponseEntity.ok(quizService.submitQuestionAnswer(
                    attemptId, questionId, selectedOptionIndex, principal.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/attempts/{attemptId}/complete")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuizAttempt> completeQuiz(
            @PathVariable Long attemptId,
            Principal principal) {
        try {
            return ResponseEntity.ok(
                    quizService.completeQuiz(attemptId, principal.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/{quizId}/attempts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<QuizAttempt>> getQuizAttemptHistory(
            @PathVariable Long quizId,
            Principal principal) {
        return ResponseEntity.ok(
                quizService.getQuizAttemptHistory(quizId, principal.getName()));
    }

    // Lấy danh sách quiz công khai (với thông tin người tạo)
    @GetMapping("/public")
    public ResponseEntity<List<QuizResponse>> getPublicQuizzes(
            @RequestParam(value = "subject", required = false) String subject,
            @RequestParam(value = "search", required = false) String search) {
        try {
            List<QuizResponse> quizzes;
            if (search != null && !search.trim().isEmpty()) {
                quizzes = quizService.searchPublicQuizzesWithCreator(search);
            } else if (subject != null && !subject.trim().isEmpty()) {
                quizzes = quizService.searchPublicQuizzesBySubjectWithCreator(subject);
            } else {
                quizzes = quizService.getPublicQuizzesWithCreator();
            }
            return ResponseEntity.ok(quizzes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Cập nhật quiz (subject, isPublic)
    @PutMapping("/{quizId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Quiz> updateQuiz(
            @PathVariable Long quizId,
            @RequestParam(value = "subject", required = false) String subject,
            @RequestParam(value = "isPublic", required = false) Boolean isPublic,
            Principal principal) {
        try {
            Quiz quiz = quizService.updateQuiz(quizId, subject, isPublic, principal.getName());
            return ResponseEntity.ok(quiz);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Unauthorized")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

