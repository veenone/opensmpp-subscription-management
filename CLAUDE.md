# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This repository contains the **SMPP Simulator Enhanced Subscription Management System** - an enterprise-grade Java-based subscription management solution for SMPP simulators, designed for telecommunications testing and integration with comprehensive MSISDN-to-UICC identity mapping capabilities.

### Project Description
A modern subscription management system that transforms static properties file-based SMPP simulator subscriptions into a scalable, remotely manageable platform with real-time synchronization, web administration, and enterprise-grade audit capabilities.

## Development Commands

### SMPP Subscription Management System
```bash
# Backend Development (Spring Boot)
./mvnw spring-boot:run                   # Run Spring Boot application
./mvnw clean compile                     # Compile Java sources
./mvnw test                             # Run unit tests
./mvnw integration-test                 # Run integration tests
./mvnw clean install                    # Build and install artifacts

# Database Operations
./mvnw flyway:migrate                   # Run database migrations
./mvnw flyway:info                      # Check migration status
./mvnw flyway:clean                     # Clean database (development only)

# Frontend Development (React/TypeScript)
cd frontend
npm install                             # Install dependencies
npm start                              # Start development server
npm test                               # Run frontend tests
npm run build                          # Build for production
npm run lint                           # Run ESLint
npm run type-check                     # Run TypeScript checks

# Docker Operations
docker-compose up -d                   # Start all services (DB, Redis, App)
docker-compose down                    # Stop all services
docker-compose logs -f app             # Follow application logs
docker-compose exec db psql -U postgres # Connect to database

# SMPP Client Testing
java -cp target/classes:target/lib/* \
  org.smpp.test.EnhancedSMPPTest        # Run enhanced SMPP client with sync commands

# API Testing
curl -X GET http://localhost:8080/api/v1/subscriptions
curl -X POST http://localhost:8080/api/v1/sync/cache/invalidate \
  -H "Content-Type: application/json" \
  -d '{"msisdn": "+1234567890"}'

# Performance Testing
./mvnw gatling:test                     # Run performance tests
./mvnw jmh:benchmark                    # Run JMH benchmarks
```

## Project Architecture

### SMPP Subscription Management System
- **Type**: Enterprise Spring Boot application with multi-interface support (Web UI, REST API, SMPP Integration)
- **Architecture**: Layered architecture with external synchronization capabilities
- **Key Components**:
  - `src/main/java/com/smpp/subscription/` - Core subscription management
  - `src/main/java/com/smpp/sync/` - External synchronization services
  - `src/main/java/com/smpp/api/` - REST API controllers and DTOs
  - `src/main/java/com/smpp/integration/` - SMPP core and Amarisoft integration
  - `src/main/java/com/smpp/cache/` - Redis caching layer
  - `frontend/src/` - React/TypeScript web administration interface
  - `database/migrations/` - Flyway database migration scripts
  - `docker/` - Docker composition and configuration files
- **Configuration**: YAML-based configuration with environment-specific profiles
- **Security Focus**: Enterprise-grade security for telecommunications subscription management

## Technology Stack

### Languages & Frameworks
- **Java 17+**: Core backend language with modern features
- **Spring Boot 3.5.5**: Enterprise application framework with security
- **React 22**: Modern frontend framework with TypeScript
- **PostgreSQL 14+**: Primary database with JSON support and triggers
- **Redis 8.2**: Distributed caching and session management

### Key Dependencies
- **Backend Libraries**:
  - `spring-boot-starter-web` - Web MVC and REST API support
  - `spring-boot-starter-data-jpa` - JPA/Hibernate database integration
  - `spring-boot-starter-security` - OAuth2/JWT authentication
  - `spring-boot-starter-cache` - Redis caching integration
  - `spring-boot-starter-websocket` - Real-time WebSocket support
  - `flyway-core` - Database migration management
  - `micrometer-registry-prometheus` - Metrics and monitoring
- **Frontend Libraries**:
  - `@mui/material` - Material-UI component library
  - `@tanstack/react-query` - Server state management
  - `react-hook-form` - Form validation and management
  - `socket.io-client` - Real-time WebSocket client
- **Integration Libraries**:
  - `amarisoft-lib` - Network simulator integration (see ../amarisoft_lib/)
  - `smpp-core` - SMPP protocol implementation

### Build Tools & Testing
- **Build**: Maven 3.9 with multi-module support
- **Testing**: JUnit 5, Mockito, TestContainers, Gatling for performance
- **Code Quality**: SpotBugs, Checkstyle, JaCoCo for coverage
- **API Documentation**: OpenAPI 3.0 with Swagger UI
- **Containerization**: Docker with multi-stage builds

## Security Considerations

This project is designed for **telecommunications subscription management** with enterprise-grade security:

### Core Security Features
- **Authentication**: OAuth2/JWT with multi-factor authentication support
- **Authorization**: Role-based access control (RBAC) with granular permissions
- **Data Protection**: AES-256-GCM encryption for sensitive subscription data
- **API Security**: Rate limiting, CORS configuration, and input validation
- **Audit Trail**: Comprehensive logging with cryptographic integrity
- **Network Security**: TLS 1.3 for all communications, secure database connections

### Enterprise Security Framework
- **Compliance Support**: GDPR, SOC2, telecommunications compliance frameworks
- **External Integration**: Secure API endpoints for provisioning system integration
- **Database Security**: Row-level security, encrypted connections, backup encryption
- **Monitoring**: Real-time security event detection and alerting
- **Incident Response**: Automated security incident detection and response

