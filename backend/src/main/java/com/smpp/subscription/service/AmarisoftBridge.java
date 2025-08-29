package com.smpp.subscription.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smpp.subscription.config.SyncConfiguration;
import com.smpp.subscription.entity.ExternalChange;
import com.smpp.subscription.entity.Subscription;
import com.smpp.subscription.repository.SubscriptionRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.*;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
@Slf4j
public class AmarisoftBridge {

    @Qualifier("amarisoftRestTemplate")
    private final RestTemplate amarisoftRestTemplate;
    
    private final SubscriptionRepository subscriptionRepository;
    private final SyncConfiguration syncConfiguration;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;
    private final MeterRegistry meterRegistry;

    // In-memory subscription cache for Amarisoft
    private final Map<String, AmarisoftSubscription> subscriptionCache = new ConcurrentHashMap<>();
    
    // Connection tracking
    private volatile boolean isConnected = false;
    private volatile LocalDateTime lastConnectionAttempt;
    private volatile String lastConnectionError;
    
    // Metrics
    private Counter refreshSuccessCounter;
    private Counter refreshFailureCounter;
    private Counter apiCallsCounter;
    private Timer refreshOperationTimer;
    
    // Performance tracking
    private final AtomicLong totalRefreshOperations = new AtomicLong(0);
    private final AtomicLong totalRefreshFailures = new AtomicLong(0);
    
    // Async processing
    private final ExecutorService amarisoftExecutor = Executors.newFixedThreadPool(3);

    @PostConstruct
    public void initMetrics() {
        this.refreshSuccessCounter = Counter.builder("amarisoft.refresh.success")
                .description("Number of successful Amarisoft data refreshes")
                .register(meterRegistry);
                
        this.refreshFailureCounter = Counter.builder("amarisoft.refresh.failure")
                .description("Number of failed Amarisoft data refreshes")
                .register(meterRegistry);
                
        this.apiCallsCounter = Counter.builder("amarisoft.api.calls")
                .description("Number of Amarisoft API calls made")
                .register(meterRegistry);
                
        this.refreshOperationTimer = Timer.builder("amarisoft.refresh.duration")
                .description("Time taken for Amarisoft refresh operations")
                .register(meterRegistry);

        // Initialize connection if enabled
        if (syncConfiguration.isAmarisoftEnabled()) {
            CompletableFuture.runAsync(this::initializeConnection, amarisoftExecutor);
        }
    }

    /**
     * Initialize connection to Amarisoft system
     */
    private void initializeConnection() {
        log.info("Initializing Amarisoft bridge connection to: {}", syncConfiguration.getAmarisoftBaseUrl());
        
        try {
            boolean connectionTest = testConnection();
            if (connectionTest) {
                loadInitialSubscriptions();
                isConnected = true;
                log.info("Amarisoft bridge initialized successfully");
                
                auditService.logSystemEvent("AMARISOFT_BRIDGE_CONNECTED", 
                        "Successfully connected to Amarisoft system");
            } else {
                log.warn("Failed to establish connection to Amarisoft system");
            }
        } catch (Exception e) {
            log.error("Error initializing Amarisoft bridge", e);
            lastConnectionError = e.getMessage();
            
            auditService.logSystemEvent("AMARISOFT_BRIDGE_CONNECTION_FAILED", 
                    "Failed to connect to Amarisoft system: " + e.getMessage());
        } finally {
            lastConnectionAttempt = LocalDateTime.now();
        }
    }

    /**
     * Test connection to Amarisoft system
     */
    public boolean testConnection() {
        if (!syncConfiguration.isAmarisoftEnabled()) {
            return false;
        }

        try {
            String healthUrl = syncConfiguration.getAmarisoftBaseUrl() + "/api/health";
            ResponseEntity<String> response = amarisoftRestTemplate.getForEntity(healthUrl, String.class);
            
            boolean connected = response.getStatusCode().is2xxSuccessful();
            if (connected) {
                isConnected = true;
                lastConnectionError = null;
            }
            
            apiCallsCounter.increment();
            return connected;
            
        } catch (Exception e) {
            log.debug("Amarisoft connection test failed: {}", e.getMessage());
            isConnected = false;
            lastConnectionError = e.getMessage();
            return false;
        }
    }

