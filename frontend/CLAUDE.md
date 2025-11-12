# CLAUDE.md - Frontend

This file provides guidance to Claude Code (claude.ai/code) when working with the Vue 3 frontend codebase.

## Frontend-Specific Commands

### Development
```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test             # Run all tests with coverage
npm run test:watch   # Run tests in watch mode

# Run specific test file
npx vitest run src/__tests__/app.smoke.test.js

# Run tests with specific pattern
npx vitest run --grep "authentication"
```

### Debugging
```bash
# Clear all caches
rm -rf node_modules/.vite dist

# Reinstall dependencies
rm -rf node_modules package-lock.json && npm install

# Run with debug output
npm run dev -- --debug
```

## Architecture Patterns

### Component Structure

Follow Vue 3 Composition API with `<script setup>`:

```vue
<template>
  <div class="my-component">
    <h1>{{ title }}</h1>
    <button @click="handleClick">Click me</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user.js'

// Props
const props = defineProps({
  title: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['update', 'delete'])

// State
const count = ref(0)

// Store
const userStore = useUserStore()

// Computed
const isAdmin = computed(() => userStore.hasRole('ADMIN_ROLE'))

// Methods
const handleClick = () => {
  count.value++
  emit('update', count.value)
}

// Lifecycle
onMounted(() => {
  console.log('Component mounted')
})
</script>

<style lang="scss" scoped>
@import '@/scss/variables';

.my-component {
  padding: $spacing-md;
}
</style>
```

### File Naming Conventions

- **Components**: `PascalCase` with `Component` suffix (e.g., `NavbarComponent.vue`, `AuthButtonsComponent.vue`)
- **Views**: `PascalCase` with `View` suffix (e.g., `TodoView.vue`, `DashboardView.vue`)
- **Services**: `PascalCase` with `Service` suffix (e.g., `ItemService.js`, `UsersService.js`)
- **Stores**: `lowercase` (e.g., `user.js`, `ui.js`)
- **Utils**: `camelCase` (e.g., `interactionsLock.js`)

### Directory Structure Logic

```
src/
├── auth/           # Authentication configuration (Keycloak)
├── components/     # Reusable components (used across multiple views)
├── router/         # Route definitions with guards
├── scss/           # Global styles, variables, mixins
├── service/        # API service layer (all backend communication)
├── store/          # Pinia stores (global state)
├── utils/          # Pure utility functions
├── views/          # Page-level components (route targets)
└── __tests__/      # Test files
```

## API Communication

### Always Use apiFetch()

**DO NOT** use `fetch()` directly. Always use `apiFetch()` from `src/service/http.js`:

```javascript
import { apiFetch } from '@/service/http.js'

// ✅ CORRECT
const items = await apiFetch('/api/items')

// ❌ WRONG
const response = await fetch('/api/items')
```

**Why?**
- Automatic JWT token injection
- Automatic token refresh (30-second buffer)
- Loading state management via UI store
- Error handling (401 → login redirect, 403 → forbidden page)
- Content-type detection

### API Service Pattern

Create service files in `src/service/` for organized API communication:

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

### API URL Pattern

All API calls use the `/api` prefix which is proxied to `http://localhost:8082` by Vite:

```javascript
// Frontend URL: /api/items
// Proxies to: http://localhost:8082/items

await apiFetch('/api/items')  // ✅ CORRECT
await apiFetch('/items')      // ❌ WRONG - won't proxy
```

See `vite.config.js:14-20` for proxy configuration.

## State Management

### Pinia Store Pattern

Stores live in `src/store/` and follow this pattern:

```javascript
import { defineStore } from 'pinia'

export const useMyStore = defineStore('my-store', {
  state: () => ({
    items: [],
    loading: false
  }),

  getters: {
    itemCount: (state) => state.items.length,
    hasItems: (state) => state.items.length > 0
  },

  actions: {
    async fetchItems() {
      this.loading = true
      try {
        this.items = await ItemService.getAll()
      } finally {
        this.loading = false
      }
    },

    addItem(item) {
      this.items.push(item)
    }
  }
})
```

### Existing Stores

#### User Store (`src/store/user.js`)

**State:**
- `isAuthenticated` - Boolean
- `user` - Object with `roles`, `username`, `firstName`, `lastName`, `email`

**Actions:**
- `setUser(authenticated, roles, tokenParsed)` - Set user state from Keycloak token
- `hasRole(role)` - Check if user has specific role
- `hasAnyRole(list)` - Check if user has any role from list
- `hasAllRoles(list)` - Check if user has all roles from list

**Usage:**
```javascript
import { useUserStore } from '@/store/user.js'

const userStore = useUserStore()

if (userStore.isAuthenticated) {
  console.log(userStore.user.username)
}

if (userStore.hasRole('ADMIN_ROLE')) {
  // Show admin UI
}
```

#### UI Store (`src/store/ui.js`)

**State:**
- `loadingCount` - Number (supports nested loading operations)

**Getters:**
- `isLoading` - Boolean (true if loadingCount > 0)

**Actions:**
- `startLoading()` - Increment loading counter
- `stopLoading()` - Decrement loading counter

