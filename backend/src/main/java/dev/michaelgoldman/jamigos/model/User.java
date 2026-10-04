package dev.michaelgoldman.jamigos.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true)
    private String keycloakId;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String displayName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    @CreatedDate
    private Instant createdAt;

    @Column(nullable = false)
    @CreatedDate
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() { this.updatedAt = Instant.now(); }

    public User(String keycloakId, String username, String displayName, String email) {
        this.keycloakId = keycloakId;
        this.username = username;
        this.displayName = displayName;
        this.email = email;
    }
}
