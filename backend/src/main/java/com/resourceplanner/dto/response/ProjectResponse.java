package com.resourceplanner.dto.response;

import com.resourceplanner.enums.ProjectStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class ProjectResponse {
    private UUID id;
    private String name;
    private ProjectStatus status;
    private Integer startMonth;
    private Integer endMonth;
    private Integer startYear;
    private Integer endYear;
    private BigDecimal budget;
    private BigDecimal budgetSpent;
    private String client;
    private String description;
    private UUID sourceBidId;
    private Boolean isArchived;
    private List<AssignmentResponse> assignments;
    private Instant createdAt;
    private Instant updatedAt;
}
