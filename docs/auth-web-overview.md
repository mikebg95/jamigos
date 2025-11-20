# Web Authentication Flow Overview

**Last Updated:** 2025-11-20
**Purpose:** Document how authentication currently works in the web build (Vue 3 + Keycloak) as a baseline for mobile refactoring.

**Related Documentation:**
- [Step 2: Auth Facade Implementation](./step2-auth-facade-summary.md) - Auth abstraction layer
- [Step 3: Mobile Redirect URI Setup](./step3-mobile-redirect-setup.md) - Deep link configuration

---

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [Keycloak Integration](#keycloak-integration)
3. [Token Management](#token-management)
4. [HTTP Client Layer](#http-client-layer)
5. [Route Guards](#route-guards)
6. [Configuration](#configuration)
7. [Key Files](#key-files)
8. [Sequence Diagrams](#sequence-diagrams)

---

## High-Level Overview

The app uses **Keycloak JS adapter** (`keycloak-js` npm package) for OAuth2/OIDC authentication in the web build. On app startup:

1. Keycloak is initialized with `check-sso` mode (silent SSO check)
2. If authenticated, user info is extracted from JWT and stored in Pinia
3. User is synced with backend via `/api/users/sync` endpoint (JIT provisioning fallback)
4. Router guards protect routes marked with `requiresAuth: true`
5. All API calls go through `apiFetch()` which auto-attaches Bearer token and handles token refresh

---

## Keycloak Integration

### Initialization

**File:** [frontend/src/main.js](../frontend/src/main.js)

**Flow:**

1. Import `keycloak` singleton from `@/auth/keycloak.js`
2. Call `keycloak.init()` with configuration:
   ```javascript
   keycloak.init({
       onLoad: isCapacitor ? "login-required" : "check-sso",
       pkceMethod: "S256",
       checkLoginIframe: false,
   })
   ```
3. **`onLoad` behavior:**
   - **Web:** `"check-sso"` - silently checks if user has active SSO session (no redirect if unauthenticated)
   - **Mobile (Capacitor):** `"login-required"` - forces login if not authenticated
4. **PKCE:** Enabled with SHA-256 (`"S256"`) for enhanced security (web standard for public clients)
5. **Login iframe:** Disabled (`checkLoginIframe: false`) to avoid CSP issues with cross-origin iframes

**After initialization:**

```javascript
.then(async () => {
    const userStore = useUserStore();
    userStore.setUser(
        keycloak.authenticated,
        keycloak.tokenParsed?.realm_access?.roles || [],
        keycloak.tokenParsed
    );

    if (userStore.isAuthenticated) {
        try {
            await usersService.syncCurrentUser();
        } catch (e) {
            console.warn('users/sync failed (will fallback to JIT):', e);
        }
    }

    if (router.currentRoute.value.path === "/" && userStore.isAuthenticated) {
        await router.replace("/dashboard");
    }

    app.mount("#app");
})
```

**Key actions:**
- Extract user info from `keycloak.tokenParsed` and store in Pinia (`useUserStore`)
- Sync user with backend (optional; backend has JIT user sync via `UserSyncFilter`)
- Redirect authenticated users from `/` to `/dashboard`
- Mount Vue app

### Keycloak Singleton

**File:** [frontend/src/auth/keycloak.js](../frontend/src/auth/keycloak.js)

**Configuration:**

```javascript
const keycloak = new Keycloak({
    url: KEYCLOAK_URL,        // from VITE_KEYCLOAK_URL
    realm: KEYCLOAK_REALM,    // from VITE_KEYCLOAK_REALM
    clientId: KEYCLOAK_CLIENT_ID, // from VITE_KEYCLOAK_CLIENT_ID
});
```

**Environment variables validated at load time:**
- `VITE_KEYCLOAK_URL` (e.g., `http://localhost:8180`)
- `VITE_KEYCLOAK_REALM` (e.g., `jamigos-realm`)
- `VITE_KEYCLOAK_CLIENT_ID` (e.g., `jamigos-client` for web)

**Export:** A single shared `keycloak` instance used throughout the app.

---

## Token Management

### Storage Mechanism

**Tokens are stored in-memory by the Keycloak JS adapter** (not in localStorage, sessionStorage, or cookies).

- **Access Token:** `keycloak.token` (JWT string)
- **Refresh Token:** `keycloak.refreshToken` (opaque string, used to get new access token)
- **Token Parsed:** `keycloak.tokenParsed` (decoded JWT claims object)
- **Authentication Status:** `keycloak.authenticated` (boolean)

**Why in-memory?**
- Security: Tokens are not persisted and are lost on page refresh (requires new SSO check)
- The `check-sso` mode re-establishes session on refresh if Keycloak SSO session is still active

### Token Refresh

**File:** [frontend/src/service/http.js](../frontend/src/service/http.js:20-30)

**Function:** `getValidToken()`

```javascript
async function getValidToken() {
    await keycloak.updateToken(TIMING.TOKEN_REFRESH_BUFFER_SEC).catch((err) => {
        if (import.meta.env.DEV) {
            console.warn('Token refresh failed:', err);
        }
    });
    if (!keycloak.authenticated) throw new Error('Not authenticated');
    return keycloak.token;
}
```

**How it works:**
1. **Proactive refresh:** `keycloak.updateToken(30)` checks if token expires in < 30 seconds
2. If yes, automatically refreshes using `keycloak.refreshToken` (silent, no user interaction)
3. If refresh fails (e.g., refresh token expired), logs warning but doesn't throw
4. Returns current access token string

**When is it called?**
- On **every API request** via `apiFetch()` (before attaching Bearer token)
- Ensures tokens are always fresh before making backend calls

**Token refresh buffer:** 30 seconds (from `TIMING.TOKEN_REFRESH_BUFFER_SEC` in [constants.js](../frontend/src/config/constants.js:15))

### Login/Logout

**Login:**
- Triggered manually via `keycloak.login({ redirectUri })` (e.g., from UI button or 401 handler)
- **401 handler** (in `apiFetch`): Redirects to Keycloak login page with theme preservation:
  ```javascript
  if (res.status === 401) {
      const theme = getTheme();
      sessionStorage.setItem('pending-auth-theme', theme);
      const redirectUri = `${window.location.origin}${window.location.pathname}?theme=${theme}`;
      keycloak.login({ redirectUri });
      return;
  }
  ```

**Logout:**
- Triggered via `keycloak.logout()` (typically from UI logout button)
- Redirects to Keycloak logout endpoint, clears SSO session

---

## HTTP Client Layer

**File:** [frontend/src/service/http.js](../frontend/src/service/http.js)

### `apiFetch(path, options)`

**Purpose:** Central wrapper around `fetch()` that handles:
- Token refresh (auto-refresh before every call)
- Bearer token injection
- 401/403 error handling (redirect to login or `/forbidden`)
- Request timeout (30 seconds via `AbortController`)
- Request deduplication (via `deduplicateRequest` utility)
- Loading state management (via `useUiStore`)
- Error tracking (Sentry integration)

**Usage:**

```javascript
import { apiFetch } from '@/service/http.js';

const items = await apiFetch('/api/items'); // GET
await apiFetch('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newItem),
});
```

### Base URL Logic

**Web mode (default):**
- `VITE_API_BASE_URL` is **not set**
- Uses relative paths: `/api/items` → proxied by Vite dev server or Nginx in production
- **Vite dev proxy:** `vite.config.js` proxies `/api` to backend (`http://localhost:8082`)

**Mobile mode (Capacitor):**
- `VITE_API_BASE_URL` is **set** (e.g., `https://api.jamigos.com`)
- Constructs full URLs: `https://api.jamigos.com/api/items`
- Mobile apps cannot use relative URLs (no Nginx proxy)

**Implementation:**

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function buildUrl(path) {
    return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}
```

### Bearer Token Injection

**Before every request:**

```javascript
const token = await getValidToken(); // Auto-refreshes if needed
const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
};
```

**Backend validation:**
- Spring Security validates JWT signature, expiry, issuer
- Extracts roles from `resource_access.jamigos-client.roles` and `realm_access.roles`
- `UserSyncFilter` creates/updates `User` entity in PostgreSQL (JIT provisioning)

### Error Handling

**401 Unauthorized:**
- Redirects to Keycloak login page (preserves current theme in `redirectUri`)
- Stores theme in `sessionStorage` for restoration after login

**403 Forbidden:**
- Redirects to `/forbidden` page (user is authenticated but lacks permissions)

**Other errors:**
- Throws error with descriptive message: `"GET /api/items -> 500"`
- Sends non-auth errors to Sentry for tracking

**Timeout:**
- 30-second timeout via `AbortController`
- User-friendly error: `"Request timeout - please check your connection and try again"`
- Tracked in Sentry

---

## Route Guards

**File:** [frontend/src/router/index.js](../frontend/src/router/index.js:66-82)

### Global Navigation Guard

```javascript
router.beforeEach((to, from, next) => {
    const userStore = useUserStore();

    // Redirect authenticated users from homepage to dashboard
    if (to.path === "/" && userStore.isAuthenticated) {
        return next("/dashboard");
    }

    // Allow public routes
    if (!to.meta?.requiresAuth) return next();

    // Block unauthenticated users from protected routes
    if (!userStore.isAuthenticated) return next("/");

    // Optional: Role-based routing (commented out)
    // if (to.meta.role && !userStore.hasRole(to.meta.role)) return next("/forbidden");

    return next();
});
```

**Logic:**

1. **Authenticated homepage redirect:** If user is logged in and navigates to `/`, redirect to `/dashboard`
2. **Public routes:** If route has `requiresAuth: false` or no meta, allow access
3. **Protected routes:** If route has `requiresAuth: true`:
   - **Unauthenticated users:** Redirect to `/` (homepage with login button)
   - **Authenticated users:** Allow access
4. **Role-based routing:** Infrastructure exists (commented out) but not enforced

**Route metadata:**

```javascript
{
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
}
```

---

## Configuration

### Environment Variables

**Location:** [frontend/.env.local](../frontend/.env.local)

**Web build:**

```env
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=jamigos-realm
VITE_KEYCLOAK_CLIENT_ID=jamigos-client
```

**Mobile build (future):**

```env
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=jamigos-realm
VITE_KEYCLOAK_CLIENT_ID=jamigos-mobile-client  # Different client for mobile
VITE_API_BASE_URL=http://192.168.1.x:8082      # Full URL for API (no Nginx)
```

### Constants

**File:** [frontend/src/config/constants.js](../frontend/src/config/constants.js)

**Relevant constants:**

```javascript
export const TIMING = {
  TOKEN_REFRESH_BUFFER_SEC: 30,  // Refresh token if expires in < 30s
  REQUEST_TIMEOUT_MS: 30000,     // 30-second request timeout
};
```

---

## Key Files

### Authentication Core

| File | Purpose |
|------|---------|
| [frontend/src/auth/keycloak.js](../frontend/src/auth/keycloak.js) | Keycloak singleton instance (configured from env vars) |
| [frontend/src/main.js](../frontend/src/main.js:88-125) | Keycloak initialization, user sync, app mounting |
| [frontend/src/service/http.js](../frontend/src/service/http.js) | `apiFetch()` wrapper with token refresh, error handling, loading state |

### State Management

| File | Purpose |
|------|---------|
| [frontend/src/store/user.js](../frontend/src/store/user.js) | Pinia store for user state (authentication status, roles, user info) |
| [frontend/src/store/ui.js](../frontend/src/store/ui.js) | Pinia store for UI state (loading indicators) |

### Routing

| File | Purpose |
|------|---------|
| [frontend/src/router/index.js](../frontend/src/router/index.js) | Vue Router config with `beforeEach` guard for protected routes |

### Configuration

| File | Purpose |
|------|---------|
| [frontend/.env.local](../frontend/.env.local) | Keycloak config (URL, realm, client ID) for local development |
| [frontend/src/config/constants.js](../frontend/src/config/constants.js) | App-wide constants (timing, validation, etc.) |

---

## Sequence Diagrams

### App Startup (Web, Unauthenticated User)

```
User                    Browser                 Keycloak                Backend
 |                         |                        |                       |
 |--- Load app ----------->|                        |                       |
 |                         |                        |                       |
 |                         |--- init(check-sso) --->|                       |
 |                         |<-- 200 (not auth'd) ---|                       |
 |                         |                        |                       |
 |                         |--- mount app --------->|                       |
 |<--- Show homepage ------|                        |                       |
 |                         |                        |                       |
 |--- Click "Login" ------>|                        |                       |
 |                         |--- keycloak.login() -->|                       |
 |<--- Redirect to KC -----|<-----------------------|                       |
 |                         |                        |                       |
 |--- Enter credentials -->|                        |                       |
 |                         |--- POST /auth -------->|                       |
 |                         |<-- JWT + refresh -------|                       |
 |<--- Redirect to app ----|                        |                       |
 |                         |                        |                       |
 |                         |--- init(check-sso) --->|                       |
 |                         |<-- JWT (from SSO) -----|                       |
 |                         |                        |                       |
 |                         |--- setUser(store) ---->|                       |
 |                         |                        |                       |
 |                         |--- POST /api/users/sync + Bearer ------------->|
 |                         |<-- 200 OK (user synced) -----------------------|
 |                         |                        |                       |
 |                         |--- router.push(/dashboard) ------------------>|
 |<--- Show dashboard -----|                        |                       |
```

### API Request with Token Refresh

```
Component               http.js                Keycloak                Backend
 |                         |                        |                       |
 |--- apiFetch('/api/items') ->|                    |                       |
 |                         |                        |                       |
 |                         |--- getValidToken() --->|                       |
 |                         |                        |                       |
 |                         |--- updateToken(30) --->|                       |
 |                         |    (checks if expires < 30s)                   |
 |                         |<-- new JWT (if needed) |                       |
 |                         |                        |                       |
 |                         |--- fetch + Bearer --------------------------->|
 |                         |<-- 200 + JSON data ----------------------------|
 |                         |                        |                       |
 |<--- return data --------|                        |                       |
```

### 401 Error Handling

```
Component               http.js                Keycloak                Browser
 |                         |                        |                       |
 |--- apiFetch('/api/items') ->|                    |                       |
 |                         |                        |                       |
 |                         |--- fetch + Bearer ---->|                       |
 |                         |<-- 401 Unauthorized ---|                       |
 |                         |                        |                       |
 |                         |--- getTheme() -------->|                       |
 |                         |--- sessionStorage.setItem('pending-auth-theme', theme) |
 |                         |                        |                       |
 |                         |--- keycloak.login({ redirectUri: '/?theme=...' }) --->|
 |                         |                        |                       |
 |<--- Redirect to login page ------------------------------------------|
```

---

## Notes for Mobile Refactoring

### What stays the same:
- `apiFetch()` wrapper (already handles Bearer tokens)
- Route guards (still need `requiresAuth` checks)
- User store (same structure)
- Backend token validation (no changes needed)

### What changes:
- **Keycloak initialization:** Replace `keycloak-js` with native browser flow (Capacitor Browser + PKCE)
- **Token storage:** Need secure storage plugin (iOS Keychain / Android Keystore) instead of in-memory
- **Token refresh:** Manual refresh logic (native flow doesn't auto-refresh)
- **Redirect URIs:** Use custom scheme (e.g., `jamigos://callback`)
- **API base URL:** Set `VITE_API_BASE_URL` to full backend URL (no Nginx proxy in mobile)

### Abstraction strategy:
1. Create **auth facade** interface (`IAuthProvider`)
2. Implement `WebAuthProvider` (current keycloak-js logic)
3. Implement `MobileAuthProvider` (native PKCE flow)
4. Inject provider at runtime based on `window.Capacitor !== undefined`
5. Update `main.js` and `http.js` to use facade instead of direct `keycloak` singleton

---

## Testing

**Current behavior (web):**

1. Run `npm run dev` in `frontend/`
2. Navigate to `http://localhost:5173`
3. Should see homepage with "Login" button
4. Click "Login" → redirects to Keycloak
5. Enter credentials → redirects back to app at `/dashboard`
6. Navigate to protected routes (`/todo`, `/profile`) → should work
7. Open DevTools Network tab → verify `Authorization: Bearer ...` header on API calls
8. Check token refresh: Wait 30 seconds, make API call → should auto-refresh without user action

**No changes expected after this step** (behavior identical, only documentation added).

---

## Summary

The web build uses a simple, battle-tested approach:

1. **Keycloak JS adapter** handles OAuth2 flow (authorization code + PKCE)
2. **Tokens stored in-memory** by adapter (secure, no persistence)
3. **Auto-refresh** on every API call (30-second buffer)
4. **Centralized `apiFetch()`** wrapper handles all HTTP concerns (tokens, errors, loading, timeouts)
5. **Route guards** protect pages based on `requiresAuth` meta
6. **JIT user sync** ensures backend has user record on first request

This architecture is **mobile-ready** with minimal changes:
- Auth logic is already isolated in `keycloak.js` and `http.js`
- Route guards and stores are platform-agnostic
- Only need to swap Keycloak adapter for native PKCE flow + secure storage
