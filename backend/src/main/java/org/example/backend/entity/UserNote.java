package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_notes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String type; // "STUDY_NOTE" or "STUDY_PLAN"

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "course_title")
    private String courseTitle;

    @Column(name = "lesson_title")
    private String lessonTitle;

    @Column(name = "event_date")
    private LocalDateTime eventDate; // For schedules / plans

    @Column(nullable = false)
    private String importance; // "HIGH", "MEDIUM", "LOW"

    @Column(name = "has_alarm", nullable = false)
    private Boolean hasAlarm = false;

    @Column(name = "alarm_time")
    private LocalDateTime alarmTime;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.importance == null) {
            this.importance = "MEDIUM";
        }
        if (this.hasAlarm == null) {
            this.hasAlarm = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
