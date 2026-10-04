package dev.michaelgoldman.jamigos.repository;

import dev.michaelgoldman.jamigos.model.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {
}
