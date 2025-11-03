package com.example.todoapp.repository;

import com.example.todoapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    User findByKeycloakId(String keycloakId);
}
