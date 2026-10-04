package dev.michaelgoldman.jamigos.service;

import dev.michaelgoldman.jamigos.model.User;
import dev.michaelgoldman.jamigos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    @Transactional
    public void ensureCurrentUser(Jwt jwt) {
        String keycloakId = jwt.getSubject();
        String username = jwt.getClaimAsString("preferred_username");
        String displayName = jwt.getClaimAsString("name");
        String email = jwt.getClaimAsString("email");

        User existingUser = userRepository.findByKeycloakId(keycloakId);

        // if user does not exist yet
         if (existingUser == null) {
             User user = new User(keycloakId, username, displayName, email);
             userRepository.save(user);

             log.info("[UserSync] New user added: {}", username);
         }
         else {
             // update info if changed
             boolean changed = false;

             if (!existingUser.getDisplayName().equals(displayName)) {
                 existingUser.setDisplayName(displayName);
                 changed = true;
             }

             if (!existingUser.getEmail().equals(email)) {
                 existingUser.setEmail(email);
                 changed = true;
             }

             if (!existingUser.getUsername().equals(username)) {
                 existingUser.setUsername(username);
                 changed = true;
             }

             if (changed) {
                 userRepository.save(existingUser);
                 log.info("[UserSync] User updated: {}", username);
             }
         }
    }
}
