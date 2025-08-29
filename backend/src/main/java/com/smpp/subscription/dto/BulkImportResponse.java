package com.smpp.subscription.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for bulk import operations.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response payload for bulk import operations")
public class BulkImportResponse {

    @Schema(description = "Total number of subscriptions processed", example = "1000")
    @JsonProperty("total_processed")
    private Integer totalProcessed;

    @Schema(description = "Number of subscriptions successfully imported", example = "950")
    @JsonProperty("successful_imports")
    private Integer successfulImports;

    @Schema(description = "Number of subscriptions that failed to import", example = "50")
    @JsonProperty("failed_imports")
    private Integer failedImports;

    @Schema(description = "Number of subscriptions skipped due to duplicates", example = "25")
    @JsonProperty("skipped_duplicates")
    private Integer skippedDuplicates;

    @Schema(description = "List of errors encountered during import")
    @JsonProperty("errors")
    private List<ImportError> errors;

    @Schema(description = "Overall status of the bulk import operation")
    @JsonProperty("status")
    private ImportStatus status;

    @Schema(description = "Processing time in milliseconds", example = "5000")
    @JsonProperty("processing_time_ms")
    private Long processingTimeMs;

    /**
     * Error details for failed imports.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Details of import errors")
    public static class ImportError {

        @Schema(description = "Row number or index of the failed entry", example = "42")
        @JsonProperty("row")
        private Integer row;

        @Schema(description = "MSISDN of the failed entry", example = "+1234567890")
        @JsonProperty("msisdn")
        private String msisdn;

        @Schema(description = "Error message describing the failure", example = "Duplicate MSISDN")
        @JsonProperty("error")
        private String error;

        @Schema(description = "Field that caused the error", example = "msisdn")
        @JsonProperty("field")
        private String field;
    }

    /**
     * Status of bulk import operation.
     */
    public enum ImportStatus {
        @Schema(description = "All entries imported successfully")
        SUCCESS,
        
        @Schema(description = "Import completed with some failures")
        PARTIAL_SUCCESS,
        
        @Schema(description = "Import failed completely")
        FAILED,
        
        @Schema(description = "Import was cancelled")
        CANCELLED
    }
}