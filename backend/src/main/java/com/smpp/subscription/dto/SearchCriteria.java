package com.smpp.subscription.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.smpp.subscription.entity.Subscription;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for advanced search criteria with filtering and pagination.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Advanced search criteria for filtering subscriptions")
public class SearchCriteria {

    @Schema(description = "Filter by MSISDN (partial match supported)", example = "+123")
    @JsonProperty("msisdn")
    private String msisdn;

    @Schema(description = "Filter by IMPI (partial match supported)", example = "user@")
    @JsonProperty("impi")
    private String impi;

    @Schema(description = "Filter by IMPU (partial match supported)", example = "sip:user@")
    @JsonProperty("impu")
    private String impu;

    @Schema(description = "Filter by subscription status", example = "ACTIVE")
    @JsonProperty("status")
    private Subscription.SubscriptionStatus status;

    @Schema(
        description = "Filter subscriptions created after this date",
        example = "2024-01-01T00:00:00"
    )
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("created_after")
    private LocalDateTime createdAfter;

    @Schema(
        description = "Filter subscriptions created before this date",
        example = "2024-12-31T23:59:59"
    )
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("created_before")
    private LocalDateTime createdBefore;

    @Schema(
        description = "Filter subscriptions updated after this date",
        example = "2024-01-01T00:00:00"
    )
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("updated_after")
    private LocalDateTime updatedAfter;

    @Schema(
        description = "Filter subscriptions updated before this date",
        example = "2024-12-31T23:59:59"
    )
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("updated_before")
    private LocalDateTime updatedBefore;

    @Schema(
        description = "Page number (0-based)",
        example = "0",
        minimum = "0"
    )
    @Min(value = 0, message = "Page number must be non-negative")
    @JsonProperty("page")
    @Builder.Default
    private Integer page = 0;

    @Schema(
        description = "Number of items per page",
        example = "20",
        minimum = "1"
    )
    @Min(value = 1, message = "Page size must be positive")
    @JsonProperty("size")
    @Builder.Default
    private Integer size = 20;

    @Schema(
        description = "Sort field (id, msisdn, impi, impu, status, createdAt, updatedAt)",
        example = "createdAt"
    )
    @Pattern(
        regexp = "^(id|msisdn|impi|impu|status|createdAt|updatedAt)$",
        message = "Sort field must be one of: id, msisdn, impi, impu, status, createdAt, updatedAt"
    )
    @JsonProperty("sort_by")
    @Builder.Default
    private String sortBy = "createdAt";

    @Schema(
        description = "Sort direction (asc or desc)",
        example = "desc"
    )
    @Pattern(
        regexp = "^(asc|desc)$",
        message = "Sort direction must be 'asc' or 'desc'"
    )
    @JsonProperty("sort_direction")
    @Builder.Default
    private String sortDirection = "desc";

    /**
     * Checks if any search criteria are specified.
     * 
     * @return true if any filter criteria are set
     */
    public boolean hasFilters() {
        return msisdn != null || impi != null || impu != null || status != null ||
               createdAfter != null || createdBefore != null ||
               updatedAfter != null || updatedBefore != null;
    }

    /**
     * Validates date ranges to ensure logical consistency.
     * 
     * @return true if date ranges are valid
     */
    public boolean hasValidDateRanges() {
        if (createdAfter != null && createdBefore != null && 
            createdAfter.isAfter(createdBefore)) {
            return false;
        }
        
        if (updatedAfter != null && updatedBefore != null && 
            updatedAfter.isAfter(updatedBefore)) {
            return false;
        }
        
        return true;
    }
}