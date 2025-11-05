package com.example.todoapp.repository;

import com.example.todoapp.model.Item;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends MongoRepository<Item, String> {
    List<Item> findByOwnerId(String ownerId);
    boolean existsByIdAndOwnerId(String id, String ownerId);
}
