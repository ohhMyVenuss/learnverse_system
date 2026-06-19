package com.vku.learnverse.data.repository

import com.vku.learnverse.data.api.ApiService
import com.vku.learnverse.data.api.TokenManager
import com.vku.learnverse.data.model.LoginRequest
import com.vku.learnverse.data.model.LoginResponse
import com.vku.learnverse.data.model.RegisterRequest

interface AuthRepository {
    suspend fun login(email: String, password: String): Result<LoginResponse>
    suspend fun register(email: String, password: String, fullName: String, role: String): Result<String>
    suspend fun forgotPassword(email: String): Result<com.vku.learnverse.data.model.ForgotPasswordResponse>
    suspend fun verifyOtp(email: String, otp: String): Result<String>
    suspend fun resetPassword(email: String, otp: String, newPassword: String): Result<String>
    suspend fun getMyProfile(): Result<com.vku.learnverse.data.model.UserProfileDto>
    fun saveToken(token: String)
    fun getToken(): String?
    fun clearToken()
    fun isLoggedIn(): Boolean
}

class DefaultAuthRepository(
    private val apiService: ApiService,
    private val tokenManager: TokenManager
) : AuthRepository {

    override suspend fun login(email: String, password: String): Result<LoginResponse> {
        return try {
            val response = apiService.login(LoginRequest(email, password))
            if (response.isSuccessful && response.body() != null) {
                val loginResponse = response.body()!!
                tokenManager.saveToken(loginResponse.token)
                Result.success(loginResponse)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Login failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun register(
        email: String,
        password: String,
        fullName: String,
        role: String
    ): Result<String> {
        return try {
            val response = apiService.register(RegisterRequest(email, password, fullName, role))
            if (response.isSuccessful) {
                val message = response.body()?.string() ?: "Registration successful"
                Result.success(message)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Registration failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun forgotPassword(email: String): Result<com.vku.learnverse.data.model.ForgotPasswordResponse> {
        return try {
            val response = apiService.forgotPassword(com.vku.learnverse.data.model.ForgotPasswordRequest(email))
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Forgot password request failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun verifyOtp(email: String, otp: String): Result<String> {
        return try {
            val response = apiService.verifyOtp(com.vku.learnverse.data.model.VerifyOtpRequest(email, otp))
            if (response.isSuccessful) {
                val message = response.body()?.string() ?: "OTP is valid"
                Result.success(message)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "OTP verification failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun resetPassword(email: String, otp: String, newPassword: String): Result<String> {
        return try {
            val response = apiService.resetPassword(com.vku.learnverse.data.model.ResetPasswordRequest(email, otp, newPassword))
            if (response.isSuccessful) {
                val message = response.body()?.string() ?: "Password reset successful"
                Result.success(message)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Password reset failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun getMyProfile(): Result<com.vku.learnverse.data.model.UserProfileDto> {
        return try {
            val response = apiService.getMyProfile()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Failed to load profile"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override fun saveToken(token: String) {
        tokenManager.saveToken(token)
    }

    override fun getToken(): String? {
        return tokenManager.getToken()
    }

    override fun clearToken() {
        tokenManager.clearToken()
    }

    override fun isLoggedIn(): Boolean {
        return !tokenManager.getToken().isNullOrEmpty()
    }
}
