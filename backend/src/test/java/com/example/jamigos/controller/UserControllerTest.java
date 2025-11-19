package com.example.jamigos.controller;

import com.example.jamigos.service.UserService;
import com.example.jamigos.util.JwtTestUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    private Jwt jwt;

    @BeforeEach
    void setup() {
        jwt = JwtTestUtils.jwt("kc-123", "john-doe", "John Doe", "john@doe.com");
    }

    @Test
    void shouldSyncCurrentUserWhenAuthenticated() throws Exception {
        mockMvc.perform(post("/users/sync").with(jwt().jwt(jwt)))
                .andExpect(status().isOk());

        verify(userService).ensureCurrentUser(any());
    }
}
