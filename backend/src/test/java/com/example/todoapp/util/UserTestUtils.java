package com.example.todoapp.util;

import com.example.todoapp.model.User;

public class UserTestUtils {
    private UserTestUtils() {}

    public static User user(String keycloakId, String username, String displayName, String email) {
        return new User(keycloakId, username, displayName, email);
    }

    public static User user(String keycloakId) {
        return user(keycloakId, null, null, null);
    }
}
