package com.smpp.subscription.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Generic paginated response DTO.
 * 
 * @param <T> Type of content in the page
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Paginated response with metadata")
public class PagedResponse<T> {

    @Schema(description = "List of items in the current page")
    @JsonProperty("content")
    private List<T> content;

    @Schema(description = "Current page number (0-based)", example = "0")
    @JsonProperty("page")
    private Integer page;

    @Schema(description = "Number of items per page", example = "20")
    @JsonProperty("size")
    private Integer size;

    @Schema(description = "Total number of elements across all pages", example = "1000")
    @JsonProperty("total_elements")
    private Long totalElements;

    @Schema(description = "Total number of pages", example = "50")
    @JsonProperty("total_pages")
    private Integer totalPages;

    @Schema(description = "Whether this is the first page", example = "true")
    @JsonProperty("first")
    private Boolean first;

    @Schema(description = "Whether this is the last page", example = "false")
    @JsonProperty("last")
    private Boolean last;

    @Schema(description = "Whether there is a next page", example = "true")
    @JsonProperty("has_next")
    private Boolean hasNext;

    @Schema(description = "Whether there is a previous page", example = "false")
    @JsonProperty("has_previous")
    private Boolean hasPrevious;

    @Schema(description = "Number of elements in the current page", example = "20")
    @JsonProperty("number_of_elements")
    private Integer numberOfElements;

    /**
     * Creates a PagedResponse from Spring's Page object.
     * 
     * @param page Spring Data Page object
     * @param <T> Type of content
     * @return PagedResponse
     */
    public static <T> PagedResponse<T> fromPage(Page<T> page) {
        return PagedResponse.<T>builder()
            .content(page.getContent())
            .page(page.getNumber())
            .size(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .first(page.isFirst())
            .last(page.isLast())
            .hasNext(page.hasNext())
            .hasPrevious(page.hasPrevious())
            .numberOfElements(page.getNumberOfElements())
            .build();
    }
}