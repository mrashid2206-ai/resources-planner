package com.resourceplanner.dto.response;

import com.resourceplanner.enums.AssignmentType;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
public class AssignmentResponse {
    private UUID id;
    private UUID resourceId;
    private String resourceName;
    private UUID projectId;
    private UUID bidId;
    private String name;
    private AssignmentType type;
    private Integer startMonth;
    private Integer endMonth;
    private Integer startYear;
    private Integer endYear;
    private Integer allocation;
    private Instant createdAt;
}
