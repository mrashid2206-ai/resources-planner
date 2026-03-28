package com.resourceplanner.dto.response;

import com.resourceplanner.enums.BidStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class BidResponse {
    private UUID id;
    private String name;
    private BidStatus status;
    private Integer startMonth;
    private Integer endMonth;
    private Integer startYear;
    private Integer endYear;
    private BigDecimal estimatedValue;
    private Integer probability;
    private String client;
    private String description;
    private String winLossReason;
    private UUID convertedProjectId;
    private Boolean isArchived;
    private List<AssignmentResponse> assignments;
    private Instant createdAt;
    private Instant updatedAt;
}
