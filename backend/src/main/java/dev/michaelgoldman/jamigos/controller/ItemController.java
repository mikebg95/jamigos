package dev.michaelgoldman.jamigos.controller;

import dev.michaelgoldman.jamigos.aop.LogExecutionTime;
import dev.michaelgoldman.jamigos.dto.ItemCreateRequest;
import dev.michaelgoldman.jamigos.model.Item;
import dev.michaelgoldman.jamigos.service.ItemService;
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
