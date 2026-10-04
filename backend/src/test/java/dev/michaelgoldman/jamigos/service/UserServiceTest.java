package dev.michaelgoldman.jamigos.service;

import dev.michaelgoldman.jamigos.model.User;
import dev.michaelgoldman.jamigos.repository.UserRepository;
import dev.michaelgoldman.jamigos.util.JwtTestUtils;
import dev.michaelgoldman.jamigos.util.UserTestUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private Jwt jwt;

    @BeforeEach
    void setup() {
        jwt = JwtTestUtils.jwt("kc-123", "john-doe", "John Doe", "john@doe.com");
    }

    @Test
    void shouldCreateNewUserIfUserNotExistingYet() {
        when(userRepository.findByKeycloakId("kc-123")).thenReturn(null);
        userService.ensureCurrentUser(jwt);

        verify(userRepository).findByKeycloakId("kc-123");

        // verify captured user was saved to repository
        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());

        User saved = captor.getValue();

        assertThat(saved.getKeycloakId()).isEqualTo("kc-123");
        assertThat(saved.getUsername()).isEqualTo("john-doe");
        assertThat(saved.getDisplayName()).isEqualTo("John Doe");
        assertThat(saved.getEmail()).isEqualTo("john@doe.com");
    }

    @Test
    void shouldDoNothingIfUserAlreadyExists() {
        User user = UserTestUtils.basicUser();
        when(userRepository.findByKeycloakId("kc-123")).thenReturn(user);
        userService.ensureCurrentUser(jwt);

        verify(userRepository, never()).save(any());
    }

    @Test
    void shouldUpdateUsernameIfDiffersFromExisting() {
        Jwt updatedJwt = JwtTestUtils.jwt("kc-123", "john-doe", "John Updated Doe", "john@doe.com");
        User user = UserTestUtils.basicUser();

        when(userRepository.findByKeycloakId("kc-123")).thenReturn(user);
        userService.ensureCurrentUser(updatedJwt);

        verify(userRepository).findByKeycloakId("kc-123");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());

        User saved = captor.getValue();

        assertThat(saved.getDisplayName()).isEqualTo("John Updated Doe");
    }
}
