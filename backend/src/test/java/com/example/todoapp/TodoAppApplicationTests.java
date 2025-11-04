package com.example.todoapp;

import com.example.todoapp.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

class TodoAppApplicationTests extends AbstractIntegrationTest {

    @MockitoBean UserService userService;
    @MockitoBean JwtDecoder jwtDecoder;

    @Test
    void contextLoads() { }
}