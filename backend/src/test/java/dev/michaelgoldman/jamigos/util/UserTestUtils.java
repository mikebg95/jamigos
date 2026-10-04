package dev.michaelgoldman.jamigos.util;

import dev.michaelgoldman.jamigos.model.User;

public class UserTestUtils {
    private UserTestUtils() {}

    public static User user(String keycloakId, String username, String displayName, String email) {
        return new User(keycloakId, username, displayName, email);
    }

    public static User user(String keycloakId) {
        return user(keycloakId, null, null, null);
    }

    public static User basicUser() {
        return new User("kc-123", "john-doe", "John Doe", "john@doe.com");
    }
}
