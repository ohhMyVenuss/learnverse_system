package com.vku.learnverse.data

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.vku.learnverse.data.model.UserNoteDto
import com.vku.learnverse.data.api.ApiService
import com.vku.learnverse.data.alarm.AlarmScheduler
import java.time.LocalDateTime

enum class NoteType {
    FLASHCARD,
    QUIZ,
    STUDY_NOTE,
    STUDY_PLAN
}

data class SavedNote(
    val id: String, // Local unique ID or server id
    val type: NoteType,
    val title: String,
    val content: String,
    val courseTitle: String = "",
    val lessonTitle: String = "",
    val eventDate: String? = null, // "yyyy-MM-dd'T'HH:mm:ss"
    val importance: String = "MEDIUM", // "HIGH", "MEDIUM", "LOW"
    val hasAlarm: Boolean = false,
    val alarmTime: String? = null, // "yyyy-MM-dd'T'HH:mm:ss"
    val timestamp: Long = System.currentTimeMillis()
)

object NotesManager {
    private const val PREFS_NAME = "learnverse_notes"
    private const val KEY_NOTES = "saved_notes"
    private val gson = Gson()

    fun getNotes(context: Context): List<SavedNote> {
        val sp = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val json = sp.getString(KEY_NOTES, null) ?: return emptyList()
        return try {
            val type = object : TypeToken<List<SavedNote>>() {}.type
            gson.fromJson<List<SavedNote>>(json, type) ?: emptyList()
        } catch (e: Exception) {
            emptyList()
        }
    }

    fun saveNoteLocalOnly(context: Context, note: SavedNote) {
        val currentNotes = getNotes(context).toMutableList()
        currentNotes.removeAll { it.id == note.id }
        currentNotes.add(0, note)
        persistNotes(context, currentNotes)

        // Handle alarm scheduling
        if (note.type == NoteType.STUDY_PLAN && note.hasAlarm && !note.alarmTime.isNullOrBlank()) {
            scheduleAlarmHelper(context, note)
        } else {
            note.id.toLongOrNull()?.let {
                AlarmScheduler.cancelAlarm(context, it)
            }
        }
    }

    fun saveNote(context: Context, note: SavedNote) {
        saveNoteLocalOnly(context, note)
    }

    fun deleteNoteLocalOnly(context: Context, noteId: String) {
        val currentNotes = getNotes(context).toMutableList()
        currentNotes.removeAll { it.id == noteId }
        persistNotes(context, currentNotes)

        noteId.toLongOrNull()?.let {
            AlarmScheduler.cancelAlarm(context, it)
        }
    }

    fun deleteNote(context: Context, noteId: String) {
        deleteNoteLocalOnly(context, noteId)
    }

    private fun persistNotes(context: Context, notes: List<SavedNote>) {
        val json = gson.toJson(notes)
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_NOTES, json)
            .apply()
    }

    private fun scheduleAlarmHelper(context: Context, note: SavedNote) {
        try {
            val time = LocalDateTime.parse(note.alarmTime)
            val zonedDateTime = time.atZone(java.time.ZoneId.systemDefault())
            val triggerTime = zonedDateTime.toInstant().toEpochMilli()
            val noteIdLong = note.id.toLongOrNull() ?: note.timestamp
            
            if (triggerTime > System.currentTimeMillis()) {
                AlarmScheduler.scheduleAlarm(
                    context,
                    noteIdLong,
                    triggerTime,
                    "Lịch nhắc: ${note.title}",
                    note.content
                )
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun saveNoteRemote(context: Context, apiService: ApiService, note: SavedNote): Boolean {
        return try {
            val dto = UserNoteDto(
                id = if (note.id == "0" || note.id.isBlank()) null else note.id.toLongOrNull(),
                type = note.type.name,
                title = note.title,
                content = note.content,
                courseTitle = note.courseTitle,
                lessonTitle = note.lessonTitle,
                eventDate = note.eventDate,
                importance = note.importance,
                hasAlarm = note.hasAlarm,
                alarmTime = note.alarmTime
            )
            val res = if (dto.id != null && dto.id > 0) {
                apiService.updateUserNote(dto.id, dto)
            } else {
                apiService.createUserNote(dto)
            }
            if (res.isSuccessful && res.body() != null) {
                val returnedDto = res.body()!!
                val updatedNote = note.copy(id = returnedDto.id.toString())
                saveNoteLocalOnly(context, updatedNote)
                true
            } else {
                android.util.Log.e("NotesManager", "saveNoteRemote failed: ${res.errorBody()?.string()}")
                saveNoteLocalOnly(context, note)
                false
            }
        } catch (e: Exception) {
            android.util.Log.e("NotesManager", "saveNoteRemote exception", e)
            saveNoteLocalOnly(context, note)
            false
        }
    }

    suspend fun deleteNoteRemote(context: Context, apiService: ApiService, noteId: String): Boolean {
        val idLong = noteId.toLongOrNull()
        if (idLong == null || idLong <= 0) {
            deleteNoteLocalOnly(context, noteId)
            return true
        }
        return try {
            val res = apiService.deleteUserNote(idLong)
            if (res.isSuccessful) {
                deleteNoteLocalOnly(context, noteId)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            false
        }
    }

    suspend fun syncWithBackend(context: Context, apiService: ApiService) {
        try {
            val response = apiService.getUserNotes()
            if (response.isSuccessful && response.body() != null) {
                val serverNotes = response.body()!!
                val mappedNotes = serverNotes.map { dto ->
                    SavedNote(
                        id = dto.id?.toString() ?: "server_${dto.createdAt}",
                        type = when (dto.type) {
                            "STUDY_PLAN" -> NoteType.STUDY_PLAN
                            "STUDY_NOTE" -> NoteType.STUDY_NOTE
                            "FLASHCARD" -> NoteType.FLASHCARD
                            "QUIZ" -> NoteType.QUIZ
                            else -> NoteType.STUDY_NOTE
                        },
                        title = dto.title,
                        content = dto.content ?: "",
                        courseTitle = dto.courseTitle ?: "",
                        lessonTitle = dto.lessonTitle ?: "",
                        eventDate = dto.eventDate,
                        importance = dto.importance,
                        hasAlarm = dto.hasAlarm,
                        alarmTime = dto.alarmTime,
                        timestamp = dto.id ?: System.currentTimeMillis()
                    )
                }
                persistNotes(context, mappedNotes)

                // Reschedule active alarms
                mappedNotes.forEach { note ->
                    if (note.type == NoteType.STUDY_PLAN && note.hasAlarm && !note.alarmTime.isNullOrBlank()) {
                        scheduleAlarmHelper(context, note)
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
