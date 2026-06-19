package com.vku.learnverse.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.ViewModelProvider.AndroidViewModelFactory.Companion.APPLICATION_KEY
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.vku.learnverse.LearnverseApplication
import com.vku.learnverse.data.repository.AuthRepository
import com.vku.learnverse.ui.state.AuthUiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AuthViewModel(private val authRepository: AuthRepository) : ViewModel() {

    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    // Cache email for forgot password & registration flow
    var userEmail = ""
        private set

    fun clearState() {
        _uiState.value = AuthUiState.Idle
    }

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            authRepository.login(email, password)
                .onSuccess {
                    _uiState.value = AuthUiState.Success("Đăng nhập thành công")
                }
                .onFailure {
                    _uiState.value = AuthUiState.Error(it.message ?: "Đăng nhập thất bại")
                }
        }
    }

    fun register(fullName: String, email: String, password: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            // Default role to STUDENT as requested
            authRepository.register(email, password, fullName, "STUDENT")
                .onSuccess {
                    _uiState.value = AuthUiState.Success("Đăng ký thành công")
                }
                .onFailure {
                    _uiState.value = AuthUiState.Error(it.message ?: "Đăng ký thất bại")
                }
        }
    }

    fun forgotPassword(email: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            userEmail = email
            authRepository.forgotPassword(email)
                .onSuccess { response ->
                    _uiState.value = AuthUiState.Success("Mã OTP đã được gửi")
                }
                .onFailure {
                    _uiState.value = AuthUiState.Error(it.message ?: "Gửi mã thất bại")
                }
        }
    }

    fun verifyOtp(otp: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            authRepository.verifyOtp(userEmail, otp)
                .onSuccess {
                    _uiState.value = AuthUiState.Idle
                    onSuccess()
                }
                .onFailure {
                    _uiState.value = AuthUiState.Error(it.message ?: "Mã OTP không chính xác")
                }
        }
    }

    fun resetPassword(otp: String, newPassword: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            authRepository.resetPassword(userEmail, otp, newPassword)
                .onSuccess {
                    _uiState.value = AuthUiState.Success("Đặt lại mật khẩu thành công")
                }
                .onFailure {
                    _uiState.value = AuthUiState.Error(it.message ?: "Đặt lại mật khẩu thất bại")
                }
        }
    }

    companion object {
        val Factory: ViewModelProvider.Factory = viewModelFactory {
            initializer {
                val application = (this[APPLICATION_KEY] as LearnverseApplication)
                val authRepository = application.container.authRepository
                AuthViewModel(authRepository = authRepository)
            }
        }
    }
}
