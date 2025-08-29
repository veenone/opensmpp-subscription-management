package com.smpp.subscription.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonType;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "external_changes",
       indexes = {
           @Index(name = "idx_external_changes_unprocessed", 
                  columnList = "processed, changed_at", 
                  unique = false),
           @Index(name = "idx_external_changes_table_entity", 
                  columnList = "table_name, entity_id", 
                  unique = false)
       })
public class ExternalChange {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "table_name", nullable = false, length = 50)
    private String tableName;

    @Enumerated(EnumType.STRING)
    @Column(name = "operation", nullable = false, length = 10)
    private OperationType operation;

    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    @Type(JsonType.class)
    @Column(name = "old_data", columnDefinition = "jsonb")
    private Map<String, Object> oldData;

    @Type(JsonType.class)
    @Column(name = "new_data", columnDefinition = "jsonb")
    private Map<String, Object> newData;

    @CreationTimestamp
    @Column(name = "changed_at", nullable = false, updatable = false)
    private LocalDateTime changedAt;

    @Column(name = "change_source", length = 100)
    private String changeSource;

    @Builder.Default
    @Column(name = "processed", nullable = false)
    private Boolean processed = false;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "sync_status", length = 20)
    private SyncStatus syncStatus = SyncStatus.PENDING;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    public enum OperationType {
        INSERT,
        UPDATE,
        DELETE
    }

    public enum SyncStatus {
        PENDING,
        PROCESSING,
        SUCCESS,
        FAILED,
        RETRY
    }

    /**
     * Mark change as processed with success status
     */
    public void markAsProcessed() {
        this.processed = true;
        this.processedAt = LocalDateTime.now();
        this.syncStatus = SyncStatus.SUCCESS;
        this.errorMessage = null;
    }

    /**
     * Mark change as failed with error message
     */
    public void markAsFailed(String errorMessage) {
        this.processed = true;
        this.processedAt = LocalDateTime.now();
        this.syncStatus = SyncStatus.FAILED;
        this.errorMessage = errorMessage;
    }

    /**
     * Mark change for retry
     */
    public void markForRetry(String errorMessage) {
        this.processed = false;
        this.processedAt = null;
        this.syncStatus = SyncStatus.RETRY;
        this.errorMessage = errorMessage;
    }

    /**
     * Start processing
     */
    public void startProcessing() {
        this.syncStatus = SyncStatus.PROCESSING;
        this.errorMessage = null;
    }

    /**
     * Check if this is a subscription change
     */
    public boolean isSubscriptionChange() {
        return "subscriptions".equals(this.tableName);
    }

    /**
     * Get the MSISDN from the data if available
     */
    public String getMsisdn() {
        if (newData != null && newData.containsKey("msisdn")) {
            return (String) newData.get("msisdn");
        }
        if (oldData != null && oldData.containsKey("msisdn")) {
            return (String) oldData.get("msisdn");
        }
        return null;
    }

    /**
     * Get the affected subscription status if available
     */
    public String getSubscriptionStatus() {
        if (newData != null && newData.containsKey("status")) {
            return (String) newData.get("status");
        }
        return null;
    }

    /**
     * Check if this is a status change
     */
    public boolean isStatusChange() {
        if (oldData == null || newData == null || operation != OperationType.UPDATE) {
            return false;
        }
        
        Object oldStatus = oldData.get("status");
        Object newStatus = newData.get("status");
        
        return oldStatus != null && newStatus != null && !oldStatus.equals(newStatus);
    }

    /**
     * Check if change is eligible for retry
     */
    public boolean isEligibleForRetry() {
        return syncStatus == SyncStatus.RETRY && !processed;
    }
}