package com.example.jamigos.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // If you send cookies / Authorization header across origins, keep this true
        config.setAllowCredentials(true);

        config.setAllowedOrigins(Arrays.asList(
                "https://jamigos.app",
                "https://www.jamigos.app",
                "https://todo-frontend-8y4v.onrender.com",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:8180",
                "http://127.0.0.1:8180",
                "http://localhost:8084",
                "http://127.0.0.1:8084",
                "http://51.21.192.54"
        ));

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