package com.example.todoapp.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "items") // mongodb collection name
public class Item {
    @Id
    private String id;

    @NotBlank
    private String text;

    @Indexed
    private String ownerId;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public Item(String text) {
        this.text = text;
    }
    public Item(String text, String ownerId) {
        this.text = text;
        this.ownerId = ownerId;
    }

    public static Item of(String text, String ownerId) {
        return new Item(text, ownerId);
    }

    @Override
    public String toString() {
        return "Item{" +
                "id='" + id + '\'' +
                ", text='" + text + '\'' +
                ", ownerId='" + ownerId + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
