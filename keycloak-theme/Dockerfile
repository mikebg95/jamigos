FROM quay.io/keycloak/keycloak:25.0

# Copy custom themes
COPY jamigos /opt/keycloak/themes/jamigos
COPY jamigos-mobile /opt/keycloak/themes/jamigos-mobile

CMD ["start-dev"]