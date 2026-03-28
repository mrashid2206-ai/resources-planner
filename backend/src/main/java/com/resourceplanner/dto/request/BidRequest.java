package com.resourceplanner.dto.request;

import com.resourceplanner.enums.BidStatus;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class BidRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 255)
    private String name;

    private BidStatus status = BidStatus.pending;

    @NotNull @Min(0) @Max(11)
    private Integer startMonth;

    @NotNull @Min(0) @Max(11)
    private Integer endMonth;

    private Integer startYear = 2026;
    private Integer endYear = 2026;
    private BigDecimal estimatedValue;

    @Min(0) @Max(100)
    private Integer probability;

    private String client;
    private String description;
    private String winLossReason;
}
