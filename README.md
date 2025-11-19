# Jamigos

A full-stack todo application with enterprise-grade authentication and authorization. Built with Vue.js frontend, Spring Boot backend, and Keycloak for OAuth2/OIDC authentication.

## Features

- **Secure Authentication**: OAuth2/OIDC via Keycloak with JWT tokens
- **User Isolation**: Todo items are user-scoped with ownership verification
- **Role-Based Access**: Admin role for viewing all items across users
- **Audit Logging**: Automatic audit trail for CREATE/DELETE operations
- **Dual Database**: PostgreSQL for users, MongoDB for todo items
- **API Documentation**: Interactive Swagger UI with OAuth2 integration
- **Monitoring**: Spring Boot Actuator endpoints with health checks
- **Comprehensive Testing**: Unit, integration, and repository slice tests with Testcontainers
- **Containerized**: Full Docker setup with database admin tools

## Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Keycloak JS** - Authentication client
- **Vite** - Build tool and dev server
- **Vitest** - Unit testing framework
- **Lucide Vue** - Icon library

### Backend
- **Spring Boot 3.5.4** - Application framework
- **Java 25** - Programming language
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - PostgreSQL integration for users
- **Spring Data MongoDB** - MongoDB integration for items
- **Spring AOP** - Aspect-oriented programming for cross-cutting concerns
- **Maven** - Build and dependency management
- **Lombok** - Reduce boilerplate code
- **SpringDoc OpenAPI** - API documentation

### Infrastructure
- **Keycloak 25.0** - Identity and access management
- **PostgreSQL 16** - Relational database for user data
- **MongoDB 7** - Document database for todo items
- **Docker** - Containerization
- **Testcontainers** - Integration testing with real databases

