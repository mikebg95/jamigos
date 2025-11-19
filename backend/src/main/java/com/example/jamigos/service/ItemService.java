package com.example.jamigos.service;

import com.example.jamigos.aop.RequireOwner;
import com.example.jamigos.model.Item;
import com.example.jamigos.repository.ItemRepository;
import com.example.jamigos.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PostFilter;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ItemService {
    private final ItemRepository itemRepository;
    private final CurrentUserService currentUserService;

    @PostFilter("filterObject.ownerId == principal.claims['sub']")
    public List<Item> getAllItemsForUser() {
        return itemRepository.findAll();
    }

    public void addItem(String itemRequestText) {
        String userId = currentUserService.getUserId();
        itemRepository.save(Item.of(itemRequestText, userId));
    }

    @RequireOwner
    public void deleteItem(String id) {
        itemRepository.deleteById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<Item> getAllItemsForAdmin() {
        return itemRepository.findAll();
    }
}
