package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.NotificationType;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(nullable = false)
    private User recipient; // Người nhận thông báo

    private String title; // Tiêu đề thông báo
    private String message; // Nội dung thông báo

    @Enumerated(EnumType.STRING)
    private NotificationType type; // APPROVED, REJECTED, INFO

    private Boolean isRead = false; // Đã đọc chưa

    @ManyToOne
    private Course course; // Liên kết với course (nếu có)

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.isRead == null) {
            this.isRead = false;
        }
    }
}

