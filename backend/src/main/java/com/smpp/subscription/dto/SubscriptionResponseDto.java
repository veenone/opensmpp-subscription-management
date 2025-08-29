package com.smpp.subscription.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.smpp.subscription.entity.Subscription;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for subscription data including metadata.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response payload containing subscription data and metadata")
public class SubscriptionResponseDto {

    @Schema(description = "Unique identifier for the subscription", example = "123")
    @JsonProperty("id")
    private Long id;

    @Schema(
        description = "Mobile Station International Subscriber Directory Number in E.164 format",
        example = "+1234567890"
    )
    @JsonProperty("msisdn")
    private String msisdn;

    @Schema(
        description = "IP Multimedia Private Identity",
        example = "user@example.com"
    )
    @JsonProperty("impi")
    private String impi;

    @Schema(
        description = "IP Multimedia Public Identity",
        example = "sip:user@example.com"
    )
    @JsonProperty("impu")
    private String impu;

    @Schema(
        description = "Current status of the subscription",
        example = "ACTIVE"
    )
    @JsonProperty("status")
    private Subscription.SubscriptionStatus status;

    @Schema(
        description = "Timestamp when the subscription was created",
        example = "2024-01-15T10:30:00"
    )
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @Schema(
        description = "Timestamp when the subscription was last updated",
        example = "2024-01-15T14:45:00"
    )
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    /**
     * Creates a response DTO from a Subscription entity.
     * 
     * @param subscription the entity to convert
     * @return SubscriptionResponseDto
     */
    public static SubscriptionResponseDto fromEntity(Subscription subscription) {
        return SubscriptionResponseDto.builder()
            .id(subscription.getId())
            .msisdn(subscription.getMsisdn())
            .impi(subscription.getImpi())
            .impu(subscription.getImpu())
            .status(subscription.getStatus())
            .createdAt(subscription.getCreatedAt())
            .updatedAt(subscription.getUpdatedAt())
            .build();
    }
}