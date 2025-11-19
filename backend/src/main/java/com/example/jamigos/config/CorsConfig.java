package com.example.jamigos.config;

import java.util.Arrays;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        // If you don't use cookies/auth, you can set this to false.
        config.setAllowCredentials(true);

        // Allow your Vite dev server origins
        config.setAllowedOrigins(Arrays.asList(
                "https://michaelgoldman.dev",
                "https://todo-frontend-8y4v.onrender.com",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:8180",
                "http://127.0.0.1:8180",
                "http://localhost:8084",
                "http://127.0.0.1:8084",
                "http://51.21.192.54"
        ));

        // Methods & headers your frontend might use
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));         // or specify: "Content-Type", "Authorization", ...
        config.setExposedHeaders(Arrays.asList("*"));         // expose if you read custom headers client-side
        config.setMaxAge(3600L);                              // cache preflight for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
