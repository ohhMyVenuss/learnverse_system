package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.entity.Lesson;
import org.example.backend.entity.Note;
import org.example.backend.entity.User;
import org.example.backend.repository.LessonRepository;
import org.example.backend.repository.NoteRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NoteService {
    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;

    /**
     * Lấy hoặc tạo note cho user và lesson
     */
    @Transactional
    public Note getOrCreateNote(String userEmail, Long lessonId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        Optional<Note> existingNote = noteRepository.findByUserAndLesson(user, lesson);
        if (existingNote.isPresent()) {
            return existingNote.get();
        }

        // Tạo note mới nếu chưa có
        Note note = new Note();
        note.setUser(user);
        note.setLesson(lesson);
        note.setContent("");
        return noteRepository.save(note);
    }

    /**
     * Lấy note của user cho một lesson
     */
    public Note getNote(String userEmail, Long lessonId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        return noteRepository.findByUserAndLesson(user, lesson)
                .orElseThrow(() -> new RuntimeException("Note not found"));
    }

    /**
     * Cập nhật nội dung note
     */
    @Transactional
    public Note updateNote(String userEmail, Long lessonId, String content) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));

        Note note = noteRepository.findByUserAndLesson(user, lesson)
                .orElseGet(() -> {
                    Note newNote = new Note();
                    newNote.setUser(user);
                    newNote.setLesson(lesson);
                    return newNote;
                });

        note.setContent(content);
        return noteRepository.save(note);
    }

    /**
     * Lấy tất cả notes của user trong một course
     */
    public List<Note> getNotesByCourse(String userEmail, Long courseId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return noteRepository.findByUserAndLessonCourseIdOrderByCreatedAtDesc(user, courseId);
    }

    /**
     * Lấy tất cả notes của user
     */
    public List<Note> getAllNotes(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return noteRepository.findByUserOrderByCreatedAtDesc(user);
    }

    /**
     * Xóa note
     */
    @Transactional
    public void deleteNote(String userEmail, Long noteId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        if (!note.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to delete this note");
        }

        noteRepository.delete(note);
    }
}

