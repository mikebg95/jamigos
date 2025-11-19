package com.example.jamigos.controller;

import com.example.jamigos.aop.LogExecutionTime;
import com.example.jamigos.dto.ItemCreateRequest;
import com.example.jamigos.model.Item;
import com.example.jamigos.service.ItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@LogExecutionTime
@RestController
@RequiredArgsConstructor
@RequestMapping("/items")
public class ItemController {
    private final ItemService itemService;

    @GetMapping
    public List<Item> getAllItemsForUser() {
        return itemService.getAllItemsForUser();
    }

    // add item
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void addItem(@Valid @RequestBody ItemCreateRequest itemCreateRequest) {
        itemService.addItem(itemCreateRequest.getText());
    }

    // delete item
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteItem(@PathVariable String id) {
        itemService.deleteItem(id);
    }

    @GetMapping("/all")
    public List<Item> getAllItemsForAdmin() {
        return itemService.getAllItemsForAdmin();
    }
}
