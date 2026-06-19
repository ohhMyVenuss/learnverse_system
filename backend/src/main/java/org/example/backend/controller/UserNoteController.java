package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.entity.UserNote;
import org.example.backend.service.UserNoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/user-notes")
@RequiredArgsConstructor
public class UserNoteController {
    private final UserNoteService userNoteService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UserNote>> getAllNotes(Principal principal) {
        return ResponseEntity.ok(userNoteService.getAllNotes(principal.getName()));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserNote> createUserNote(@RequestBody UserNote note, Principal principal) {
        return ResponseEntity.ok(userNoteService.createUserNote(principal.getName(), note));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserNote> updateUserNote(
            @PathVariable Long id,
            @RequestBody UserNote note,
            Principal principal) {
        return ResponseEntity.ok(userNoteService.updateUserNote(principal.getName(), id, note));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteUserNote(@PathVariable Long id, Principal principal) {
        userNoteService.deleteUserNote(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
