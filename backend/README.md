# Todo App - Backend

Spring Boot 3.5.4 REST API with OAuth2/JWT authentication via Keycloak, dual-database architecture (PostgreSQL + MongoDB), and comprehensive security using AOP-based authorization.

## Overview

Enterprise-grade backend for a todo application featuring:
- **OAuth2/OIDC Authentication** - Keycloak-issued JWT tokens
- **Dual Database Architecture** - PostgreSQL for users, MongoDB for todo items
- **AOP-Based Security** - Custom `@RequireOwner` annotation for ownership verification
- **Automatic Audit Logging** - AOP aspects for CREATE/DELETE operations
- **Multi-Chain Security** - Separate filter chains for API, Swagger, and Actuator
- **Comprehensive Testing** - Integration, repository slice, and security tests with Testcontainers
- **API Documentation** - Interactive Swagger UI with OAuth2 integration

## Tech Stack

- **Java 25** - Programming language
- **Spring Boot 3.5.4** - Application framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - PostgreSQL integration (users)
- **Spring Data MongoDB** - MongoDB integration (todo items)
- **Spring AOP** - Cross-cutting concerns (ownership, audit, performance)
- **Maven** - Build and dependency management
- **Lombok** - Reduce boilerplate code
- **SpringDoc OpenAPI** - API documentation (Swagger)
- **Testcontainers** - Integration testing with real databases
- **JUnit 5** - Testing framework

## Prerequisites

- **Java 25** - Required for building and running
- **Maven 3.9+** - Build tool (or use included `./mvnw`)
- **Docker** - Required for Testcontainers and local development
- **PostgreSQL 16** - User database (via Docker)
- **MongoDB 7** - Todo items database (via Docker)
- **Keycloak 25.0** - Authentication server (via Docker)

## Quick Start

### 1. Start Infrastructure Services

Start PostgreSQL, MongoDB, and Keycloak:

```bash
cd ..  # Go to project root
docker-compose -f docker-compose-local.yml up -d
cd backend
```

### 2. Configure Keycloak

First time setup (see root README.md for detailed Keycloak configuration).

### 3. Run the Application

With local profile (uses Docker services):

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Application will start on http://localhost:8082

### 4. Test the API

Access Swagger UI: http://localhost:8082/swagger-ui.html

## Building

### Clean Build

```bash
./mvnw clean install
```

### Package Without Tests

```bash
./mvnw clean package -DskipTests
```

### Generate JAR for Deployment

```bash
./mvnw clean package
# Output: target/jamigos-0.0.1-SNAPSHOT.jar
```

### Run the JAR

```bash
java -jar target/jamigos-0.0.1-SNAPSHOT.jar --spring.profiles.active=local
```

## Running

### Development Mode

With Maven (hot reload with spring-boot-devtools):

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

### With Specific Profile

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### With JVM Arguments

```bash
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Xmx512m -Dserver.port=9090"
```

### Direct JAR Execution

```bash
java -jar target/jamigos-0.0.1-SNAPSHOT.jar
```

## Configuration

### Application Profiles

The application supports multiple Spring profiles:

- **`local`** - Local development with Docker services
  - PostgreSQL: `localhost:5432`
  - MongoDB: `localhost:27017`
  - Keycloak: `localhost:8180`

- **`dev`** - Development environment

- **`test`** - Test profile (auto-configured by `AbstractIntegrationTest`)
  - Uses Testcontainers for databases
  - Embedded MongoDB for repository slice tests

### Profile Files

- `src/main/resources/application.yml` - Base configuration
- `src/main/resources/application-local.yml` - Local development
- `src/main/resources/application-dev.yml` - Development environment
- `src/main/resources/application-test.yml` - Test configuration

### Key Configuration Properties

**Database Configuration (application-local.yml):**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/jamigos
    username: admin
    password: admin
  data:
    mongodb:
      uri: mongodb://admin:admin@localhost:27017/todosdb?authSource=admin
```

**OAuth2 Resource Server:**
```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8180/realms/jamigos-realm
```

**Actuator Security:**
```yaml
actuator:
  username: admin
  password: admin
```

**Server Configuration:**
```yaml
server:
  port: 8082
