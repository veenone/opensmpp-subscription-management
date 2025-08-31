@echo off
REM SMPP Subscription Management System - Database Setup Script (Windows)
REM This script sets up PostgreSQL and Redis using Docker for development

echo 🚀 SMPP Subscription Management System - Database Setup
echo =======================================================

REM Check if Docker is installed and running
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Docker is not installed or not in PATH
    echo Please install Docker Desktop and try again
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Docker daemon is not running
    echo Please start Docker Desktop and try again
    exit /b 1
)

echo ✅ Docker is available

REM Check if docker-compose.yml exists
if not exist "docker-compose.yml" (
    echo ❌ Error: docker-compose.yml not found
    echo Please run this script from the project root directory
    exit /b 1
)

echo ✅ Docker Compose configuration found

REM Start PostgreSQL and Redis containers
echo.
echo 📦 Starting database containers...
docker-compose up -d postgres redis

REM Wait for containers to be healthy
echo.
echo ⏳ Waiting for containers to be ready...
timeout /t 10 >nul

REM Check container status
echo.
echo 🔍 Checking container status...
docker-compose ps postgres redis

REM Test PostgreSQL connection
echo.
echo 🗄️ Testing PostgreSQL connection...
docker exec smpp_postgres pg_isready -U postgres -d smpp_subscriptions >nul 2>&1
if errorlevel 1 (
    echo ❌ PostgreSQL connection failed
) else (
    echo ✅ PostgreSQL is ready
    echo 📊 Database Information:
    echo   - Database: smpp_subscriptions
    echo   - Username: postgres
    echo   - Password: postgres
    echo   - Host: localhost
    echo   - Port: 5432
)

REM Test Redis connection
echo.
echo 🔴 Testing Redis connection...
docker exec smpp_redis redis-cli -a redis_password ping >nul 2>&1
if errorlevel 1 (
    echo ❌ Redis connection failed
) else (
    echo ✅ Redis is ready
    echo 📊 Redis Information:
    echo   - Host: localhost
    echo   - Port: 6379
    echo   - Password: redis_password
)

REM Show next steps
echo.
echo 🎉 Database setup complete!
echo.
echo 📝 Next Steps:
echo 1. Start the backend application:
echo    mvnw.cmd spring-boot:run
echo.
echo 2. Start the frontend application:
echo    cd frontend
echo    npm install
echo    npm run dev
echo.
echo 3. Access the application:
echo    - Frontend: http://localhost:3000 (or check console for actual port)
echo    - Backend API: http://localhost:8080
echo    - Health Check: http://localhost:8080/actuator/health
echo.
echo 🛑 To stop the databases:
echo    docker-compose down
echo.
echo 🧹 To clean up (removes all data):
echo    docker-compose down -v
echo.
pause