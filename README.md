# SMPP Simulator Enhanced Subscription Management System

> An enterprise-grade Java-based subscription management solution for SMPP simulators, designed for telecommunications testing and integration with comprehensive MSISDN-to-UICC identity mapping capabilities.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Java](https://img.shields.io/badge/Java-17%2B-orange.svg)](https://adoptopenjdk.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18%2B-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-blue.svg)](https://www.postgresql.org/)

## 🚀 Overview

This project transforms static properties file-based SMPP simulator subscriptions into a scalable, remotely manageable platform with real-time synchronization, web administration, and enterprise-grade audit capabilities.

### Key Features

- **🔄 Real-time Synchronization**: Automatic cache invalidation and external change detection
- **🌐 Web Administration**: Modern React/TypeScript interface for subscription management
- **📊 Enterprise Scalability**: Support 500,000+ active subscriptions with sub-second lookups
- **🔒 Security First**: OAuth2/JWT authentication with role-based access control
- **📈 Performance Optimized**: Redis caching with 95%+ cache hit ratio target
- **🔍 Comprehensive Audit**: Complete audit trail with cryptographic integrity
- **🔌 API-First Design**: RESTful APIs for external system integration
- **📱 SMPP Integration**: Enhanced client commands for subscription synchronization

## 🏗️ Architecture

### System Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │   SMPP Client   │    │ External Systems│
│  (React/TS)     │    │   Enhanced      │    │ (Provisioning)  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Spring Boot API Gateway                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │ Subscription│  │    Auth     │  │    Sync     │           │
│  │  Service    │  │   Service   │  │   Service   │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
└─────────────────────┬───────────────────────────────────────────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
    ┌─────────┐ ┌─────────┐ ┌─────────────┐
    │PostgreSQL│ │  Redis  │ │ Amarisoft   │
    │Database │ │ Cache   │ │ Integration │
    └─────────┘ └─────────┘ └─────────────┘
```

### Key Components
- **Backend**: Spring Boot 3.x with Java 17+, PostgreSQL, Redis
- **Frontend**: React 18+ with TypeScript, Material-UI
- **Integration**: Enhanced Amarisoft library integration
- **Infrastructure**: Docker containerization with monitoring

## 📋 Problem Solved

### Current Pain Points
- **Service Disruption**: Manual file editing requires application restarts
- **Limited Scalability**: Simple TreeMap cannot handle enterprise-scale data
- **No Remote Access**: No API or web interface for management
- **Missing Audit Trail**: No accountability or change tracking
- **Basic Identity Mapping**: Only simple MSISDN→IMPI mapping

### Our Solution
- **Zero-Downtime Updates**: Real-time subscription management without restarts
- **Enterprise Scale**: Database-backed system supporting 500,000+ subscriptions
- **Multi-Interface Access**: Web UI, REST API, and enhanced SMPP client
- **Comprehensive Audit**: Complete change tracking with cryptographic integrity
- **Advanced Identity Management**: Full MSISDN-to-UICC mapping with validation

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 6+

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd opensmpp-subscription-management-system
   ```

2. **Start infrastructure services**
   ```bash
   docker-compose up -d postgres redis
   ```

3. **Backend setup**
   ```bash
   ./mvnw clean install
   ./mvnw flyway:migrate
   ./mvnw spring-boot:run
   ```

4. **Frontend setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

5. **Access the application**
   - Web UI: http://localhost:3000
   - API Documentation: http://localhost:8080/swagger-ui
   - Backend API: http://localhost:8080/api/v1

### Testing SMPP Integration

```bash
# Build the enhanced SMPP client
./mvnw clean install

# Run the SMPP client with synchronization commands
java -cp target/classes:target/lib/* org.smpp.test.EnhancedSMPPTest

# Available sync commands in SMPP client:
# 20. REFRESH_SUBSCRIPTION - Reload specific subscription
# 21. SYNC_ALL_SUBSCRIPTIONS - Full synchronization
# 22. VALIDATE_SUBSCRIPTION - Check data consistency
# 23. GET_SUBSCRIPTION_STATUS - Retrieve subscription state
# 24. CHECK_SYNC_HEALTH - Verify system-wide consistency
```

## 💻 Development Commands

### Backend (Spring Boot)
```bash
./mvnw spring-boot:run              # Run application
./mvnw clean compile                # Compile sources
./mvnw test                        # Run unit tests
./mvnw integration-test            # Run integration tests
./mvnw clean install               # Build and install
```

### Database Operations
```bash
./mvnw flyway:migrate              # Run migrations
./mvnw flyway:info                 # Check migration status
./mvnw flyway:clean                # Clean database (dev only)
```

### Frontend (React/TypeScript)
```bash
cd frontend
npm install                        # Install dependencies
npm start                         # Start dev server
npm test                          # Run tests
npm run build                     # Production build
npm run lint                      # Run ESLint
npm run type-check                # TypeScript checks
```

### Docker Operations
```bash
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f app        # Follow app logs
docker-compose exec db psql -U postgres  # DB access
```

## 📖 API Examples

### Subscription Management
```bash
# Get all subscriptions
curl -X GET http://localhost:8080/api/v1/subscriptions

# Create new subscription
curl -X POST http://localhost:8080/api/v1/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "msisdn": "+1234567890",
    "impi": "001010000000123@ims.example.com",
    "status": "ACTIVE"
  }'

# Update subscription
curl -X PUT http://localhost:8080/api/v1/subscriptions/123 \
  -H "Content-Type: application/json" \
  -d '{"status": "INACTIVE"}'
```

### Cache Management
```bash
# Invalidate specific subscription cache
curl -X POST http://localhost:8080/api/v1/sync/cache/invalidate \
  -H "Content-Type: application/json" \
  -d '{"msisdn": "+1234567890"}'

# Full cache refresh
curl -X POST http://localhost:8080/api/v1/sync/cache/refresh

# Check cache health
curl -X GET http://localhost:8080/api/v1/sync/health
```

## 🔒 Security Features

### Enterprise Security
- **Authentication**: OAuth2/JWT with multi-factor authentication
- **Authorization**: Role-based access control (RBAC) with granular permissions
- **Data Protection**: AES-256-GCM encryption for sensitive subscription data
- **Network Security**: TLS 1.3 for all communications
- **Audit Trail**: Comprehensive logging with cryptographic integrity

### Compliance Support
- **GDPR**: Data protection and privacy compliance
- **SOC2**: Security and availability controls
- **Telecommunications**: Industry-specific compliance frameworks
- **Audit Ready**: Complete audit trails for regulatory requirements

## 📊 Performance Targets

| Metric | Target | Current Baseline |
|--------|--------|------------------|
| Subscription Lookup | < 50ms (95th percentile) | ~500ms |
| Cache Hit Ratio | > 95% | N/A |
| API Throughput | 1000+ requests/second | Limited |
| Concurrent Subscriptions | 500,000+ active | ~1,000 |
| System Availability | 99.9% uptime | Manual downtime required |

## 🧪 Testing Strategy

### Test Categories
- **Unit Tests**: JUnit 5 with Mockito (90%+ coverage target)
- **Integration Tests**: TestContainers for database/Redis testing
- **Performance Tests**: Gatling for load testing
- **Security Tests**: OWASP ZAP integration
- **E2E Tests**: Playwright for frontend testing

### Running Tests
```bash
# All tests
./mvnw test

# Integration tests only
./mvnw integration-test

# Performance tests
./mvnw gatling:test

# Frontend tests
cd frontend && npm test
```

## 📚 Documentation

- **[Product Requirements Document](PRD_SMPP_Subscription_Management_System.md)**: Complete technical and business requirements
- **[Development Guide](CLAUDE.md)**: Comprehensive development guidance and architecture
- **[Project Planning](planning.md)**: Detailed project phases and milestones
- **[Task Breakdown](tasks.md)**: Complete task list with dependencies and priorities
- **API Documentation**: Available at `/swagger-ui` when running

## 🗂️ Project Structure

```
opensmpp-subscription-management-system/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/smpp/subscription/     # Core subscription management
│   │   │   └── com/smpp/sync/             # External synchronization
│   │   │   └── com/smpp/api/              # REST API controllers
│   │   │   └── com/smpp/integration/      # SMPP & Amarisoft integration
│   │   │   └── com/smpp/cache/            # Redis caching layer
│   │   └── resources/
│   │       ├── application.yml            # Configuration
│   │       └── db/migration/              # Flyway migrations
│   └── test/                              # Test suites
├── frontend/
│   ├── src/
│   │   ├── components/                    # React components
│   │   ├── pages/                         # Application pages
│   │   ├── services/                      # API services
│   │   └── hooks/                         # Custom React hooks
│   └── public/                            # Static assets
├── docker/                                # Docker configurations
├── docs/                                  # Additional documentation
└── scripts/                               # Utility scripts
```

## 🚦 Deployment

### Production Deployment
```bash
# Build production images
docker build -t smpp-subscription-backend .
docker build -t smpp-subscription-frontend ./frontend

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Health check
curl http://localhost:8080/actuator/health
```

### Environment Configuration
- **Development**: Local database and Redis
- **Staging**: Containerized with external database
- **Production**: Kubernetes deployment with high availability

## 📈 Monitoring & Observability

### Metrics & Monitoring
- **Application Metrics**: Micrometer with Prometheus
- **Health Checks**: Spring Boot Actuator endpoints
- **Performance**: Real-time subscription access analytics
- **Alerting**: Custom alerts for subscription system health

### Logging
- **Structured Logging**: JSON format with correlation IDs
- **Audit Trail**: Immutable subscription change logs
- **Security Events**: Authentication and authorization logging
- **Performance Logging**: Response time and cache metrics

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- **Code Coverage**: Maintain 90%+ test coverage
- **Security First**: All changes must pass security review
- **Performance Impact**: Benchmark critical path changes
- **Documentation**: Update docs for all public APIs

## 📞 Support & Contact

- **Issues**: Create GitHub issues for bug reports and feature requests
- **Documentation**: Check the `/docs` folder for detailed guides
- **Architecture Questions**: Refer to `CLAUDE.md` for technical details
- **Project Planning**: See `planning.md` and `tasks.md` for roadmap

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for telecommunications testing excellence**

*Last updated: August 28, 2025*