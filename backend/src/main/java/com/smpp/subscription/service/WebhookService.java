package com.smpp.subscription.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smpp.subscription.entity.ExternalChange;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@Slf4j
public class WebhookService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final AuditService auditService;
    private final MeterRegistry meterRegistry;

    public WebhookService(@Qualifier("syncRestTemplate") RestTemplate restTemplate,
                         ObjectMapper objectMapper,
                         AuditService auditService,
                         MeterRegistry meterRegistry) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.auditService = auditService;
        this.meterRegistry = meterRegistry;
    }

    // Configuration
    @Value("${app.sync.webhook.endpoints:}")
    private List<String> webhookEndpoints;

    @Value("${app.sync.webhook.secret:}")
    private String webhookSecret;

    @Value("${app.sync.webhook.enabled:true}")
    private boolean webhookEnabled;

    @Value("${app.sync.webhook.timeout:5000}")
    private int webhookTimeoutMs;

    @Value("${app.sync.webhook.max-retries:3}")
    private int maxRetries;

    @Value("${app.sync.webhook.retry-delay:1000}")
    private long retryDelayMs;

    // Metrics
    private Counter webhooksSuccessCounter;
    private Counter webhooksFailureCounter;
    private Timer webhookExecutionTimer;

    // Async processing
    private final ExecutorService webhookExecutor = Executors.newFixedThreadPool(5);

    @PostConstruct
    public void initMetrics() {
        this.webhooksSuccessCounter = Counter.builder("webhook.notifications.success")
                .description("Number of successful webhook notifications")
                .register(meterRegistry);

        this.webhooksFailureCounter = Counter.builder("webhook.notifications.failure")
                .description("Number of failed webhook notifications")
                .register(meterRegistry);

        this.webhookExecutionTimer = Timer.builder("webhook.execution.duration")
                .description("Time taken to execute webhook notifications")
                .register(meterRegistry);
    }

    /**
     * Send change notification to configured webhooks
     */
    public CompletableFuture<Void> sendChangeNotification(ExternalChange change) {
        if (!webhookEnabled || webhookEndpoints == null || webhookEndpoints.isEmpty()) {
            log.debug("Webhooks disabled or no endpoints configured");
            return CompletableFuture.completedFuture(null);
        }

        return CompletableFuture.runAsync(() -> {
            Timer.Sample sample = Timer.start(meterRegistry);
            try {
                WebhookPayload payload = buildWebhookPayload(change);
                String payloadJson = objectMapper.writeValueAsString(payload);
                String signature = generateSignature(payloadJson);

                for (String endpoint : webhookEndpoints) {
                    try {
                        sendWebhookWithRetry(endpoint, payloadJson, signature);
                        webhooksSuccessCounter.increment();
                    } catch (Exception e) {
                        log.error("Failed to send webhook to endpoint {}: {}", endpoint, e.getMessage());
                        webhooksFailureCounter.increment();
                        
                        // Log audit entry for failed webhook
                        auditService.logSystemEvent("WEBHOOK_FAILURE", 
                                String.format("Failed to send webhook to %s: %s", endpoint, e.getMessage()));
                    }
                }
            } catch (JsonProcessingException e) {
                log.error("Failed to serialize webhook payload: {}", e.getMessage());
                webhooksFailureCounter.increment();
            } finally {
                sample.stop(webhookExecutionTimer);
            }
        }, webhookExecutor);
    }

    /**
     * Send webhook with retry logic
     */
    @Retryable(
        value = {Exception.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    public void sendWebhookWithRetry(String endpoint, String payload, String signature) {
        log.debug("Sending webhook to endpoint: {}", endpoint);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Webhook-Signature", signature);
        headers.set("X-Webhook-Timestamp", String.valueOf(System.currentTimeMillis()));
        headers.set("User-Agent", "SMPP-Subscription-Management-System/1.0");

        HttpEntity<String> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    endpoint,
                    HttpMethod.POST,
                    request,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                log.debug("Webhook sent successfully to {}: {}", endpoint, response.getStatusCode());
                
                // Log successful webhook
                auditService.logSystemEvent("WEBHOOK_SUCCESS", 
                        String.format("Webhook sent to %s with status %s", endpoint, response.getStatusCode()));
            } else {
                throw new WebhookException(String.format("Webhook failed with status: %s", response.getStatusCode()));
            }

        } catch (Exception e) {
            log.warn("Webhook failed for endpoint {}: {}", endpoint, e.getMessage());
            throw new WebhookException("Webhook delivery failed: " + e.getMessage(), e);
        }
    }

    /**
     * Build webhook payload from external change
     */
    private WebhookPayload buildWebhookPayload(ExternalChange change) {
        WebhookPayload payload = new WebhookPayload();
        payload.setEventType("external_change");
        payload.setEventId(change.getId().toString());
        payload.setTimestamp(change.getChangedAt());
        payload.setSource("smpp-subscription-management");
        
        // Build event data
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("table", change.getTableName());
        eventData.put("operation", change.getOperation().toString());
        eventData.put("entity_id", change.getEntityId());
        eventData.put("change_source", change.getChangeSource());
        
        if (change.getOldData() != null) {
            eventData.put("old_data", change.getOldData());
        }
        
        if (change.getNewData() != null) {
            eventData.put("new_data", change.getNewData());
        }
        
        // Add subscription-specific data
        if (change.isSubscriptionChange()) {
            eventData.put("msisdn", change.getMsisdn());
            eventData.put("status_change", change.isStatusChange());
            if (change.isStatusChange()) {
                eventData.put("new_status", change.getSubscriptionStatus());
            }
        }
        
        payload.setData(eventData);
        
        return payload;
    }

    /**
     * Generate HMAC signature for webhook payload
     */
    private String generateSignature(String payload) {
        if (webhookSecret == null || webhookSecret.isEmpty()) {
            return "";
        }

        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    webhookSecret.getBytes(StandardCharsets.UTF_8), 
                    "HmacSHA256"
            );
            mac.init(secretKeySpec);
            
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return "sha256=" + Base64.getEncoder().encodeToString(hash);
            
        } catch (Exception e) {
            log.error("Failed to generate webhook signature: {}", e.getMessage());
            return "";
        }
    }

    /**
     * Send test webhook to verify endpoint connectivity
     */
    public WebhookTestResult testWebhookEndpoint(String endpoint) {
        log.info("Testing webhook endpoint: {}", endpoint);
        
        try {
            WebhookPayload testPayload = createTestPayload();
            String payloadJson = objectMapper.writeValueAsString(testPayload);
            String signature = generateSignature(payloadJson);
            
            long startTime = System.currentTimeMillis();
            sendWebhookWithRetry(endpoint, payloadJson, signature);
            long duration = System.currentTimeMillis() - startTime;
            
            return WebhookTestResult.builder()
                    .success(true)
                    .endpoint(endpoint)
                    .responseTime(duration)
                    .message("Webhook test successful")
                    .build();
                    
        } catch (Exception e) {
            return WebhookTestResult.builder()
                    .success(false)
                    .endpoint(endpoint)
                    .message("Webhook test failed: " + e.getMessage())
                    .error(e.getMessage())
                    .build();
        }
    }

    /**
     * Create test payload for webhook testing
     */
    private WebhookPayload createTestPayload() {
        WebhookPayload payload = new WebhookPayload();
        payload.setEventType("test");
        payload.setEventId("test-" + System.currentTimeMillis());
        payload.setTimestamp(LocalDateTime.now());
        payload.setSource("smpp-subscription-management");
        
        Map<String, Object> testData = new HashMap<>();
        testData.put("test", true);
        testData.put("message", "This is a test webhook notification");
        payload.setData(testData);
        
        return payload;
    }

    /**
     * Get webhook statistics
     */
    public WebhookStatistics getWebhookStatistics() {
        return WebhookStatistics.builder()
                .enabled(webhookEnabled)
                .configuredEndpoints(webhookEndpoints != null ? webhookEndpoints.size() : 0)
                .endpoints(webhookEndpoints)
                .successfulNotifications((long) webhooksSuccessCounter.count())
                .failedNotifications((long) webhooksFailureCounter.count())
                .averageExecutionTime(webhookExecutionTimer.mean(java.util.concurrent.TimeUnit.MILLISECONDS))
                .maxRetries(maxRetries)
                .timeoutMs(webhookTimeoutMs)
                .build();
    }

    /**
     * Update webhook configuration
     */
    public void updateWebhookConfiguration(List<String> endpoints, String secret, boolean enabled) {
        log.info("Updating webhook configuration - endpoints: {}, enabled: {}", endpoints.size(), enabled);
        
        this.webhookEndpoints = endpoints;
        this.webhookSecret = secret;
        this.webhookEnabled = enabled;
        
        auditService.logSystemEvent("WEBHOOK_CONFIG_UPDATE", 
                String.format("Webhook configuration updated - %d endpoints, enabled: %s", 
                        endpoints.size(), enabled));
    }

    /**
     * Shutdown webhook executor
     */
    public void shutdown() {
        log.info("Shutting down webhook service");
        webhookExecutor.shutdown();
    }

    /**
     * Webhook payload structure
     */
    @lombok.Data
    public static class WebhookPayload {
        private String eventType;
        private String eventId;
        private LocalDateTime timestamp;
        private String source;
        private String version = "1.0";
        private Map<String, Object> data;
    }

    /**
     * Webhook test result
     */
    @lombok.Data
    @lombok.Builder
    public static class WebhookTestResult {
        private boolean success;
        private String endpoint;
        private long responseTime;
        private String message;
        private String error;
    }

    /**
     * Webhook statistics
     */
    @lombok.Data
    @lombok.Builder
    public static class WebhookStatistics {
        private boolean enabled;
        private int configuredEndpoints;
        private List<String> endpoints;
        private long successfulNotifications;
        private long failedNotifications;
        private double averageExecutionTime;
        private int maxRetries;
        private int timeoutMs;
    }

    /**
     * Custom webhook exception
     */
    public static class WebhookException extends RuntimeException {
        public WebhookException(String message) {
            super(message);
        }

        public WebhookException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}