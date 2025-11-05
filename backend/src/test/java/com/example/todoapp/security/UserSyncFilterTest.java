package com.example.todoapp.security;

import com.example.todoapp.service.UserService;
import com.example.todoapp.util.JwtTestUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.io.IOException;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
public class UserSyncFilterTest {

    @Mock
    private UserService userService;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private UserSyncFilter userSyncFilter;

    private Jwt jwt;

    @BeforeEach
    void setup() {
        jwt = JwtTestUtils.jwt("kc-123", "john-doe", "John Doe", "john@doe.com");
    }

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldCallUserServiceWhenAuthenticated() throws ServletException, IOException {
        JwtAuthenticationToken jwtAuthenticationToken = new JwtAuthenticationToken(jwt);
        SecurityContextHolder.getContext().setAuthentication(jwtAuthenticationToken);

        var req = new MockHttpServletRequest();
        var res = new MockHttpServletResponse();
        userSyncFilter.doFilter(req, res, filterChain);

        verify(userService).ensureCurrentUser(jwt);
        verify(filterChain).doFilter(req, res);
    }

    @Test
    void shouldDoNothingWhenNotAuthenticated() throws ServletException, IOException {
        var req = new MockHttpServletRequest();
        var res = new MockHttpServletResponse();
        userSyncFilter.doFilter(req, res, filterChain);

        verifyNoInteractions(userService);
        verify(filterChain).doFilter(req, res);
    }
}
