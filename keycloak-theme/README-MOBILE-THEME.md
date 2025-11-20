# Jamigos Mobile Keycloak Theme

## Overview

This directory contains **TWO separate Keycloak themes**:

1. **`jamigos/`** - Web theme for `jamigos-client` (existing, unchanged)
2. **`jamigos-mobile/`** - NEW mobile theme for `jamigos-mobile-client`

## Theme Comparison

| Feature | Web Theme (`jamigos`) | Mobile Theme (`jamigos-mobile`) |
|---------|----------------------|----------------------------------|
| **Client** | `jamigos-client` | `jamigos-mobile-client` |
| **Card Design** | ✅ White card container with shadow | ❌ No card - transparent background |
| **Logo** | Icon + "Jamigos" text | Gradient "Jamigos" text only |
| **Tagline** | None | "Where Musicians Connect & Create" |
| **Title Style** | Black/white text | Gradient (primary → secondary) |
| **Layout** | Centered card in container | Full-height centered flexbox |
| **Scrolling** | Always scrollable | Hidden by default, auto if overflow |
| **Button Style** | Medium padding, soft shadow | Large padding, no shadow, scale on click |
| **Matches** | Web marketing site | Mobile app `/mobile-auth` screen |

## Mobile Theme Structure

```
jamigos-mobile/
├── login/
│   ├── theme.properties          # Theme config
│   ├── template.ftl              # Base layout (modified header)
│   ├── login.ftl                 # Login page
│   ├── register.ftl              # Registration page
│   ├── error.ftl                 # Error pages
│   ├── logout.ftl                # Logout pages
│   └── resources/
│       ├── css/
│       │   └── login.css         # Mobile-specific styling
│       ├── js/
│       │   └── theme.js          # Theme switching script
│       └── img/
│           └── (logos, if needed)
├── account/
│   └── theme.properties
└── email/
    └── theme.properties
```

## Key CSS Changes (Mobile Theme)

### 1. **No Card Design**
```css
#kc-content {
  background: transparent;  /* Was: var(--color-surface) */
  border: none;            /* Was: 1px solid var(--color-border-subtle) */
  box-shadow: none;        /* Was: var(--shadow-soft) */
  padding: 0;              /* Was: var(--spacing-2xl) */
}
```

### 2. **Full-Height Centered Layout**
```css
html, body {
  height: 100%;
  overflow: hidden; /* Prevent scroll by default */
}

#kc-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  height: 100%;
}

#kc-content-wrapper {
  max-height: 80vh;
  overflow-y: auto; /* Scroll only if content overflows */
}
```

### 3. **Gradient Title** (matches `/mobile-auth`)
```css
#kc-logo-text {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);

  /* Gradient effect */
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### 4. **Mobile Tagline**
```css
.mobile-tagline {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-sm);
}
```

### 5. **Large Buttons** (matches `/mobile-auth`)
```css
button, input[type="submit"] {
  padding: var(--spacing-lg) var(--spacing-xl); /* Larger padding */
  font-size: var(--font-size-lg);               /* Larger text */
}

button:active {
  transform: scale(0.98); /* Scale effect on click */
}
```

## Template Changes (Mobile Theme)

**File:** `jamigos-mobile/login/template.ftl`

```html
<!-- OLD (Web Theme) -->
<div id="kc-logo-wrapper">
    <img id="kc-logo-icon" src="${url.resourcesPath}/img/jamigos-logo-minimal.svg" alt="Jamigos icon" />
    <h1 id="kc-logo-text">Jamigos</h1>
</div>

<!-- NEW (Mobile Theme) -->
<div id="kc-logo-wrapper">
    <h1 id="kc-logo-text">Jamigos</h1>
    <p class="mobile-tagline">Where Musicians Connect & Create</p>
