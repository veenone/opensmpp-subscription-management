package com.smpp.subscription.repository;

import com.smpp.subscription.entity.ExternalChange;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExternalChangeRepository extends JpaRepository<ExternalChange, Long> {

    /**
     * Find unprocessed changes ordered by timestamp
     */
    @Query("SELECT ec FROM ExternalChange ec WHERE ec.processed = false ORDER BY ec.changedAt ASC")
    List<ExternalChange> findUnprocessedChanges(Pageable pageable);

    /**
     * Find unprocessed changes for a specific table
     */
    @Query("SELECT ec FROM ExternalChange ec WHERE ec.processed = false AND ec.tableName = :tableName ORDER BY ec.changedAt ASC")
    List<ExternalChange> findUnprocessedChangesByTable(@Param("tableName") String tableName, Pageable pageable);

    /**
     * Find changes eligible for retry
     */
    @Query("SELECT ec FROM ExternalChange ec WHERE ec.processed = false AND ec.syncStatus = 'RETRY' ORDER BY ec.changedAt ASC")
    List<ExternalChange> findChangesEligibleForRetry(Pageable pageable);

    /**
     * Find changes by entity ID and table name
     */
    @Query("SELECT ec FROM ExternalChange ec WHERE ec.tableName = :tableName AND ec.entityId = :entityId ORDER BY ec.changedAt DESC")
    List<ExternalChange> findChangesByEntityAndTable(@Param("tableName") String tableName, @Param("entityId") Long entityId);

    /**
     * Find recent changes within time window
     */
    @Query("SELECT ec FROM ExternalChange ec WHERE ec.changedAt >= :since ORDER BY ec.changedAt DESC")
    List<ExternalChange> findRecentChanges(@Param("since") LocalDateTime since, Pageable pageable);

    /**
     * Count unprocessed changes
     */
    @Query("SELECT COUNT(ec) FROM ExternalChange ec WHERE ec.processed = false")
    long countUnprocessedChanges();

    /**
     * Count unprocessed changes by table
     */
    @Query("SELECT COUNT(ec) FROM ExternalChange ec WHERE ec.processed = false AND ec.tableName = :tableName")
    long countUnprocessedChangesByTable(@Param("tableName") String tableName);

    /**
     * Count failed changes
     */
    @Query("SELECT COUNT(ec) FROM ExternalChange ec WHERE ec.syncStatus = 'FAILED'")
    long countFailedChanges();

    /**
     * Find oldest unprocessed change
     */
    @Query("SELECT ec FROM ExternalChange ec WHERE ec.processed = false ORDER BY ec.changedAt ASC LIMIT 1")
    Optional<ExternalChange> findOldestUnprocessedChange();

    /**
     * Find changes by status
     */
    @Query("SELECT ec FROM ExternalChange ec WHERE ec.syncStatus = :status ORDER BY ec.changedAt DESC")
    Page<ExternalChange> findChangesByStatus(@Param("status") ExternalChange.SyncStatus status, Pageable pageable);

    /**
     * Batch update changes to processed status
     */
    @Modifying
    @Query("UPDATE ExternalChange ec SET ec.processed = true, ec.processedAt = :processedAt, ec.syncStatus = :status WHERE ec.id IN :ids")
    int batchUpdateProcessedStatus(@Param("ids") List<Long> ids, 
                                   @Param("processedAt") LocalDateTime processedAt,
                                   @Param("status") ExternalChange.SyncStatus status);

    /**
     * Batch mark changes as failed
     */
    @Modifying
    @Query("UPDATE ExternalChange ec SET ec.processed = true, ec.processedAt = :processedAt, ec.syncStatus = 'FAILED', ec.errorMessage = :errorMessage WHERE ec.id IN :ids")
    int batchMarkAsFailed(@Param("ids") List<Long> ids, 
                         @Param("processedAt") LocalDateTime processedAt,
                         @Param("errorMessage") String errorMessage);

    /**
     * Clean up old processed changes (older than retention period)
     */
    @Modifying
    @Query("DELETE FROM ExternalChange ec WHERE ec.processed = true AND ec.processedAt < :cutoffDate")
    int cleanupOldProcessedChanges(@Param("cutoffDate") LocalDateTime cutoffDate);

    /**
     * Get synchronization statistics
     */
    @Query("""
        SELECT new map(
            ec.tableName as tableName,
            ec.operation as operation,
            ec.syncStatus as syncStatus,
            COUNT(ec) as changeCount,
            MIN(ec.changedAt) as oldestChange,
            MAX(ec.changedAt) as newestChange,
            SUM(CASE WHEN ec.processed = false THEN 1 ELSE 0 END) as unprocessedCount
        )
        FROM ExternalChange ec
        GROUP BY ec.tableName, ec.operation, ec.syncStatus
        """)
    List<Object[]> getSynchronizationStatistics();

    /**
     * Find subscription changes by MSISDN (using JSON extraction)
     */
    @Query(value = """
        SELECT * FROM external_changes ec 
        WHERE ec.table_name = 'subscriptions' 
        AND (
            (ec.new_data->>'msisdn' = :msisdn) 
            OR (ec.old_data->>'msisdn' = :msisdn)
        )
        ORDER BY ec.changed_at DESC
        """, nativeQuery = true)
    List<ExternalChange> findSubscriptionChangesByMsisdn(@Param("msisdn") String msisdn, Pageable pageable);

    /**
     * Find changes that failed processing and are eligible for retry
     */
    @Query("""
        SELECT ec FROM ExternalChange ec 
        WHERE ec.syncStatus = 'FAILED' 
        AND ec.changedAt > :retryAfter 
        ORDER BY ec.changedAt ASC
        """)
    List<ExternalChange> findFailedChangesForRetry(@Param("retryAfter") LocalDateTime retryAfter, Pageable pageable);

    /**
     * Get processing performance metrics
     */
    @Query(value = """
        SELECT 
            COUNT(*) as total_changes,
            COUNT(CASE WHEN processed = true THEN 1 END) as processed_changes,
            COUNT(CASE WHEN sync_status = 'SUCCESS' THEN 1 END) as successful_changes,
            COUNT(CASE WHEN sync_status = 'FAILED' THEN 1 END) as failed_changes,
            AVG(EXTRACT(EPOCH FROM (processed_at - changed_at))) as avg_processing_time_seconds,
            MAX(changed_at) as latest_change_time
        FROM external_changes 
        WHERE changed_at >= :since
        """, nativeQuery = true)
    Object[] getProcessingMetrics(@Param("since") LocalDateTime since);

    /**
     * Check for processing bottlenecks (changes older than threshold that are still unprocessed)
     */
    @Query("SELECT COUNT(ec) FROM ExternalChange ec WHERE ec.processed = false AND ec.changedAt < :threshold")
    long countProcessingBottlenecks(@Param("threshold") LocalDateTime threshold);

    /**
     * Find duplicate changes for the same entity within a time window
     */
    @Query("""
        SELECT ec FROM ExternalChange ec 
        WHERE ec.tableName = :tableName 
        AND ec.entityId = :entityId 
        AND ec.changedAt BETWEEN :startTime AND :endTime
        AND ec.processed = false
        ORDER BY ec.changedAt ASC
        """)
    List<ExternalChange> findDuplicateChanges(@Param("tableName") String tableName,
                                              @Param("entityId") Long entityId,
                                              @Param("startTime") LocalDateTime startTime,
                                              @Param("endTime") LocalDateTime endTime);
}