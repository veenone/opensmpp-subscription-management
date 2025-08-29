package com.smpp.subscription.testutil;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import javax.sql.DataSource;

/**
 * TestContainers configuration for integration tests
 * Provides PostgreSQL and Redis containers for testing
 */
@Slf4j
@TestConfiguration
@Testcontainers
public class TestContainerConfiguration {
    
    @Container
    public static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("smpp_test")
            .withUsername("test")
            .withPassword("test")
            .withReuse(true)  // Reuse container across test runs
            .waitingFor(Wait.forLogMessage(".*database system is ready to accept connections.*", 2));
    
    @Container
    public static final GenericContainer<?> redis = new GenericContainer<>("redis:7-alpine")
            .withExposedPorts(6379)
            .withReuse(true)
            .waitingFor(Wait.forLogMessage(".*Ready to accept connections.*", 1));
    
    static {
        // Start containers
        postgres.start();
        redis.start();
        
        log.info("PostgreSQL container started on {}:{}", 
                postgres.getHost(), postgres.getMappedPort(5432));
        log.info("Redis container started on {}:{}", 
                redis.getHost(), redis.getMappedPort(6379));
    }
    
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        // PostgreSQL properties
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", postgres::getDriverClassName);
        
        // Redis properties
        registry.add("spring.data.redis.host", redis::getHost);
        registry.add("spring.data.redis.port", () -> redis.getMappedPort(6379));
        
        // JPA properties
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.jpa.show-sql", () -> "false");
        
        // Flyway properties
        registry.add("spring.flyway.enabled", () -> "true");
        registry.add("spring.flyway.baseline-on-migrate", () -> "true");
    }
    
    /**
     * Get PostgreSQL JDBC URL for programmatic access
     */
    public static String getPostgresJdbcUrl() {
        return postgres.getJdbcUrl();
    }
    
    /**
     * Get Redis connection details
     */
    public static String getRedisHost() {
        return redis.getHost();
    }
    
    public static Integer getRedisPort() {
        return redis.getMappedPort(6379);
    }
    
    /**
     * Execute SQL command in PostgreSQL container
     */
    public static void executeInPostgres(String sql) {
        try {
            postgres.execInContainer("psql", "-U", postgres.getUsername(), 
                    "-d", postgres.getDatabaseName(), "-c", sql);
        } catch (Exception e) {
            log.warn("Failed to execute SQL: {}", sql, e);
        }
    }
    
    /**
     * Clean all test data from PostgreSQL
     */
    public static void cleanPostgresData() {
        executeInPostgres("TRUNCATE TABLE subscriptions, external_changes, audit_logs, users RESTART IDENTITY CASCADE");
        log.debug("Cleaned PostgreSQL test data");
    }
    
    /**
     * Execute Redis command
     */
    public static void executeInRedis(String... command) {
        try {
            redis.execInContainer("redis-cli", command);
        } catch (Exception e) {
            log.warn("Failed to execute Redis command: {}", String.join(" ", command), e);
        }
    }
    
    /**
     * Clean all test data from Redis
     */
    public static void cleanRedisData() {
        executeInRedis("FLUSHALL");
        log.debug("Cleaned Redis test data");
    }
    
    /**
     * Clean all test data from both containers
     */
    public static void cleanAllTestData() {
        cleanPostgresData();
        cleanRedisData();
    }
}