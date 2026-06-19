package com.vku.learnverse.data

import android.content.Context
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.TemporalAdjusters

object StreakManager {
    private const val PREF_NAME = "streak_prefs"
    private const val KEY_STUDY_DATES = "study_dates"
    private val formatter = DateTimeFormatter.ISO_LOCAL_DATE

    /**
     * Records study activity for the current day.
     */
    fun recordStudyActivity(context: Context) {
        val prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        val todayStr = LocalDate.now().format(formatter)
        val dates = prefs.getStringSet(KEY_STUDY_DATES, emptySet())?.toMutableSet() ?: mutableSetOf()
        if (dates.add(todayStr)) {
            prefs.edit().putStringSet(KEY_STUDY_DATES, dates).apply()
        }
    }

    /**
     * Checks if study activity is recorded for today.
     */
    fun isDailyQuestCompleted(context: Context): Boolean {
        val prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        val todayStr = LocalDate.now().format(formatter)
        val dates = prefs.getStringSet(KEY_STUDY_DATES, emptySet()) ?: emptySet()
        return dates.contains(todayStr)
    }

    /**
     * Returns completion status (Boolean) for each day of the current week (Monday to Sunday).
     */
    fun getWeeklyStreakDays(context: Context): List<Boolean> {
        val prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        val dates = prefs.getStringSet(KEY_STUDY_DATES, emptySet()) ?: emptySet()
        
        val today = LocalDate.now()
        // Get Monday of the current week
        val monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
        
        return (0..6).map { i ->
            val day = monday.plusDays(i.toLong())
            dates.contains(day.format(formatter))
        }
    }

    /**
     * Calculates the current consecutive days streak count ending today or yesterday.
     */
    fun getStreakCount(context: Context): Int {
        val prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        val dates = prefs.getStringSet(KEY_STUDY_DATES, emptySet()) ?: emptySet()
        if (dates.isEmpty()) return 0

        var streak = 0
        var checkDate = LocalDate.now()

        // If today is not in the set, check starting from yesterday
        if (!dates.contains(checkDate.format(formatter))) {
            checkDate = checkDate.minusDays(1)
        }

        while (dates.contains(checkDate.format(formatter))) {
            streak++
            checkDate = checkDate.minusDays(1)
        }

        return streak
    }
}
