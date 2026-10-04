package dev.michaelgoldman.jamigos.util;


import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

public class JwtTestUtils {
    private JwtTestUtils() {}

    public static Jwt jwt(String sub, String username, String name, String email ) {
        Map<String, Object> claims = new HashMap<>();

        claims.put("sub", sub);
        claims.put("preferred_username", username);
        claims.put("name", name);
        claims.put("email", email);

        return Jwt.withTokenValue("test-token")
                .headers(h -> h.put("alg", "none"))
                .claims(c -> c.putAll(claims))
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();
    }

    public static Jwt jwt(String sub) {
        return jwt(sub, null, null, null);
    }
}
