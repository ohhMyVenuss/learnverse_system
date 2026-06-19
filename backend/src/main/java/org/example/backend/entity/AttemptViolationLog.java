package org.example.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.ViolationType;

import java.nio.MappedByteBuffer;
import java.time.LocalDateTime;

@Entity
@Table(name = "attempt_violation_logs")@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttemptViolationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id")
    private QuizAttempt quizAttempt;

    @Enumerated(EnumType.STRING)
    private ViolationType violationType;

    private LocalDateTime violationTime;

    private String message;

    @PrePersist
    protected void onCreate() {
        if (this.violationTime == null) {
            this.violationTime = LocalDateTime.now();
        }
    }

}