    /**
     * Load initial subscriptions from database into cache
     */
    private void loadInitialSubscriptions() {
        Timer.Sample sample = Timer.start(meterRegistry);
        
        try {
            List<Subscription> subscriptions = subscriptionRepository.findAll();
            
            for (Subscription subscription : subscriptions) {
                AmarisoftSubscription amarisoftSub = convertToAmarisoftSubscription(subscription);
                subscriptionCache.put(subscription.getMsisdn(), amarisoftSub);
            }
            
            log.info("Loaded {} subscriptions into Amarisoft cache", subscriptions.size());
            
        } catch (Exception e) {
            log.error("Error loading initial subscriptions", e);
        } finally {
            sample.stop(refreshOperationTimer);
        }
    }

    /**
     * Refresh subscription data based on external change
     */
    public CompletableFuture<RefreshResult> refreshSubscriptionData(ExternalChange change) {
        if (!syncConfiguration.isAmarisoftEnabled() || !change.isSubscriptionChange()) {
            return CompletableFuture.completedFuture(
                RefreshResult.builder()
                    .success(true)
                    .message("Amarisoft integration disabled or not subscription change")
                    .skipped(true)
                    .build()
            );
        }

        return CompletableFuture.supplyAsync(() -> {
            Timer.Sample sample = Timer.start(meterRegistry);
            totalRefreshOperations.incrementAndGet();
            
            try {
                RefreshResult result = processSubscriptionChange(change);
                
                if (result.isSuccess()) {
                    refreshSuccessCounter.increment();
                } else {
                    refreshFailureCounter.increment();
                    totalRefreshFailures.incrementAndGet();
                }
                
                return result;
                
            } finally {
                sample.stop(refreshOperationTimer);
            }
        }, amarisoftExecutor);
    }

    /**
     * Process individual subscription change
     */
    private RefreshResult processSubscriptionChange(ExternalChange change) {
        try {
            log.debug("Processing subscription change for entity ID: {}, operation: {}", 
                    change.getEntityId(), change.getOperation());

            switch (change.getOperation()) {
                case INSERT:
                    return handleSubscriptionInsert(change);
                case UPDATE:
                    return handleSubscriptionUpdate(change);
                case DELETE:
                    return handleSubscriptionDelete(change);
                default:
                    return RefreshResult.builder()
                            .success(false)
                            .message("Unknown operation: " + change.getOperation())
                            .build();
            }
            
        } catch (Exception e) {
            log.error("Error processing subscription change: {}", e.getMessage(), e);
            return RefreshResult.builder()
                    .success(false)
                    .message("Processing error: " + e.getMessage())
                    .error(e.getMessage())
                    .build();
        }
    }

    /**
     * Handle subscription insert
     */
    private RefreshResult handleSubscriptionInsert(ExternalChange change) {
        if (change.getNewData() == null) {
            return RefreshResult.builder()
                    .success(false)
                    .message("No new data provided for insert operation")
                    .build();
        }

        try {
            // Get subscription from database
            Optional<Subscription> subscriptionOpt = subscriptionRepository.findById(change.getEntityId());
            if (subscriptionOpt.isEmpty()) {
                return RefreshResult.builder()
                        .success(false)
                        .message("Subscription not found in database: " + change.getEntityId())
                        .build();
            }

            Subscription subscription = subscriptionOpt.get();
            AmarisoftSubscription amarisoftSub = convertToAmarisoftSubscription(subscription);
            
            // Add to local cache
            subscriptionCache.put(subscription.getMsisdn(), amarisoftSub);
            
            // Notify Amarisoft system
            boolean notificationSuccess = notifyAmarisoftSubscriptionChange(amarisoftSub, "CREATE");
            
            return RefreshResult.builder()
                    .success(notificationSuccess)
                    .message(notificationSuccess ? "Subscription inserted successfully" : "Failed to notify Amarisoft")
                    .msisdn(subscription.getMsisdn())
                    .operation("INSERT")
                    .build();
                    
        } catch (Exception e) {
            log.error("Error handling subscription insert", e);
            return RefreshResult.builder()
                    .success(false)
                    .message("Insert processing error: " + e.getMessage())
                    .error(e.getMessage())
                    .build();
        }
    }