</div>
```

## Docker Setup

The mobile theme is automatically mounted alongside the web theme:

**docker-compose-local.yml:**
```yaml
keycloak:
  volumes:
    # Both themes mounted
    - ./keycloak-theme/jamigos:/opt/keycloak/themes/jamigos
    - ./keycloak-theme/jamigos-mobile:/opt/keycloak/themes/jamigos-mobile
```

## Applying the Mobile Theme

### Step 1: Deploy Theme to Keycloak

If using Docker:
```bash
docker-compose -f docker-compose-local.yml up keycloak
```

The theme folder `/keycloak-theme/jamigos-mobile` should now be visible in Keycloak.

### Step 2: Configure Client Theme

1. Access Keycloak Admin Console:
   - URL: `http://localhost:8180` (or your Keycloak URL)
   - Login with admin credentials

2. Navigate to your realm (e.g., `jamigos-realm`)

3. Go to **Clients** → **jamigos-mobile-client**

4. Click on the **Settings** tab

5. Scroll to **Login Theme** dropdown

6. Select **`jamigos-mobile`**

7. Click **Save**

### Step 3: Verify

Test the mobile client login:
- When `jamigos-mobile-client` opens Keycloak login, you should see:
  - ✅ Gradient "Jamigos" title
  - ✅ "Where Musicians Connect & Create" tagline
  - ✅ No card background - form on page background
  - ✅ Large buttons
  - ✅ Centered layout (not scrollable unless content overflows)

Test the web client login (ensure unchanged):
- When `jamigos-client` opens Keycloak login, you should see:
  - ✅ Icon + "Jamigos" text logo
  - ✅ White card container
  - ✅ Standard button sizes
  - ✅ Normal scrolling behavior

## Important Notes

### What Was Changed
- ✅ Created new `jamigos-mobile` theme directory
- ✅ Modified `jamigos-mobile/login/resources/css/login.css` (no card, centered layout)
- ✅ Modified `jamigos-mobile/login/template.ftl` (added tagline, removed icon)
- ✅ All color tokens, spacing, typography remain identical to web theme

### What Was NOT Changed
- ❌ Web theme (`jamigos/`) - completely untouched
- ❌ Auth flows, PKCE, redirect URLs - no functional changes
- ❌ Form field names, IDs, actions - only CSS/markup changes
- ❌ JavaScript logic - same theme.js for dark/light mode

### Keycloak Version
- This theme extends **`keycloak.v2`** (Keycloak's default theme)
- Tested with Keycloak 23+
- Should work with any Keycloak version supporting `keycloak.v2` parent theme

### Troubleshooting

**Theme not appearing in dropdown:**
1. Ensure Docker volume is correctly mounted
2. Restart Keycloak: `docker-compose -f docker-compose-local.yml restart keycloak`
3. Check logs: `docker logs local-keycloak`

**Theme looks wrong:**
1. Clear browser cache
2. Verify you selected `jamigos-mobile` (not `jamigos`)
3. Check browser console for CSS errors

**Mobile theme applies to web client:**
1. Double-check client configuration
2. Ensure `jamigos-client` uses `jamigos` theme
3. Ensure `jamigos-mobile-client` uses `jamigos-mobile` theme

## Future Customization

To further customize the mobile theme:

1. **Colors:** Edit CSS variables in `login.css`
2. **Fonts:** Modify `--font-family-base` in `login.css`
3. **Layout:** Adjust flexbox properties in `#kc-container`, `#kc-content-wrapper`
4. **Templates:** Override specific FTL files (login.ftl, register.ftl, etc.)

**Rule:** Never modify the web theme (`jamigos/`) when making mobile changes!

## Summary

| Theme Name | Client | Purpose | Status |
|-----------|--------|---------|--------|
| `jamigos` | `jamigos-client` | Web login/registration | ✅ Existing, unchanged |
| `jamigos-mobile` | `jamigos-mobile-client` | Mobile app login/registration | ✅ New, matches `/mobile-auth` |

**Admin Action Required:**
- Set Login Theme for `jamigos-mobile-client` to `jamigos-mobile` in Keycloak Admin Console
