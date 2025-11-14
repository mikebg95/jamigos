FROM quay.io/keycloak/keycloak:25.0

# Copy custom theme into the Keycloak themes directory
COPY taskflow /opt/keycloak/themes/taskflow

# Set environment variables for production
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

# Run Keycloak in production mode
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
