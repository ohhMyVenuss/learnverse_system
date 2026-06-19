package com.vku.learnverse.data.model

import androidx.compose.ui.graphics.Color
import java.time.LocalDate

data class LeaderboardEntry(
    val id: Long,
    val fullName: String,
    val xp: Int,
    val rank: Int,
    val avatarColors: List<Color>
) {
    val initials: String
        get() = fullName
            .split(" ")
            .filter { it.isNotBlank() }
            .take(2)
            .joinToString("") { it.first().uppercase() }
}

data class UserProfileSummary(
    val id: Long,
    val fullName: String,
    val scholarTitle: String,
    val level: Int,
    val hearts: Int,
    val coursesCompleted: Int,
    val dayStreak: Int,
    val totalXp: Int,
    val globalRankPercent: Int,
    val avatarColors: List<Color>
) {
    val initials: String
        get() = fullName
            .split(" ")
            .filter { it.isNotBlank() }
            .take(2)
            .joinToString("") { it.first().uppercase() }
}

enum class LearningActivityType {
    QUIZ_COMPLETED,
    LESSON_COMPLETED,
    COURSE_ENROLLED,
    STREAK_REACHED
}

data class LearningActivity(
    val id: Long,
    val date: LocalDate,
    val type: LearningActivityType,
    val title: String,
    val detail: String,
    val xpEarned: Int,
    val intensity: Int
)

data class Achievement(
    val title: String,
    val description: String,
    val icon: String,
    val colors: List<Color>
)
