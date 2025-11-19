package com.example.jamigos.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "audit_logs")
public class AuditLog {
    @Id
    private String id;
    private Instant timestamp;
    private String userId;
    private String action;
    private String itemId;

    public AuditLog(Instant timestamp, String userId, String action, String itemId) {
        this.timestamp = timestamp;
        this.userId = userId;
        this.action = action;
        this.itemId = itemId;
    }
}
