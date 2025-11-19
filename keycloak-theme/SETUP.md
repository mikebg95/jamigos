# Keycloak Theme Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Start Keycloak with Theme

The theme is already mounted in your docker-compose file. Just restart Keycloak:

```bash
cd /Users/michaelgoldman/Projects/jamigos

# Stop Keycloak
docker-compose -f docker-compose-local.yml stop keycloak

# Start Keycloak (theme will be auto-mounted)
docker-compose -f docker-compose-local.yml up -d keycloak

# Watch logs to ensure it started
docker logs -f local-keycloak
```

### Step 2: Configure Theme in Keycloak Admin

1. **Open Keycloak Admin**: http://localhost:8180
   - Username: (from your `.env.local` KEYCLOAK_ADMIN)
   - Password: (from your `.env.local` KEYCLOAK_ADMIN_PASSWORD)

2. **Select your realm**:
   - Click on the realm dropdown (top left)
   - Select `todo-app` (or your realm name)

3. **Enable the theme**:
   - Go to **Realm Settings** (left sidebar)
   - Click **Themes** tab
   - Under **Login theme**, select `taskflow` from dropdown
   - Click **Save**

4. **Test it out**:
   - Open your app: http://localhost:5173
   - Click **Login** or **Sign Up**
   - You should see the new styled auth pages!

### Step 3: Verify Theme is Working

Visit the login page directly:
```
http://localhost:8180/realms/todo-app/protocol/openid-connect/auth?client_id=jamigos-client&redirect_uri=http://localhost:5173&response_type=code&scope=openid
```

You should see:
- ✅ Warm cream background (light mode) or dark charcoal (dark mode)
- ✅ Centered card with rounded corners
- ✅ Orange primary buttons
- ✅ Teal accents
- ✅ Smooth animations

---

## 🎨 Theme Customization

### Change Colors

Edit: `keycloak-theme/taskflow/login/resources/css/_tokens.scss`

```scss
$ds-colors-light: (
  'primary': #YourColor,    // Change this
  'secondary': #YourColor,  // And this
  // ...
);
```

Then recompile:

```bash
cd keycloak-theme/taskflow/login/resources/css
npx sass design-system.scss design-system.css --no-source-map
npx sass auth.scss auth.css --no-source-map
```

Refresh Keycloak (no restart needed with `cacheThemes=false`).

### Add Your Logo

Edit: `keycloak-theme/taskflow/login/template.ftl`

Replace line ~45-50 with your logo:

```html
<div class="ds-auth-logo">
    <img src="${url.resourcesPath}/img/your-logo.png" alt="TaskFlow" />
</div>
```

Add your logo image to:
```
keycloak-theme/taskflow/login/resources/img/your-logo.png
```

### Customize Layout

Edit: `keycloak-theme/taskflow/login/resources/css/auth.scss`

Common changes:

```scss
// Card width
.ds-auth-card {
  max-width: 500px; // Change from 440px
}

// Button style
.ds-auth-button {
  border-radius: var(--ds-radius-pill); // Make pill-shaped
}

// Add gradient background
.ds-auth-bg {
  background: linear-gradient(135deg, var(--ds-color-primary), var(--ds-color-secondary));
}
```

---

## 🔄 Development Workflow

### Making Changes

1. **Edit files** in `keycloak-theme/taskflow/`
2. **Recompile SCSS** (if you changed .scss files):
   ```bash
   cd keycloak-theme/taskflow/login/resources/css
   npx sass design-system.scss design-system.css --no-source-map
   npx sass auth.scss auth.css --no-source-map
   ```
3. **Hard refresh** browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)

No Keycloak restart needed if `cacheThemes=false` in theme.properties!

### Watch Mode for SCSS

For active development:

```bash
cd keycloak-theme/taskflow/login/resources/css

# Watch and auto-compile
npx sass --watch design-system.scss:design-system.css auth.scss:auth.css --no-source-map
```

---

## 🌓 Theme Switching

