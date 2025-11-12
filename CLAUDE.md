# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack todo application with Vue 3 frontend, Spring Boot backend, Keycloak authentication, MongoDB (for items), and PostgreSQL (for users).

## Repository Structure

```
todo-project/
├── frontend/          # Vue 3 + Vite application
├── backend/           # Spring Boot application
├── docker-compose-local.yml
└── .env.local        # Local environment variables
```

## Development Commands

### Frontend (Vue 3 + Vite)

```bash
cd frontend
npm install
npm run dev          # Development server at http://localhost:5173
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test             # Run all tests with coverage
npm run test:watch   # Run tests in watch mode
```

**Running a single test file:**
```bash
npx vitest run src/__tests__/specific-test.test.js
```

### Backend (Spring Boot + Maven)

```bash
cd backend
./mvnw clean install                    # Build and run all tests
./mvnw spring-boot:run                  # Run application (port 8082)
./mvnw test                            # Run all tests
./mvnw test -Dtest=ClassName           # Run specific test class
./mvnw test -Dtest=ClassName#methodName # Run specific test method
```

### Full Stack (Docker Compose)

```bash
# From project root
docker-compose -f docker-compose-local.yml up     # Start all infrastructure services
docker-compose -f docker-compose-local.yml down   # Stop all services
```

**Services:**
- MongoDB: `localhost:27017`
- Mongo Express: `localhost:8081`
- PostgreSQL: `localhost:5432`
- pgAdmin: `localhost:8090`
- Keycloak: `localhost:8180`
- Backend API: `localhost:8082`
- Frontend: `localhost:5173` (when running `npm run dev`)

## Architecture

### Frontend Architecture

**Tech Stack:** Vue 3, Vue Router, Pinia, Keycloak JS, Vite, Vitest

**Key Patterns:**
- **Authentication:** Keycloak integration via `src/auth/keycloak.js`
  - All API calls go through `apiFetch()` in `src/service/http.js` which automatically adds Bearer token
  - Route guards in `src/router/index.js` check `requiresAuth` meta property

- **State Management:** Pinia stores
  - `src/store/user.js` - User authentication state and role checking
  - `src/store/ui.js` - UI state (loading indicators)

- **Routing:** Route guards enforce authentication. Authenticated users at `/` redirect to `/dashboard`. Role-based routing infrastructure exists but is not currently enforced.

- **API Proxy:** Vite dev server proxies `/api/*` to `http://localhost:8082` (see `vite.config.js`)

- **Loading State:** Global loading spinner via UI store (`loadingCount` counter supports nested operations). `interactionsLock.js` prevents user interactions during loading.

- **Error Handling:** 401 → redirect to login, 403 → redirect to `/forbidden`

**Directory Structure:**
```
src/
├── auth/           # Keycloak configuration
├── components/     # Reusable Vue components
├── router/         # Vue Router setup with auth guards
├── scss/          # Global styles (SCSS)
├── service/       # API service layer (ItemService, UsersService, http)
├── store/         # Pinia stores
├── utils/         # Utility functions
├── views/         # Page components
└── __tests__/     # Test files
```

### Backend Architecture

**Tech Stack:** Spring Boot 3.5.4, Java 25, MongoDB, PostgreSQL, Spring Security, Keycloak OAuth2

**Key Patterns:**

1. **Dual Database Design:**
   - **MongoDB** (`@Document`): Stores `Item` (todo items) and `AuditLog` (audit trail) entities
   - **PostgreSQL** (`@Entity` + JPA): Stores `User` entities (synced from Keycloak)
   - Items reference users via `ownerId` field (stores Keycloak subject ID)
   - Both databases have auditing enabled (`@CreatedDate`, `@LastModifiedDate`) via `JpaConfig` and `MongoConfig`

2. **Authentication & Authorization:**
   - Keycloak JWT tokens validated via Spring Security OAuth2 Resource Server
   - `JwtAuthConverter` (`backend/src/main/java/com/example/todoapp/security/JwtAuthConverter.java:34`) extracts roles from both `resource_access.todo-project-client.roles` and `realm_access.roles`
   - Roles prefixed with `ROLE_` and uppercased (e.g., `ROLE_ADMIN`, `ROLE_USER`)
   - Three ordered security filter chains (see `SecurityConfig`):
     - **@Order(0) - Swagger/OpenAPI**: Public access to `/swagger-ui/**`, `/v3/api-docs/**`
     - **@Order(1) - Actuator**: `/actuator/health` public, rest requires `ACTUATOR` role (basic auth with configurable credentials)
     - **@Order(2) - API**: JWT authentication required for all other endpoints; includes `UserSyncFilter` after bearer token auth

3. **User Synchronization:**
   - `UserSyncFilter` automatically creates/updates `User` entity in PostgreSQL on each authenticated request
   - Users are identified by Keycloak subject ID (`keycloakId`)

4. **AOP-based Cross-cutting Concerns:**
   - `@RequireOwner` + `RequireOwnerAspect`: Validates that the authenticated user owns the resource before operations (optional `allowAdmin` flag)
   - `@LogExecutionTime` + `ExecutionTimeAspect`: Logs method execution time at INFO level
   - `AuditTrailAspect`: Intercepts @PostMapping and @DeleteMapping on controllers to log CREATE/DELETE actions to `AuditLog` collection (MongoDB)
   - `InputValidationAspect`: Additional input validation

