package com.smpp.subscription.controller;

import com.smpp.subscription.dto.*;
import com.smpp.subscription.entity.Subscription;
import com.smpp.subscription.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST Controller for SMPP Subscription Management.
 * 
 * Provides comprehensive CRUD operations, advanced search, bulk import/export,
 * and management functionality for mobile subscriptions.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
@Validated
@Tag(name = "Subscription Management", description = "SMPP subscription management operations")
@SecurityRequirement(name = "bearerAuth")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    /**
     * Get all subscriptions with pagination and sorting.
     */
    @GetMapping
    @PreAuthorize("hasAuthority('SUBSCRIPTION_READ')")
    @Operation(
        summary = "List all subscriptions",
        description = "Retrieve a paginated list of all subscriptions with optional sorting"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved subscriptions",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = PagedResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid pagination parameters",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Access denied",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)
            )
        )
    })
    public ResponseEntity<PagedResponse<SubscriptionResponseDto>> getAllSubscriptions(
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") @Min(0) Integer page,
            
            @Parameter(description = "Page size", example = "20")
            @RequestParam(defaultValue = "20") @Min(1) Integer size,
            
            @Parameter(description = "Sort field", example = "createdAt")
            @RequestParam(defaultValue = "createdAt") String sortBy,
            
            @Parameter(description = "Sort direction", example = "desc")
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        log.info("Fetching subscriptions - page: {}, size: {}, sortBy: {}, sortDir: {}", 
            page, size, sortBy, sortDir);
        
        // Create sort direction
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? 
            Sort.Direction.ASC : Sort.Direction.DESC;
        
        // Create pageable
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        // Fetch subscriptions
        Page<Subscription> subscriptionPage = subscriptionService.getSubscriptions(pageable);
        
        // Convert to DTOs
        Page<SubscriptionResponseDto> dtoPage = subscriptionPage.map(SubscriptionResponseDto::fromEntity);
        
        // Create response
        PagedResponse<SubscriptionResponseDto> response = PagedResponse.fromPage(dtoPage);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get subscription by ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SUBSCRIPTION_READ')")
    @Operation(
        summary = "Get subscription by ID",
        description = "Retrieve a specific subscription by its unique identifier"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Subscription found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = SubscriptionResponseDto.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Subscription not found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Access denied",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)
            )
        )
    })
    public ResponseEntity<SubscriptionResponseDto> getSubscriptionById(
            @Parameter(description = "Subscription ID", example = "123")
            @PathVariable Long id) {
        
        log.info("Fetching subscription with ID: {}", id);
        
        Optional<Subscription> subscriptionOpt = subscriptionService.getSubscriptionById(id);
        if (subscriptionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        SubscriptionResponseDto response = SubscriptionResponseDto.fromEntity(subscriptionOpt.get());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get subscription by MSISDN.
     */
    @GetMapping("/msisdn/{msisdn}")
    @PreAuthorize("hasAuthority('SUBSCRIPTION_READ')")
    @Operation(
        summary = "Get subscription by MSISDN",
        description = "Retrieve a subscription using the mobile number (MSISDN)"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Subscription found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = SubscriptionResponseDto.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Subscription not found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid MSISDN format",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)
            )
        )
    })
    @Cacheable(value = "subscriptions", key = "#msisdn")
    public ResponseEntity<SubscriptionResponseDto> getSubscriptionByMsisdn(
            @Parameter(description = "MSISDN in E.164 format", example = "+1234567890")
            @PathVariable String msisdn) {
        
        log.info("Fetching subscription with MSISDN: {}", msisdn);
        
        Optional<Subscription> subscriptionOpt = subscriptionService.getSubscriptionByMsisdn(msisdn);
        if (subscriptionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        SubscriptionResponseDto response = SubscriptionResponseDto.fromEntity(subscriptionOpt.get());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Create new subscription.
     */
    @PostMapping
    @PreAuthorize("hasAuthority('SUBSCRIPTION_CREATE')")
    @Operation(
        summary = "Create new subscription",
        description = "Create a new mobile subscription with MSISDN, IMPI, and IMPU"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "201",
            description = "Subscription created successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = SubscriptionResponseDto.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request data",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Subscription already exists",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Access denied",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)
            )
        )
    })
    public ResponseEntity<SubscriptionResponseDto> createSubscription(
            @Parameter(description = "Subscription data", required = true)
            @Valid @RequestBody SubscriptionRequestDto request) {
        
        log.info("Creating new subscription for MSISDN: {}", request.getMsisdn());
        
        // Convert to entity
        Subscription subscription = request.toEntity();
        
        // Create subscription
        Subscription createdSubscription = subscriptionService.createSubscription(subscription);
        
        // Convert to response DTO
        SubscriptionResponseDto response = SubscriptionResponseDto.fromEntity(createdSubscription);
        
        log.info("Successfully created subscription with ID: {}", createdSubscription.getId());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Update existing subscription.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SUBSCRIPTION_UPDATE')")
    @Operation(
        summary = "Update subscription",
        description = "Update an existing subscription by ID"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Subscription updated successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = SubscriptionResponseDto.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request data",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Subscription not found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Conflicting data (duplicate MSISDN/IMPI/IMPU)",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)
            )
        )
    })
    public ResponseEntity<SubscriptionResponseDto> updateSubscription(
            @Parameter(description = "Subscription ID", example = "123")
            @PathVariable Long id,
            
            @Parameter(description = "Updated subscription data", required = true)
            @Valid @RequestBody SubscriptionRequestDto request) {
        
        log.info("Updating subscription with ID: {}", id);
        
        // Convert to entity
        Subscription updateData = request.toEntity();
        
        // Update subscription
        Subscription updatedSubscription = subscriptionService.updateSubscriptionById(id, updateData);
        
        // Convert to response DTO
        SubscriptionResponseDto response = SubscriptionResponseDto.fromEntity(updatedSubscription);
        
        log.info("Successfully updated subscription with ID: {}", id);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Delete subscription.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SUBSCRIPTION_DELETE')")
    @Operation(
        summary = "Delete subscription",
        description = "Delete a subscription by ID"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "204",
            description = "Subscription deleted successfully"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Subscription not found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Access denied",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)
            )
        )
    })
    public ResponseEntity<Void> deleteSubscription(
            @Parameter(description = "Subscription ID", example = "123")
            @PathVariable Long id) {
        
        log.info("Deleting subscription with ID: {}", id);
        
        subscriptionService.deleteSubscriptionById(id);
        
        log.info("Successfully deleted subscription with ID: {}", id);
        
        return ResponseEntity.noContent().build();
    }

    /**
     * Advanced search for subscriptions.
     */
    @PostMapping("/search")
    @PreAuthorize("hasAuthority('SUBSCRIPTION_READ')")
    @Operation(
        summary = "Advanced subscription search",
        description = "Search subscriptions with advanced filtering and pagination"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Search completed successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = PagedResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid search criteria",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)
            )
        )
    })
    public ResponseEntity<PagedResponse<SubscriptionResponseDto>> searchSubscriptions(
            @Parameter(description = "Search criteria", required = true)
            @Valid @RequestBody SearchCriteria criteria) {
        
        log.info("Searching subscriptions with criteria: {}", criteria);
        
        // Perform search
        Page<Subscription> searchResults = subscriptionService.searchSubscriptions(criteria);
        
        // Convert to DTOs
        Page<SubscriptionResponseDto> dtoPage = searchResults.map(SubscriptionResponseDto::fromEntity);
        
        // Create response
        PagedResponse<SubscriptionResponseDto> response = PagedResponse.fromPage(dtoPage);
        
        log.info("Search completed - found {} results", response.getTotalElements());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Bulk import subscriptions.
     */
    @PostMapping("/bulk-import")
    @PreAuthorize("hasAuthority('SUBSCRIPTION_BULK_IMPORT')")
    @Operation(
        summary = "Bulk import subscriptions",
        description = "Import multiple subscriptions from JSON data"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Bulk import completed",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = BulkImportResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid import data",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "413",
            description = "Request too large",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)
            )
        )
    })
    public ResponseEntity<BulkImportResponse> bulkImportSubscriptions(
            @Parameter(description = "Bulk import request", required = true)
            @Valid @RequestBody BulkImportRequest request) {
        
        log.info("Starting bulk import of {} subscriptions", request.getSubscriptions().size());
        
        // Validate request size
        if (request.getSubscriptions().size() > request.getBatchSize()) {
            throw new IllegalArgumentException(
                String.format("Request size (%d) exceeds maximum batch size (%d)", 
                    request.getSubscriptions().size(), request.getBatchSize())
            );
        }
        
        // Perform bulk import
        BulkImportResponse response = subscriptionService.bulkImportSubscriptions(request);
        
        log.info("Bulk import completed - Success: {}, Failed: {}, Skipped: {}", 
            response.getSuccessfulImports(), 
            response.getFailedImports(), 
            response.getSkippedDuplicates());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Export subscriptions to CSV.
     */
    @GetMapping("/export")
    @PreAuthorize("hasAuthority('SUBSCRIPTION_EXPORT')")
    @Operation(
        summary = "Export subscriptions to CSV",
        description = "Export all or filtered subscriptions to CSV format"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Export completed successfully",
            content = @Content(mediaType = "text/csv")
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Export failed",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)
            )
        )
    })
    public void exportSubscriptionsToCsv(
            @Parameter(description = "Filter by status")
            @RequestParam(required = false) Subscription.SubscriptionStatus status,
            
            @Parameter(description = "Filter by MSISDN pattern")
            @RequestParam(required = false) String msisdnPattern,
            
            HttpServletResponse response) throws IOException {
        
        log.info("Exporting subscriptions to CSV - status: {}, msisdnPattern: {}", status, msisdnPattern);
        
        // Set response headers for CSV download
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"subscriptions.csv\"");
        
        // Get subscriptions based on filters
        List<Subscription> subscriptions;
        if (status != null) {
            subscriptions = subscriptionService.getSubscriptionsByStatus(status);
        } else {
            subscriptions = subscriptionService.getAllSubscriptions();
        }
        
        // Filter by MSISDN pattern if provided
        if (msisdnPattern != null && !msisdnPattern.trim().isEmpty()) {
            subscriptions = subscriptions.stream()
                .filter(sub -> sub.getMsisdn().contains(msisdnPattern))
                .collect(Collectors.toList());
        }
        
        // Write CSV
        try (PrintWriter writer = response.getWriter()) {
            // Write CSV header
            writer.println("ID,MSISDN,IMPI,IMPU,Status,Created At,Updated At");
            
            // Write data rows
            for (Subscription subscription : subscriptions) {
                writer.printf("%d,\"%s\",\"%s\",\"%s\",%s,%s,%s%n",
                    subscription.getId(),
                    subscription.getMsisdn(),
                    subscription.getImpi(),
                    subscription.getImpu(),
                    subscription.getStatus(),
                    subscription.getCreatedAt(),
                    subscription.getUpdatedAt());
            }
            
            writer.flush();
        }
        
        log.info("Successfully exported {} subscriptions to CSV", subscriptions.size());
    }

    /**
     * Export subscriptions to JSON.
     */
    @GetMapping(value = "/export/json", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAuthority('SUBSCRIPTION_EXPORT')")
    @Operation(
        summary = "Export subscriptions to JSON",
        description = "Export all or filtered subscriptions to JSON format"
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Export completed successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(type = "array", implementation = SubscriptionResponseDto.class)
            )
        )
    })
    public ResponseEntity<List<SubscriptionResponseDto>> exportSubscriptionsToJson(
            @Parameter(description = "Filter by status")
            @RequestParam(required = false) Subscription.SubscriptionStatus status,
            
            @Parameter(description = "Filter by MSISDN pattern")
            @RequestParam(required = false) String msisdnPattern) {
        
        log.info("Exporting subscriptions to JSON - status: {}, msisdnPattern: {}", status, msisdnPattern);
        
        // Get subscriptions based on filters
        List<Subscription> subscriptions;
        if (status != null) {
            subscriptions = subscriptionService.getSubscriptionsByStatus(status);
        } else {
            subscriptions = subscriptionService.getAllSubscriptions();
        }
        
        // Filter by MSISDN pattern if provided
        if (msisdnPattern != null && !msisdnPattern.trim().isEmpty()) {
            subscriptions = subscriptions.stream()
                .filter(sub -> sub.getMsisdn().contains(msisdnPattern))
                .collect(Collectors.toList());
        }
        
        // Convert to DTOs
        List<SubscriptionResponseDto> response = subscriptions.stream()
            .map(SubscriptionResponseDto::fromEntity)
            .collect(Collectors.toList());
        
        log.info("Successfully exported {} subscriptions to JSON", response.size());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get subscription statistics.
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAuthority('SUBSCRIPTION_READ')")
    @Operation(
        summary = "Get subscription statistics",
        description = "Retrieve statistics about subscriptions by status"
    )
    public ResponseEntity<Object> getSubscriptionStatistics() {
        log.info("Fetching subscription statistics");
        
        List<Subscription> allSubscriptions = subscriptionService.getAllSubscriptions();
        
        long activeCount = allSubscriptions.stream()
            .filter(sub -> sub.getStatus() == Subscription.SubscriptionStatus.ACTIVE)
            .count();
            
        long suspendedCount = allSubscriptions.stream()
            .filter(sub -> sub.getStatus() == Subscription.SubscriptionStatus.SUSPENDED)
            .count();
            
        long terminatedCount = allSubscriptions.stream()
            .filter(sub -> sub.getStatus() == Subscription.SubscriptionStatus.TERMINATED)
            .count();
        
        var statistics = java.util.Map.of(
            "total", allSubscriptions.size(),
            "active", activeCount,
            "suspended", suspendedCount,
            "terminated", terminatedCount
        );
        
        return ResponseEntity.ok(statistics);
    }
}