package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.entity.Note;
import org.example.backend.service.NoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class  NoteController {
    private final NoteService noteService;

    /**
     * Lấy hoặc tạo note cho lesson
     */
    @GetMapping("/lesson/{lessonId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Note> getOrCreateNote(@PathVariable Long lessonId, Principal principal) {
        return ResponseEntity.ok(noteService.getOrCreateNote(principal.getName(), lessonId));
    }

    /**
     * Cập nhật note
     */
    @PutMapping("/lesson/{lessonId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Note> updateNote(
            @PathVariable Long lessonId,
            @RequestBody Map<String, String> request,
            Principal principal) {
        String content = request.get("content");
        return ResponseEntity.ok(noteService.updateNote(principal.getName(), lessonId, content));
    }

    /**
     * Lấy tất cả notes của user trong một course
     */
    @GetMapping("/course/{courseId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Note>> getNotesByCourse(@PathVariable Long courseId, Principal principal) {
        return ResponseEntity.ok(noteService.getNotesByCourse(principal.getName(), courseId));
    }

    /**
     * Lấy tất cả notes của user
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Note>> getAllNotes(Principal principal) {
        return ResponseEntity.ok(noteService.getAllNotes(principal.getName()));
    }

    /**
     * Xóa note
     */
    @DeleteMapping("/{noteId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> deleteNote(@PathVariable Long noteId, Principal principal) {
        noteService.deleteNote(principal.getName(), noteId);
        return ResponseEntity.ok("Note deleted successfully");
    }
}

