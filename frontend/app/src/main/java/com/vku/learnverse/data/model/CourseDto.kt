package com.vku.learnverse.data.model

import com.google.gson.annotations.SerializedName

data class UserDto(
    @SerializedName("id") val id: Long?,
    @SerializedName("fullName") val fullName: String?,
    @SerializedName("email") val email: String,
    @SerializedName("role") val role: String?
)

data class CourseDto(
    @SerializedName("id") val id: Long?,
    @SerializedName("title") val title: String?,
    @SerializedName("description") val description: String?,
    @SerializedName("price") val price: Double?,
    @SerializedName("thumbnail") val thumbnail: String?,
    @SerializedName("category") val category: String?,
    @SerializedName("level") val level: String?,
    @SerializedName("overview") val overview: String?,
    @SerializedName("includes") val includes: String?,
    @SerializedName("instructor") val teacher: UserDto?,
    @SerializedName("status") val status: String?,
    @SerializedName("rejectionReason") val rejectionReason: String?,
    @SerializedName("createdAt") val createdAt: String?,
    @SerializedName("updatedAt") val updatedAt: String?
)

data class FlashcardDto(
    @SerializedName("id") val id: Long?,
    @SerializedName("frontText") val frontText: String?,
    @SerializedName("backText") val backText: String?
)

data class AnswerOptionDto(
    @SerializedName("id") val id: Long?,
    @SerializedName("optionText") val optionText: String?,
    @SerializedName("optionIndex") val optionIndex: Int?
)

data class QuestionDto(
    @SerializedName("id") val id: Long?,
    @SerializedName("questionText") val questionText: String?,
    @SerializedName("options") val options: List<AnswerOptionDto>?,
    @SerializedName("correctAnswerIndex") val correctAnswerIndex: Int?,
    @SerializedName("points") val points: Int?,
    @SerializedName("questionOrder") val questionOrder: Int?
)

data class QuizDto(
    @SerializedName("id") val id: Long,
    @SerializedName("title") val title: String?,
    @SerializedName("description") val description: String?,
    @SerializedName("questions") val questions: List<QuestionDto>?,
    @SerializedName("numberOfQuestions") val numberOfQuestions: Int?,
    @SerializedName("difficultyLevel") val difficultyLevel: String?,
    @SerializedName("subject") val subject: String?,
    @SerializedName("isPublic") val isPublic: Boolean?
)

data class LessonDto(
    @SerializedName("id") val id: Long,
    @SerializedName("title") val title: String,
    @SerializedName("content") val content: String?,
    @SerializedName("videoUrl") val videoUrl: String?,
    @SerializedName("orderIndex") val orderIndex: Int?,
    @SerializedName("flashcards") val flashcards: List<FlashcardDto>?,
    @SerializedName("quiz") val quiz: QuizDto?,
    @SerializedName("createdAt") val createdAt: String?,
    @SerializedName("updatedAt") val updatedAt: String?
)

data class QuizAttemptDto(
    @SerializedName("id") val id: Long,
    @SerializedName("totalScore") val totalScore: Int?,
    @SerializedName("maxScore") val maxScore: Int?,
    @SerializedName("percentage") val percentage: Double?,
    @SerializedName("isCompleted") val isCompleted: Boolean?
)

data class QuestionResultResponseDto(
    @SerializedName("questionId") val questionId: Long?,
    @SerializedName("selectedOptionIndex") val selectedOptionIndex: Int?,
    @SerializedName("correctAnswerIndex") val correctAnswerIndex: Int?,
    @SerializedName("isCorrect") val isCorrect: Boolean?,
    @SerializedName("pointsEarned") val pointsEarned: Int?,
    @SerializedName("currentTotalScore") val currentTotalScore: Int?,
    @SerializedName("maxScore") val maxScore: Int?
)
