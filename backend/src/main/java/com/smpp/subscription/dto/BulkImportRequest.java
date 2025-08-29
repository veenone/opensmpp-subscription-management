package com.smpp.subscription.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO for bulk importing subscriptions.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request payload for bulk importing subscriptions")
public class BulkImportRequest {

    @NotEmpty(message = "Subscriptions list cannot be empty")
    @Valid
    @Schema(description = "List of subscriptions to import")
    @JsonProperty("subscriptions")
    private List<SubscriptionRequestDto> subscriptions;

    @Schema(
        description = "Whether to skip existing subscriptions or update them",
        example = "false"
    )
    @JsonProperty("skip_existing")
    @Builder.Default
    private Boolean skipExisting = false;

    @Schema(
        description = "Whether to validate all entries before importing any",
        example = "true"
    )
    @JsonProperty("validate_all")
    @Builder.Default
    private Boolean validateAll = true;

    @Schema(
        description = "Maximum number of subscriptions to import in one batch",
        example = "1000"
    )
    @JsonProperty("batch_size")
    @Builder.Default
    private Integer batchSize = 1000;
}