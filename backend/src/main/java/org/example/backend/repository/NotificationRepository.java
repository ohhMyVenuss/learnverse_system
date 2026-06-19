package org.example.backend.repository;

import org.example.backend.entity.Notification;
import org.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
    List<Notification> findByRecipientAndIsReadOrderByCreatedAtDesc(User recipient, Boolean isRead);
    Long countByRecipientAndIsRead(User recipient, Boolean isRead);
}

