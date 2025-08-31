package com.smpp.subscription.service;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.locks.ReentrantLock;

@Service
@RequiredArgsConstructor
@Slf4j
public class SyncScheduler implements HealthIndicator {

    private final ExternalSyncService externalSyncService;
    private final AuditService auditService;
    private final MeterRegistry meterRegistry;

    // Configuration
    @Value("${app.sync.external.enabled:true}")
    private boolean syncEnabled;

    @Value("${app.sync.external.batch-size:100}")
    private int batchSize;

    @Value("${app.sync.external.max-processing-time-minutes:10}")
    private int maxProcessingTimeMinutes;

    @Value("${app.sync.external.health-check-threshold-minutes:5}")
    private int healthCheckThresholdMinutes;

    @Value("${app.sync.external.cleanup-retention-days:30}")
    private int cleanupRetentionDays;

    // State tracking
    private final AtomicBoolean schedulerEnabled = new AtomicBoolean(true);
    private final AtomicLong totalSyncCycles = new AtomicLong(0);
    private final AtomicLong successfulSyncCycles = new AtomicLong(0);
    private final AtomicLong failedSyncCycles = new AtomicLong(0);
    private final ReentrantLock syncLock = new ReentrantLock();
    
    private volatile LocalDateTime lastSyncStartTime;
    private volatile LocalDateTime lastSuccessfulSyncTime;
    private volatile LocalDateTime lastFailureTime;
    private volatile String lastErrorMessage;
    private volatile boolean isCurrentlyRunning = false;

    // Metrics
    private Timer syncCycleTimer;
    private Counter syncCyclesSuccessCounter;
    private Counter syncCyclesFailureCounter;
    private Counter cleanupOperationsCounter;

    @PostConstruct
    public void initMetrics() {
        this.syncCycleTimer = Timer.builder("sync.scheduler.cycle.duration")
                .description("Duration of sync scheduler cycles")
                .register(meterRegistry);
                
        this.syncCyclesSuccessCounter = Counter.builder("sync.scheduler.cycles.success")
                .description("Number of successful sync cycles")
                .register(meterRegistry);
                
        this.syncCyclesFailureCounter = Counter.builder("sync.scheduler.cycles.failure")
                .description("Number of failed sync cycles")
                .register(meterRegistry);
                
        this.cleanupOperationsCounter = Counter.builder("sync.scheduler.cleanup.operations")
                .description("Number of cleanup operations performed")
                .register(meterRegistry);

        log.info("Sync scheduler initialized - enabled: {}, batch size: {}", syncEnabled, batchSize);
        
        if (syncEnabled) {
            auditService.logSystemEvent("SYNC_SCHEDULER_STARTED", 
                    String.format("Sync scheduler started with batch size %d", batchSize));
        }
    }

    /**
     * Main scheduled sync processing - runs every 30 seconds
     */
    @Scheduled(fixedDelay = 30000, initialDelay = 10000)
    public void processExternalChanges() {
        if (!syncEnabled || !schedulerEnabled.get()) {
            log.debug("Sync scheduler is disabled, skipping cycle");
            return;
        }

        if (!syncLock.tryLock()) {
            log.debug("Previous sync cycle still running, skipping this cycle");
            return;
        }

        Timer.Sample sample = Timer.start(meterRegistry);
        lastSyncStartTime = LocalDateTime.now();
        isCurrentlyRunning = true;
        totalSyncCycles.incrementAndGet();

        try {
            log.debug("Starting scheduled sync cycle");
            
            // Check for stuck processing
            if (isProcessingStuck()) {
                log.warn("Sync processing appears to be stuck, attempting recovery");
                handleStuckProcessing();
            }

            // Process regular changes
            ExternalSyncService.SyncResult result = externalSyncService.processExternalChanges(batchSize);
            
            if (result.isSuccess()) {
                lastSuccessfulSyncTime = LocalDateTime.now();
                successfulSyncCycles.incrementAndGet();
                syncCyclesSuccessCounter.increment();
                
                if (result.getChangesProcessed() > 0) {
                    log.info("Sync cycle completed successfully: {}", result.getMessage());
                }
                
                // Clear any previous error state
                lastErrorMessage = null;
            } else {
                handleSyncFailure(result);
            }

            // Process retry changes if needed
            processRetryChanges();

        } catch (Exception e) {
            handleSyncException(e);
        } finally {
            isCurrentlyRunning = false;
            syncLock.unlock();
            sample.stop(syncCycleTimer);
        }
    }

    /**
     * Process changes that are eligible for retry
     */
    private void processRetryChanges() {
        try {
            ExternalSyncService.SyncResult retryResult = externalSyncService.processRetryChanges(batchSize / 2);
            if (retryResult.isSuccess() && retryResult.getChangesProcessed() > 0) {
                log.info("Retry cycle completed: {}", retryResult.getMessage());
            }
        } catch (Exception e) {
            log.warn("Error processing retry changes: {}", e.getMessage());
        }
    }

