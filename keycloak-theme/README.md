# TaskFlow Keycloak Theme

A custom Keycloak theme that matches the TaskFlow app design system with warm, modern styling and light/dark theme support.

## 🎨 Features

- **Design System Integration**: Uses the same color tokens, spacing, and styling as the main TaskFlow Vue app
- **Light & Dark Themes**: Automatic theme detection from system preferences or localStorage
- **Modern UI**: Warm orange/teal color palette, rounded corners, soft shadows
- **Fully Responsive**: Works beautifully on mobile, tablet, and desktop
- **Accessible**: WCAG compliant with proper focus states and ARIA labels
- **Smooth Animations**: Fade-in/scale-in effects for card and form elements

## 📁 Structure

```
taskflow/
├── theme.properties          # Theme configuration
└── login/
    ├── template.ftl          # Base layout template
    ├── login.ftl             # Login page
    ├── register.ftl          # Registration page
    ├── login-reset-password.ftl     # Forgot password
    ├── login-update-password.ftl    # Update password
    ├── error.ftl             # Error page
    ├── info.ftl              # Info page
    └── resources/
        └── css/
            ├── _tokens.scss         # Design system tokens
            ├── design-system.scss   # Theme CSS variables & keyframes
            ├── design-system.css    # Compiled CSS
            ├── auth.scss            # Auth page components
            └── auth.css             # Compiled CSS
```

## 🚀 Deployment

### Option 1: Docker Volume Mount (Recommended for Development)

1. **Update docker-compose-local.yml**:

```yaml
keycloak:
  image: quay.io/keycloak/keycloak:25.0
  container_name: local-keycloak
  ports: ["8180:8080"]
  environment:
    KEYCLOAK_ADMIN: ${KEYCLOAK_ADMIN}
    KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD}
    KC_HOSTNAME: localhost
    KC_HTTP_ENABLED: "true"
  command: ["start-dev"]
  volumes:
    - keycloak-data:/opt/keycloak/data
    - ./keycloak-theme/taskflow:/opt/keycloak/themes/taskflow  # Mount theme
```

2. **Restart Keycloak**:

```bash
docker-compose -f docker-compose-local.yml down
docker-compose -f docker-compose-local.yml up -d keycloak
```

3. **Configure in Keycloak Admin**:
   - Go to http://localhost:8180
   - Login with admin credentials
   - Navigate to your realm (e.g., `todo-app`)
   - Go to **Realm Settings** → **Themes** tab
   - Set **Login theme** to `taskflow`
   - Click **Save**

### Option 2: Build Custom Keycloak Image (Production)

1. **Create Dockerfile**:

```dockerfile
FROM quay.io/keycloak/keycloak:25.0

COPY keycloak-theme/taskflow /opt/keycloak/themes/taskflow

CMD ["start"]
```

2. **Build and push**:

```bash
docker build -t your-registry/keycloak:custom .
docker push your-registry/keycloak:custom
```

### Option 3: JAR Deployment

1. **Create theme JAR**:

```bash
cd keycloak-theme
jar -cvf taskflow-theme.jar -C taskflow .
```

2. **Copy to Keycloak**:

```bash
# If using Docker
docker cp taskflow-theme.jar local-keycloak:/opt/keycloak/providers/
docker restart local-keycloak
```

## 🔧 Development

### Compiling SCSS

The SCSS files are already compiled, but if you make changes:

```bash
cd keycloak-theme/taskflow/login/resources/css

# Compile design-system
npx sass design-system.scss design-system.css --no-source-map

# Compile auth styles
npx sass auth.scss auth.css --no-source-map
```

### Hot Reload

In `theme.properties`, set:

```properties
cacheThemes=false
cacheTemplates=false
```

This allows you to see changes immediately without restarting Keycloak (though you'll need to hard-refresh your browser).

### Theme Switching

The theme automatically detects:
1. `localStorage.getItem('app-theme')` from your main app
2. System preference `prefers-color-scheme`
3. Falls back to `light`

To sync with your main app, ensure both use the same localStorage key.

## 🎨 Customization

### Colors

Edit `resources/css/_tokens.scss`:

```scss
$ds-colors-light: (
  'primary': #F9A548,        // Change primary color
  'secondary': #0EB3A7,      // Change secondary color
  // ...
);
```

Then recompile:

```bash
npx sass design-system.scss design-system.css --no-source-map
npx sass auth.scss auth.css --no-source-map
```

### Logo

Replace the SVG in `template.ftl`:

```html
<div class="ds-auth-logo">
    <!-- Replace this SVG with your logo -->
    <svg>...</svg>
</div>
```

Or use an image:

```html
<div class="ds-auth-logo">
    <img src="${url.resourcesPath}/img/logo.png" alt="Logo" />
</div>
```

### Layout

Modify `resources/css/auth.scss`:

```scss
.ds-auth-card {
  max-width: 440px;  // Change card width
  // ...
}
```

## 📝 Available Pages

The theme includes templates for:

- ✅ **Login** (`login.ftl`)
- ✅ **Registration** (`register.ftl`)
- ✅ **Forgot Password** (`login-reset-password.ftl`)
- ✅ **Update Password** (`login-update-password.ftl`)
- ✅ **Error** (`error.ftl`)
- ✅ **Info** (`info.ftl`)

Additional pages can be created following the same pattern.

## 🎯 Component Classes

### Buttons

```html
<button class="ds-auth-button">Primary Button</button>
<button class="ds-auth-button secondary">Secondary Button</button>
<button class="ds-auth-button loading">Loading...</button>
```

### Inputs

```html
<input type="text" class="ds-auth-input" />
<input type="text" class="ds-auth-input error" /> <!-- Error state -->
```

### Messages

```html
<div class="ds-auth-message error">Error message</div>
<div class="ds-auth-message success">Success message</div>
<div class="ds-auth-message warning">Warning message</div>
<div class="ds-auth-message info">Info message</div>
```

### Links

```html
<a href="#" class="ds-auth-link">Text Link</a>
```

## 🐛 Troubleshooting

### Theme not appearing

1. Check volume mount in docker-compose
2. Verify theme is selected in Keycloak admin
3. Clear browser cache
4. Check Keycloak logs: `docker logs local-keycloak`

### Styles not loading

1. Ensure CSS files are compiled
2. Check `theme.properties` has correct CSS paths
3. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)

### Theme switching not working

1. Verify `data-theme` attribute on `<html>` element
2. Check browser console for JavaScript errors
3. Ensure localStorage key matches main app

## 📚 Resources

- [Keycloak Theme Documentation](https://www.keycloak.org/docs/latest/server_development/#_themes)
- [Freemarker Template Language](https://freemarker.apache.org/docs/)
- [TaskFlow Design System](/frontend/DESIGN_SYSTEM.md)

## 📄 License

Matches parent project license.
