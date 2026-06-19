package com.vku.learnverse.data.model

import com.google.gson.annotations.SerializedName

data class UserNoteDto(
    @SerializedName("id") val id: Long?,
    @SerializedName("type") val type: String, // "STUDY_NOTE" or "STUDY_PLAN"
    @SerializedName("title") val title: String,
    @SerializedName("content") val content: String?,
    @SerializedName("courseTitle") val courseTitle: String?,
    @SerializedName("lessonTitle") val lessonTitle: String?,
    @SerializedName("eventDate") val eventDate: String?, // ISO_LOCAL_DATE_TIME
    @SerializedName("importance") val importance: String, // "HIGH", "MEDIUM", "LOW"
    @SerializedName("hasAlarm") val hasAlarm: Boolean,
    @SerializedName("alarmTime") val alarmTime: String?, // ISO_LOCAL_DATE_TIME
    @SerializedName("createdAt") val createdAt: String? = null,
    @SerializedName("updatedAt") val updatedAt: String? = null
)
