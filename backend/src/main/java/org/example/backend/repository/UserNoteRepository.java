package org.example.backend.repository;

import org.example.backend.entity.User;
import org.example.backend.entity.UserNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserNoteRepository extends JpaRepository<UserNote, Long> {
    List<UserNote> findByUserOrderByCreatedAtDesc(User user);
}
