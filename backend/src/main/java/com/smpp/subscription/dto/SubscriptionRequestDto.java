package com.smpp.subscription.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.smpp.subscription.entity.Subscription;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating or updating subscription data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for creating or updating a subscription")
public class SubscriptionRequestDto {

    @NotBlank(message = "MSISDN is required")
    @Pattern(
        regexp = "^\\+[1-9]\\d{1,14}$", 
        message = "MSISDN must be in E.164 format (e.g., +1234567890)"
    )
    @Schema(
        description = "Mobile Station International Subscriber Directory Number in E.164 format",
        example = "+1234567890",
        pattern = "^\\+[1-9]\\d{1,14}$"
    )
    @JsonProperty("msisdn")
    private String msisdn;

    @NotBlank(message = "IMPI is required")
    @Pattern(
        regexp = "^[a-zA-Z0-9@._-]+$",
        message = "IMPI must contain only alphanumeric characters, @, ., _, -"
    )
    @Schema(
        description = "IP Multimedia Private Identity - unique identifier for authentication",
        example = "user@example.com",
        pattern = "^[a-zA-Z0-9@._-]+$"
    )
    @JsonProperty("impi")
    private String impi;

    @NotBlank(message = "IMPU is required")
    @Pattern(
        regexp = "^sip:[a-zA-Z0-9@._-]+$",
        message = "IMPU must be in SIP URI format (sip:user@domain)"
    )
    @Schema(
        description = "IP Multimedia Public Identity - public SIP URI for the subscription",
        example = "sip:user@example.com",
        pattern = "^sip:[a-zA-Z0-9@._-]+$"
    )
    @JsonProperty("impu")
    private String impu;

    @NotNull(message = "Status is required")
    @Schema(
        description = "Current status of the subscription",
        example = "ACTIVE"
    )
    @JsonProperty("status")
    private Subscription.SubscriptionStatus status;

    /**
     * Converts this DTO to a Subscription entity.
     * 
     * @return Subscription entity
     */
    public Subscription toEntity() {
        Subscription subscription = new Subscription();
        subscription.setMsisdn(this.msisdn);
        subscription.setImpi(this.impi);
        subscription.setImpu(this.impu);
        subscription.setStatus(this.status);
        return subscription;
    }

    /**
     * Creates a DTO from a Subscription entity.
     * 
     * @param subscription the entity to convert
     * @return SubscriptionRequestDto
     */
    public static SubscriptionRequestDto fromEntity(Subscription subscription) {
        return SubscriptionRequestDto.builder()
            .msisdn(subscription.getMsisdn())
            .impi(subscription.getImpi())
            .impu(subscription.getImpu())
            .status(subscription.getStatus())
            .build();
    }
}