### How It Works

The theme automatically detects:
1. **localStorage** key `app-theme` (set by your Vue app)
2. **System preference** `prefers-color-scheme`
3. **Default**: light

### Syncing with Main App

Your Vue app already sets `localStorage.setItem('app-theme', theme)` when users toggle the theme (via the sun/moon button in navbar).

The Keycloak theme reads this same key in `template.ftl`:

```javascript
const theme = localStorage.getItem('app-theme') ||
             (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', theme);
```

So theme preference is automatically shared!

### Manual Theme Switch (Testing)

In browser console:

```javascript
// Switch to dark
localStorage.setItem('app-theme', 'dark');
location.reload();

// Switch to light
localStorage.setItem('app-theme', 'light');
location.reload();
```

---

## 📄 File Reference

### Templates (Freemarker)

| File | Purpose |
|------|---------|
| `template.ftl` | Base layout for all pages |
| `login.ftl` | Login page |
| `register.ftl` | Registration page |
| `login-reset-password.ftl` | Forgot password |
| `login-update-password.ftl` | Update/reset password |
| `error.ftl` | Error page |
| `info.ftl` | Info/success page |

### Styles

| File | Purpose |
|------|---------|
| `_tokens.scss` | Design system tokens (colors, spacing, etc.) |
| `design-system.scss` | CSS variables, keyframes, utilities |
| `auth.scss` | Auth page components (cards, forms, buttons) |
| `*.css` | Compiled CSS (what Keycloak loads) |

---

## 🐛 Troubleshooting

### Theme not showing

**Problem**: Still seeing default Keycloak theme

**Solution**:
1. Check theme is selected: Admin → Realm Settings → Themes → Login theme = `taskflow`
2. Verify volume mount: `docker exec local-keycloak ls /opt/keycloak/themes/taskflow`
3. Check logs: `docker logs local-keycloak | grep -i theme`
4. Clear browser cache and hard refresh

### Styles look broken

**Problem**: Layout/colors not right

**Solution**:
1. Ensure CSS is compiled: Check `.css` files exist next to `.scss` files
2. Recompile: `npx sass auth.scss auth.css --no-source-map`
3. Check browser console for CSS load errors (F12 → Console)
4. Verify `theme.properties` has correct CSS paths

### Dark mode not working

**Problem**: Always shows light theme

**Solution**:
1. Check browser console for `data-theme` attribute: `document.documentElement.dataset.theme`
2. Check localStorage: `localStorage.getItem('app-theme')`
3. Verify CSS variables are defined for dark mode in `design-system.scss`
4. Hard refresh browser

### Changes not appearing

**Problem**: Made changes but don't see them

**Solution**:
1. Recompile SCSS to CSS
2. Hard refresh browser: `Cmd+Shift+R` / `Ctrl+Shift+R`
3. Check `theme.properties` has `cacheThemes=false`
4. If still stuck, restart Keycloak: `docker restart local-keycloak`

---

## ✅ Checklist

Before deploying to production:

- [ ] Test all auth flows (login, register, forgot password, reset password)
- [ ] Test in both light and dark modes
- [ ] Test on mobile, tablet, desktop
- [ ] Test with social providers (if enabled)
- [ ] Verify error messages display correctly
- [ ] Check accessibility (keyboard navigation, screen reader)
- [ ] Set `cacheThemes=true` and `cacheTemplates=true` in theme.properties
- [ ] Add your custom logo
- [ ] Update colors to match brand (if needed)
- [ ] Test theme switching between app and Keycloak

---

## 📞 Need Help?

- Review the main [README.md](./README.md) for detailed docs
- Check [Keycloak Theme Docs](https://www.keycloak.org/docs/latest/server_development/#_themes)
- Review your app's [Design System Docs](/frontend/DESIGN_SYSTEM.md)
- Check Keycloak logs: `docker logs local-keycloak`

---

**Enjoy your beautifully styled authentication! 🎨✨**