    /**
     * Handle subscription update
     */
    private RefreshResult handleSubscriptionUpdate(ExternalChange change) {
        if (change.getNewData() == null) {
            return RefreshResult.builder()
                    .success(false)
                    .message("No new data provided for update operation")
                    .build();
        }

        try {
            // Get updated subscription from database
            Optional<Subscription> subscriptionOpt = subscriptionRepository.findById(change.getEntityId());
            if (subscriptionOpt.isEmpty()) {
                return RefreshResult.builder()
                        .success(false)
                        .message("Subscription not found in database: " + change.getEntityId())
                        .build();
            }

            Subscription subscription = subscriptionOpt.get();
            AmarisoftSubscription amarisoftSub = convertToAmarisoftSubscription(subscription);
            
            // Update local cache
            subscriptionCache.put(subscription.getMsisdn(), amarisoftSub);
            
            // Notify Amarisoft system
            boolean notificationSuccess = notifyAmarisoftSubscriptionChange(amarisoftSub, "UPDATE");
            
            return RefreshResult.builder()
                    .success(notificationSuccess)
                    .message(notificationSuccess ? "Subscription updated successfully" : "Failed to notify Amarisoft")
                    .msisdn(subscription.getMsisdn())
                    .operation("UPDATE")
                    .statusChanged(change.isStatusChange())
                    .build();
                    
        } catch (Exception e) {
            log.error("Error handling subscription update", e);
            return RefreshResult.builder()
                    .success(false)
                    .message("Update processing error: " + e.getMessage())
                    .error(e.getMessage())
                    .build();
        }
    }

    /**
     * Handle subscription delete
     */
    private RefreshResult handleSubscriptionDelete(ExternalChange change) {
        if (change.getOldData() == null) {
            return RefreshResult.builder()
                    .success(false)
                    .message("No old data provided for delete operation")
                    .build();
        }

        try {
            String msisdn = change.getMsisdn();
            if (msisdn == null) {
                return RefreshResult.builder()
                        .success(false)
                        .message("No MSISDN found in delete data")
                        .build();
            }
            
            // Remove from local cache
            AmarisoftSubscription removedSub = subscriptionCache.remove(msisdn);
            
            if (removedSub != null) {
                // Notify Amarisoft system
                boolean notificationSuccess = notifyAmarisoftSubscriptionChange(removedSub, "DELETE");
                
                return RefreshResult.builder()
                        .success(notificationSuccess)
                        .message(notificationSuccess ? "Subscription deleted successfully" : "Failed to notify Amarisoft")
                        .msisdn(msisdn)
                        .operation("DELETE")
                        .build();
            } else {
                return RefreshResult.builder()
                        .success(true)
                        .message("Subscription was not in cache")
                        .msisdn(msisdn)
                        .operation("DELETE")
                        .build();
            }
            
        } catch (Exception e) {
            log.error("Error handling subscription delete", e);
            return RefreshResult.builder()
                    .success(false)
                    .message("Delete processing error: " + e.getMessage())
                    .error(e.getMessage())
                    .build();
        }
    }