5. **Service Layer Security:**
   - Methods use `CurrentUserService.getKeycloakId()` to get authenticated user's Keycloak ID from JWT claims
   - Spring Security method annotations (`@PreAuthorize`, `@PostFilter`) for role-based and data-level access control
   - Example: `@PreAuthorize("hasRole('ADMIN_ROLE')")` for admin-only endpoints
   - Example: `@PostFilter("filterObject.ownerId == authentication.name")` to filter items by ownership

**Directory Structure:**
```
src/main/java/com/example/todoapp/
├── aop/            # Aspect-oriented programming (logging, auditing, ownership)
├── config/         # Configuration classes (Security, CORS, MongoDB, JPA, OpenAPI)
├── controller/     # REST controllers + GlobalExceptionHandler
├── dto/            # Data transfer objects
├── model/          # Domain entities (User, Item, AuditLog)
├── repository/     # Spring Data repositories (JPA + MongoDB)
├── security/       # Security components (JwtAuthConverter, UserSyncFilter, CurrentUserService)
└── service/        # Business logic layer
```

**Testing (15 test files):**
- Integration tests extend `AbstractIntegrationTest` which uses Testcontainers for MongoDB and PostgreSQL
- Repository slice tests use embedded databases (H2 for PostgreSQL, Flapdoodle MongoDB v4.21.0)
- Controller tests use `@WebMvcTest` with MockMvc
- Security tests use `@WithMockUser` and custom JWT test utilities (`JwtTestUtils`)
- Test utilities: `UserTestUtils` provides reusable test data builders

## Important Implementation Details

### Adding New Protected Endpoints (Backend)

1. Add controller method with appropriate role annotation:
   ```java
   @PreAuthorize("hasRole('ADMIN')")
   @GetMapping("/admin-only")
   public ResponseEntity<?> adminEndpoint() { ... }
   ```

2. Use `CurrentUserService` to get authenticated user:
   ```java
   private final CurrentUserService currentUserService;
   String keycloakId = currentUserService.getKeycloakId();
   ```

3. For ownership-based access, use `@RequireOwner` annotation:
   ```java
   @RequireOwner(allowAdmin = true)
   @DeleteMapping("/items/{id}")
   public ResponseEntity<Void> deleteItem(@PathVariable String id) {
       itemService.deleteItem(id);
       return ResponseEntity.noContent().build();
   }
   ```
   The aspect validates ownership by checking if `item.ownerId == currentUser.keycloakId`

### Adding New Frontend Routes

1. Add route in `src/router/index.js` with `requiresAuth` meta:
   ```javascript
   {
     path: '/new-page',
     component: NewPageView,
     meta: { requiresAuth: true }
   }
   ```

2. Use `useUserStore()` for role checking in components:
   ```javascript
   const userStore = useUserStore();
   if (userStore.hasRole('ADMIN_ROLE')) { ... }
   ```

3. Make API calls through `apiFetch()` from `src/service/http.js`

### Testing Strategy

**Frontend:**
- Smoke tests in `src/__tests__/`
- Use Vitest with jsdom environment
- Mock Keycloak and Pinia stores

**Backend:**
- Integration tests with Testcontainers for real database interactions
- Repository slice tests with embedded databases for fast unit tests
- Security tests to verify authorization rules
- Use `JwtTestUtils` and `UserTestUtils` for test data

## Environment Variables

**Frontend (.env.local):**
```
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=todo-app
VITE_KEYCLOAK_CLIENT_ID=todo-project-client
```

**Backend (application.properties or .env):**
- MongoDB connection string
- PostgreSQL connection details
- Keycloak issuer URI and JWK set URI
- Actuator credentials (optional)

## Common Gotchas

- Frontend API calls must use `/api` prefix due to Vite proxy (e.g., `/api/items`)
- Backend expects JWT with roles in both `resource_access.todo-project-client.roles` and `realm_access.roles`
- User entities are auto-synced on each request via `UserSyncFilter` (JIT provisioning)
- Items use MongoDB string IDs (ObjectId), Users use PostgreSQL UUIDs
- All timestamps use `Instant` (UTC) with automatic auditing
- Backend listens on port **8082** (not 8080)
- CORS configured for multiple origins (local, dev, production) - see `CorsConfig`
- Token auto-refreshes with 30-second buffer in frontend `http.js`

## Key Architectural Insights

### Request Flow (Backend)
```
HTTP Request
  → CorsFilter
  → SecurityFilterChain (@Order determines which chain)
    → [API Chain] BearerTokenAuthenticationFilter + JwtAuthConverter
    → [API Chain] UserSyncFilter (JIT user provisioning)
  → Controller (@RestController)
  → Service (@Service with @PreAuthorize, @PostFilter)
    → AOP Aspects (AuditTrail, RequireOwner, ExecutionTime)
  → Repository (MongoRepository or JpaRepository)
  → Response (or GlobalExceptionHandler on exception)
```

### Authentication Flow
```
1. User logs in via Keycloak
2. Keycloak issues JWT with roles
3. Frontend stores token, adds to Authorization header
4. Backend validates JWT (checks signature, expiry, issuer)
5. JwtAuthConverter extracts roles from resource_access + realm_access
6. UserSyncFilter ensures User exists in PostgreSQL
7. Authorization checks (@PreAuthorize, @PostFilter, @RequireOwner)
```

### Why Dual Databases?
- **PostgreSQL for Users**: Relational integrity, JPA convenience, potential for future foreign key constraints
- **MongoDB for Items/AuditLogs**: Flexible schema, fast writes for audit logs, document-oriented data model fits todo items
- Items reference users via `ownerId` (Keycloak subject ID string) avoiding tight coupling between databases