**Note:** `apiFetch()` automatically calls these, so you usually don't need to manually.

## Authentication & Authorization

### Keycloak Integration

Keycloak client configured in `src/auth/keycloak.js`:

```javascript
import Keycloak from "keycloak-js"

const keycloak = new Keycloak({
    url: import.meta.env.VITE_KEYCLOAK_URL,
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
})

export default keycloak
```

### Authentication Flow

1. User clicks login button (calls `keycloak.login()`)
2. Redirects to Keycloak login page
3. After successful login, returns to app with JWT
4. `main.js` initializes Keycloak and sets user store
5. All subsequent API calls include JWT via `apiFetch()`

See `src/main.js:15-35` for initialization logic.

### Route Guards

Routes are protected via `meta: { requiresAuth: true }`:

```javascript
// src/router/index.js
{
  path: '/protected-page',
  component: ProtectedView,
  meta: { requiresAuth: true }
}
```

The `router.beforeEach()` guard (src/router/index.js:54-69) checks:
1. If route requires auth and user is not authenticated → redirect to `/`
2. If user is authenticated and visits `/` → redirect to `/dashboard`

**Note:** Role-based routing infrastructure exists but is commented out (src/router/index.js:66).

### Conditional Rendering by Role

```vue
<template>
  <!-- Show only to admins -->
  <div v-if="userStore.hasRole('ADMIN_ROLE')">
    <button @click="deleteAllItems">Delete All</button>
  </div>

  <!-- Show to users and admins -->
  <div v-if="userStore.hasAnyRole(['USER_ROLE', 'ADMIN_ROLE'])">
    <button @click="createItem">Create Item</button>
  </div>
</template>

<script setup>
import { useUserStore } from '@/store/user.js'

const userStore = useUserStore()
</script>
```

### Allowed Roles

The frontend filters roles to only these values (src/store/user.js:17):
- `USER_ROLE`
- `ADMIN_ROLE`

Any other roles in the JWT are ignored.

## Routing

### Adding New Routes

1. Create view component in `src/views/`
2. Import in `src/router/index.js`
3. Add route definition with auth requirements

```javascript
// src/router/index.js
import NewFeature from '@/views/NewFeatureView.vue'

const routes = [
  // ... existing routes
  {
    path: '/new-feature',
    component: NewFeature,
    meta: { requiresAuth: true }  // or false for public
  }
]
```

### Navigation

Use `<router-link>` or programmatic navigation:

```vue
<template>
  <!-- Declarative -->
  <router-link to="/dashboard">Dashboard</router-link>

  <!-- Programmatic -->
  <button @click="goToDashboard">Go to Dashboard</button>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToDashboard = () => {
  router.push('/dashboard')
}
</script>
```

## Styling

### SCSS Architecture

```
src/scss/
├── main.scss           # Entry point (imported in main.js)
├── _variables.scss     # Colors, spacing, breakpoints
├── _mixins.scss        # Reusable mixins
├── base/
│   └── _reset.scss     # CSS reset
└── components/
    └── _navbar.scss    # Component-specific styles
```

### Using SCSS in Components

```vue
<style lang="scss" scoped>
// Import variables and mixins
@import '@/scss/variables';
@import '@/scss/mixins';

.my-component {
  // Use variables
  color: $primary-color;
  padding: $spacing-md;

  // Use mixins
  @include respond-to(mobile) {
    padding: $spacing-sm;
  }
}
</style>
```

### Scoped Styles

**Always use `scoped`** to prevent style leakage:

```vue
<style lang="scss" scoped>
/* Styles only apply to this component */
.button {
  background: blue;
}
</style>
```

## Testing

### Test File Location

Place tests in `src/__tests__/` directory with `.test.js` or `.spec.js` extension.

### Vitest Configuration

Configured in `vitest.config.js`:
- Environment: `jsdom` (browser-like environment)
- Coverage: `v8` provider

### Testing Pattern

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MyComponent from '@/components/MyComponent.vue'

describe('MyComponent', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders correctly', () => {
    const wrapper = mount(MyComponent, {
      props: {
        title: 'Test Title'
      }
    })

    expect(wrapper.text()).toContain('Test Title')
  })

  it('emits event on click', async () => {
    const wrapper = mount(MyComponent)
    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted()).toHaveProperty('update')
  })
})
```

### Mocking Services

```javascript
import { vi } from 'vitest'
import ItemService from '@/service/ItemService.js'

// Mock the entire module
vi.mock('@/service/ItemService.js', () => ({
  default: {
    getAll: vi.fn().mockResolvedValue([
      { id: '1', text: 'Test item' }
    ]),
    create: vi.fn(),
    delete: vi.fn()
  }
}))

// Use in tests
await ItemService.getAll() // Returns mocked data
```

### Mocking Keycloak

```javascript
import { vi } from 'vitest'

