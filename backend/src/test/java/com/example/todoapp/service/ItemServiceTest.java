package com.example.todoapp.service;

import com.example.todoapp.repository.ItemRepository;
import com.example.todoapp.security.CurrentUserService;
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
