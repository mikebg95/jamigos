package dev.michaelgoldman.jamigos.config;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

class ActuatorUserTest {

    private final SecurityConfig securityConfig = new SecurityConfig(null, null);
    private final PasswordEncoder delegatingEncoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();

    @Test
    void plainPasswordIsStoredBcryptEncoded() {
        UserDetails user = securityConfig.actuatorUser("ops", "s3cret").loadUserByUsername("ops");

        assertThat(user.getPassword()).startsWith("{bcrypt}").doesNotContain("s3cret");
        assertThat(delegatingEncoder.matches("s3cret", user.getPassword())).isTrue();
    }

    @Test
    void preEncodedPasswordIsUsedAsIs() {
        String encoded = "{bcrypt}" + new BCryptPasswordEncoder().encode("s3cret");

        UserDetails user = securityConfig.actuatorUser("ops", encoded).loadUserByUsername("ops");

        assertThat(user.getPassword()).isEqualTo(encoded);
        assertThat(delegatingEncoder.matches("s3cret", user.getPassword())).isTrue();
    }
}