```

### Environment Variables

Set via environment or IDE run configuration:

```bash
export SPRING_PROFILES_ACTIVE=local
export SERVER_PORT=8082
```

## Architecture

### Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/example/jamigos/
│   │   │   ├── aop/                      # AOP aspects
│   │   │   │   ├── AuditTrailAspect.java       # Audit logging
│   │   │   │   ├── RequireOwnerAspect.java     # Ownership verification
│   │   │   │   ├── RequireOwner.java           # @RequireOwner annotation
│   │   │   │   ├── ExecutionTimeAspect.java    # Performance monitoring
│   │   │   │   └── InputValidationAspect.java  # Input validation
│   │   │   ├── config/                   # Configuration
│   │   │   │   ├── SecurityConfig.java          # Multi-chain security
│   │   │   │   ├── MongoConfig.java             # MongoDB config
│   │   │   │   ├── JpaConfig.java               # JPA config
│   │   │   │   ├── CorsConfig.java              # CORS configuration
│   │   │   │   └── OpenApiConfig.java           # Swagger/OpenAPI
│   │   │   ├── controller/               # REST controllers
│   │   │   │   ├── ItemController.java          # Todo items API
│   │   │   │   ├── UserController.java          # User API
│   │   │   │   └── GlobalExceptionHandler.java # Exception handling
│   │   │   ├── dto/                      # Data transfer objects
│   │   │   │   └── ItemCreateRequest.java
│   │   │   ├── model/                    # Domain models
│   │   │   │   ├── Item.java                    # MongoDB document
│   │   │   │   ├── User.java                    # JPA entity
│   │   │   │   └── AuditLog.java                # MongoDB document
│   │   │   ├── repository/               # Data access layer
│   │   │   │   ├── ItemRepository.java          # MongoDB repository
│   │   │   │   ├── UserRepository.java          # JPA repository
│   │   │   │   └── AuditLogRepository.java      # MongoDB repository
│   │   │   ├── security/                 # Security components
│   │   │   │   ├── JwtAuthConverter.java        # JWT to authorities
│   │   │   │   ├── UserSyncFilter.java          # User sync filter
│   │   │   │   └── CurrentUserService.java      # Current user helper
│   │   │   ├── service/                  # Business logic
│   │   │   │   ├── ItemService.java             # Item operations
│   │   │   │   └── UserService.java             # User operations
│   │   │   └── TodoAppApplication.java   # Main application class
│   │   └── resources/
│   │       ├── application.yml                  # Base config
│   │       ├── application-local.yml            # Local profile
│   │       ├── application-dev.yml              # Dev profile
│   │       ├── application-test.yml             # Test profile
│   │       └── logback-spring.xml               # Logging config
│   └── test/
│       └── java/com/example/jamigos/
│           ├── AbstractIntegrationTest.java     # Base integration test
│           ├── controller/                       # Controller tests
│           ├── repository/                       # Repository tests
│           ├── service/                          # Service tests
│           ├── security/                         # Security tests
│           └── util/                             # Test utilities
├── pom.xml                               # Maven dependencies
├── Dockerfile                            # Docker image
├── CLAUDE.md                             # AI assistant guidance
└── README.md                             # This file
```

### Security Architecture

**Three-Chain Security Configuration (`SecurityConfig.java`):**

1. **Swagger Chain** (`@Order(0)`)
   - Paths: `/swagger-ui/**`, `/v3/api-docs/**`
   - Access: Public (no authentication)

2. **Actuator Chain** (`@Order(1)`)
   - Paths: `/actuator/**`
   - `/actuator/health`: Public
   - Other endpoints: HTTP Basic Auth with `ROLE_ACTUATOR`

3. **API Chain** (`@Order(2)`)
   - Paths: All other endpoints
   - Authentication: JWT via `JwtAuthConverter`
   - User sync: `UserSyncFilter` after JWT authentication

**Key Security Components:**

- **`JwtAuthConverter`**: Extracts roles from `realm_access.roles` in Keycloak JWT
- **`UserSyncFilter`**: Syncs authenticated user from JWT to PostgreSQL (`UserService.ensureCurrentUser()`)
- **`CurrentUserService`**: Retrieves current user's Keycloak subject ID from JWT claims

### AOP-Based Authorization

**`@RequireOwner` Annotation:**

Custom annotation for method-level ownership verification:

```java
@RequireOwner(idParam = "id", allowAdmin = true)
public void deleteItem(String id) {
    itemRepository.deleteById(id);
}
```

How it works:
1. `RequireOwnerAspect` intercepts annotated methods
2. Extracts item ID from method parameter
3. Queries `ItemRepository.existsByIdAndOwnerId(itemId, currentUserId)`
4. Returns 404 if item doesn't exist or belongs to another user
5. Bypasses check for users with `ROLE_ADMIN_ROLE` if `allowAdmin=true`

