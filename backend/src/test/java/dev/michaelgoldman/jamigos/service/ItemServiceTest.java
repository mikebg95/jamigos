package dev.michaelgoldman.jamigos.service;

import dev.michaelgoldman.jamigos.repository.ItemRepository;
import dev.michaelgoldman.jamigos.security.CurrentUserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class ItemServiceTest {

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private ItemService itemService;

}