vi.mock('@/auth/keycloak.js', () => ({
  default: {
    authenticated: true,
    token: 'mock-token',
    tokenParsed: {
      preferred_username: 'testuser',
      given_name: 'Test',
      family_name: 'User',
      email: 'test@example.com'
    },
    login: vi.fn(),
    logout: vi.fn(),
    updateToken: vi.fn().mockResolvedValue(true)
  }
}))
```

## Error Handling

### HTTP Errors

`apiFetch()` automatically handles common errors:

- **401 Unauthorized**: Redirects to Keycloak login
- **403 Forbidden**: Redirects to `/forbidden` page
- **Other errors**: Throws error with message

```javascript
try {
  const items = await apiFetch('/api/items')
} catch (error) {
  console.error('Failed to fetch items:', error.message)
  // Show user-friendly error message
}
```

### Loading States

Loading state is automatically managed by `apiFetch()` via UI store:

```vue
<template>
  <div v-if="uiStore.isLoading">
    <LoadingSpinner />
  </div>
  <div v-else>
    <!-- Content -->
  </div>
</template>

<script setup>
import { useUiStore } from '@/store/ui.js'

const uiStore = useUiStore()
</script>
```

### Interaction Locking

`src/utils/interactionsLock.js` prevents user interactions during loading. This is automatically applied when loading state is active.

## Common Tasks

### Add a New Todo Item Feature

1. **Add API service method** (`src/service/ItemService.js`):
```javascript
async updateItem(id, text) {
  return await apiFetch(`/api/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })
}
```

2. **Use in component**:
```vue
<script setup>
import ItemService from '@/service/ItemService.js'

const updateItem = async (id, newText) => {
  try {
    await ItemService.updateItem(id, newText)
    // Refresh list or update local state
  } catch (error) {
    console.error('Update failed:', error)
  }
}
</script>
```

### Add Admin-Only UI

```vue
<template>
  <div v-if="userStore.hasRole('ADMIN_ROLE')" class="admin-panel">
    <h2>Admin Panel</h2>
    <button @click="viewAllItems">View All User Items</button>
  </div>
</template>

<script setup>
import { useUserStore } from '@/store/user.js'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const viewAllItems = () => {
  router.push('/admin/all-items')
}
</script>
```

### Add New Navigation Link

Update `src/components/NavbarComponent.vue`:

```vue
<template>
  <nav>
    <router-link to="/">Home</router-link>
    <router-link to="/dashboard">Dashboard</router-link>
    <router-link to="/new-feature">New Feature</router-link>
  </nav>
</template>
```

## Environment Variables

Access environment variables via `import.meta.env`:

```javascript
const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL
const apiUrl = import.meta.env.VITE_API_BASE_URL
```

**Required variables** (`.env.local`):
```env
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=todo-app
VITE_KEYCLOAK_CLIENT_ID=todo-project-client
```

**Note:** All Vite environment variables must be prefixed with `VITE_`.

## Important Conventions

### DO
- ✅ Use `<script setup>` for all components
- ✅ Use `apiFetch()` for all API calls
- ✅ Use Pinia stores for shared state
- ✅ Use `scoped` styles in components
- ✅ Import SCSS variables/mixins when needed
- ✅ Check authentication state with `userStore.isAuthenticated`
- ✅ Check roles with `userStore.hasRole()`
- ✅ Use `/api` prefix for all backend calls
- ✅ Handle loading states via UI store
- ✅ Write tests for new components/features

### DON'T
- ❌ Don't use `fetch()` directly
- ❌ Don't use Options API (use Composition API)
- ❌ Don't store authentication state in localStorage
- ❌ Don't call backend without `/api` prefix
- ❌ Don't manually manage loading state (use `apiFetch()`)
- ❌ Don't forget `scoped` in component styles
- ❌ Don't import Keycloak directly (use store for auth state)
- ❌ Don't bypass route guards

## Troubleshooting

### Component Not Rendering
1. Check Vue DevTools for component tree
2. Verify props are passed correctly
3. Check for console errors
4. Verify component is imported and used correctly

### API Calls Failing
1. Check Network tab in browser DevTools
2. Verify backend is running on port 8082
3. Check `/api` prefix is used
4. Verify Keycloak token is valid (check `keycloak.authenticated`)
5. Check CORS errors in console

### Authentication Not Working
1. Verify Keycloak is running (http://localhost:8180)
2. Check `.env.local` has correct Keycloak configuration
3. Clear browser localStorage/sessionStorage
4. Check Keycloak client configuration in admin console
5. Verify realm and client ID match

### Styles Not Applied
1. Check `scoped` attribute on `<style>` tag
2. Verify SCSS imports are correct
3. Check browser DevTools for CSS specificity issues
4. Clear Vite cache: `rm -rf node_modules/.vite`

## References

- [Vue 3 Docs](https://vuejs.org/) - Official Vue documentation
- [Pinia Docs](https://pinia.vuejs.org/) - State management
- [Vue Router Docs](https://router.vuejs.org/) - Routing
- [Vite Docs](https://vitejs.dev/) - Build tool
- [Vitest Docs](https://vitest.dev/) - Testing framework
- [Keycloak JS Adapter](https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter)
- [Root CLAUDE.md](../CLAUDE.md) - Full project architecture
