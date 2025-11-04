package com.example.todoapp;

import com.example.todoapp.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.assertj.core.api.Assertions.assertThat;

class ActuatorSecurityTest extends AbstractIntegrationTest {

    @MockitoBean UserService userService;
    @MockitoBean JwtDecoder jwtDecoder;

    @Autowired TestRestTemplate rest;

    @Test
    void health_isPublic() {
        var resp = rest.getForEntity("/actuator/health", String.class);
        assertThat(resp.getStatusCode().value()).isEqualTo(200);
    }

    @Test
    void info_requiresAuth() {
        var resp = rest.getForEntity("/actuator/info", String.class);
        assertThat(resp.getStatusCode().value()).isEqualTo(401);
    }

    @Test
    void info_allowsWithBasicAuth() {
        var authed = rest.withBasicAuth("admin", "admin");
        var resp = authed.getForEntity("/actuator/info", String.class);
        assertThat(resp.getStatusCode().value()).isEqualTo(200);
    }
}