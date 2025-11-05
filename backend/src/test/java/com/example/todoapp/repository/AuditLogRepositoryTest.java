package com.example.todoapp.repository;

import com.example.todoapp.model.AuditLog;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;
import java.time.Instant;
import static org.assertj.core.api.Assertions.assertThat;

@DataMongoTest
public class AuditLogRepositoryTest {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Test
    void shouldSaveAndFindAuditLog() {
        AuditLog auditLog = new AuditLog(Instant.now(), "user-123", "POST", "item456");
        auditLogRepository.save(auditLog);

        var found = auditLogRepository.findById(auditLog.getId());
        assertThat(found).isPresent();
        assertThat(found.get().getAction()).isEqualTo("POST");
        assertThat(found.get().getItemId()).isEqualTo("item456");
        assertThat(found.get().getId()).isEqualTo(auditLog.getId());
    }

    @Test
    void shouldReturnEmptyWhenNotFound() {
        var result = auditLogRepository.findById("non-existent");
        assertThat(result).isNotPresent();
    }
}