    /**
     * Cleanup old processed changes - runs daily at 2 AM
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupOldChanges() {
        if (!syncEnabled) {
            return;
        }

        try {
            log.info("Starting cleanup of old processed changes");
            int deletedCount = externalSyncService.cleanupOldChanges(cleanupRetentionDays);
            cleanupOperationsCounter.increment();
            
            if (deletedCount > 0) {
                log.info("Cleanup completed: {} old changes removed", deletedCount);
                auditService.logSystemEvent("EXTERNAL_CHANGES_CLEANUP", 
                        String.format("Cleanup completed: %d old changes removed", deletedCount));
            }
        } catch (Exception e) {
            log.error("Error during cleanup operation: {}", e.getMessage(), e);
            auditService.logSystemEvent("EXTERNAL_CHANGES_CLEANUP_FAILED", 
                    "Cleanup operation failed: " + e.getMessage());
        }
    }

    /**
     * Health monitoring - runs every 5 minutes
     */
    @Scheduled(fixedDelay = 300000, initialDelay = 60000)
    public void performHealthCheck() {
        if (!syncEnabled) {
            return;
        }

        try {
            ExternalSyncService.SyncHealthInfo healthInfo = externalSyncService.getHealthInfo();
            
            if (!healthInfo.getSyncStatus().isHealthy()) {
                log.warn("Sync system health check failed: unprocessed={}, lag={}s", 
                        healthInfo.getSyncStatus().getUnprocessedChanges(),
                        healthInfo.getSyncStatus().getProcessingLagSeconds());
                
                // Log health issue
                auditService.logSystemEvent("SYNC_HEALTH_WARNING", 
                        String.format("Sync health degraded: %d unprocessed changes, %ds lag", 
                                healthInfo.getSyncStatus().getUnprocessedChanges(),
                                healthInfo.getSyncStatus().getProcessingLagSeconds()));
            }
            
            // Check for processing bottlenecks
            if (healthInfo.getProcessingBottlenecks() > 0) {
                log.warn("Processing bottlenecks detected: {} changes stuck in processing", 
                        healthInfo.getProcessingBottlenecks());
            }
            
        } catch (Exception e) {
            log.error("Error during health check: {}", e.getMessage(), e);
        }
    }

    /**
     * Check if processing appears to be stuck
     */
    private boolean isProcessingStuck() {
        if (lastSyncStartTime == null) {
            return false;
        }
        
        Duration timeSinceLastStart = Duration.between(lastSyncStartTime, LocalDateTime.now());
        return timeSinceLastStart.toMinutes() > maxProcessingTimeMinutes && isCurrentlyRunning;
    }

    /**
     * Handle stuck processing scenario
     */
    private void handleStuckProcessing() {
        log.error("Sync processing has been stuck for {} minutes, attempting recovery", 
                Duration.between(lastSyncStartTime, LocalDateTime.now()).toMinutes());
        
        auditService.logSystemEvent("SYNC_STUCK_RECOVERY", 
                "Sync processing stuck, attempting automatic recovery");
        
        // Reset state
        isCurrentlyRunning = false;
        lastErrorMessage = "Processing was stuck and recovered";
        
        // Additional recovery actions could be added here
    }

    /**
     * Handle sync failure
     */
    private void handleSyncFailure(ExternalSyncService.SyncResult result) {
        lastFailureTime = LocalDateTime.now();
        lastErrorMessage = result.getError() != null ? result.getError() : result.getMessage();
        failedSyncCycles.incrementAndGet();
        syncCyclesFailureCounter.increment();
        
        log.error("Sync cycle failed: {}", result.getMessage());
        
        auditService.logSystemEvent("SYNC_CYCLE_FAILED", 
                "Sync cycle failed: " + result.getMessage());
    }

    /**
     * Handle sync exception
     */
    private void handleSyncException(Exception e) {
        lastFailureTime = LocalDateTime.now();
        lastErrorMessage = e.getMessage();
        failedSyncCycles.incrementAndGet();
        syncCyclesFailureCounter.increment();
        
        log.error("Sync cycle encountered exception", e);
        
        auditService.logSystemEvent("SYNC_CYCLE_EXCEPTION", 
                "Sync cycle exception: " + e.getMessage());
    }

    /**
     * Manually trigger sync cycle
     */
    public SyncCycleResult triggerManualSync() {
        if (!syncEnabled) {
            return SyncCycleResult.builder()
                    .success(false)
                    .message("Sync is disabled")
                    .build();
        }

        if (!syncLock.tryLock()) {
            return SyncCycleResult.builder()
                    .success(false)
                    .message("Sync already in progress")
                    .build();
        }

        try {
            log.info("Manual sync triggered");
            auditService.logSystemEvent("MANUAL_SYNC_TRIGGERED", "Manual sync cycle initiated");
            
            ExternalSyncService.SyncResult result = externalSyncService.processExternalChanges(batchSize);
            
            return SyncCycleResult.builder()
                    .success(result.isSuccess())
                    .message(result.getMessage())
                    .changesProcessed(result.getChangesProcessed())
                    .executionTime(LocalDateTime.now())
                    .build();
                    
        } finally {
            syncLock.unlock();
        }
    }

