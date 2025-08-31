#!/bin/bash

# SMPP Subscription Management System - Database Setup Script
# This script sets up PostgreSQL and Redis using Docker for development

echo "🚀 SMPP Subscription Management System - Database Setup"
echo "======================================================="

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker is not installed or not in PATH"
    echo "Please install Docker Desktop and try again"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Error: Docker daemon is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo "✅ Docker is available"

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "✅ Docker Compose configuration found"

# Start PostgreSQL and Redis containers
echo ""
echo "📦 Starting database containers..."
docker-compose up -d postgres redis

# Wait for containers to be healthy
echo ""
echo "⏳ Waiting for containers to be ready..."
sleep 10

# Check container status
echo ""
echo "🔍 Checking container status..."
docker-compose ps postgres redis

# Test PostgreSQL connection
echo ""
echo "🗄️ Testing PostgreSQL connection..."
if docker exec smpp_postgres pg_isready -U postgres -d smpp_subscriptions &> /dev/null; then
    echo "✅ PostgreSQL is ready"
    
    # Show database info
    echo "📊 Database Information:"
    echo "  - Database: smpp_subscriptions"
    echo "  - Username: postgres"
    echo "  - Password: postgres"
    echo "  - Host: localhost"
    echo "  - Port: 5432"
    
    # Test connection with version
    DB_VERSION=$(docker exec smpp_postgres psql -U postgres -d smpp_subscriptions -t -c "SELECT version();" | head -1 | xargs)
    echo "  - Version: $DB_VERSION"
else
    echo "❌ PostgreSQL connection failed"
fi

# Test Redis connection
echo ""
echo "🔴 Testing Redis connection..."
if docker exec smpp_redis redis-cli -a redis_password ping &> /dev/null; then
    echo "✅ Redis is ready"
    
    # Show Redis info
    echo "📊 Redis Information:"
    echo "  - Host: localhost"
    echo "  - Port: 6379"
    echo "  - Password: redis_password"
    
    # Test connection with info
    REDIS_VERSION=$(docker exec smpp_redis redis-cli -a redis_password info server | grep "redis_version" | cut -d: -f2 | tr -d '\r')
    echo "  - Version: $REDIS_VERSION"
else
    echo "❌ Redis connection failed"
fi

# Show next steps
echo ""
echo "🎉 Database setup complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Start the backend application:"
echo "   ./mvnw spring-boot:run"
echo ""
echo "2. Start the frontend application:"
echo "   cd frontend"
echo "   npm install"
echo "   npm run dev"
echo ""
echo "3. Access the application:"
echo "   - Frontend: http://localhost:3000 (or check console for actual port)"
echo "   - Backend API: http://localhost:8080"
echo "   - Health Check: http://localhost:8080/actuator/health"
echo ""
echo "🛑 To stop the databases:"
echo "   docker-compose down"
echo ""
echo "🧹 To clean up (removes all data):"
echo "   docker-compose down -v"
echo ""