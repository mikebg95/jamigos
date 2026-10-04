package dev.michaelgoldman.jamigos.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty("spring.security.oauth2.resourceserver.jwt.issuer-uri")
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI(
            @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}") String issuer) {

        String base = issuer.endsWith("/") ? issuer.substring(0, issuer.length()-1) : issuer;
        String authUrl  = base + "/protocol/openid-connect/auth";
        String tokenUrl = base + "/protocol/openid-connect/token";

        return new OpenAPI()
                .info(new Info().title("Todo API").version("v1"))
                .components(new Components().addSecuritySchemes("keycloak",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.OAUTH2)
                                .flows(new OAuthFlows().authorizationCode(new OAuthFlow()
                                        .authorizationUrl(authUrl)
                                        .tokenUrl(tokenUrl)
                                        .scopes(new Scopes()
                                                .addString("openid","OpenID")
                                                .addString("api.read","Read")
                                                .addString("api.write","Write"))))))
                .addSecurityItem(new SecurityRequirement().addList("keycloak"));
    }
}