    /**
     * Enable/disable scheduler
     */
    public void setSchedulerEnabled(boolean enabled) {
        boolean wasEnabled = schedulerEnabled.getAndSet(enabled);
        
        if (wasEnabled != enabled) {
            log.info("Sync scheduler {}", enabled ? "enabled" : "disabled");
            auditService.logSystemEvent("SYNC_SCHEDULER_STATE_CHANGE", 
                    "Sync scheduler " + (enabled ? "enabled" : "disabled"));
        }
    }

    /**
     * Get scheduler statistics
     */
    public SchedulerStatistics getSchedulerStatistics() {
        return SchedulerStatistics.builder()
                .enabled(syncEnabled && schedulerEnabled.get())
                .batchSize(batchSize)
                .totalCycles(totalSyncCycles.get())
                .successfulCycles(successfulSyncCycles.get())
                .failedCycles(failedSyncCycles.get())
                .lastSyncStartTime(lastSyncStartTime)
                .lastSuccessfulSyncTime(lastSuccessfulSyncTime)
                .lastFailureTime(lastFailureTime)
                .lastErrorMessage(lastErrorMessage)
                .currentlyRunning(isCurrentlyRunning)
                .averageCycleDuration(syncCycleTimer.mean(java.util.concurrent.TimeUnit.MILLISECONDS))
                .build();
    }

    /**
     * Spring Boot health indicator implementation
     */
    @Override
    public Health health() {
        if (!syncEnabled) {
            return Health.up()
                    .withDetail("status", "disabled")
                    .build();
        }

        boolean isHealthy = true;
        Health.Builder healthBuilder = Health.up();
        
        // Check if scheduler is enabled
        if (!schedulerEnabled.get()) {
            healthBuilder.withDetail("scheduler_enabled", false);
        }
        
        // Check for recent failures
        if (lastFailureTime != null) {
            Duration timeSinceFailure = Duration.between(lastFailureTime, LocalDateTime.now());
            if (timeSinceFailure.toMinutes() < healthCheckThresholdMinutes) {
                isHealthy = false;
                healthBuilder.withDetail("recent_failure", lastErrorMessage);
            }
        }
        
        // Check if sync is stuck
        if (isProcessingStuck()) {
            isHealthy = false;
            healthBuilder.withDetail("status", "stuck");
        }
        
        // Check sync service health
        try {
            ExternalSyncService.SyncStatus syncStatus = externalSyncService.getSyncStatus();
            if (!syncStatus.isHealthy()) {
                isHealthy = false;
                healthBuilder.withDetail("sync_service_healthy", false);
                healthBuilder.withDetail("unprocessed_changes", syncStatus.getUnprocessedChanges());
                healthBuilder.withDetail("processing_lag_seconds", syncStatus.getProcessingLagSeconds());
            }
        } catch (Exception e) {
            isHealthy = false;
            healthBuilder.withDetail("sync_service_error", e.getMessage());
        }
        
        healthBuilder
                .withDetail("total_cycles", totalSyncCycles.get())
                .withDetail("successful_cycles", successfulSyncCycles.get())
                .withDetail("failed_cycles", failedSyncCycles.get())
                .withDetail("last_sync_time", lastSuccessfulSyncTime)
                .withDetail("currently_running", isCurrentlyRunning);
        
        return isHealthy ? healthBuilder.build() : healthBuilder.down().build();
    }

    /**
     * Shutdown scheduler gracefully
     */
    @PreDestroy
    public void shutdown() {
        log.info("Shutting down sync scheduler");
        setSchedulerEnabled(false);
        
        // Wait for current cycle to complete
        if (syncLock.isLocked()) {
            try {
                syncLock.lock();
                syncLock.unlock();
            } catch (Exception e) {
                log.warn("Error waiting for sync cycle to complete: {}", e.getMessage());
            }
        }
        
        auditService.logSystemEvent("SYNC_SCHEDULER_SHUTDOWN", "Sync scheduler shutdown completed");
    }

    /**
     * Sync cycle result
     */
    @lombok.Data
    @lombok.Builder
    public static class SyncCycleResult {
        private boolean success;
        private String message;
        private int changesProcessed;
        private LocalDateTime executionTime;
    }

    /**
     * Scheduler statistics
     */
    @lombok.Data
    @lombok.Builder
    public static class SchedulerStatistics {
        private boolean enabled;
        private int batchSize;
        private long totalCycles;
        private long successfulCycles;
        private long failedCycles;
        private LocalDateTime lastSyncStartTime;
        private LocalDateTime lastSuccessfulSyncTime;
        private LocalDateTime lastFailureTime;
        private String lastErrorMessage;
        private boolean currentlyRunning;
        private double averageCycleDuration;
    }
}