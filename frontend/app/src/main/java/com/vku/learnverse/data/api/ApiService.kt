package com.vku.learnverse.data.api

import com.vku.learnverse.data.model.CourseDto
import com.vku.learnverse.data.model.LessonDto
import com.vku.learnverse.data.model.LoginRequest
import com.vku.learnverse.data.model.LoginResponse
import com.vku.learnverse.data.model.RegisterRequest
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

import retrofit2.http.PUT
import retrofit2.http.DELETE

interface ApiService {

    // --- Auth Endpoints ---
    @POST("auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<LoginResponse>

    @POST("auth/register")
    suspend fun register(
        @Body request: RegisterRequest
    ): Response<ResponseBody> // Using ResponseBody because backend returns a raw String response

    @POST("auth/forgot-password")
    suspend fun forgotPassword(
        @Body request: com.vku.learnverse.data.model.ForgotPasswordRequest
    ): Response<com.vku.learnverse.data.model.ForgotPasswordResponse>

    @POST("auth/verify-otp")
    suspend fun verifyOtp(
        @Body request: com.vku.learnverse.data.model.VerifyOtpRequest
    ): Response<ResponseBody>

    @POST("auth/reset-password")
    suspend fun resetPassword(
        @Body request: com.vku.learnverse.data.model.ResetPasswordRequest
    ): Response<ResponseBody>

    // --- Profile Endpoints ---
    @GET("profile")
    suspend fun getMyProfile(): Response<com.vku.learnverse.data.model.UserProfileDto>

    // --- Course Endpoints ---
    @GET("courses")
    suspend fun getApprovedCourses(): Response<List<CourseDto>>

    @GET("courses/my-courses")
    suspend fun getMyCourses(): Response<List<CourseDto>>

    @GET("courses/pending")
    suspend fun getPendingCourses(): Response<List<CourseDto>>

    @GET("courses/enrolled")
    suspend fun getEnrolledCourses(): Response<List<CourseDto>>

    @GET("courses/{courseId}")
    suspend fun getCourseById(
        @Path("courseId") courseId: Long
    ): Response<CourseDto>

    @GET("courses/{courseId}/lessons")
    suspend fun getLessonsByCourse(
        @Path("courseId") courseId: Long
    ): Response<List<LessonDto>>

    // --- Payment Endpoints ---
    @POST("payments")
    suspend fun createPayment(
        @Body request: com.vku.learnverse.data.model.PaymentRequestDto
    ): Response<com.vku.learnverse.data.model.PaymentResponseDto>

    @GET("payments/history")
    suspend fun getPaymentHistory(): Response<List<com.vku.learnverse.data.model.PaymentHistoryDto>>

    @GET("payments/{paymentId}/status")
    suspend fun getPaymentStatus(
        @Path("paymentId") paymentId: Long
    ): Response<com.vku.learnverse.data.model.PaymentStatusDto>

    // --- Quiz Play Endpoints ---
    @POST("quizzes/{quizId}/start")
    suspend fun startQuiz(
        @Path("quizId") quizId: Long
    ): Response<com.vku.learnverse.data.model.QuizAttemptDto>

    @POST("quizzes/attempts/{attemptId}/questions/{questionId}/answer")
    suspend fun submitQuestionAnswer(
        @Path("attemptId") attemptId: Long,
        @Path("questionId") questionId: Long,
        @retrofit2.http.Query("selectedOptionIndex") selectedOptionIndex: Int
    ): Response<com.vku.learnverse.data.model.QuestionResultResponseDto>

    @POST("quizzes/attempts/{attemptId}/complete")
    suspend fun completeQuiz(
        @Path("attemptId") attemptId: Long
    ): Response<com.vku.learnverse.data.model.QuizAttemptDto>

    // --- User Note/Plan Endpoints ---
    @GET("user-notes")
    suspend fun getUserNotes(): Response<List<com.vku.learnverse.data.model.UserNoteDto>>

    @POST("user-notes")
    suspend fun createUserNote(
        @Body note: com.vku.learnverse.data.model.UserNoteDto
    ): Response<com.vku.learnverse.data.model.UserNoteDto>

    @PUT("user-notes/{id}")
    suspend fun updateUserNote(
        @Path("id") id: Long,
        @Body note: com.vku.learnverse.data.model.UserNoteDto
    ): Response<com.vku.learnverse.data.model.UserNoteDto>

    @DELETE("user-notes/{id}")
    suspend fun deleteUserNote(
        @Path("id") id: Long
    ): Response<Void>
}
