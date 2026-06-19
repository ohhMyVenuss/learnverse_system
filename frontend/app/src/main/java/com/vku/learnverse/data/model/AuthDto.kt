package com.vku.learnverse.data.model

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String
)

data class RegisterRequest(
    @SerializedName("email") val email: String,
    @SerializedName("password") val password: String,
    @SerializedName("fullName") val fullName: String,
    @SerializedName("role") val role: String
)

data class LoginResponse(
    @SerializedName("token") val token: String
)

data class ForgotPasswordRequest(
    @SerializedName("email") val email: String
)

data class ForgotPasswordResponse(
    @SerializedName("email") val email: String,
    @SerializedName("otp") val otp: String,
    @SerializedName("message") val message: String
)

data class ResetPasswordRequest(
    @SerializedName("email") val email: String,
    @SerializedName("otp") val otp: String,
    @SerializedName("newPassword") val newPassword: String
)

data class VerifyOtpRequest(
    @SerializedName("email") val email: String,
    @SerializedName("otp") val otp: String
)

data class UserProfileDto(
    @SerializedName("id") val id: Long,
    @SerializedName("user") val user: UserDto,
    @SerializedName("avatarUrl") val avatarUrl: String?,
    @SerializedName("bio") val bio: String?,
    @SerializedName("birthday") val birthday: String?,
    @SerializedName("phone") val phone: String?,
    @SerializedName("address") val address: String?,
    @SerializedName("socialLinks") val socialLinks: String?
)
