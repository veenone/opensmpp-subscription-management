# Developer Deployment Guide
## SMPP Subscription Management System

**Goal**: Get the complete system running in under 30 minutes for testing and development.

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Java 17+ (OpenJDK recommended)
- Node.js 18+ with npm
- PostgreSQL 13+
- Redis 6+
- Git

### Clone and Basic Setup
```bash
# Clone the repository
git clone <repository-url>
cd opensmpp-subscription-management-system

# Verify Java version
java -version

# Verify Node.js version
node --version
```

---

## 🗄️ Backend Setup (10 minutes)

### Step 1: PostgreSQL Database Setup

**Windows:**
```cmd
# Create database and user
psql -U postgres
CREATE DATABASE smpp_subscription_db;
CREATE USER smpp_user WITH PASSWORD 'smpp_password123';
GRANT ALL PRIVILEGES ON DATABASE smpp_subscription_db TO smpp_user;
\q
```

**Linux/macOS:**
```bash
sudo -u postgres createdb smpp_subscription_db
sudo -u postgres psql -c "CREATE USER smpp_user WITH PASSWORD 'smpp_password123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE smpp_subscription_db TO smpp_user;"
```

### Step 2: Redis Setup

**Windows:**
```cmd
# Download and run Redis for Windows or use Docker
docker run -d -p 6379:6379 redis:alpine
```

**Linux/macOS:**
```bash
# Install and start Redis
sudo systemctl start redis-server
# or use Docker
docker run -d -p 6379:6379 redis:alpine
```

### Step 3: Backend Configuration

Create `backend/src/main/resources/application-dev.properties`:
```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/smpp_subscription_db
spring.datasource.username=smpp_user
spring.datasource.password=smpp_password123

# Redis Configuration
spring.data.redis.host=localhost
spring.data.redis.port=6379

# JWT Configuration
app.jwt.secret=mySecretKey123456789012345678901234567890
app.jwt.expiration=86400000

# Server Configuration
server.port=8080

# Logging
logging.level.com.smpp=DEBUG
logging.level.org.springframework.security=DEBUG
```

### Step 4: Start Backend

**Windows:**
```cmd
cd backend
.\mvnw.cmd clean spring-boot:run -Dspring-boot.run.profiles=dev
```

**Linux/macOS:**
```bash
cd backend
./mvnw clean spring-boot:run -Dspring-boot.run.profiles=dev
```

### Step 5: Verify Backend Health
```bash
# Check if backend is running
curl http://localhost:8080/api/health

# Expected response: {"status":"UP","timestamp":"..."}
```

---

## 🖥️ Frontend Setup (5 minutes)

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Environment Configuration

Create `frontend/.env.local`:
```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_ENV=development
GENERATE_SOURCEMAP=false
```

### Step 3: Start Frontend Development Server
```bash
npm start
```

The frontend will automatically open at `http://localhost:3002`

### Step 4: Verify Frontend
1. Navigate to `http://localhost:3002`
2. You should see the login page
3. Check browser console for any errors

---

## 🧪 Integration Testing (15 minutes)

### Step 1: Initialize Test Data

**Create test user:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com"
  }'
```

**Login and get JWT token:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

Save the returned JWT token for subsequent API calls.

### Step 2: Test Subscription Management

**Create test subscription:**
```bash
curl -X POST http://localhost:8080/api/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "msisdn": "+1234567890",
    "serviceType": "SMS",
    "status": "ACTIVE",
    "planId": "BASIC_PLAN"
  }'
```

**List subscriptions:**
```bash
curl -X GET http://localhost:8080/api/subscriptions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Step 3: End-to-End UI Testing

1. **Login**: Use `testuser` / `password123` at `http://localhost:3002`
2. **Dashboard**: Verify dashboard loads with metrics
3. **Create Subscription**: Go to Subscriptions → Add New
4. **View Lists**: Check subscription list displays correctly
5. **Search/Filter**: Test search functionality

### Step 4: SMPP Simulator Integration

