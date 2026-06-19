package com.vku.learnverse.data.di

import android.content.Context
import com.vku.learnverse.data.api.ApiService
import com.vku.learnverse.data.api.RetrofitClient
import com.vku.learnverse.data.api.TokenManager
import com.vku.learnverse.data.repository.AuthRepository
import com.vku.learnverse.data.repository.CourseRepository
import com.vku.learnverse.data.repository.DefaultAuthRepository
import com.vku.learnverse.data.repository.DefaultCourseRepository

interface AppContainer {
    val tokenManager: TokenManager
    val apiService: ApiService
    val authRepository: AuthRepository
    val courseRepository: CourseRepository
}

class DefaultAppContainer(private val context: Context) : AppContainer {

    override val tokenManager: TokenManager by lazy {
        TokenManager(context)
    }

    override val apiService: ApiService by lazy {
        RetrofitClient.getApiService(tokenManager)
    }

    override val authRepository: AuthRepository by lazy {
        DefaultAuthRepository(apiService, tokenManager)
    }

    override val courseRepository: CourseRepository by lazy {
        DefaultCourseRepository(apiService)
    }
}
