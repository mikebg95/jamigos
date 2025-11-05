package com.example.todoapp.repository;

import com.example.todoapp.model.Item;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataMongoTest
public class ItemRepositoryTest {

    @Autowired
    private ItemRepository itemRepository;

    @AfterEach
    void cleanup() {
        itemRepository.deleteAll();
    }

    @Test
    void shouldSaveAndFindItem() {
        Item item = new Item("Buy milk", "owner-123");
        itemRepository.save(item);

        var foundItem = itemRepository.findById(item.getId()).orElseThrow();
        assertThat(foundItem).isNotNull();
        assertThat(foundItem.getText()).isEqualTo("Buy milk");
        assertThat(foundItem.getOwnerId()).isEqualTo("owner-123");
    }

    @Test
    void shouldSaveAndFindItemsByOwnerId() {
        Item item1 = new Item("Buy milk", "owner-123");
        Item item2 = new Item("Take shower", "owner-123");
        Item item3 = new Item("Read article", "owner-123");
        itemRepository.save(item1);
        itemRepository.save(item2);
        itemRepository.save(item3);

        List<Item> foundItems  = itemRepository.findByOwnerId("owner-123");
        assertThat(foundItems).isNotEmpty();
        assertThat(foundItems).hasSize(3);
        assertThat(foundItems).extracting(Item::getText)
                .containsExactlyInAnyOrder("Buy milk", "Take shower", "Read article");
    }

    @Test
    void shouldSaveAndFindItemByOwnerId() {
        Item item = new Item("Read article", "owner-123");
        itemRepository.save(item);

        List<Item> foundItems  = itemRepository.findByOwnerId("owner-123");
        assertThat(foundItems).isNotNull();
        assertThat(foundItems.getFirst()).isNotNull();
        assertThat(foundItems.getFirst().getOwnerId()).isEqualTo("owner-123");
        assertThat(foundItems).extracting(Item::getText).containsExactly("Read article");
    }

    @Test
    void shouldReturnEmptyWhenNotFoundById() {
        var result = itemRepository.findById("non-existent");
        assertThat(result).isNotPresent();
    }

    @Test
    void shouldReturnEmptyWhenNotFoundByOwnerId() {
        List<Item> result = itemRepository.findByOwnerId("non-existent");
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }
}
