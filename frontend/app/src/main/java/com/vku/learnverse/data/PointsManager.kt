package com.vku.learnverse.data

import android.content.Context
import androidx.compose.ui.graphics.Color
import com.vku.learnverse.data.model.LeaderboardEntry
import com.vku.learnverse.data.repository.DemoLearnVerseRepository

object PointsManager {
    private const val PREFS_NAME = "points_prefs"
    private const val KEY_USER_XP = "user_total_xp"
    private const val DEFAULT_XP = 6500

    /**
     * Gets the user's total XP from SharedPreferences.
     */
    fun getUserXp(context: Context): Int {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getInt(KEY_USER_XP, DEFAULT_XP)
    }

    /**
     * Adds XP to the user's total score.
     */
    fun addXp(context: Context, amount: Int) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val currentXp = prefs.getInt(KEY_USER_XP, DEFAULT_XP)
        prefs.edit().putInt(KEY_USER_XP, currentXp + amount).apply()
    }

    /**
     * Generates a dynamic leaderboard by inserting the current user.
     */
    fun getLeaderboard(context: Context, userName: String): List<LeaderboardEntry> {
        val userXp = getUserXp(context)
        val currentUserEntry = LeaderboardEntry(
            id = 9999,
            fullName = if (userName.isBlank()) "Bạn" else userName,
            xp = userXp,
            rank = 1, // Will be recalculated
            avatarColors = listOf(Color(0xFFE91E63), Color(0xFF8A2BE2))
        )

        // Filter out any mock entry with the same name if it exists, to avoid duplicates
        val baseLeaders = DemoLearnVerseRepository.leaderboard.filter { it.fullName != userName }
        val allLeaders = baseLeaders + currentUserEntry

        return allLeaders
            .sortedByDescending { it.xp }
            .mapIndexed { index, entry ->
                entry.copy(rank = index + 1)
            }
    }

    /**
     * Gets the current rank of the user.
     */
    fun getUserRank(context: Context, userName: String): Int {
        val leaderboard = getLeaderboard(context, userName)
        return leaderboard.find { it.fullName == userName || (userName.isBlank() && it.fullName == "Bạn") }?.rank ?: 1
    }
}
