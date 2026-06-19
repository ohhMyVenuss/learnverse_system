package com.vku.learnverse.data.api

import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {
    // Default base URL pointing to local Spring Boot backend (running on localhost:8080)
    private const val BASE_URL = "http://127.0.0.1:8080/api/"

    private fun createOkHttpClient(tokenManager: TokenManager): OkHttpClient {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val authInterceptor = Interceptor { chain ->
            val originalRequest = chain.request()
            val token = tokenManager.getToken()

            val requestBuilder = originalRequest.newBuilder()
            if (!token.isNullOrEmpty()) {
                requestBuilder.addHeader("Authorization", "Bearer $token")
            }

            chain.proceed(requestBuilder.build())
        }

        return OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .addInterceptor(authInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    fun getApiService(tokenManager: TokenManager): ApiService {
        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(createOkHttpClient(tokenManager))
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
