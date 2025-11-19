package com.example.jamigos.repository;

import com.example.jamigos.model.User;
import com.example.jamigos.util.UserTestUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldFindUserByKeycloakId() {
        User user = UserTestUtils.basicUser();
        userRepository.save(user);

        User foundUser = userRepository.findByKeycloakId(user.getKeycloakId());
        assertThat(foundUser).isNotNull();
        assertThat(foundUser.getUsername()).isEqualTo(user.getUsername());
    }

    @Test
    void shouldReturnNullWhenUserNotFound() {
        User foundUser = userRepository.findByKeycloakId("non-existent");
        assertThat(foundUser).isNull();
    }
}
