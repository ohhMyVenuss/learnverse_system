package com.vku.learnverse.data.repository

import android.util.Log
import androidx.compose.ui.graphics.Color
import com.vku.learnverse.data.api.ApiService
import com.vku.learnverse.data.model.CourseDto
import com.vku.learnverse.data.model.CoursePayment
import com.vku.learnverse.data.model.CourseSummary
import com.vku.learnverse.data.model.LessonDto
import com.vku.learnverse.data.model.PaymentRequestDto
import com.vku.learnverse.data.model.PaymentState

interface CourseRepository {
    suspend fun getApprovedCourses(): Result<List<CourseDto>>
    suspend fun getMyCourses(): Result<List<CourseDto>>
    suspend fun getPendingCourses(): Result<List<CourseDto>>
    suspend fun getEnrolledCourses(): Result<List<CourseDto>>
    suspend fun getCourseById(courseId: Long): Result<CourseDto>
    suspend fun getLessonsByCourse(courseId: Long): Result<List<LessonDto>>

    suspend fun loadCourses(): List<CourseSummary>
    suspend fun loadEnrolledCourses(): List<CourseSummary>
    suspend fun createPayment(course: CourseSummary): CoursePayment
    suspend fun refreshPaymentStatus(paymentId: Long): PaymentState
}

class DefaultCourseRepository(
    private val apiService: ApiService
) : CourseRepository {

    companion object {
        private const val TAG = "DefaultCourseRepository"
    }

    override suspend fun getApprovedCourses(): Result<List<CourseDto>> {
        return safeApiCall { apiService.getApprovedCourses() }
    }

    override suspend fun getMyCourses(): Result<List<CourseDto>> {
        return safeApiCall { apiService.getMyCourses() }
    }

    override suspend fun getPendingCourses(): Result<List<CourseDto>> {
        return safeApiCall { apiService.getPendingCourses() }
    }

    override suspend fun getEnrolledCourses(): Result<List<CourseDto>> {
        return safeApiCall { apiService.getEnrolledCourses() }
    }

    override suspend fun getCourseById(courseId: Long): Result<CourseDto> {
        return safeApiCall { apiService.getCourseById(courseId) }
    }

    override suspend fun getLessonsByCourse(courseId: Long): Result<List<LessonDto>> {
        return safeApiCall { apiService.getLessonsByCourse(courseId) }
    }

    override suspend fun loadCourses(): List<CourseSummary> {
        return try {
            val response = apiService.getApprovedCourses()
            if (response.isSuccessful && response.body() != null) {
                response.body()!!
                    .mapIndexedNotNull { index, course -> toCourseSummaryOrNull(course, index) }
                    .distinctBy { it.id }
                    .sortedByDescending { it.id }
                    .ifEmpty { DemoLearnVerseRepository.demoCourses }
            } else {
                DemoLearnVerseRepository.demoCourses
            }
        } catch (e: Exception) {
            Log.e(TAG, "loadCourses failed", e)
            DemoLearnVerseRepository.demoCourses
        }
    }

    override suspend fun loadEnrolledCourses(): List<CourseSummary> {
        return try {
            val response = apiService.getEnrolledCourses()
            if (response.isSuccessful && response.body() != null) {
                response.body()!!
                    .mapIndexedNotNull { index, course -> toCourseSummaryOrNull(course, index) }
                    .distinctBy { it.id }
            } else {
                emptyList()
            }
        } catch (e: Exception) {
            Log.e(TAG, "loadEnrolledCourses failed", e)
            emptyList()
        }
    }

    override suspend fun createPayment(course: CourseSummary): CoursePayment {
        try {
            val response = apiService.createPayment(
                PaymentRequestDto(
                    courseId = course.id,
                    amount = course.price
                )
            )
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                return CoursePayment(
                    paymentId = body.paymentId,
                    status = body.status.toPaymentState(),
                    checkoutUrl = body.checkoutUrl,
                    qrCode = body.qrCode
                )
            } else {
                val errorMsg = response.errorBody()?.string() ?: "Lỗi máy chủ"
                throw IllegalStateException(errorMsg)
            }
        } catch (e: Exception) {
            throw IllegalStateException("Không thể tạo liên kết thanh toán: ${e.message}", e)
        }
    }

    override suspend fun refreshPaymentStatus(paymentId: Long): PaymentState {
        return try {
            val response = apiService.getPaymentStatus(paymentId)
            if (response.isSuccessful && response.body() != null) {
                response.body()!!.status.toPaymentState()
            } else {
                PaymentState.PENDING
            }
        } catch (e: Exception) {
            PaymentState.PENDING
        }
    }

    private fun toCourseSummaryOrNull(course: CourseDto, index: Int): CourseSummary? {
        val courseId = course.id
        if (courseId == null) {
            Log.w(TAG, "Skip course at index=$index because id is null")
            return null
        }

        return CourseSummary(
            id = courseId,
            title = course.title.orEmpty().ifBlank { "Khóa học LearnVerse" },
            description = course.description.orEmpty()
                .ifBlank { "Học theo lộ trình thực hành, dễ hiểu và có bài tập." },
            price = course.price ?: 2_000.0,
            thumbnail = course.thumbnail,
            category = course.category.orEmpty().ifBlank { "Lập trình" },
            level = normalizeLevel(course.level),
            overview = cleanMarkdown(course.overview),
            includes = parseIncludes(course.includes),
            instructorName = course.teacher?.fullName.orEmpty().ifBlank { "Đội ngũ LearnVerse" },
            rating = 4.6 + (index % 4) * 0.1,
            studentCount = 680 + index * 137,
            durationHours = 5 + index % 8,
            accentColors = courseColors[index % courseColors.size]
        )
    }

    private fun normalizeLevel(level: String?): String = when (level?.lowercase()) {
        "easy", "cơ bản" -> "Cơ bản"
        "medium", "trung cấp" -> "Trung cấp"
        "hard", "nâng cao" -> "Nâng cao"
        else -> level.orEmpty().ifBlank { "Mọi cấp độ" }
    }

    private fun cleanMarkdown(value: String?): String {
        return value.orEmpty()
            .replace("#", "")
            .replace(Regex("\\n{2,}"), "\n")
            .trim()
            .ifBlank {
                "Khóa học tập trung vào kiến thức nền tảng, ví dụ trực quan và dự án thực tế."
            }
    }

    private fun parseIncludes(value: String?): List<String> {
        val parsed = value.orEmpty()
            .lineSequence()
            .map { it.trim().removePrefix("-").trim() }
            .filter { it.isNotBlank() }
            .toList()
        return parsed.ifEmpty {
            listOf("Video bài giảng HD", "Tài liệu thực hành", "Chứng nhận hoàn thành")
        }
    }

    private fun String?.toPaymentState(): PaymentState = when (this?.uppercase()) {
        "SUCCESS" -> PaymentState.SUCCESS
        "FAILED" -> PaymentState.FAILED
        else -> PaymentState.PENDING
    }

    private val courseColors = listOf(
        listOf(Color(0xFF7348DE), Color(0xFFC51A78)),
        listOf(Color(0xFF2878C8), Color(0xFF58B4C9)),
        listOf(Color(0xFFF08B45), Color(0xFFE44C6A)),
        listOf(Color(0xFF345D61), Color(0xFF69A98E)),
        listOf(Color(0xFF614A9F), Color(0xFF9684DA))
    )

    private suspend fun <T> safeApiCall(apiCall: suspend () -> retrofit2.Response<T>): Result<T> {
        return try {
            val response = apiCall()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "API Error"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