**Audit Logging:**

`AuditTrailAspect` automatically logs operations:

```java
@PostMapping  // Automatically logged as CREATE
public void addItem(@RequestBody ItemCreateRequest request) {
    // ...
}

@DeleteMapping("/{id}")  // Automatically logged as DELETE
public void deleteItem(@PathVariable String id) {
    // ...
}
```

Creates `AuditLog` entries in MongoDB with:
- Timestamp
- User ID
- Action (CREATE/DELETE)
- Item ID

### Dual Database Architecture

**PostgreSQL (JPA):**
- **Entity**: `User` (in `com.example.jamigos.model`)
- **Repository**: `UserRepository` (extends `JpaRepository`)
- **Purpose**: Store user accounts synced from Keycloak
- **Fields**: UUID id, keycloakId, username, displayName, email, timestamps

**MongoDB:**
- **Documents**: `Item`, `AuditLog`
- **Repositories**: `ItemRepository`, `AuditLogRepository` (extend `MongoRepository`)
- **Purpose**: Store todo items and audit logs
- **Item Fields**: String id, text, ownerId (links to Keycloak sub), timestamps

### Method Security

Beyond AOP, the application uses Spring Security annotations:

```java
// Filter results by current user
@PostFilter("filterObject.ownerId == principal.claims['sub']")
public List<Item> getAllItemsForUser() {
    return itemRepository.findAll();
}

// Require ADMIN_ROLE
@PreAuthorize("hasRole('ADMIN_ROLE')")
public List<Item> getAllItemsForAdmin() {
    return itemRepository.findAll();
}
```

## API Endpoints

### Todo Items

**Get all items for current user**
```
GET /items
Authorization: Bearer <jwt-token>
Response: 200 OK, List<Item>
```

**Create new item**
```
POST /items
Authorization: Bearer <jwt-token>
Content-Type: application/json
Body: { "text": "Buy groceries" }
Response: 201 CREATED
```

**Delete item (ownership verified)**
```
DELETE /items/{id}
Authorization: Bearer <jwt-token>
Response: 204 NO CONTENT
```

**Get all items (admin only)**
```
GET /items/all
Authorization: Bearer <jwt-token>
Requires: ROLE_ADMIN_ROLE
Response: 200 OK, List<Item>
```

### Health & Monitoring

**Health check (public)**
```
GET /actuator/health
Response: 200 OK, { "status": "UP" }
```

**Application info (requires basic auth)**
```
GET /actuator/info
Authorization: Basic <base64(actuator-username:actuator-password)>
Response: 200 OK
```

### API Documentation

**Swagger UI**
```
GET /swagger-ui.html
Interactive API documentation with OAuth2 integration
```

**OpenAPI JSON**
```
GET /v3/api-docs
OpenAPI 3.0 specification
```

## Testing

### Running Tests

**All tests:**
```bash
./mvnw test
```

**Specific test class:**
```bash
./mvnw test -Dtest=ItemControllerTest
```

**Specific test method:**
```bash
./mvnw test -Dtest=ItemControllerTest#shouldCreateItem
```

**Pattern matching:**
```bash
./mvnw test -Dtest=*ControllerTest
./mvnw test -Dtest=*RepositoryTest
```

**With coverage:**
```bash
./mvnw clean test jacoco:report
# Report: target/site/jacoco/index.html
```

### Test Types

**1. Integration Tests**

Extend `AbstractIntegrationTest` for full Spring context with real databases:

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class ItemControllerTest extends AbstractIntegrationTest {
    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void shouldCreateItem() {
        // Test with real HTTP requests
    }
}
```

- Uses Testcontainers (MongoDB + PostgreSQL)
- Full application context
- Real HTTP requests via `TestRestTemplate` or `MockMvc`
- Examples: `ItemControllerTest`, `UserControllerTest`

**2. Repository Slice Tests**

Test only the data access layer:

```java
@DataJpaTest  // For JPA repositories
public class UserRepositoryTest {
    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldFindUserByKeycloakId() {
        // Test repository methods
    }
}
```

```java
@DataMongoTest  // For MongoDB repositories
public class ItemRepositoryTest {
    @Autowired
    private ItemRepository itemRepository;

