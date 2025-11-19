# Keycloak Custom Theme - Jamigos

This directory contains the custom Keycloak theme for the Jamigos application.

## Theme Structure

```
jamigos/
├── login/              # Login, registration, forgot password pages
│   ├── theme.properties
│   └── resources/      # CSS, JS, images (optional)
├── account/            # Account management pages
│   └── theme.properties
└── email/              # Email templates
    └── theme.properties
```

## How It Works

The Jamigos theme extends Keycloak's default themes:
- **Login theme**: Extends `keycloak.v2` (Keycloak's default login theme)
- **Account theme**: Extends `keycloak.v3` (Keycloak's default account management theme)
- **Email theme**: Extends `base` (Keycloak's base email templates)

By extending the default themes, we inherit all the functionality including logout, without needing to copy template files.

## Docker Setup

The theme is mounted into the Keycloak container via `docker-compose-local.yml`:

```yaml
volumes:
  - ./keycloak-theme/jamigos:/opt/keycloak/themes/jamigos
```

## Applying the Theme

1. Start Keycloak:
   ```bash
   docker-compose -f docker-compose-local.yml up keycloak
   ```

2. Access Keycloak Admin Console:
   - URL: http://localhost:8180
   - Login with admin credentials from `.env.local`

3. Select your realm (e.g., `jamigos-realm`)

4. Go to **Realm Settings** → **Themes** tab

5. Set the themes:
   - **Login theme**: jamigos
   - **Account theme**: jamigos
   - **Email theme**: jamigos

6. Click **Save**

## Customization (Future)

To customize the theme appearance:

1. Add CSS files to `login/resources/css/`
2. Add custom images to `login/resources/img/`
3. Override specific templates by copying from Keycloak's base theme
4. Restart Keycloak to see changes (in dev mode, changes are often picked up automatically)

## Troubleshooting

**Theme not appearing in dropdown:**
- Ensure the theme is properly mounted (check `docker-compose-local.yml`)
- Restart Keycloak container: `docker-compose -f docker-compose-local.yml restart keycloak`
- Check Keycloak logs: `docker logs local-keycloak`

**Logout not working:**
- Verify you're extending the correct parent theme (`keycloak.v2`)
- Don't override templates unless necessary - let the parent theme handle functionality

## References

- [Keycloak Theme Documentation](https://www.keycloak.org/docs/latest/server_development/#_themes)
- [Keycloak Default Themes Source](https://github.com/keycloak/keycloak/tree/main/themes/src/main/resources/theme)
