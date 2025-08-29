package com.smpp.subscription.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "app.sync")
@Data
@Validated
public class SyncConfiguration {

    @Valid
    @NotNull
    private CacheInvalidation cacheInvalidation = new CacheInvalidation();

    @Valid
    @NotNull
    private External external = new External();

    @Valid
    @NotNull
    private Webhook webhook = new Webhook();

    @Valid
    @NotNull
    private Amarisoft amarisoft = new Amarisoft();

    @Data
    public static class CacheInvalidation {
        private boolean enabled = true;
        
        @Min(1000)
        private long ttl = 30000;
        
        @Min(1)
        private int batchSize = 100;
    }

    @Data
    public static class External {
        private boolean enabled = true;
        
        @Min(1000)
        private long pollingInterval = 30000;
        
        @Min(1)
        private int batchSize = 100;
        
        @Min(1)
        private int maxRetries = 3;
        
        @Min(100)
        private long retryDelay = 1000;
        
        @Min(1)
        private int maxProcessingTimeMinutes = 10;
        
        @Min(1)
        private int healthCheckThresholdMinutes = 5;
        
        @Min(1)
        private int cleanupRetentionDays = 30;
    }

    @Data
    public static class Webhook {
        private boolean enabled = true;
        
        @Min(1000)
        private int timeout = 5000;
        
        @Min(1)
        private int maxRetries = 3;
        
        @Min(100)
        private long retryDelay = 1000;
        
        private String secret = "";
        
        private List<String> endpoints = List.of();
    }

    @Data
    public static class Amarisoft {
        private boolean enabled = true;
        
        @NotNull
        private String host = "localhost";
        
        @Min(1)
        private int port = 8080;
        
        @NotNull
        private String username = "admin";
        
        @NotNull
        private String password = "admin";
        
        @Min(1000)
        private int timeout = 5000;
        
        @Min(1)
        private int maxRetries = 3;
        
        private String apiVersion = "v1";
        
        private boolean sslEnabled = false;
        
        private boolean validateCertificates = true;
        
        private String authMethod = "basic";
        
        private long connectionPoolMaxSize = 10;
        
        private long connectionPoolKeepAlive = 60000;
    }

    /**
     * Get polling interval in milliseconds
     */
    public long getPollingIntervalMs() {
        return external.getPollingInterval();
    }

    /**
     * Get batch size for external change processing
     */
    public int getExternalBatchSize() {
        return external.getBatchSize();
    }

    /**
     * Check if external sync is enabled
     */
    public boolean isExternalSyncEnabled() {
        return external.isEnabled();
    }

    /**
     * Check if webhooks are enabled
     */
    public boolean isWebhookEnabled() {
        return webhook.isEnabled();
    }

    /**
     * Check if Amarisoft integration is enabled
     */
    public boolean isAmarisoftEnabled() {
        return amarisoft.isEnabled();
    }

    /**
     * Get webhook endpoints excluding empty ones
     */
    public List<String> getActiveWebhookEndpoints() {
        return webhook.getEndpoints().stream()
                .filter(endpoint -> endpoint != null && !endpoint.trim().isEmpty())
                .toList();
    }

    /**
     * Get Amarisoft base URL
     */
    public String getAmarisoftBaseUrl() {
        String protocol = amarisoft.isSslEnabled() ? "https" : "http";
        return String.format("%s://%s:%d", protocol, amarisoft.getHost(), amarisoft.getPort());
    }

    /**
     * Validate configuration on startup
     */
    public void validate() {
        if (external.isEnabled() && external.getBatchSize() <= 0) {
            throw new IllegalStateException("External sync batch size must be positive");
        }
        
        if (webhook.isEnabled() && getActiveWebhookEndpoints().isEmpty()) {
            throw new IllegalStateException("Webhook is enabled but no valid endpoints configured");
        }
        
        if (amarisoft.isEnabled() && (amarisoft.getHost() == null || amarisoft.getHost().trim().isEmpty())) {
            throw new IllegalStateException("Amarisoft integration is enabled but host is not configured");
        }
    }
}