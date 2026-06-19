package org.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.example.backend.entity.User;
import org.example.backend.entity.UserNote;
import org.example.backend.repository.UserNoteRepository;
import org.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserNoteService {
    private final UserNoteRepository userNoteRepository;
    private final UserRepository userRepository;

    public List<UserNote> getAllNotes(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userNoteRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional
    public UserNote createUserNote(String userEmail, UserNote note) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        note.setUser(user);
        return userNoteRepository.save(note);
    }

    @Transactional
    public UserNote updateUserNote(String userEmail, Long noteId, UserNote updatedNote) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserNote existingNote = userNoteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        if (!existingNote.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to update this note");
        }

        existingNote.setTitle(updatedNote.getTitle());
        existingNote.setContent(updatedNote.getContent());
        existingNote.setType(updatedNote.getType());
        existingNote.setCourseTitle(updatedNote.getCourseTitle());
        existingNote.setLessonTitle(updatedNote.getLessonTitle());
        existingNote.setEventDate(updatedNote.getEventDate());
        existingNote.setImportance(updatedNote.getImportance());
        existingNote.setHasAlarm(updatedNote.getHasAlarm());
        existingNote.setAlarmTime(updatedNote.getAlarmTime());

        return userNoteRepository.save(existingNote);
    }

    @Transactional
    public void deleteUserNote(String userEmail, Long noteId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserNote existingNote = userNoteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Note not found"));

        if (!existingNote.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this note");
        }

        userNoteRepository.delete(existingNote);
    }
}
