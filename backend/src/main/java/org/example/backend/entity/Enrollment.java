package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
@Data
@NoArgsConstructor
public class Enrollment {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Course course;

    private Double progress;

    private LocalDateTime enrollmentAt;

    @PrePersist
    protected void onCreate() {
        this.enrollmentAt = LocalDateTime.now();
        // Khi mới đăng ký, mặc định tiến độ là 0%
        if (this.progress == null) {
            this.progress = 0.0;
        }
    }

    public Enrollment(User user, Course course) {
        this.user = user;
        this.course = course;
    }
}

