package com.vku.learnverse.data.model

import androidx.compose.ui.graphics.Color

data class CourseSummary(
    val id: Long,
    val title: String,
    val description: String,
    val price: Double,
    val thumbnail: String?,
    val category: String,
    val level: String,
    val overview: String,
    val includes: List<String>,
    val instructorName: String,
    val rating: Double,
    val studentCount: Int,
    val durationHours: Int,
    val accentColors: List<Color>
)

enum class PaymentState {
    PENDING,
    SUCCESS,
    FAILED
}

data class CoursePayment(
    val paymentId: Long,
    val status: PaymentState,
    val checkoutUrl: String?,
    val qrCode: String?
)