**Start SMPP Simulator:**
```bash
cd smpp-core
mvn spring-boot:run -Dspring-boot.run.profiles=simulator
```

**Test SMPP Connection:**
```bash
curl -X POST http://localhost:8080/api/smpp/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "msisdn": "+1234567890",
    "message": "Test message",
    "serviceType": "SMS"
  }'
```

### Step 5: Performance Verification

**Database Connection Pool:**
```bash
curl http://localhost:8080/api/actuator/metrics/hikaricp.connections.active
```

**Memory Usage:**
```bash
curl http://localhost:8080/api/actuator/metrics/jvm.memory.used
```

---

## 🔧 Common Issues & Solutions

### Database Connection Issues

**Problem**: `Connection refused` to PostgreSQL
```
Solution:
1. Check PostgreSQL is running: `systemctl status postgresql`
2. Verify port 5432 is open: `netstat -an | grep 5432`
3. Check pg_hba.conf allows local connections
4. Restart PostgreSQL service
```

**Problem**: `Authentication failed for user`
```
Solution:
1. Verify user exists: `psql -U postgres -c "\du"`
2. Reset password: `psql -U postgres -c "ALTER USER smpp_user PASSWORD 'smpp_password123';"`
3. Check application.properties has correct credentials
```

### Port Conflicts

**Problem**: `Port 8080 already in use`
```bash
# Find process using port 8080
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # Linux/macOS

# Kill the process or change port in application.properties
server.port=8081
```

**Problem**: `Port 3002 already in use`
```bash
# Frontend port conflict
export PORT=3003  # Linux/macOS
set PORT=3003     # Windows

npm start
```

### Redis Connection Issues

**Problem**: `Unable to connect to Redis`
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG

# Start Redis if not running
redis-server  # Linux/macOS
# or use Docker
docker run -d -p 6379:6379 redis:alpine
```

### Authentication Setup Issues

**Problem**: JWT token expired or invalid
```
Solution:
1. Check token expiration in application.properties
2. Verify JWT secret is at least 256 bits
3. Clear browser localStorage and re-login
4. Check server logs for authentication errors
```

**Problem**: CORS errors in browser
```
Solution:
Add to backend application.properties:
spring.web.cors.allowed-origins=http://localhost:3002
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
```

### Performance Issues

**Problem**: Slow API responses
```bash
# Check database connections
curl http://localhost:8080/api/actuator/metrics/hikaricp.connections

# Monitor JVM memory
curl http://localhost:8080/api/actuator/metrics/jvm.memory.used

# Check for long-running queries in PostgreSQL
SELECT query, now() - query_start AS duration FROM pg_stat_activity WHERE state = 'active';
```

**Problem**: Frontend build failures
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Check Node.js version compatibility
node --version  # Should be 18+
```

### Development Tips

**Hot Reload Setup:**
```properties
# Add to application-dev.properties for faster development
spring.devtools.restart.enabled=true
spring.devtools.livereload.enabled=true
```

**Database Reset (if needed):**
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE smpp_subscription_db;"
psql -U postgres -c "CREATE DATABASE smpp_subscription_db;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE smpp_subscription_db TO smpp_user;"
```

**Log Monitoring:**
```bash
# Backend logs
tail -f backend/logs/application.log

# Frontend logs
# Check browser console and terminal where npm start is running
```

---

## ✅ System Health Checklist

After completing setup, verify all components:

- [ ] PostgreSQL running on port 5432
- [ ] Redis running on port 6379  
- [ ] Backend API responding at http://localhost:8080/api/health
- [ ] Frontend UI accessible at http://localhost:3002
- [ ] User can login successfully
- [ ] Subscription CRUD operations work
- [ ] SMPP simulator can be started
- [ ] No console errors in browser
- [ ] Database contains test data
- [ ] JWT authentication working

**Total Setup Time**: ~25-30 minutes for first-time setup, ~5 minutes for subsequent runs.

For additional configuration and advanced features, refer to the main documentation in the `docs/` directory.