### Defensive Security Applications
- **Subscription Protection**: Secure MSISDN-to-IMPI mapping and validation
- **Access Control**: Fine-grained permissions for subscription management operations
- **Data Integrity**: External change detection and synchronization validation
- **Audit Compliance**: Complete audit trail for all subscription modifications
- **Threat Detection**: Anomaly detection for unusual subscription access patterns

## SMPP Integration

### Core SMPP Simulator Integration
- **Enhanced AmarisoftBridge**: Database-backed subscription resolution with caching
- **Real-time Synchronization**: Automatic cache invalidation on external changes
- **Command Extensions**: New SMPP client commands for subscription management
- **Performance Optimization**: Sub-50ms subscription lookup with 95%+ cache hit ratio

### Subscription Synchronization
- **External Change Detection**: PostgreSQL triggers capture database modifications
- **Cache Management**: Redis-based caching with intelligent TTL management
- **Memory Synchronization**: AmarisoftBridge in-memory state consistency
- **Validation Commands**: Data consistency checking across all system layers

### SMPP Client Commands
- **REFRESH_SUBSCRIPTION**: Force reload specific subscription from database
- **SYNC_ALL_SUBSCRIPTIONS**: Full synchronization of all subscription data
- **VALIDATE_SUBSCRIPTION**: Check consistency between cache/memory and database
- **GET_SUBSCRIPTION_STATUS**: Retrieve subscription state with cache information
- **CHECK_SYNC_HEALTH**: Verify data consistency across all system layers

## Enterprise Features

### Scalability & Performance
- **High Throughput**: Support 1000+ API requests/second with proper load balancing
- **Large Scale**: Handle 500,000+ active subscriptions with sub-second lookups
- **Horizontal Scaling**: Multi-instance deployment with distributed caching
- **Performance Monitoring**: Real-time metrics with Prometheus and Grafana

### External System Integration
- **REST API**: Comprehensive API for external provisioning system integration
- **Database Triggers**: Automatic detection of external subscription modifications
- **Event Streaming**: Real-time subscription change notifications
- **Webhook Support**: Configurable webhooks for subscription lifecycle events
- **Bulk Operations**: Efficient import/export for large subscription datasets

### Operational Excellence
- **Health Monitoring**: Comprehensive health checks and system status monitoring
- **Automated Backup**: Point-in-time recovery with encrypted backup storage
- **Zero Downtime**: Blue-green deployments with rolling updates
- **Observability**: Structured logging with correlation IDs and distributed tracing

## Important Notes

### Development Guidelines
- **Database Changes**: All schema changes must use Flyway migrations
- **API Design**: Follow OpenAPI 3.0 specification and RESTful principles
- **Caching Strategy**: Implement cache-aside pattern with TTL management
- **Error Handling**: Use structured error responses with correlation IDs
- **Testing**: Maintain 90%+ test coverage with integration and performance tests
- **Development Architecture**: Follow clean architecture for the implementation

### External Synchronization Requirements
- **Change Detection**: External database changes must trigger cache invalidation within 30 seconds
- **Data Consistency**: Maintain 99.9% consistency between database, cache, and memory
- **Conflict Resolution**: Handle simultaneous updates from multiple sources gracefully
- **Performance Impact**: External sync operations should not degrade SMPP performance by > 10ms

### Security Requirements
- **Input Validation**: All API inputs must be validated against telecommunications standards
- **Access Logging**: All subscription access must be logged with user and IP information
- **Data Encryption**: Sensitive fields (IMPI, IMSI) must be encrypted at rest
- **Rate Limiting**: API endpoints must implement rate limiting to prevent abuse

## Testing and Quality Assurance

### Testing Strategy
- **Unit Tests**: JUnit 5 with Mockito for service and component testing
- **Integration Tests**: TestContainers for database and Redis integration testing
- **Performance Tests**: Gatling for load testing and JMH for micro-benchmarks
- **Security Tests**: OWASP ZAP integration for security scanning
- **Contract Tests**: Pact for API contract testing between services

### Quality Standards
- **Code Coverage**: Minimum 90% line coverage for critical components
- **Performance**: API response times < 200ms for 95th percentile
- **Availability**: 99.9% uptime during business hours
- **Data Integrity**: Zero data corruption or loss during synchronization

For detailed implementation guidance, API specifications, and deployment procedures, refer to the comprehensive Product Requirements Document (PRD_SMPP_Subscription_Management_System.md) in this repository.

## Quick Start

### Development Environment Setup
1. **Prerequisites**: Java 17+, Node.js 22, Docker, PostgreSQL 14+
2. **Database**: `docker-compose up -d postgres redis`
3. **Backend**: `./mvnw spring-boot:run`
4. **Frontend**: `cd frontend && npm start`
5. **Testing**: Access http://localhost:3000 for web UI, http://localhost:8080/swagger-ui for API docs

### SMPP Client Testing
1. **Build**: `./mvnw clean install`
2. **Run Enhanced Client**: `java -cp target/classes:target/lib/* org.smpp.test.EnhancedSMPPTest`
3. **Test Sync Commands**: Use menu options 20-24 for subscription synchronization
4. **Validate Integration**: Verify subscription changes reflect across all system layers

# important-instruction-reminders
Focus on telecommunications subscription management and SMPP integration.
ALWAYS consider external synchronization requirements when modifying subscription-related code.
NEVER bypass cache invalidation when updating subscription data.
ALWAYS validate MSISDN format according to E.164 standard.
PREFER database-backed operations over in-memory-only changes.
ALWAYS implement proper error handling for external system integrations.
NEVER expose sensitive subscription data (IMPI, IMSI) in logs or error messages.