### Admin Tools
- **PgAdmin** - PostgreSQL administration (http://localhost:8090)
- **Mongo Express** - MongoDB administration (http://localhost:8081)

## Architecture

### Security Architecture
- **Multi-chain SecurityFilterChain**: Separate security configurations for Swagger (public), Actuator (basic auth), and API (JWT)
- **JWT Authentication**: Keycloak-issued JWTs with role mapping from `realm_access.roles`
- **User Sync Filter**: Automatically syncs authenticated users from JWT to PostgreSQL
- **AOP-Based Authorization**: Custom `@RequireOwner` annotation for ownership verification

### Data Architecture
- **PostgreSQL**: Stores user accounts synced from Keycloak (JPA entities)
- **MongoDB**: Stores todo items with `ownerId` linking to Keycloak subject ID
- **Audit Trail**: MongoDB collection for audit logs with automatic AOP-based logging

### Key Design Patterns
- **Aspect-Oriented Programming**: Cross-cutting concerns (ownership verification, audit logging, performance monitoring)
- **Method Security**: Spring Security's `@PreAuthorize` and `@PostFilter` for authorization
- **Repository Pattern**: Spring Data repositories for data access
- **Service Layer**: Business logic separated from controllers

## Prerequisites

- **Java 25** - For backend development
- **Node.js 20.19+ or 22.12+** - For frontend development
- **Maven 3.9+** - For building backend (or use included `./mvnw`)
- **Docker & Docker Compose** - For running infrastructure services
- **Git** - Version control

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jamigos
   ```

2. **Start infrastructure services**
   ```bash
   docker-compose -f docker-compose-local.yml up -d
   ```

3. **Configure Keycloak** (First time setup)
   - Access Keycloak: http://localhost:8180
   - Login with admin credentials (see `.env.local`)
   - Create realm: `jamigos-realm`
   - Create client: `jamigos-client`
     - Client authentication: OFF (public client)
     - Valid redirect URIs: `http://localhost:5173/*`, `http://localhost:8082/*`
     - Web origins: `http://localhost:5173`, `http://localhost:8082`
   - Create client scope with roles mapper
   - Create realm role: `ADMIN_ROLE` (optional, for admin features)
   - Create test users with appropriate roles

4. **Start the backend**
   ```bash
   cd backend
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=local
   ```
   Backend will be available at http://localhost:8082

5. **Start the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend will be available at http://localhost:5173

## Running Locally

### Using Docker Compose

The `docker-compose-local.yml` file starts all required infrastructure:

```bash
docker-compose -f docker-compose-local.yml up -d
```

This starts:
- **MongoDB** (port 27017)
- **Mongo Express** (port 8081)
- **Keycloak** (port 8180)
- **PostgreSQL** (port 5432)
- **PgAdmin** (port 8090)

### Environment Variables

Copy `.env.local` and adjust if needed:

```bash
cp .env.local .env
```

Default credentials:
- MongoDB: `admin/admin`
- PostgreSQL: `admin/admin`
- Keycloak: `admin/admin`
- PgAdmin: `admin@admin.nl/admin`

### Application Profiles

Backend supports multiple Spring profiles:

- **local**: For local development with Docker services
- **dev**: For development environment
- **test**: For running tests (automatically configured)

Activate a profile:
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Or set in IDE run configuration:
```
--spring.profiles.active=local
```

## Project Structure

```
jamigos/
├── backend/                  # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/jamigos/
│   │   │   │   ├── aop/               # AOP aspects
│   │   │   │   ├── config/            # Configuration classes
│   │   │   │   ├── controller/        # REST controllers
│   │   │   │   ├── dto/               # Data transfer objects
│   │   │   │   ├── model/             # Domain entities
│   │   │   │   ├── repository/        # Data access layer
│   │   │   │   ├── security/          # Security components
│   │   │   │   └── service/           # Business logic
│   │   │   └── resources/
│   │   │       ├── application.yml          # Base config
│   │   │       ├── application-local.yml    # Local profile
│   │   │       └── application-test.yml     # Test profile
│   │   └── test/              # Test classes
│   ├── pom.xml               # Maven dependencies
│   ├── Dockerfile            # Backend Docker image
│   └── CLAUDE.md             # AI assistant guidance
├── frontend/                 # Vue.js frontend
│   ├── src/
│   │   ├── components/       # Vue components
│   │   ├── router/           # Route definitions
│   │   ├── stores/           # Pinia stores
│   │   ├── views/            # Page views
│   │   └── main.js           # Application entry
│   ├── package.json          # NPM dependencies
│   └── Dockerfile            # Frontend Docker image
├── docker-compose-local.yml  # Local development setup
└── .env.local                # Environment variables
```

## Development

### Backend Development

**Build the project:**
```bash
cd backend
./mvnw clean install
```

**Run the application:**
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

**Run tests:**
```bash
./mvnw test                              # All tests
./mvnw test -Dtest=ItemControllerTest    # Specific test class
./mvnw test -Dtest=*ControllerTest       # Pattern matching
```

**Package for deployment:**
```bash
./mvnw clean package -DskipTests
```

### Frontend Development

**Install dependencies:**
```bash
cd frontend
npm install
```

**Development server with hot reload:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Run tests:**
```bash
npm test              # Run tests once with coverage
npm run test:watch    # Watch mode
```

**Lint code:**
```bash
npm run lint
```

### Adding New Features

See `backend/CLAUDE.md` for architectural guidance when adding:
- New entities with ownership verification
- New API endpoints
- New security rules
- New tests

## API Documentation

### Swagger UI

Interactive API documentation available at:
- http://localhost:8082/swagger-ui.html

The Swagger UI is integrated with Keycloak OAuth2:
1. Click "Authorize" button
2. Complete OAuth2 authorization code flow with PKCE
3. Test endpoints directly from the UI

### API Endpoints

**Items (requires authentication):**
- `GET /items` - Get all items for current user
- `POST /items` - Create new item
- `DELETE /items/{id}` - Delete item (ownership verified)
- `GET /items/all` - Get all items (admin only)

**Users (requires authentication):**
- User endpoints managed through Keycloak

**Actuator (health endpoint public, others require basic auth):**
- `GET /actuator/health` - Application health status
- `GET /actuator/info` - Application information

### Authentication

All API endpoints (except Swagger and health) require JWT authentication:

```bash
# Get token from Keycloak
curl -X POST http://localhost:8180/realms/jamigos-realm/protocol/openid-connect/token \
  -d "client_id=jamigos-client" \
  -d "grant_type=password" \
  -d "username=<user>" \
  -d "password=<password>"

# Call API with token
curl -H "Authorization: Bearer <token>" http://localhost:8082/items
```

## Configuration

### Backend Configuration

Key configuration properties in `application-local.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/jamigos
  data:
    mongodb:
      uri: mongodb://admin:admin@localhost:27017/todosdb
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8180/realms/jamigos-realm
```

### Frontend Configuration

Frontend configuration in `frontend/.env.local`:

```env
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=jamigos-realm
VITE_KEYCLOAK_CLIENT_ID=jamigos-client
VITE_API_BASE_URL=http://localhost:8082
```

## Testing

### Backend Tests

Three types of tests:

1. **Integration Tests**: Extend `AbstractIntegrationTest`
   - Full Spring context
   - Real databases via Testcontainers
   - Example: `ItemControllerTest`

2. **Repository Slice Tests**: `@DataJpaTest` or `@DataMongoTest`
   - Repository layer only
   - Embedded databases (H2 for JPA, Flapdoodle for MongoDB)
   - Example: `UserRepositoryTest`, `ItemRepositoryTest`

3. **Security Tests**: Mock security context
   - Use `@WithMockUser` or `JwtTestUtils`
   - Example: `ActuatorSecurityTest`

**Run all tests:**
```bash
cd backend
./mvnw test
```

### Frontend Tests

Unit tests with Vitest:

```bash
cd frontend
npm test              # Run once with coverage
npm run test:watch    # Interactive watch mode
```

## Deployment

### Docker Build

**Backend:**
```bash
cd backend
docker build -t jamigos-backend .
```

**Frontend:**
```bash
cd frontend
docker build -t jamigos-frontend .
```

### Environment-Specific Deployment

The application uses Spring profiles for different environments:

- **local**: Local development
- **dev**: Development environment
- **prod**: Production environment

Set profile via environment variable:
```bash
export SPRING_PROFILES_ACTIVE=prod
```

## Troubleshooting

### Backend won't start

1. **Check Java version**: Requires Java 25
   ```bash
   java -version
   ```

2. **Check database connectivity**: Ensure Docker services are running
   ```bash
   docker-compose -f docker-compose-local.yml ps
   ```

3. **Check Keycloak configuration**: Verify issuer URI is reachable
   ```bash
   curl http://localhost:8180/realms/jamigos-realm/.well-known/openid-configuration
   ```

### Frontend authentication fails

1. **Verify Keycloak client configuration**:
   - Check redirect URIs include `http://localhost:5173/*`
   - Verify web origins include `http://localhost:5173`
   - Ensure client authentication is OFF (public client)

2. **Check browser console** for CORS errors

3. **Verify environment variables** in frontend `.env.local`

### Tests failing

1. **Integration tests**: Ensure Docker is running (Testcontainers needs Docker)
2. **Port conflicts**: Make sure ports 5432, 27017, 8180 are not in use
3. **Clean build**: `./mvnw clean install`

### Database connection issues

1. **PostgreSQL**: Check with PgAdmin at http://localhost:8090
2. **MongoDB**: Check with Mongo Express at http://localhost:8081
3. **Reset volumes** if data is corrupted:
   ```bash
   docker-compose -f docker-compose-local.yml down -v
   docker-compose -f docker-compose-local.yml up -d
   ```

## License

[Specify your license here]

## Contributing

[Add contribution guidelines if applicable]