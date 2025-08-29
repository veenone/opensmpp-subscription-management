package com.smpp.subscription.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smpp.subscription.dto.SubscriptionRequestDto;
import com.smpp.subscription.entity.Subscription;
import com.smpp.subscription.repository.SubscriptionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@Testcontainers
@Transactional
public class SubscriptionIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:14")
            .withDatabaseName("smpp_test")
            .withUsername("test")
            .withPassword("test");

    @Container
    static GenericContainer<?> redis = new GenericContainer<>("redis:6-alpine")
            .withExposedPorts(6379);

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.redis.host", redis::getHost);
        registry.add("spring.redis.port", redis::getFirstMappedPort);
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @BeforeEach
    void setUp() {
        subscriptionRepository.deleteAll();
    }

    @Test
    @WithMockUser(authorities = {"SUBSCRIPTION_CREATE"})
    void createSubscription_Success() throws Exception {
        // Arrange
        SubscriptionRequestDto request = SubscriptionRequestDto.builder()
                .msisdn("+1234567890")
                .impi("test@example.com")
                .impu("sip:test@example.com")
                .status("ACTIVE")
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/v1/subscriptions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.msisdn").value("+1234567890"))
                .andExpect(jsonPath("$.impi").value("test@example.com"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.createdAt").exists());
    }

    @Test
    @WithMockUser(authorities = {"SUBSCRIPTION_CREATE"})
    void createSubscription_InvalidMsisdn_BadRequest() throws Exception {
        // Arrange
        SubscriptionRequestDto request = SubscriptionRequestDto.builder()
                .msisdn("invalid-msisdn")
                .impi("test@example.com")
                .impu("sip:test@example.com")
                .status("ACTIVE")
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/v1/subscriptions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Invalid MSISDN format")));
    }

    @Test
    @WithMockUser(authorities = {"SUBSCRIPTION_READ"})
    void getSubscription_Success() throws Exception {
        // Arrange
        Subscription subscription = Subscription.builder()
                .msisdn("+1234567890")
                .impi("test@example.com")
                .impu("sip:test@example.com")
                .status(Subscription.SubscriptionStatus.ACTIVE)
                .build();
        subscription = subscriptionRepository.save(subscription);

        // Act & Assert
        mockMvc.perform(get("/api/v1/subscriptions/{id}", subscription.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(subscription.getId()))
                .andExpect(jsonPath("$.msisdn").value("+1234567890"));
    }

    @Test
    @WithMockUser(authorities = {"SUBSCRIPTION_READ"})
    void getSubscriptionByMsisdn_Success() throws Exception {
        // Arrange
        Subscription subscription = Subscription.builder()
                .msisdn("+1234567890")
                .impi("test@example.com")
                .impu("sip:test@example.com")
                .status(Subscription.SubscriptionStatus.ACTIVE)
                .build();
        subscriptionRepository.save(subscription);

        // Act & Assert
        mockMvc.perform(get("/api/v1/subscriptions/msisdn/{msisdn}", "+1234567890"))
                .andExpect(status().isOk())
                .andExpected(jsonPath("$.msisdn").value("+1234567890"));
    }

    @Test
    @WithMockUser(authorities = {"SUBSCRIPTION_READ"})
    void getSubscriptions_WithPagination() throws Exception {
        // Arrange
        for (int i = 0; i < 5; i++) {
            Subscription subscription = Subscription.builder()
                    .msisdn("+123456789" + i)
                    .impi("test" + i + "@example.com")
                    .impu("sip:test" + i + "@example.com")
                    .status(Subscription.SubscriptionStatus.ACTIVE)
                    .build();
            subscriptionRepository.save(subscription);
        }

        // Act & Assert
        mockMvc.perform(get("/api/v1/subscriptions")
                .param("page", "0")
                .param("size", "3")
                .param("sortBy", "createdAt")
                .param("sortDir", "desc"))
                .andExpect(status().isOk())
                .andExpected(jsonPath("$.content", hasSize(3)))
                .andExpected(jsonPath("$.totalElements").value(5))
                .andExpected(jsonPath("$.totalPages").value(2));
    }

    @Test
    @WithMockUser(authorities = {"SUBSCRIPTION_UPDATE"})
    void updateSubscription_Success() throws Exception {
        // Arrange
        Subscription subscription = Subscription.builder()
                .msisdn("+1234567890")
                .impi("test@example.com")
                .impu("sip:test@example.com")
                .status(Subscription.SubscriptionStatus.ACTIVE)
                .build();
        subscription = subscriptionRepository.save(subscription);

        SubscriptionRequestDto updateRequest = SubscriptionRequestDto.builder()
                .msisdn("+1234567890")
                .impi("updated@example.com")
                .impu("sip:updated@example.com")
                .status("INACTIVE")
                .build();

        // Act & Assert
        mockMvc.perform(put("/api/v1/subscriptions/{id}", subscription.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpected(jsonPath("$.impi").value("updated@example.com"))
                .andExpected(jsonPath("$.status").value("INACTIVE"));
    }

    @Test
    @WithMockUser(authorities = {"SUBSCRIPTION_DELETE"})
    void deleteSubscription_Success() throws Exception {
        // Arrange
        Subscription subscription = Subscription.builder()
                .msisdn("+1234567890")
                .impi("test@example.com")
                .impu("sip:test@example.com")
                .status(Subscription.SubscriptionStatus.ACTIVE)
                .build();
        subscription = subscriptionRepository.save(subscription);

        // Act & Assert
        mockMvc.perform(delete("/api/v1/subscriptions/{id}", subscription.getId()))
                .andExpect(status().isNoContent());

        // Verify deletion
        mockMvc.perform(get("/api/v1/subscriptions/{id}", subscription.getId()))
                .andExpected(status().isNotFound());
    }

    @Test
    @WithMockUser(authorities = {"SUBSCRIPTION_BULK_IMPORT"})
    void bulkImportSubscriptions_Success() throws Exception {
        // Arrange
        String csvData = "msisdn,impi,impu,status\n" +
                "+1111111111,user1@test.com,sip:user1@test.com,ACTIVE\n" +
                "+2222222222,user2@test.com,sip:user2@test.com,ACTIVE";

        // Act & Assert
        mockMvc.perform(post("/api/v1/subscriptions/bulk-import")
                .contentType(MediaType.TEXT_PLAIN)
                .content(csvData))
                .andExpected(status().isOk())
                .andExpected(jsonPath("$.successfulImports").value(2))
                .andExpected(jsonPath("$.failedImports").value(0));
    }

    @Test
    void getSubscriptions_UnauthorizedAccess_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/subscriptions"))
                .andExpected(status().isUnauthorized());
    }

    @Test
    @WithMockUser(authorities = {"WRONG_PERMISSION"})
    void createSubscription_InsufficientPermissions_Forbidden() throws Exception {
        // Arrange
        SubscriptionRequestDto request = SubscriptionRequestDto.builder()
                .msisdn("+1234567890")
                .impi("test@example.com")
                .impu("sip:test@example.com")
                .status("ACTIVE")
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/v1/subscriptions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpected(status().isForbidden());
    }
}