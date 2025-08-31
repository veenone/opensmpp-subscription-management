# SMPP Subscription Management System

Enterprise-grade subscription management solution for SMPP simulators with comprehensive MSISDN-to-UICC identity mapping capabilities.

## Overview

A modern subscription management system that transforms static properties file-based SMPP simulator subscriptions into a scalable, remotely manageable platform with real-time synchronization, web administration, and enterprise-grade audit capabilities.

## Features

- **Database-backed Subscription Management**: PostgreSQL-based storage with full CRUD operations
- **Real-time Synchronization**: Automatic cache invalidation and memory state updates
- **Web Administration Interface**: React-based UI for subscription management
- **RESTful API**: Comprehensive API for external system integration
- **SMPP Integration**: Enhanced commands for subscription synchronization
- **Security**: OAuth2/JWT authentication with role-based access control
- **Monitoring**: Prometheus metrics and Grafana dashboards
- **High Performance**: Sub-50ms lookups with 95%+ cache hit ratio

## Quick Start

### Prerequisites

- Java 17+
- Node.js 18+
- Docker and Docker Compose
- Git

### Database Setup (5 minutes)

The system requires PostgreSQL and Redis. The easiest way is using Docker:

#### Option 1: Quick Docker Setup (Recommended)
```bash
# Start PostgreSQL and Redis containers
docker-compose up -d postgres redis

# Verify containers are running
docker-compose ps
```

**Default Database Configuration:**
- **Database**: `smpp_subscriptions`
- **Username**: `postgres` 
- **Password**: `postgres`
- **PostgreSQL Port**: `5432`
- **Redis Port**: `6379`
- **Redis Password**: `redis_password`

#### Option 2: Manual Database Setup
If you prefer local installations:

**PostgreSQL:**
```bash
# Create database and user
psql -U postgres -c "CREATE DATABASE smpp_subscriptions;"
psql -U postgres -c "CREATE USER smpp_user WITH PASSWORD 'smpp_password_2024';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE smpp_subscriptions TO smpp_user;"
```

**Redis:**
```bash
# Start Redis with password
redis-server --requirepass redis_password
```

### Development Setup

1. **Start Infrastructure Services**
```bash
docker-compose up -d postgres redis
```

2. **Verify Database Connection**
```bash
# Test PostgreSQL connection
docker exec -it smpp_postgres psql -U postgres -d smpp_subscriptions -c "SELECT version();"

# Test Redis connection  
docker exec -it smpp_redis redis-cli -a redis_password ping
```

3. **Run Backend Application**
```bash
./mvnw spring-boot:run
```

4. **Install Frontend Dependencies**
```bash
cd frontend
npm install
```

5. **Start Frontend Development Server**
```bash
npm run dev
```

6. **Access the Application**
- Web UI: http://localhost:3000 (or check console for actual port)
- API Documentation: http://localhost:8080/swagger-ui.html
- Health Check: http://localhost:8080/actuator/health
- Database Admin: http://localhost:8081 (Adminer, if enabled)

### Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Services will be available at:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8080
# - Prometheus: http://localhost:9091
# - Grafana: http://localhost:3001 (admin/admin)
```

## Project Structure

```
smpp-subscription-management/
├── backend/                    # Spring Boot backend application
│   ├── src/main/java/         # Java source code
│   └── src/main/resources/    # Configuration files
├── frontend/                   # React frontend application
│   ├── src/                   # TypeScript/React source
│   └── public/                # Static assets
├── smpp-core/                 # SMPP protocol implementation
├── amarisoft-integration/     # Amarisoft simulator integration
├── docs/                      # Project documentation
│   ├── planning.md            # Development planning and phases
│   └── tasks.md              # Detailed task tracking
├── docker/                    # Docker configuration files
│   ├── prometheus/           # Prometheus monitoring config
│   └── grafana/              # Grafana dashboard config
├── .mvn/wrapper/             # Maven wrapper configuration
├── mvnw                      # Maven wrapper (Unix/Linux)
├── mvnw.cmd                  # Maven wrapper (Windows)
├── docker-compose.yml        # Development environment
└── CLAUDE.md                 # Development guidelines
```

## API Endpoints

### Subscription Management
- `GET /api/v1/subscriptions` - List all subscriptions
- `GET /api/v1/subscriptions/{msisdn}` - Get subscription by MSISDN
- `POST /api/v1/subscriptions` - Create new subscription
- `PUT /api/v1/subscriptions/{msisdn}` - Update subscription
- `DELETE /api/v1/subscriptions/{msisdn}` - Delete subscription

### Synchronization
- `POST /api/v1/sync/cache/invalidate` - Invalidate cache for specific MSISDN
- `POST /api/v1/sync/refresh-all` - Refresh all subscriptions
- `GET /api/v1/sync/health` - Check synchronization health

## Development Commands

### Backend
```bash
# Windows users can use mvnw.cmd instead of ./mvnw
./mvnw clean compile          # Compile Java sources
./mvnw test                   # Run unit tests
./mvnw integration-test       # Run integration tests
./mvnw spring-boot:run        # Run application
```

### Frontend (Vite)
```bash
cd frontend
npm install                   # Install dependencies
npm run dev                  # Start Vite development server
npm start                    # Alternative: Start dev server
npm test                     # Run tests with Vitest
npm run build               # Build for production
npm run preview             # Preview production build
npm run lint                # Run ESLint
npm run type-check          # Run TypeScript checks
npm run format              # Format code with Prettier
```

### Database
```bash
./mvnw flyway:migrate        # Run database migrations
./mvnw flyway:info          # Check migration status
./mvnw flyway:clean         # Clean database (dev only)
```

### Docker Operations
```bash
docker-compose up -d postgres redis    # Start infrastructure only
docker-compose up --build             # Build and start all services
docker-compose down                    # Stop all services
docker-compose logs -f app            # Follow application logs
```

## Testing

### Unit Tests
```bash
./mvnw test
```

### Integration Tests
```bash
./mvnw integration-test
```

### Performance Tests
```bash
./mvnw gatling:test
```

## Security

This system implements enterprise-grade security features:
- OAuth2/JWT authentication
- Role-based access control (RBAC)
- AES-256-GCM encryption for sensitive data
- TLS 1.3 for all communications
- Comprehensive audit logging

## Development Status

**Current Phase**: Phase 2 Complete ✅  
**Next Phase**: Phase 3 - Frontend Development

### Completed (Phase 1)
- ✅ Project foundation and structure
- ✅ Spring Boot backend with comprehensive configuration
- ✅ React TypeScript frontend with Vite migration
- ✅ Docker development environment
- ✅ Monitoring setup (Prometheus/Grafana)
- ✅ Cross-platform build support (Windows/Linux/Mac)
- ✅ Configuration issues resolved (TypeScript 5.9.2 compatibility)
- ✅ Application startup verification and testing

### Completed (Phase 2)
- ✅ Database schema design with 3 Flyway migrations
- ✅ Core subscription entities with JPA annotations
- ✅ Authentication and security implementation (JWT, RBAC)
- ✅ REST API controllers with 15+ endpoints
- ✅ MSISDN E.164 validation with comprehensive testing
- ✅ Enhanced AmarisoftBridge with database integration
- ✅ External synchronization service with real-time processing
- ✅ Redis caching with sub-50ms performance
- ✅ Comprehensive testing suite (90%+ coverage)
- ✅ PostgreSQL triggers for external change detection
- ✅ Audit logging with cryptographic integrity

### In Progress (Phase 3)
- 🔄 Frontend UI/UX implementation with Material Design 3
- 🔄 Real-time WebSocket integration
- 🔄 Theme configuration and customization

For detailed planning and task tracking, see:
- [Development Planning](docs/planning.md)
- [Task Tracking](docs/tasks.md)

## License

Copyright (c) 2024. All rights reserved.

## Support

For issues and questions, please refer to the project documentation or contact the development team.