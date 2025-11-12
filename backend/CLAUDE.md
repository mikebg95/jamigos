# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Spring Boot 3.5.4 backend for a todo application with Keycloak OAuth2/JWT authentication. Uses dual-database architecture: PostgreSQL (JPA) for user data and MongoDB for todo items. Java 25 with Maven.

## Build & Test Commands

### Building
```bash
./mvnw clean install        # Full build with tests
./mvnw clean package        # Build without installing to local repo
./mvnw spring-boot:run      # Run the application (port 8082)
```

### Testing
```bash
./mvnw test                                    # Run all tests
./mvnw test -Dtest=ClassName                   # Run specific test class
./mvnw test -Dtest=ClassName#methodName        # Run specific test method
./mvnw test -Dtest=*ControllerTest             # Run tests matching pattern
```

Tests use:
- **Integration tests**: Extend `AbstractIntegrationTest` which provides Testcontainers for MongoDB (mongo:7) and PostgreSQL (postgres:16-alpine) with `@ActiveProfiles("test")`
- **Repository slice tests**: Use `@DataJpaTest` for JPA/Postgres or `@DataMongoTest` with embedded MongoDB for repository-only tests
- **Controller tests**: Use `@WebMvcTest` with mocked dependencies

## Architecture

### Dual-Database Design
- **PostgreSQL (JPA)**: Stores user accounts synced from Keycloak. `User` entity in `com.example.todoapp.model` with `UserRepository` (JPA).
- **MongoDB**: Stores todo items. `Item` document with `ItemRepository` (Spring Data MongoDB). Items have `ownerId` field linking to user's Keycloak subject ID.

### Security Architecture (Multi-Chain SecurityFilterChain)

Three separate security filter chains defined in `SecurityConfig`:

1. **Swagger Chain** (`@Order(0)`): Public access to `/swagger-ui/**` and `/v3/api-docs/**`
2. **Actuator Chain** (`@Order(1)`): `/actuator/health` public, other actuator endpoints require `ROLE_ACTUATOR` via HTTP Basic Auth
3. **API Chain** (`@Order(2)`): All other endpoints require JWT authentication via `JwtAuthConverter`

Key security components:
- `JwtAuthConverter`: Converts Keycloak JWT to Spring Security authorities, extracting roles from `realm_access.roles`
- `UserSyncFilter`: Runs after `BearerTokenAuthenticationFilter` to sync authenticated user from JWT to PostgreSQL via `UserService.ensureCurrentUser()`
- `CurrentUserService`: Retrieves current user's Keycloak subject ID from JWT claims

### AOP-Based Authorization & Auditing

Custom aspects in `com.example.todoapp.aop`:

- **`@RequireOwner`**: Method-level annotation for ownership verification. Aspect checks if item belongs to current user by querying `ItemRepository.existsByIdAndOwnerId()`. Supports `allowAdmin=true` to bypass for users with `ROLE_ADMIN_ROLE`. Returns 404 if item doesn't exist or belongs to another user.

- **`AuditTrailAspect`**: Automatically logs CREATE/DELETE actions on methods annotated with `@PostMapping`/`@DeleteMapping`. Creates `AuditLog` entries in MongoDB with timestamp, userId, action, and itemId.

- **`@LogExecutionTime`**: Performance monitoring annotation handled by `ExecutionTimeAspect`

- **`InputValidationAspect`**: Additional validation logic

Method security also uses Spring Security's `@PreAuthorize` and `@PostFilter` (see `ItemService.getAllItemsForAdmin()` and `ItemService.getAllItemsForUser()`).

### Service Layer Pattern

Services in `com.example.todoapp.service` handle business logic:
- `ItemService`: Manages CRUD for items with ownership filtering via `@PostFilter` and `@RequireOwner`
- `UserService`: Handles user synchronization from Keycloak JWT to PostgreSQL

Controllers delegate to services and should not contain business logic.

## Configuration & Profiles

- `application.yml`: Base config (port 8082, PostgreSQL dialect, logging levels)
- `application-local.yml`: Local development with real Keycloak
- `application-dev.yml`: Development environment
- `application-test.yml`: Test profile (used by `AbstractIntegrationTest`)

### Key Configuration Properties

OAuth2 resource server configuration expected in profile-specific YML (not in base `application.yml`):
```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: <keycloak-issuer-uri>
```

Actuator security via properties:
```yaml
actuator:
  username: <username>
  password: <password>
```

## Test Utilities

- `UserTestUtils.basicUser()`: Creates test `User` instances
- `JwtTestUtils`: Helper for creating test JWT tokens in security tests

## Common Patterns

### Adding a new entity with ownership
1. Create entity class with `ownerId` field (String type matching Keycloak subject)
2. Add repository with query methods like `existsByIdAndOwnerId()`
3. Use `@RequireOwner` on service methods that operate on single entities
4. Use `@PostFilter` on service methods returning lists to filter by `principal.claims['sub']`
5. Consider adding audit logging with `@PostMapping`/`@DeleteMapping` annotations

### Writing tests
- Integration tests: Extend `AbstractIntegrationTest` for full app context with real databases
- Repository tests: Use `@DataJpaTest` or `@DataMongoTest` for focused repository testing with embedded databases (H2 for JPA, Flapdoodle for MongoDB)
- Controller tests: Use `@WebMvcTest(ControllerClass.class)` with `@MockBean` for dependencies
- Security tests: Use `@WithMockUser` or `JwtTestUtils` to create authenticated contexts