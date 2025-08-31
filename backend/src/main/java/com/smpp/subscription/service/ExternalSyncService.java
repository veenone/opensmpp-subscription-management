package com.smpp.subscription.service;

import com.smpp.cache.CacheService;
import com.smpp.subscription.entity.ExternalChange;
import com.smpp.subscription.repository.ExternalChangeRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExternalSyncService {

    private final ExternalChangeRepository externalChangeRepository;
    private final CacheService cacheService;
    private final WebhookService webhookService;
    private final AuditService auditService;
    private final AmarisoftBridge amarisoftBridge;
    private final MeterRegistry meterRegistry;

    // Metrics
    private Counter changesProcessedCounter;
    private Counter changesFailedCounter;
    private Counter cacheInvalidationsCounter;
    private Counter webhookNotificationsCounter;
    private Timer syncProcessingTimer;

    // Performance tracking
    private final AtomicLong totalChangesProcessed = new AtomicLong(0);
    private final AtomicLong totalProcessingErrors = new AtomicLong(0);
    private volatile LocalDateTime lastSyncTime;
    private volatile boolean syncInProgress = false;
    
    // Async processing
    private final ExecutorService asyncExecutor = Executors.newFixedThreadPool(4);

    @PostConstruct
    public void initMetrics() {
        this.changesProcessedCounter = Counter.builder("sync.changes.processed")
                .description("Number of external changes processed")
                .register(meterRegistry);
        
        this.changesFailedCounter = Counter.builder("sync.changes.failed")
                .description("Number of external changes that failed processing")
                .register(meterRegistry);
        
        this.cacheInvalidationsCounter = Counter.builder("sync.cache.invalidations")
                .description("Number of cache invalidations performed")
                .register(meterRegistry);
        
        this.webhookNotificationsCounter = Counter.builder("sync.webhook.notifications")
                .description("Number of webhook notifications sent")
                .register(meterRegistry);
        
        this.syncProcessingTimer = Timer.builder("sync.processing.duration")
                .description("Time taken to process external changes")
                .register(meterRegistry);
    }

    /**
     * Process external changes in batches
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
    public SyncResult processExternalChanges(int batchSize) {
        if (syncInProgress) {
            log.warn("Sync already in progress, skipping this cycle");
            return SyncResult.builder()
                    .success(false)
                    .message("Sync already in progress")
                    .build();
        }

        Timer.Sample sample = Timer.start(meterRegistry);
        syncInProgress = true;
        SyncResult result;

        try {
            log.debug("Starting external changes processing with batch size: {}", batchSize);
            
            // Get unprocessed changes
            Pageable pageable = PageRequest.of(0, batchSize);
            List<ExternalChange> unprocessedChanges = externalChangeRepository.findUnprocessedChanges(pageable);
            
            if (unprocessedChanges.isEmpty()) {
                log.debug("No unprocessed changes found");
                return SyncResult.builder()
                        .success(true)
                        .message("No changes to process")
                        .changesProcessed(0)
                        .build();
            }

            log.info("Processing {} external changes", unprocessedChanges.size());
            
            result = processBatch(unprocessedChanges);
            lastSyncTime = LocalDateTime.now();
            
            // Log audit entry
            auditService.logSystemEvent("EXTERNAL_SYNC", 
                String.format("Processed %d changes, %d successful, %d failed", 
                    result.getChangesProcessed(), 
                    result.getSuccessfulChanges(), 
                    result.getFailedChanges()));

            return result;
            
        } catch (Exception e) {
            log.error("Error processing external changes", e);
            totalProcessingErrors.incrementAndGet();
            changesFailedCounter.increment();
            
            return SyncResult.builder()
                    .success(false)
                    .message("Error processing changes: " + e.getMessage())
                    .error(e.getMessage())
                    .build();
        } finally {
            syncInProgress = false;
            sample.stop(syncProcessingTimer);
        }
    }

    /**
     * Process retry-eligible changes
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public SyncResult processRetryChanges(int batchSize) {
        log.debug("Processing retry-eligible changes");
        
        Pageable pageable = PageRequest.of(0, batchSize);
        List<ExternalChange> retryChanges = externalChangeRepository.findChangesEligibleForRetry(pageable);
        
        if (retryChanges.isEmpty()) {
            return SyncResult.builder()
                    .success(true)
                    .message("No retry changes to process")
                    .changesProcessed(0)
                    .build();
        }

        log.info("Processing {} retry changes", retryChanges.size());
        return processBatch(retryChanges);
    }

    /**
     * Process a batch of changes
     */
    private SyncResult processBatch(List<ExternalChange> changes) {
        int successCount = 0;
        int failureCount = 0;
        
        for (ExternalChange change : changes) {
            try {
                change.startProcessing();
                externalChangeRepository.save(change);
                
                boolean success = processIndividualChange(change);
                
                if (success) {
                    change.markAsProcessed();
                    successCount++;
                    changesProcessedCounter.increment();
                } else {
                    change.markAsFailed("Processing failed - check logs for details");
                    failureCount++;
                    changesFailedCounter.increment();
                }
                
                externalChangeRepository.save(change);
                
            } catch (Exception e) {
                log.error("Error processing change ID {}: {}", change.getId(), e.getMessage(), e);
                change.markAsFailed("Exception: " + e.getMessage());
                externalChangeRepository.save(change);
                failureCount++;
                changesFailedCounter.increment();
            }
        }
        
        totalChangesProcessed.addAndGet(successCount);
        
        return SyncResult.builder()
                .success(failureCount == 0)
                .message(String.format("Processed %d changes: %d successful, %d failed", 
                        changes.size(), successCount, failureCount))
                .changesProcessed(changes.size())
                .successfulChanges(successCount)
                .failedChanges(failureCount)
                .build();
    }

    /**
     * Process individual change
     */
    private boolean processIndividualChange(ExternalChange change) {
        try {
            log.debug("Processing change ID {} for {} {} on entity ID {}", 
                    change.getId(), change.getOperation(), change.getTableName(), change.getEntityId());

            // Invalidate cache
            invalidateCacheForChange(change);
            
            // Send webhook notification asynchronously
            CompletableFuture.runAsync(() -> {
                try {
                    webhookService.sendChangeNotification(change);
                    webhookNotificationsCounter.increment();
                } catch (Exception e) {
                    log.warn("Failed to send webhook notification for change ID {}: {}", 
                            change.getId(), e.getMessage());
                }
            }, asyncExecutor);
            
            // Refresh in-memory data if needed
            refreshInMemoryData(change);
            
            return true;
            
        } catch (Exception e) {
            log.error("Failed to process change ID {}: {}", change.getId(), e.getMessage(), e);
            return false;
        }
    }

    /**
     * Invalidate cache based on change type
     */
    private void invalidateCacheForChange(ExternalChange change) {
        try {
            if (change.isSubscriptionChange()) {
                String msisdn = change.getMsisdn();
                if (msisdn != null) {
                    log.debug("Invalidating subscription caches for MSISDN: {}", msisdn);
                    cacheService.invalidateSubscriptionCaches(msisdn);
                    cacheInvalidationsCounter.increment();
                }
                
                // Also invalidate general subscription caches
                cacheService.invalidateCache("subscription-stats");
            } else if ("users".equals(change.getTableName())) {
                // Handle user changes
                Map<String, Object> data = change.getNewData() != null ? change.getNewData() : change.getOldData();
                if (data != null && data.containsKey("username")) {
                    String username = (String) data.get("username");
                    cacheService.invalidateUserCaches(username);
                    cacheInvalidationsCounter.increment();
                }
            }
            
        } catch (Exception e) {
            log.warn("Failed to invalidate cache for change ID {}: {}", change.getId(), e.getMessage());
        }
    }

    /**
     * Refresh in-memory data structures
     */
    private void refreshInMemoryData(ExternalChange change) {
        try {
            if (change.isSubscriptionChange()) {
                // Trigger refresh of Amarisoft bridge data asynchronously
                log.debug("Triggering in-memory data refresh for subscription change");
                CompletableFuture<AmarisoftBridge.RefreshResult> refreshFuture = 
                    amarisoftBridge.refreshSubscriptionData(change);
                
                // Handle the result asynchronously without blocking
                refreshFuture.whenComplete((result, throwable) -> {
                    if (throwable != null) {
                        log.warn("Amarisoft refresh failed for change ID {}: {}", 
                                change.getId(), throwable.getMessage());
                    } else if (result != null && !result.isSuccess() && !result.isSkipped()) {
                        log.warn("Amarisoft refresh unsuccessful for change ID {}: {}", 
                                change.getId(), result.getMessage());
                    } else if (result != null && result.isSuccess() && !result.isSkipped()) {
                        log.debug("Amarisoft refresh completed successfully for change ID {}", change.getId());
                    }
                });
            }
        } catch (Exception e) {
            log.warn("Failed to trigger in-memory data refresh for change ID {}: {}", change.getId(), e.getMessage());
        }
    }

    /**
     * Manually trigger synchronization
     */
    public SyncResult triggerSync(int batchSize) {
        log.info("Manual sync triggered with batch size: {}", batchSize);
        return processExternalChanges(batchSize);
    }

    /**
     * Invalidate specific cache entry manually
     */
    public void invalidateCache(String cacheName, String key) {
        log.info("Manual cache invalidation requested: {} - {}", cacheName, key);
        cacheService.invalidateCacheEntry(cacheName, key);
        cacheInvalidationsCounter.increment();
        
        auditService.logSystemEvent("MANUAL_CACHE_INVALIDATION", 
                String.format("Cache %s key %s invalidated", cacheName, key));
    }

    /**
     * Get sync status and statistics
     */
    public SyncStatus getSyncStatus() {
        long unprocessedCount = externalChangeRepository.countUnprocessedChanges();
        long failedCount = externalChangeRepository.countFailedChanges();
        
        LocalDateTime oldestUnprocessed = externalChangeRepository.findOldestUnprocessedChange()
                .map(ExternalChange::getChangedAt)
                .orElse(null);
        
        // Calculate processing lag
        long processingLagSeconds = 0;
        if (oldestUnprocessed != null) {
            processingLagSeconds = java.time.Duration.between(oldestUnprocessed, LocalDateTime.now()).getSeconds();
        }
        
        return SyncStatus.builder()
                .syncInProgress(syncInProgress)
                .lastSyncTime(lastSyncTime)
                .unprocessedChanges(unprocessedCount)
                .failedChanges(failedCount)
                .totalProcessed(totalChangesProcessed.get())
                .totalErrors(totalProcessingErrors.get())
                .processingLagSeconds(processingLagSeconds)
                .oldestUnprocessedChange(oldestUnprocessed)
                .healthy(unprocessedCount < 1000 && processingLagSeconds < 300) // 5 minutes
                .build();
    }

    /**
     * Get detailed health information
     */
    public SyncHealthInfo getHealthInfo() {
        SyncStatus status = getSyncStatus();
        
        // Check for processing bottlenecks
        LocalDateTime bottleneckThreshold = LocalDateTime.now().minusMinutes(10);
        long bottleneckCount = externalChangeRepository.countProcessingBottlenecks(bottleneckThreshold);
        
        // Get recent processing metrics
        Object[] metrics = externalChangeRepository.getProcessingMetrics(LocalDateTime.now().minusHours(1));
        
        return SyncHealthInfo.builder()
                .syncStatus(status)
                .processingBottlenecks(bottleneckCount)
                .recentMetrics(metrics)
                .executorServiceActive(!asyncExecutor.isShutdown())
                .build();
    }

    /**
     * Clean up old processed changes
     */
    @Transactional
    public int cleanupOldChanges(int retentionDays) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(retentionDays);
        int deletedCount = externalChangeRepository.cleanupOldProcessedChanges(cutoffDate);
        
        if (deletedCount > 0) {
            log.info("Cleaned up {} old processed changes older than {} days", deletedCount, retentionDays);
            auditService.logSystemEvent("CLEANUP_EXTERNAL_CHANGES", 
                    String.format("Deleted %d old changes older than %d days", deletedCount, retentionDays));
        }
        
        return deletedCount;
    }

    /**
     * Shutdown async executor gracefully
     */
    public void shutdown() {
        log.info("Shutting down external sync service");
        asyncExecutor.shutdown();
    }

    /**
     * Sync result data transfer object
     */
    @lombok.Data
    @lombok.Builder
    public static class SyncResult {
        private boolean success;
        private String message;
        private String error;
        private int changesProcessed;
        private int successfulChanges;
        private int failedChanges;
        @lombok.Builder.Default
        private LocalDateTime processedAt = LocalDateTime.now();
    }

    /**
     * Sync status data transfer object
     */
    @lombok.Data
    @lombok.Builder
    public static class SyncStatus {
        private boolean syncInProgress;
        private LocalDateTime lastSyncTime;
        private long unprocessedChanges;
        private long failedChanges;
        private long totalProcessed;
        private long totalErrors;
        private long processingLagSeconds;
        private LocalDateTime oldestUnprocessedChange;
        private boolean healthy;
    }

    /**
     * Detailed health information
     */
    @lombok.Data
    @lombok.Builder
    public static class SyncHealthInfo {
        private SyncStatus syncStatus;
        private long processingBottlenecks;
        private Object[] recentMetrics;
        private boolean executorServiceActive;
    }
}