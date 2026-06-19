package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.quiz.QuestionDTO;
import org.example.backend.dto.response.quiz.AnswerOptionResponse;
import org.example.backend.dto.response.quiz.QuestionResponse;
import org.example.backend.dto.response.quiz.QuestionResultResponse;
import org.example.backend.dto.response.quiz.QuizResponse;
import org.example.backend.entity.*;
import org.example.backend.enums.DifficultyLevel;
import org.example.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final AnswerOptionRepository answerOptionRepository;
    private final DocumentProcessingService documentProcessingService;
    private final GeminiApiService geminiApiService;
    private final UserRepository userRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final UserAnswerRepository userAnswerRepository;

    public Quiz generateQuizFromDocument(
            MultipartFile file,
            String title,
            String description,
            int numberOfQuestions,
            DifficultyLevel difficultyLevel,
            String cloudinaryUrl,
            String subject,
            Boolean isPublic,
            String userEmail) throws Exception {

        // 1. Sử dụng Cloudinary URL nếu có, nếu không thì dùng URL giả (fallback)
        String fileUrl = cloudinaryUrl != null && !cloudinaryUrl.isEmpty()
                ? cloudinaryUrl
                : "https://storage.example.com/files/" + file.getOriginalFilename();

        // 2. Trích xuất text từ document
        String documentText = documentProcessingService.processDocument(file);

        // 3. Gọi Gemini API để generate quiz
        List<QuestionDTO> questionDTOs = geminiApiService.generateQuizFromText(
                documentText, numberOfQuestions, difficultyLevel);

        // 4. Tạo Quiz entity
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Quiz quiz = new Quiz();
        quiz.setTitle(title);
        quiz.setDescription(description);
        quiz.setCreatedBy(user);
        quiz.setOriginalFileName(file.getOriginalFilename());
        quiz.setFileUrl(fileUrl);
        quiz.setFileType(documentProcessingService.getFileType(file));
        quiz.setNumberOfQuestions(numberOfQuestions);
        quiz.setDifficultyLevel(difficultyLevel);
        quiz.setSubject(subject != null ? subject : "");
        quiz.setIsPublic(isPublic != null ? isPublic : false);

        quiz = quizRepository.save(quiz);

        // 5. Lưu questions và answers
        for (int i = 0; i < questionDTOs.size(); i++) {
            QuestionDTO qDto = questionDTOs.get(i);
            Question question = new Question();
            question.setQuiz(quiz);
            question.setQuestionText(qDto.questionText());
            question.setCorrectAnswerIndex(qDto.correctAnswerIndex());
            question.setPoints(qDto.points());
            question.setQuestionOrder(i + 1);
            question = questionRepository.save(question);

            // Lưu các đáp án
            for (int j = 0; j < qDto.options().size(); j++) {
                AnswerOption option = new AnswerOption();
                option.setQuestion(question);
                option.setOptionText(qDto.options().get(j));
                option.setOptionIndex(j);
                answerOptionRepository.save(option);
            }
        }

        return quiz;
    }

    public Quiz getQuizById(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        // Force load questions và options (tránh lazy loading)
        // Sắp xếp questions theo thứ tự
        if (quiz.getQuestions() != null && !quiz.getQuestions().isEmpty()) {
            quiz.getQuestions().sort(Comparator.comparing(Question::getQuestionOrder));
            quiz.getQuestions().forEach(q -> {
                if (q.getOptions() != null && !q.getOptions().isEmpty()) {
                    q.getOptions().sort(Comparator.comparing(AnswerOption::getOptionIndex));
                }
            });
        }

        return quiz;
    }

    public List<Quiz> getMySavedQuizzes(String userEmail) {
        return quizRepository.findByCreatedByEmailOrderByCreatedAtDesc(userEmail);
    }

    // Lấy danh sách quiz công khai
    public List<Quiz> getPublicQuizzes() {
        return quizRepository.findByIsPublicTrueOrderByCreatedAtDesc();
    }

    // Lấy danh sách quiz công khai với thông tin người tạo (DTO)
    public List<QuizResponse> getPublicQuizzesWithCreator() {
        List<Quiz> quizzes = quizRepository.findByIsPublicTrueOrderByCreatedAtDesc();
        return quizzes.stream()
                .map(this::convertToQuizResponse)
                .collect(Collectors.toList());
    }

    // Tìm kiếm quiz công khai theo subject
    public List<Quiz> searchPublicQuizzesBySubject(String subject) {
        if (subject == null || subject.trim().isEmpty()) {
            return getPublicQuizzes();
        }
        return quizRepository.findByIsPublicTrueAndSubjectContainingIgnoreCaseOrderByCreatedAtDesc(subject);
    }

    // Tìm kiếm quiz công khai theo subject với thông tin người tạo (DTO)
    public List<QuizResponse> searchPublicQuizzesBySubjectWithCreator(String subject) {
        List<Quiz> quizzes;
        if (subject == null || subject.trim().isEmpty()) {
            quizzes = getPublicQuizzes();
        } else {
            quizzes = quizRepository.findByIsPublicTrueAndSubjectContainingIgnoreCaseOrderByCreatedAtDesc(subject);
        }
        return quizzes.stream()
                .map(this::convertToQuizResponse)
                .collect(Collectors.toList());
    }

    // Tìm kiếm quiz công khai theo title hoặc subject
    public List<Quiz> searchPublicQuizzes(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getPublicQuizzes();
        }
        return quizRepository.searchPublicQuizzes(keyword);
    }

    // Tìm kiếm quiz công khai theo title hoặc subject với thông tin người tạo (DTO)
    public List<QuizResponse> searchPublicQuizzesWithCreator(String keyword) {
        List<Quiz> quizzes;
        if (keyword == null || keyword.trim().isEmpty()) {
            quizzes = getPublicQuizzes();
        } else {
            quizzes = quizRepository.searchPublicQuizzes(keyword);
        }
        return quizzes.stream()
                .map(this::convertToQuizResponse)
                .collect(Collectors.toList());
    }

    // Chuyển đổi Quiz entity sang QuizResponse DTO
    private QuizResponse convertToQuizResponse(Quiz quiz) {
        Long createdById = null;
        String createdByFullName = null;
        String createdByEmail = null;
        
        if (quiz.getCreatedBy() != null) {
            createdById = quiz.getCreatedBy().getId();
            createdByFullName = quiz.getCreatedBy().getFullName();
            createdByEmail = quiz.getCreatedBy().getEmail();
        }

        return new QuizResponse(
                quiz.getId(),
                quiz.getTitle(),
                quiz.getDescription(),
                quiz.getOriginalFileName(),
                quiz.getFileUrl(),
                quiz.getFileType(),
                quiz.getNumberOfQuestions(),
                quiz.getDifficultyLevel(),
                quiz.getSubject(),
                quiz.getIsPublic(),
                quiz.getCreatedAt(),
                quiz.getUpdatedAt(),
                createdById,
                createdByFullName,
                createdByEmail,
                null // Không bao gồm questions trong list view để giảm payload
        );
    }

    // Cập nhật thông tin quiz (subject, isPublic)
    public Quiz updateQuiz(Long quizId, String subject, Boolean isPublic, String userEmail) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        // Chỉ cho phép owner cập nhật
        if (!quiz.getCreatedBy().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized: Only quiz owner can update");
        }

        if (subject != null) {
            quiz.setSubject(subject);
        }
        if (isPublic != null) {
            quiz.setIsPublic(isPublic);
        }

        return quizRepository.save(quiz);
    }

    public QuizAttempt startQuizAttempt(Long quizId, String userEmail) {
        Quiz quiz = getQuizById(quizId);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuiz(quiz);
        attempt.setUser(user);
        attempt.setStartedAt(LocalDateTime.now());
        attempt.setIsCompleted(false);
        attempt.setMaxScore(quiz.getQuestions().stream()
                .mapToInt(Question::getPoints)
                .sum());
        attempt.setTotalScore(0);

        return quizAttemptRepository.save(attempt);
    }

    public QuestionResultResponse submitQuestionAnswer(
            Long attemptId,
            Long questionId,
            Integer selectedOptionIndex,
            String userEmail) {

        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        if (!attempt.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized");
        }

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        // Kiểm tra xem đã trả lời câu này chưa
        Optional<UserAnswer> existingAnswer = userAnswerRepository
                .findByAttemptIdAndQuestionId(attemptId, questionId);

        UserAnswer userAnswer;
        if (existingAnswer.isPresent()) {
            userAnswer = existingAnswer.get();
            userAnswer.setSelectedOptionIndex(selectedOptionIndex);
        } else {
            userAnswer = new UserAnswer();
            userAnswer.setAttempt(attempt);
            userAnswer.setQuestion(question);
            userAnswer.setSelectedOptionIndex(selectedOptionIndex);
        }

        // Kiểm tra đáp án đúng
        boolean isCorrect = selectedOptionIndex.equals(question.getCorrectAnswerIndex());
        userAnswer.setIsCorrect(isCorrect);
        userAnswer.setPointsEarned(isCorrect ? question.getPoints() : 0);

        userAnswerRepository.save(userAnswer);

        // Cập nhật tổng điểm
        updateAttemptScore(attempt);

        return new QuestionResultResponse(
                questionId,
                selectedOptionIndex,
                question.getCorrectAnswerIndex(),
                isCorrect,
                userAnswer.getPointsEarned(),
                attempt.getTotalScore(),
                attempt.getMaxScore()
        );
    }

    public QuizAttempt completeQuiz(Long attemptId, String userEmail) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        if (!attempt.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized");
        }

        attempt.setIsCompleted(true);
        //attempt.setCompletedAt(LocalDateTime.now());
        attempt.setCompletedAt(LocalDateTime.now());
        attempt.setPercentage(
                (double) attempt.getTotalScore() / attempt.getMaxScore() * 100);

        return quizAttemptRepository.save(attempt);
    }

    public List<QuizAttempt> getQuizAttemptHistory(Long quizId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return quizAttemptRepository.findByQuizIdAndUserId(quizId, user.getId());
    }

    private void updateAttemptScore(QuizAttempt attempt) {
        attempt = quizAttemptRepository.findById(attempt.getId()).orElse(attempt);
        int totalScore = attempt.getUserAnswers().stream()
                .mapToInt(UserAnswer::getPointsEarned)
                .sum();
        attempt.setTotalScore(totalScore);
        quizAttemptRepository.save(attempt);
    }
}

