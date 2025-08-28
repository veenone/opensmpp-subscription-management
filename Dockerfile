# Multi-stage build for the Spring Boot application
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Copy parent pom
COPY pom.xml ./
COPY backend/pom.xml ./backend/
COPY smpp-core/pom.xml ./smpp-core/
COPY amarisoft-integration/pom.xml ./amarisoft-integration/

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY backend/src ./backend/src
COPY smpp-core/src ./smpp-core/src
COPY amarisoft-integration/src ./amarisoft-integration/src

# Build the application
RUN mvn clean package -DskipTests -B

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

RUN apk add --no-cache curl bash

WORKDIR /app

# Copy the built artifact
COPY --from=builder /app/backend/target/*.jar app.jar

# Create logs directory
RUN mkdir -p /app/logs

# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

# Change ownership
RUN chown -R appuser:appuser /app

USER appuser

# Expose ports
EXPOSE 8080 9090

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]