package com.smpp.subscription.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;

@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_entity_type_id", columnList = "entity_type, entity_id"),
    @Index(name = "idx_audit_user", columnList = "user_name"),
    @Index(name = "idx_audit_timestamp", columnList = "timestamp"),
    @Index(name = "idx_audit_action", columnList = "action")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType;

    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AuditAction action;

    @Column(name = "user_name", nullable = false, length = 50)
    private String userName;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "old_values", columnDefinition = "TEXT")
    private String oldValues;

    @Column(name = "new_values", columnDefinition = "TEXT")
    private String newValues;

    @Column(name = "change_details", columnDefinition = "TEXT")
    private String changeDetails;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(name = "session_id", length = 100)
    private String sessionId;

    @Column(name = "correlation_id", length = 100)
    private String correlationId;

    @Column(name = "success")
    @Builder.Default
    private boolean success = true;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "duration_ms")
    private Long durationMs;

    // For external change detection
    @Column(name = "is_external_change")
    @Builder.Default
    private boolean isExternalChange = false;

    @Column(name = "external_source", length = 100)
    private String externalSource;

    // Cryptographic integrity
    @Column(name = "checksum", length = 64)
    private String checksum;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    public enum AuditAction {
        CREATE,
        READ,
        UPDATE,
        DELETE,
        BULK_IMPORT,
        BULK_EXPORT,
        LOGIN,
        LOGOUT,
        LOGIN_FAILED,
        PASSWORD_CHANGE,
        CACHE_INVALIDATE,
        SYNC_EXECUTE,
        SYNC_FAILED,
        EXTERNAL_UPDATE,
        CONFIGURATION_CHANGE,
        SYSTEM_EVENT
    }

    // Helper method to create audit log for subscription changes
    public static AuditLog forSubscriptionChange(Subscription oldSubscription, 
                                                  Subscription newSubscription, 
                                                  AuditAction action,
                                                  String userName,
                                                  Long userId) {
        AuditLog log = AuditLog.builder()
            .entityType("Subscription")
            .entityId(newSubscription != null ? newSubscription.getId() : 
                     oldSubscription != null ? oldSubscription.getId() : null)
            .action(action)
            .userName(userName)
            .userId(userId)
            .timestamp(LocalDateTime.now())
            .success(true)
            .build();
        
        // Set old and new values based on action
        if (action == AuditAction.UPDATE && oldSubscription != null) {
            log.setOldValues(oldSubscription.toString());
            log.setNewValues(newSubscription.toString());
        } else if (action == AuditAction.CREATE && newSubscription != null) {
            log.setNewValues(newSubscription.toString());
        } else if (action == AuditAction.DELETE && oldSubscription != null) {
            log.setOldValues(oldSubscription.toString());
        }
        
        return log;
    }
}