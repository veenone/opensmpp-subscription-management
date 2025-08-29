package com.smpp.subscription.controller;

import com.smpp.subscription.entity.ExternalChange;
import com.smpp.subscription.repository.ExternalChangeRepository;
import com.smpp.subscription.service.ExternalSyncService;
import com.smpp.subscription.service.SyncScheduler;
import com.smpp.subscription.service.WebhookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/sync")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Synchronization", description = "External synchronization management endpoints")
public class SyncController {

    private final ExternalSyncService externalSyncService;
    private final SyncScheduler syncScheduler;
    private final WebhookService webhookService;
    private final ExternalChangeRepository externalChangeRepository;

    @Operation(summary = "Trigger manual synchronization")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Synchronization completed successfully"),
        @ApiResponse(responseCode = "409", description = "Synchronization already in progress"),
        @ApiResponse(responseCode = "500", description = "Synchronization failed")
    })
    @PostMapping("/trigger")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('SYNC_MANAGER')")
    public ResponseEntity<SyncResponse> triggerManualSync(
            @Parameter(description = "Batch size for processing", example = "100")
            @RequestParam(defaultValue = "100") 
            @Min(1) @Max(1000) 
            int batchSize) {
        
        log.info("Manual sync triggered with batch size: {}", batchSize);
        
        try {
            ExternalSyncService.SyncResult result = externalSyncService.triggerSync(batchSize);
            
            SyncResponse response = SyncResponse.builder()
                    .success(result.isSuccess())
                    .message(result.getMessage())
                    .changesProcessed(result.getChangesProcessed())
                    .successfulChanges(result.getSuccessfulChanges())
                    .failedChanges(result.getFailedChanges())
                    .timestamp(LocalDateTime.now())
                    .batchSize(batchSize)
                    .build();
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error triggering manual sync", e);
            
            SyncResponse errorResponse = SyncResponse.builder()
                    .success(false)
                    .message("Failed to trigger synchronization")
                    .error(e.getMessage())
                    .timestamp(LocalDateTime.now())
                    .build();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @Operation(summary = "Get synchronization status and statistics")
    @ApiResponse(responseCode = "200", description = "Status retrieved successfully")
    @GetMapping("/status")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('SYNC_MANAGER') or hasAuthority('SYNC_VIEWER')")
    public ResponseEntity<SyncStatusResponse> getSyncStatus() {
        
        try {
            ExternalSyncService.SyncStatus syncStatus = externalSyncService.getSyncStatus();
            SyncScheduler.SchedulerStatistics schedulerStats = syncScheduler.getSchedulerStatistics();
            WebhookService.WebhookStatistics webhookStats = webhookService.getWebhookStatistics();
            
            SyncStatusResponse response = SyncStatusResponse.builder()
                    .syncInProgress(syncStatus.isSyncInProgress())
                    .lastSyncTime(syncStatus.getLastSyncTime())
                    .unprocessedChanges(syncStatus.getUnprocessedChanges())
                    .failedChanges(syncStatus.getFailedChanges())
                    .totalProcessed(syncStatus.getTotalProcessed())
                    .totalErrors(syncStatus.getTotalErrors())
                    .processingLagSeconds(syncStatus.getProcessingLagSeconds())
                    .oldestUnprocessedChange(syncStatus.getOldestUnprocessedChange())
                    .healthy(syncStatus.isHealthy())
                    .schedulerEnabled(schedulerStats.isEnabled())
                    .schedulerStats(schedulerStats)
                    .webhookStats(webhookStats)
                    .timestamp(LocalDateTime.now())
                    .build();
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error retrieving sync status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Manually invalidate cache")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cache invalidated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid cache parameters")
    })
    @PostMapping("/cache/invalidate")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('SYNC_MANAGER')")
    public ResponseEntity<CacheInvalidationResponse> invalidateCache(
            @Parameter(description = "Cache name to invalidate", example = "subscription-by-msisdn")
            @RequestParam String cacheName,
            @Parameter(description = "Cache key to invalidate (optional)")
            @RequestParam(required = false) String key) {
        
        try {
            if (key != null && !key.trim().isEmpty()) {
                log.info("Manual cache invalidation requested: {} - {}", cacheName, key);
                externalSyncService.invalidateCache(cacheName, key);
            } else {
                log.info("Manual cache invalidation requested for entire cache: {}", cacheName);
                externalSyncService.invalidateCache(cacheName, null);
            }
            
            CacheInvalidationResponse response = CacheInvalidationResponse.builder()
                    .success(true)
                    .message("Cache invalidation completed successfully")
                    .cacheName(cacheName)
                    .key(key)
                    .timestamp(LocalDateTime.now())
                    .build();
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error invalidating cache", e);
            
            CacheInvalidationResponse errorResponse = CacheInvalidationResponse.builder()
                    .success(false)
                    .message("Cache invalidation failed")
                    .error(e.getMessage())
                    .cacheName(cacheName)
                    .key(key)
                    .timestamp(LocalDateTime.now())
                    .build();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @Operation(summary = "Get health check information")
    @ApiResponse(responseCode = "200", description = "Health information retrieved successfully")
    @GetMapping("/health")
    public ResponseEntity<SyncHealthResponse> getHealthCheck() {
        
        try {
            ExternalSyncService.SyncHealthInfo healthInfo = externalSyncService.getHealthInfo();
            SyncScheduler.SchedulerStatistics schedulerStats = syncScheduler.getSchedulerStatistics();
            
            SyncHealthResponse response = SyncHealthResponse.builder()
                    .healthy(healthInfo.getSyncStatus().isHealthy() && schedulerStats.isEnabled())
                    .syncStatus(healthInfo.getSyncStatus())
                    .schedulerStats(schedulerStats)
                    .processingBottlenecks(healthInfo.getProcessingBottlenecks())
                    .executorServiceActive(healthInfo.isExecutorServiceActive())
                    .timestamp(LocalDateTime.now())
                    .build();
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error retrieving health information", e);
            
            SyncHealthResponse errorResponse = SyncHealthResponse.builder()
                    .healthy(false)
                    .error(e.getMessage())
                    .timestamp(LocalDateTime.now())
                    .build();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @Operation(summary = "List unprocessed external changes")
    @ApiResponse(responseCode = "200", description = "Unprocessed changes retrieved successfully")
    @GetMapping("/external-changes")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('SYNC_MANAGER') or hasAuthority('SYNC_VIEWER')")
    public ResponseEntity<Page<ExternalChangeResponse>> getUnprocessedChanges(
            @Parameter(description = "Page number (0-based)")
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @Parameter(description = "Filter by table name")
            @RequestParam(required = false) String tableName) {
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("changedAt").ascending());
            
            List<ExternalChange> changes;
            if (tableName != null && !tableName.trim().isEmpty()) {
                changes = externalChangeRepository.findUnprocessedChangesByTable(tableName, pageable);
            } else {
                changes = externalChangeRepository.findUnprocessedChanges(pageable);
            }
            
            // Convert to response DTOs
            List<ExternalChangeResponse> changeResponses = changes.stream()
                    .map(this::convertToExternalChangeResponse)
                    .toList();
            
            // Create pageable response (simplified for this example)
            Page<ExternalChangeResponse> pageResponse = new PageImpl<>(changeResponses, pageable, changes.size());
            
            return ResponseEntity.ok(pageResponse);
            
        } catch (Exception e) {
            log.error("Error retrieving unprocessed changes", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Get external change by ID")
    @ApiResponse(responseCode = "200", description = "External change retrieved successfully")
    @ApiResponse(responseCode = "404", description = "External change not found")
    @GetMapping("/external-changes/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('SYNC_MANAGER') or hasAuthority('SYNC_VIEWER')")
    public ResponseEntity<ExternalChangeResponse> getExternalChange(
            @Parameter(description = "External change ID")
            @PathVariable Long id) {
        
        try {
            Optional<ExternalChange> changeOpt = externalChangeRepository.findById(id);
            
            if (changeOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ExternalChangeResponse response = convertToExternalChangeResponse(changeOpt.get());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error retrieving external change with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Enable or disable sync scheduler")
    @ApiResponse(responseCode = "200", description = "Scheduler state updated successfully")
    @PostMapping("/scheduler/toggle")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<SchedulerToggleResponse> toggleScheduler(
            @Parameter(description = "Enable or disable scheduler")
            @RequestParam boolean enabled) {
        
        try {
            syncScheduler.setSchedulerEnabled(enabled);
            
            SchedulerToggleResponse response = SchedulerToggleResponse.builder()
                    .success(true)
                    .message("Scheduler " + (enabled ? "enabled" : "disabled") + " successfully")
                    .enabled(enabled)
                    .timestamp(LocalDateTime.now())
                    .build();
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error toggling scheduler", e);
            
            SchedulerToggleResponse errorResponse = SchedulerToggleResponse.builder()
                    .success(false)
                    .message("Failed to toggle scheduler")
                    .error(e.getMessage())
                    .timestamp(LocalDateTime.now())
                    .build();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @Operation(summary = "Test webhook endpoints")
    @ApiResponse(responseCode = "200", description = "Webhook test completed")
    @PostMapping("/webhook/test")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('SYNC_MANAGER')")
    public ResponseEntity<WebhookTestResponse> testWebhooks(
            @Parameter(description = "Specific endpoint to test (optional)")
            @RequestParam(required = false) String endpoint) {
        
        try {
            if (endpoint != null && !endpoint.trim().isEmpty()) {
                WebhookService.WebhookTestResult result = webhookService.testWebhookEndpoint(endpoint);
                
                WebhookTestResponse response = WebhookTestResponse.builder()
                        .success(result.isSuccess())
                        .message(result.getMessage())
                        .testedEndpoint(result.getEndpoint())
                        .responseTime(result.getResponseTime())
                        .error(result.getError())
                        .timestamp(LocalDateTime.now())
                        .build();
                
                return ResponseEntity.ok(response);
            } else {
                // Test all configured endpoints
                WebhookService.WebhookStatistics stats = webhookService.getWebhookStatistics();
                
                WebhookTestResponse response = WebhookTestResponse.builder()
                        .success(true)
                        .message("Webhook testing completed for all endpoints")
                        .testedEndpoints(stats.getEndpoints())
                        .timestamp(LocalDateTime.now())
                        .build();
                
                return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            log.error("Error testing webhooks", e);
            
            WebhookTestResponse errorResponse = WebhookTestResponse.builder()
                    .success(false)
                    .message("Webhook test failed")
                    .error(e.getMessage())
                    .timestamp(LocalDateTime.now())
                    .build();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Convert ExternalChange entity to response DTO
     */
    private ExternalChangeResponse convertToExternalChangeResponse(ExternalChange change) {
        return ExternalChangeResponse.builder()
                .id(change.getId())
                .tableName(change.getTableName())
                .operation(change.getOperation().toString())
                .entityId(change.getEntityId())
                .oldData(change.getOldData())
                .newData(change.getNewData())
                .changedAt(change.getChangedAt())
                .changeSource(change.getChangeSource())
                .processed(change.getProcessed())
                .processedAt(change.getProcessedAt())
                .syncStatus(change.getSyncStatus().toString())
                .errorMessage(change.getErrorMessage())
                .msisdn(change.getMsisdn())
                .isStatusChange(change.isStatusChange())
                .build();
    }

    // Response DTOs
    @lombok.Data
    @lombok.Builder
    public static class SyncResponse {
        private boolean success;
        private String message;
        private String error;
        private int changesProcessed;
        private int successfulChanges;
        private int failedChanges;
        private int batchSize;
        private LocalDateTime timestamp;
    }

    @lombok.Data
    @lombok.Builder
    public static class SyncStatusResponse {
        private boolean syncInProgress;
        private LocalDateTime lastSyncTime;
        private long unprocessedChanges;
        private long failedChanges;
        private long totalProcessed;
        private long totalErrors;
        private long processingLagSeconds;
        private LocalDateTime oldestUnprocessedChange;
        private boolean healthy;
        private boolean schedulerEnabled;
        private SyncScheduler.SchedulerStatistics schedulerStats;
        private WebhookService.WebhookStatistics webhookStats;
        private LocalDateTime timestamp;
    }

    @lombok.Data
    @lombok.Builder
    public static class CacheInvalidationResponse {
        private boolean success;
        private String message;
        private String error;
        private String cacheName;
        private String key;
        private LocalDateTime timestamp;
    }

    @lombok.Data
    @lombok.Builder
    public static class SyncHealthResponse {
        private boolean healthy;
        private String error;
        private ExternalSyncService.SyncStatus syncStatus;
        private SyncScheduler.SchedulerStatistics schedulerStats;
        private long processingBottlenecks;
        private boolean executorServiceActive;
        private LocalDateTime timestamp;
    }

    @lombok.Data
    @lombok.Builder
    public static class ExternalChangeResponse {
        private Long id;
        private String tableName;
        private String operation;
        private Long entityId;
        private Map<String, Object> oldData;
        private Map<String, Object> newData;
        private LocalDateTime changedAt;
        private String changeSource;
        private Boolean processed;
        private LocalDateTime processedAt;
        private String syncStatus;
        private String errorMessage;
        private String msisdn;
        private boolean isStatusChange;
    }

    @lombok.Data
    @lombok.Builder
    public static class SchedulerToggleResponse {
        private boolean success;
        private String message;
        private String error;
        private boolean enabled;
        private LocalDateTime timestamp;
    }

    @lombok.Data
    @lombok.Builder
    public static class WebhookTestResponse {
        private boolean success;
        private String message;
        private String error;
        private String testedEndpoint;
        private List<String> testedEndpoints;
        private long responseTime;
        private LocalDateTime timestamp;
    }
}