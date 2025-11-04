package com.example.todoapp.util;

import com.example.todoapp.model.User;

public class UserTestUtil {
    private UserTestUtil() {}

    public static User user(String keycloakId, String username, String displayName, String email) {
        return new User(keycloakId, username, displayName, email);
    }
}
