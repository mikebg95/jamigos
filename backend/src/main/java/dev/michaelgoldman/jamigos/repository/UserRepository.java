package dev.michaelgoldman.jamigos.repository;

import dev.michaelgoldman.jamigos.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    User findByKeycloakId(String keycloakId);
}
