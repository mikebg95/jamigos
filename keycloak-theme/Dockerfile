FROM quay.io/keycloak/keycloak:25.0

# Copy custom theme
COPY jamigos /opt/keycloak/themes/jamigos

# Use start-dev for simpler deployment (no external DB required)
# For production, you would use "start" with proper DB configuration
CMD ["start-dev"]
