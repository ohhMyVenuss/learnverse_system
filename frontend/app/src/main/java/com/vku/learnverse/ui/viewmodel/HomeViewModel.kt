package com.vku.learnverse.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.ViewModelProvider.AndroidViewModelFactory.Companion.APPLICATION_KEY
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.vku.learnverse.LearnverseApplication
import com.vku.learnverse.data.model.CourseDto
import com.vku.learnverse.data.model.UserProfileDto
import com.vku.learnverse.data.repository.AuthRepository
import com.vku.learnverse.data.repository.CourseRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class HomeUiState(
    val isLoading: Boolean = false,
    val userProfile: UserProfileDto? = null,
    val courses: List<CourseDto> = emptyList(),
    val enrolledCourses: List<CourseDto> = emptyList(),
    val errorMessage: String? = null,
    val streakDays: Int = 5,
    val dailyQuestProgress: Float = 0f,
    val mascotMessage: String? = "Hôm nay bạn muốn học gì nào?"
)

class HomeViewModel(
    private val authRepository: AuthRepository,
    private val courseRepository: CourseRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadDashboardData()
    }

    fun loadDashboardData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            
            val profileResult = authRepository.getMyProfile()
            val coursesResult = courseRepository.getApprovedCourses()
            val enrolledResult = courseRepository.getEnrolledCourses()

            var profile: UserProfileDto? = null
            var approvedCourses: List<CourseDto> = emptyList()
            var enrolledCourses: List<CourseDto> = emptyList()
            var error: String? = null

            profileResult.onSuccess {
                profile = it
            }.onFailure {
                error = it.message
            }

            coursesResult.onSuccess {
                approvedCourses = it
            }.onFailure {
                if (error == null) error = it.message
            }

            enrolledResult.onSuccess {
                enrolledCourses = it
            }.onFailure {
                // Fail silently or log
            }

            _uiState.value = HomeUiState(
                isLoading = false,
                userProfile = profile,
                courses = approvedCourses,
                enrolledCourses = enrolledCourses,
                errorMessage = error,
                mascotMessage = if (profile != null) "Chào ${profile?.user?.fullName ?: "bạn"}, cùng hoàn thành nhiệm vụ nhé!" else "Hôm nay học gì nào?"
            )
        }
    }

    fun setMascotMessage(message: String?) {
        _uiState.value = _uiState.value.copy(mascotMessage = message)
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }

    companion object {
        val Factory: ViewModelProvider.Factory = viewModelFactory {
            initializer {
                val application = (this[APPLICATION_KEY] as LearnverseApplication)
                HomeViewModel(
                    authRepository = application.container.authRepository,
                    courseRepository = application.container.courseRepository
                )
            }
        }
    }
}
