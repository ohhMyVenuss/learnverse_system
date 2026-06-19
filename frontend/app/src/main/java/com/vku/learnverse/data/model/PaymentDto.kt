package com.vku.learnverse.data.model

import com.google.gson.annotations.SerializedName

data class PaymentRequestDto(
    @SerializedName("courseId") val courseId: Long,
    @SerializedName("amount") val amount: Double
)

data class PaymentResponseDto(
    @SerializedName("paymentId") val paymentId: Long,
    @SerializedName("status") val status: String,
    @SerializedName("checkoutUrl") val checkoutUrl: String?,
    @SerializedName("qrCode") val qrCode: String?
)

data class PaymentStatusDto(
    @SerializedName("paymentId") val paymentId: Long,
    @SerializedName("status") val status: String
)

data class PaymentHistoryDto(
    @SerializedName("id") val id: Long,
    @SerializedName("status") val status: String,
    @SerializedName("course") val course: PaymentCourseDto?
)

data class PaymentCourseDto(
    @SerializedName("id") val id: Long?
)
