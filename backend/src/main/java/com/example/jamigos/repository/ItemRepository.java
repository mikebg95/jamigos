package com.example.jamigos.repository;

import com.example.jamigos.model.Item;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends MongoRepository<Item, String> {
    List<Item> findByOwnerId(String ownerId);
    boolean existsByIdAndOwnerId(String id, String ownerId);
}
