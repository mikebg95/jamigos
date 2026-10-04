package dev.michaelgoldman.jamigos.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    /** Origins used for local development and the Capacitor mobile shell. */
    private static final List<String> LOCAL_ORIGINS = List.of(
            "capacitor://localhost",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:8180",
            "http://127.0.0.1:8180",
            "http://localhost:8084",
            "http://127.0.0.1:8084"
    );

    /**
     * Deployed frontend origins, e.g. {@code https://app.example.com}. Set per environment
     * via {@code jamigos.cors.allowed-origins} (env var {@code JAMIGOS_CORS_ALLOWED_ORIGINS}).
     */
    @Value("${jamigos.cors.allowed-origins:}")
    private List<String> deployedOrigins = List.of();

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // If you send cookies / Authorization header across origins, keep this true
        config.setAllowCredentials(true);

        List<String> origins = new ArrayList<>(LOCAL_ORIGINS);
        deployedOrigins.stream()
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .forEach(origins::add);
        config.setAllowedOrigins(origins);

        config.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setExposedHeaders(Arrays.asList("*"));
        config.setMaxAge(3600L); // cache preflight for 1h

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}