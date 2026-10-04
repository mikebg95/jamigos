package dev.michaelgoldman.jamigos.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class JwtAuthConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private static final String RESOURCE_ACCESS = "resource_access";
    private static final String REALM_ACCESS = "realm_access";
    private static final String ROLES = "roles";

    // keycloak backend client ID
    private final String clientId = "jamigos-client";

    @Override
    public AbstractAuthenticationToken convert(@NonNull Jwt jwt) {
        Collection<GrantedAuthority> authorities = extractRoles(jwt);

        return new JwtAuthenticationToken(jwt, authorities, jwt.getSubject());
    }

    private Collection<GrantedAuthority> extractRoles(Jwt jwt) {
        Set<String> roles = new HashSet<>();

        // 1) client roles
        Map<String, Object> resourceAccess = jwt.getClaim(RESOURCE_ACCESS);
        if (resourceAccess != null && resourceAccess.get(clientId) instanceof Map<?, ?> clientData) {
            Object clientRoles = clientData.get(ROLES);
            if (clientRoles instanceof Collection<?> r) {
                r.forEach(role -> roles.add(role.toString()));
            }
        }

        // 2) realm roles
        Map<String, Object> realmAccess = jwt.getClaim(REALM_ACCESS);
        if (realmAccess != null && realmAccess.get(ROLES) instanceof Collection<?> r) {
            r.forEach(role -> roles.add(role.toString()));
        }

        // 3) prefix with ROLE_
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                .collect(Collectors.toSet());
    }
}
