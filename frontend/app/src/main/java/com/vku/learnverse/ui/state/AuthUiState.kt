package com.vku.learnverse.ui.state

sealed interface AuthUiState {
    object Idle : AuthUiState
    object Loading : AuthUiState
    data class Success(val message: String) : AuthUiState
    data class Error(val error: String) : AuthUiState
}
