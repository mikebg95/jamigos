# Jamigos Theme Setup Guide

## Quick Setup

Your custom Keycloak theme "jamigos" is now ready! Follow these steps to apply it:

### 1. Access Keycloak Admin Console

Open http://localhost:8180 in your browser and log in with your admin credentials.

### 2. Navigate to Realm Settings

1. Select your realm (`jamigos-realm`) from the dropdown in the top-left corner
2. Click on **Realm Settings** in the left sidebar
3. Click on the **Themes** tab

### 3. Apply the Jamigos Theme

Set the following dropdowns:

- **Login theme**: `jamigos`
- **Account theme**: `jamigos`
- **Email theme**: `jamigos`
- **Admin console theme**: Leave as default (or choose your preference)

Click **Save** at the bottom of the page.

### 4. Test the Theme

#### Test Login:
1. Open your application (http://localhost:5173)
2. Click the login button
3. You should see the Keycloak login page (will look identical to default for now)
4. Log in with your credentials

#### Test Logout:
1. Once logged in to your application
2. Click the logout button
3. Verify you are successfully logged out and redirected appropriately

### 5. Verify Theme is Active

To confirm the theme is being used:

1. In Keycloak Admin Console, go to **Realm Settings** → **Themes**
2. Verify "jamigos" is selected for Login, Account, and Email themes
3. Try logging out and back in to see the theme in action

## Troubleshooting

### Theme not appearing in dropdown

If "jamigos" doesn't appear in the theme dropdowns:

1. Check Keycloak container logs:
   ```bash
   docker logs local-keycloak
   ```

2. Verify the theme is mounted:
   ```bash
   docker exec local-keycloak ls -la /opt/keycloak/themes/jamigos/
   ```

3. Restart Keycloak:
   ```bash
   docker-compose -f docker-compose-local.yml restart keycloak
   ```

### Logout not working

The jamigos theme extends Keycloak's default theme (`keycloak.v2`), so all functionality including logout should work exactly as before. If logout breaks:

1. Verify `login/theme.properties` contains `parent=keycloak.v2`
2. Make sure you haven't overridden any template files
3. Check browser console for JavaScript errors
4. Check Keycloak logs for errors

### Changes not appearing

Keycloak caches themes. To force reload:

1. Clear browser cache
2. Restart Keycloak container
3. In development mode, Keycloak usually picks up theme changes automatically

## Next Steps: Customization

Once you've verified the theme works, you can customize it:

1. **Add custom CSS**: Create `login/resources/css/custom.css`
2. **Add logo**: Put your logo in `login/resources/img/logo.png`
3. **Override templates**: Copy templates from Keycloak's base theme and modify
4. **Customize messages**: Create `login/messages/messages_en.properties`

See the main [README.md](README.md) for more details on customization.

## Current Theme Status

✅ Login theme extends keycloak.v2
✅ Account theme extends keycloak.v3
✅ Email theme extends base
✅ Theme mounted in Docker container
✅ No custom styling (uses default appearance)
✅ All functionality preserved (including logout)

The theme is currently a 1:1 copy of Keycloak's default themes, ready for customization when needed.
