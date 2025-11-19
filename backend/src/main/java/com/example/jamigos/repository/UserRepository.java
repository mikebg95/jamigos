package com.example.jamigos.repository;

import com.example.jamigos.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    User findByKeycloakId(String keycloakId);
}