    /**
     * Notify Amarisoft system about subscription changes
     */
    @Retryable(
        value = {RestClientException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    private boolean notifyAmarisoftSubscriptionChange(AmarisoftSubscription subscription, String operation) {
        if (!isConnected) {
            log.warn("Not connected to Amarisoft system, skipping notification");
            return false;
        }

        try {
            String notificationUrl = syncConfiguration.getAmarisoftBaseUrl() + "/api/v1/subscribers/notify";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Operation-Type", operation);
            headers.set("X-Source", "smpp-subscription-management");
            
            AmarisoftNotification notification = AmarisoftNotification.builder()
                    .operation(operation)
                    .msisdn(subscription.getMsisdn())
                    .impi(subscription.getImpi())
                    .impu(subscription.getImpu())
                    .status(subscription.getStatus())
                    .timestamp(LocalDateTime.now())
                    .source("external_sync")
                    .build();
            
            HttpEntity<AmarisoftNotification> request = new HttpEntity<>(notification, headers);
            
            ResponseEntity<String> response = amarisoftRestTemplate.postForEntity(
                    notificationUrl, request, String.class);
            
            apiCallsCounter.increment();
            boolean success = response.getStatusCode().is2xxSuccessful();
            
            if (success) {
                log.debug("Successfully notified Amarisoft about {} for MSISDN: {}", 
                        operation, subscription.getMsisdn());
            } else {
                log.warn("Amarisoft notification failed with status: {}", response.getStatusCode());
            }
            
            return success;
            
        } catch (Exception e) {
            log.error("Error notifying Amarisoft system: {}", e.getMessage());
            
            // Check if we should reconnect
            if (e.getMessage().contains("Connection") || e.getMessage().contains("refused")) {
                isConnected = false;
                CompletableFuture.runAsync(this::initializeConnection, amarisoftExecutor);
            }
            
            return false;
        }
    }

    /**
     * Convert database subscription to Amarisoft format
     */
    private AmarisoftSubscription convertToAmarisoftSubscription(Subscription subscription) {
        return AmarisoftSubscription.builder()
                .msisdn(subscription.getMsisdn())
                .impi(subscription.getImpi())
                .impu(subscription.getImpu())
                .status(subscription.getStatus().toString())
                .lastUpdated(subscription.getUpdatedAt())
                .build();
    }

    /**
     * Get current cache statistics
     */
    public AmarisoftBridgeStatus getBridgeStatus() {
        return AmarisoftBridgeStatus.builder()
                .enabled(syncConfiguration.isAmarisoftEnabled())
                .connected(isConnected)
                .baseUrl(syncConfiguration.getAmarisoftBaseUrl())
                .cacheSize(subscriptionCache.size())
                .totalRefreshOperations(totalRefreshOperations.get())
                .totalRefreshFailures(totalRefreshFailures.get())
                .lastConnectionAttempt(lastConnectionAttempt)
                .lastConnectionError(lastConnectionError)
                .build();
    }

    /**
     * Force refresh all subscriptions
     */
    public CompletableFuture<RefreshResult> forceRefreshAll() {
        return CompletableFuture.supplyAsync(() -> {
            try {
                log.info("Starting force refresh of all subscriptions");
                
                subscriptionCache.clear();
                loadInitialSubscriptions();
                
                return RefreshResult.builder()
                        .success(true)
                        .message("All subscriptions refreshed successfully")
                        .operation("REFRESH_ALL")
                        .build();
                        
            } catch (Exception e) {
                log.error("Error during force refresh", e);
                return RefreshResult.builder()
                        .success(false)
                        .message("Force refresh failed: " + e.getMessage())
                        .error(e.getMessage())
                        .operation("REFRESH_ALL")
                        .build();
            }
        }, amarisoftExecutor);
    }

    /**
     * Shutdown bridge gracefully
     */
    public void shutdown() {
        log.info("Shutting down Amarisoft bridge");
        amarisoftExecutor.shutdown();
    }

    // DTOs
    @lombok.Data
    @lombok.Builder
    public static class AmarisoftSubscription {
        private String msisdn;
        private String impi;
        private String impu;
        private String status;
        private LocalDateTime lastUpdated;
    }

    @lombok.Data
    @lombok.Builder
    public static class AmarisoftNotification {
        private String operation;
        private String msisdn;
        private String impi;
        private String impu;
        private String status;
        private LocalDateTime timestamp;
        private String source;
    }

    @lombok.Data
    @lombok.Builder
    public static class RefreshResult {
        private boolean success;
        private boolean skipped;
        private String message;
        private String error;
        private String msisdn;
        private String operation;
        private boolean statusChanged;
        private LocalDateTime timestamp;
        
        @lombok.Builder.Default
        private LocalDateTime timestamp() {
            return LocalDateTime.now();
        }
    }

    @lombok.Data
    @lombok.Builder
    public static class AmarisoftBridgeStatus {
        private boolean enabled;
        private boolean connected;
        private String baseUrl;
        private int cacheSize;
        private long totalRefreshOperations;
        private long totalRefreshFailures;
        private LocalDateTime lastConnectionAttempt;
        private String lastConnectionError;
    }
}