    @Test
    void shouldFindByOwnerId() {
        // Test repository methods
    }
}
```

- Lightweight (no full application context)
- Embedded databases (H2 for JPA, Flapdoodle for MongoDB)
- Fast execution
- Examples: `UserRepositoryTest`, `ItemRepositoryTest`, `AuditLogRepositoryTest`

**3. Security Tests**

Test security configurations and authentication:

```java
@SpringBootTest
public class ActuatorSecurityTest extends AbstractIntegrationTest {
    @Test
    void actuatorHealthShouldBePublic() {
        // Test without authentication
    }

    @Test
    void actuatorInfoRequiresAuth() {
        // Test with basic auth
    }
}
```

- Mock security context with `@WithMockUser`
- Use `JwtTestUtils` for creating test JWTs
- Examples: `ActuatorSecurityTest`, `UserSyncFilterTest`

### Test Utilities

**`UserTestUtils`**
```java
User user = UserTestUtils.basicUser();
```

**`JwtTestUtils`**
```java
String token = JwtTestUtils.createJwt("user123", List.of("ADMIN_ROLE"));
```

**`AbstractIntegrationTest`**
```java
public class MyTest extends AbstractIntegrationTest {
    // Automatically gets Testcontainers setup
}
```

## Docker

### Build Image

```bash
docker build -t jamigos-backend .
```

### Run Container

```bash
docker run -p 8082:8082 \
  -e SPRING_PROFILES_ACTIVE=local \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/jamigos \
  -e SPRING_DATA_MONGODB_URI=mongodb://admin:admin@host.docker.internal:27017/todosdb \
  jamigos-backend
```

### Multi-Stage Build

The Dockerfile uses multi-stage build for optimization:

1. **Build Stage**: Maven build with dependency caching
2. **Runtime Stage**: Eclipse Temurin JRE, runs as non-root user (10001:10001)

## Logging

### Log Levels

Configure in `application.yml`:

```yaml
logging:
  level:
    org.springframework.security: DEBUG
    org.springframework.security.oauth2: DEBUG
    com.example.jamigos.aop: INFO
    com.example.jamigos: DEBUG
```

### View Logs

**During development:**
```bash
tail -f logs/spring.log
```

**In production:**
Configure log aggregation (ELK, Splunk, etc.)

## Troubleshooting

### Application Won't Start

**Check Java version:**
```bash
java -version  # Should be Java 25
```

**Check database connectivity:**
```bash
# PostgreSQL
docker exec -it local-postgres pg_isready

# MongoDB
docker exec -it local-mongo mongosh --eval "db.adminCommand('ping')"
```

**Check Keycloak:**
```bash
curl http://localhost:8180/realms/jamigos-realm/.well-known/openid-configuration
```

### Tests Failing

**Testcontainers requires Docker:**
```bash
docker ps  # Verify Docker is running
```

**Port conflicts:**
```bash
lsof -i :5432  # PostgreSQL
lsof -i :27017 # MongoDB
lsof -i :8180  # Keycloak
```

**Clean build:**
```bash
./mvnw clean install
```

### JWT Authentication Errors

**Invalid issuer:**
- Verify `spring.security.oauth2.resourceserver.jwt.issuer-uri` matches Keycloak realm

**Token expired:**
- Keycloak tokens have short expiration (default 5 minutes)
- Refresh token or get new one

**Missing roles:**
- Verify Keycloak client has role mapper configured
- Check JWT payload contains `realm_access.roles`

### Database Connection Errors

**PostgreSQL:**
- Check credentials in `application-local.yml`
- Verify database exists: `docker exec -it local-postgres psql -U admin -d jamigos`

**MongoDB:**
- Check authentication source: `?authSource=admin`
- Verify database: `docker exec -it local-mongo mongosh --username admin --password admin`

## Performance

### Monitoring

- **Actuator Metrics**: `/actuator/metrics`
- **Execution Time Logging**: Methods annotated with `@LogExecutionTime`

### Optimization Tips

1. **Database Indexes**: Add indexes on frequently queried fields (e.g., `Item.ownerId`)
2. **Connection Pooling**: Configure HikariCP for PostgreSQL
3. **Caching**: Add Spring Cache for read-heavy operations
4. **Pagination**: Use `Pageable` for large result sets

## Further Reading

- [CLAUDE.md](./CLAUDE.md) - Detailed architectural guidance for AI assistants
- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Spring Security OAuth2 Resource Server](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Testcontainers](https://www.testcontainers.org/)
