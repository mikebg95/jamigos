package com.example.todoapp;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("${spring.profiles.active:local}")
class ActuatorSecurityTest {

    @Autowired
    TestRestTemplate rest;

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
