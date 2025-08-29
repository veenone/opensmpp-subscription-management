package com.smpp.subscription.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Standard error response DTO for consistent API error handling.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Standard error response structure")
public class ErrorResponse {

    @Schema(description = "HTTP status code", example = "400")
    @JsonProperty("status")
    private Integer status;

    @Schema(description = "Error code for programmatic handling", example = "VALIDATION_FAILED")
    @JsonProperty("error_code")
    private String errorCode;

    @Schema(description = "Human-readable error message", example = "Validation failed for request")
    @JsonProperty("message")
    private String message;

    @Schema(description = "Detailed error description", example = "The provided MSISDN is not in valid E.164 format")
    @JsonProperty("details")
    private String details;

    @Schema(description = "Request path where error occurred", example = "/api/v1/subscriptions")
    @JsonProperty("path")
    private String path;

    @Schema(description = "HTTP method used", example = "POST")
    @JsonProperty("method")
    private String method;

    @Schema(description = "Timestamp when error occurred", example = "2024-01-15T10:30:00")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("timestamp")
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    @Schema(description = "Validation errors for specific fields")
    @JsonProperty("validation_errors")
    private Map<String, List<String>> validationErrors;

    @Schema(description = "Trace ID for debugging", example = "abc123def456")
    @JsonProperty("trace_id")
    private String traceId;

    /**
     * Creates a simple error response.
     * 
     * @param status HTTP status code
     * @param errorCode Application error code
     * @param message Error message
     * @return ErrorResponse
     */
    public static ErrorResponse simple(Integer status, String errorCode, String message) {
        return ErrorResponse.builder()
            .status(status)
            .errorCode(errorCode)
            .message(message)
            .timestamp(LocalDateTime.now())
            .build();
    }

    /**
     * Creates an error response with validation details.
     * 
     * @param status HTTP status code
     * @param errorCode Application error code
     * @param message Error message
     * @param validationErrors Field validation errors
     * @return ErrorResponse
     */
    public static ErrorResponse withValidation(Integer status, String errorCode, String message,
                                             Map<String, List<String>> validationErrors) {
        return ErrorResponse.builder()
            .status(status)
            .errorCode(errorCode)
            .message(message)
            .validationErrors(validationErrors)
            .timestamp(LocalDateTime.now())
            .build();
    }

    /**
     * Creates a detailed error response.
     * 
     * @param status HTTP status code
     * @param errorCode Application error code
     * @param message Error message
     * @param details Detailed description
     * @param path Request path
     * @param method HTTP method
     * @return ErrorResponse
     */
    public static ErrorResponse detailed(Integer status, String errorCode, String message,
                                       String details, String path, String method) {
        return ErrorResponse.builder()
            .status(status)
            .errorCode(errorCode)
            .message(message)
            .details(details)
            .path(path)
            .method(method)
            .timestamp(LocalDateTime.now())
            .build();
    }
}