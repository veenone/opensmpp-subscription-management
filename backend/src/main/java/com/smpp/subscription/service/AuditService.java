package com.smpp.subscription.service;

import com.smpp.subscription.entity.AuditLog;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Service for audit logging of subscription operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    /**
     * Log subscription creation event.
     */
    public void logSubscriptionCreated(Long subscriptionId, String msisdn) {
        logAuditEvent(
            "SUBSCRIPTION_CREATED",
            String.format("Subscription created with ID: %d, MSISDN: %s", subscriptionId, msisdn),
            subscriptionId.toString()
        );
    }

    /**
     * Log subscription update event.
     */
    public void logSubscriptionUpdated(Long subscriptionId, String msisdn, String changes) {
        logAuditEvent(
            "SUBSCRIPTION_UPDATED",
            String.format("Subscription updated - ID: %d, MSISDN: %s, Changes: %s", 
                subscriptionId, msisdn, changes),
            subscriptionId.toString()
        );
    }

    /**
     * Log subscription deletion event.
     */
    public void logSubscriptionDeleted(Long subscriptionId, String msisdn) {
        logAuditEvent(
            "SUBSCRIPTION_DELETED",
            String.format("Subscription deleted - ID: %d, MSISDN: %s", subscriptionId, msisdn),
            subscriptionId.toString()
        );
    }

    /**
     * Log bulk import event.
     */
    public void logBulkImport(int totalProcessed, int successful, int failed, int skipped) {
        logAuditEvent(
            "BULK_IMPORT",
            String.format("Bulk import completed - Total: %d, Success: %d, Failed: %d, Skipped: %d", 
                totalProcessed, successful, failed, skipped),
            null
        );
    }

    /**
     * Log subscription search event.
     */
    public void logSubscriptionSearch(String searchCriteria, int resultCount) {
        logAuditEvent(
            "SUBSCRIPTION_SEARCH",
            String.format("Subscription search performed - Criteria: %s, Results: %d", 
                searchCriteria, resultCount),
            null
        );
    }

    /**
     * Log subscription export event.
     */
    public void logSubscriptionExport(String format, int recordCount) {
        logAuditEvent(
            "SUBSCRIPTION_EXPORT",
            String.format("Subscription export performed - Format: %s, Records: %d", 
                format, recordCount),
            null
        );
    }

    /**
     * Log authentication events.
     */
    public void logAuthenticationEvent(String event, String username, boolean success) {
        logAuditEvent(
            "AUTHENTICATION_" + event.toUpperCase(),
            String.format("Authentication %s for user: %s, Success: %b", 
                event.toLowerCase(), username, success),
            username
        );
    }

    /**
     * Log access denied events.
     */
    public void logAccessDenied(String resource, String action) {
        logAuditEvent(
            "ACCESS_DENIED",
            String.format("Access denied to resource: %s, Action: %s", resource, action),
            null
        );
    }

    /**
     * Log general audit event.
     */
    private void logAuditEvent(String action, String description, String resourceId) {
        String username = getCurrentUsername();
        
        // Create audit log entry
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setDescription(description);
        auditLog.setResourceId(resourceId);
        auditLog.setUserId(username);
        auditLog.setTimestamp(LocalDateTime.now());
        auditLog.setIpAddress(getCurrentIpAddress());
        auditLog.setUserAgent(getCurrentUserAgent());
        
        // Log to application logs
        log.info("AUDIT: {} - User: {}, Action: {}, Description: {}, Resource: {}", 
            auditLog.getTimestamp(), username, action, description, resourceId);
        
        // In a production system, you would typically:
        // 1. Save to audit database table
        // 2. Send to SIEM system
        // 3. Store in secure audit logs
        // 4. Implement log signing for integrity
        
        // For now, we're just logging to the application logs
        // You could extend this to save to database using an AuditLogRepository
    }

    /**
     * Get current authenticated username.
     */
    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        return "SYSTEM";
    }

    /**
     * Get current user's IP address.
     * In a real implementation, this would be extracted from the HTTP request.
     */
    private String getCurrentIpAddress() {
        // This would typically be extracted from HttpServletRequest
        // For now, returning a placeholder
        return "127.0.0.1";
    }

    /**
     * Get current user's user agent.
     * In a real implementation, this would be extracted from the HTTP request.
     */
    private String getCurrentUserAgent() {
        // This would typically be extracted from HttpServletRequest
        // For now, returning a placeholder
        return "API-Client";
    }
}