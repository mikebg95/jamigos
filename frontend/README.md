# Todo Project - Frontend

Vue 3 frontend application for the Todo Project with Keycloak authentication, role-based access control, and modern state management.

## Tech Stack

- **Vue 3** - Progressive JavaScript framework with Composition API
- **Vite** - Next-generation frontend build tool
- **Pinia** - Intuitive state management for Vue
- **Vue Router** - Official router with authentication guards
- **Keycloak JS** - OAuth2/OIDC authentication client
- **Vitest** - Fast unit testing framework
- **SCSS** - CSS preprocessor for styling
- **Lucide Vue** - Beautiful & consistent icon library

## Prerequisites

- **Node.js**: v20.19.0 or v22.12.0+ (see `package.json` engines)
- **npm**: 8.x or later
- **Backend API**: Running on `http://localhost:8082`
- **Keycloak**: Running on `http://localhost:8180`

## Installation

```bash
npm install
```

## Development

### Start Development Server

```bash
npm run dev
```

The application will be available at **http://localhost:5173** with hot module replacement (HMR) enabled.

### Build for Production

```bash
npm run build
```

Build output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally for testing.

### Linting

```bash
npm run lint
```

Runs ESLint to check code quality.

## Testing

### Run All Tests with Coverage

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Specific Test File

```bash
npx vitest run src/__tests__/app.smoke.test.js
```

## Project Structure

```
src/
├── auth/
│   └── keycloak.js           # Keycloak client configuration
├── components/
│   ├── NavbarComponent.vue   # Main navigation bar
│   └── AuthButtonsComponent.vue  # Login/logout buttons
├── router/
│   └── index.js              # Route definitions with auth guards
├── scss/
│   ├── main.scss             # Global styles entry point
│   ├── _variables.scss       # SCSS variables
│   ├── _mixins.scss          # SCSS mixins
│   ├── base/
│   │   └── _reset.scss       # CSS reset
│   └── components/
│       └── _navbar.scss      # Component-specific styles
├── service/
│   ├── http.js               # HTTP client with auth
│   ├── ItemService.js        # Todo item API service
│   └── UsersService.js       # User API service
├── store/
│   ├── user.js               # User authentication state
│   └── ui.js                 # UI state (loading indicators)
├── utils/
│   └── interactionsLock.js   # Prevent interactions during loading
├── views/
│   ├── HomeView.vue          # Landing page
│   ├── DashboardView.vue     # Main dashboard (router view)
│   ├── DashboardUserView.vue # User dashboard
│   ├── DashboardAdminView.vue # Admin dashboard
│   ├── TodoView.vue          # Todo list page
│   ├── ProfileView.vue       # User profile
│   ├── InformationView.vue   # Info page
│   ├── ForbiddenView.vue     # 403 error page
│   └── PageNotFoundView.vue  # 404 error page
├── __tests__/
│   └── app.smoke.test.js     # Basic smoke tests
├── App.vue                   # Root component
└── main.js                   # Application entry point
```

## Configuration

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# Keycloak Configuration
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=jamigos-realm
VITE_KEYCLOAK_CLIENT_ID=jamigos-client
```

### Vite Proxy Configuration

The development server proxies API requests to the backend:

```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:8082',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

**Usage**: Make API calls to `/api/items` which will proxy to `http://localhost:8082/items`

## Key Concepts

### Authentication Flow

1. User clicks "Login" button
2. Redirected to Keycloak login page
3. After successful login, receives JWT token
4. Token stored by Keycloak JS client
5. All API calls automatically include `Authorization: Bearer {token}` header
6. Token auto-refreshes with 30-second buffer before expiry

**Implementation**: See `src/auth/keycloak.js` and `src/service/http.js`

### Route Guards

All routes with `meta: { requiresAuth: true }` require authentication:

```javascript
// src/router/index.js
{
  path: '/todo',
  component: Todo,
  meta: { requiresAuth: true }
}
```

The router's `beforeEach` guard checks authentication state and redirects unauthenticated users to the home page.

### State Management (Pinia)

#### User Store (`src/store/user.js`)

Manages authentication state and user information:

```javascript
import { useUserStore } from '@/store/user.js'

const userStore = useUserStore()

// Check authentication
if (userStore.isAuthenticated) { ... }

// Check roles
if (userStore.hasRole('ADMIN_ROLE')) { ... }
if (userStore.hasAnyRole(['USER_ROLE', 'ADMIN_ROLE'])) { ... }

// Access user info
console.log(userStore.user.username)
console.log(userStore.user.email)
```

#### UI Store (`src/store/ui.js`)

Manages UI state like loading indicators:

```javascript
import { useUiStore } from '@/store/ui.js'

const uiStore = useUiStore()

// Check loading state
if (uiStore.isLoading) { ... }
```

**Note**: Loading state is automatically managed by `apiFetch()` in `src/service/http.js`

### API Communication

All API calls should use the `apiFetch()` wrapper function:

```javascript
import { apiFetch } from '@/service/http.js'

// GET request
const items = await apiFetch('/api/items')

// POST request
await apiFetch('/api/items', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'New todo item' })
})

// DELETE request
await apiFetch(`/api/items/${id}`, {
  method: 'DELETE'
})
```

**Benefits**:
- Automatic JWT token inclusion
- Automatic token refresh
- Loading state management
- Error handling (401 → login, 403 → forbidden page)
- Content-type detection (JSON vs text)

### Service Layer

Use service classes for organized API communication:

```javascript
// src/service/ItemService.js
import { apiFetch } from './http.js'

export default {
  async getAll() {
    return await apiFetch('/api/items')
  },

  async create(text) {
    return await apiFetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })
  },

  async delete(id) {
    return await apiFetch(`/api/items/${id}`, {
      method: 'DELETE'
    })
  }
}
```

## Styling

### SCSS Architecture

The project uses SCSS with a modular structure:

- **Variables** (`_variables.scss`): Colors, spacing, breakpoints
- **Mixins** (`_mixins.scss`): Reusable style patterns
- **Base** (`base/_reset.scss`): CSS reset and base styles
- **Components** (`components/*.scss`): Component-specific styles

### Import Styles in Components

```vue
<style lang="scss" scoped>
@import '@/scss/variables';
@import '@/scss/mixins';

.my-component {
  color: $primary-color;

  @include respond-to(mobile) {
    font-size: 14px;
  }
}
</style>
```

## Adding New Features

### 1. Add a New Route

```javascript
// src/router/index.js
import MyNewView from '@/views/MyNewView.vue'

const routes = [
  // ... existing routes
  {
    path: '/my-new-page',
    component: MyNewView,
    meta: { requiresAuth: true } // or false for public routes
  }
]
```

### 2. Create a New API Service

```javascript
// src/service/MyService.js
import { apiFetch } from './http.js'

export default {
  async getItems() {
    return await apiFetch('/api/my-endpoint')
  }
}
```

### 3. Add Role-Based UI Elements

```vue
<template>
  <div v-if="userStore.hasRole('ADMIN_ROLE')">
    Admin only content
  </div>
</template>

<script setup>
import { useUserStore } from '@/store/user.js'

const userStore = useUserStore()
</script>
```

## IDE Setup

### Recommended

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

**Important**: Disable Vetur if you have it installed (conflicts with Volar)

### VSCode Extensions

- **Volar** - Vue 3 language support
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting (optional)

## Troubleshooting

### Port 5173 Already in Use

```bash
# Kill the process using port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

### Cannot Connect to Backend API

1. Verify backend is running on `http://localhost:8082`
2. Check Vite proxy configuration in `vite.config.js`
3. Check browser console for CORS errors
4. Verify `.env.local` has correct backend URL

### Authentication Not Working

1. **Check Keycloak is running**: http://localhost:8180
2. **Verify environment variables** in `.env.local`:
   ```env
   VITE_KEYCLOAK_URL=http://localhost:8180
   VITE_KEYCLOAK_REALM=jamigos-realm
   VITE_KEYCLOAK_CLIENT_ID=jamigos-client
   ```
3. **Check Keycloak client configuration**:
   - Valid redirect URIs include `http://localhost:5173/*`
   - Web origins include `http://localhost:5173`
   - Client authentication is OFF (public client)
4. **Clear browser storage**: Cookies, localStorage, sessionStorage
5. **Check browser console** for error messages

### Tests Failing

```bash
# Clear Vitest cache
npx vitest --clearCache

# Run tests with verbose output
npm test -- --reporter=verbose

# Run specific test in watch mode for debugging
npx vitest src/__tests__/app.smoke.test.js
```

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Try building with verbose output
npm run build -- --debug
```

### Hot Module Replacement (HMR) Not Working

1. Check file watcher limits (Linux):
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```
2. Restart dev server
3. Clear browser cache
4. Check Vite config for HMR settings

## Performance Tips

1. **Use `v-show` instead of `v-if`** for frequently toggled elements
2. **Lazy load routes** for code splitting (already configured)
3. **Use `computed` properties** for derived state
4. **Avoid unnecessary reactivity** with `shallowRef()` for large objects
5. **Profile with Vue DevTools** to identify performance bottlenecks

## Deployment

### Build for Production

```bash
npm run build
```

### Docker Build

```bash
docker build -t todo-frontend .
docker run -p 8080:80 todo-frontend
```

The Dockerfile uses nginx to serve the built static files.

### Environment-Specific Builds

Create environment-specific `.env` files:

- `.env.local` - Local development
- `.env.development` - Development server
- `.env.production` - Production

Vite automatically loads the correct file based on the mode:

```bash
npm run build              # Uses .env.production
npm run build -- --mode development  # Uses .env.development
```

## Additional Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue Router Documentation](https://router.vuejs.org/)
- [Keycloak JS Documentation](https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter)
- [Vitest Documentation](https://vitest.dev/)

## Related Documentation

- [Root README](../README.md) - Full project overview and setup
- [Backend README](../backend/README.md) - Backend API documentation
- [CLAUDE.md](../CLAUDE.md) - Developer guidance for AI assistants
