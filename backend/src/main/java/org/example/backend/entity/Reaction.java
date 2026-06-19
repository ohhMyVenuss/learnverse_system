package org.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.backend.enums.ReactionType;

@Entity
@Table(name = "reactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Enumerated(EnumType.STRING)
    private ReactionType type;
    @ManyToOne
    private User user;
    @ManyToOne
    private Post post; // Reaction cho post (nullable nếu là reaction cho comment)
    @ManyToOne
    private Comment comment; // Reaction cho comment (nullable nếu là reaction cho post)
}
