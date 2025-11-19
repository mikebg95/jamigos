package com.example.jamigos.service;

import com.example.jamigos.repository.ItemRepository;
import com.example.jamigos.security.CurrentUserService;
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
