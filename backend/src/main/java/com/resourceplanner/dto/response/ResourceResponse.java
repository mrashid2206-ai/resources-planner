package com.resourceplanner.dto.response;

import com.resourceplanner.enums.ResourceAvailability;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class ResourceResponse {
    private UUID id;
    private String name;
    private String role;
    private String email;
    private String phone;
    private ResourceAvailability availability;
    private Integer monthlyCapacity;
    private BigDecimal hourlyRate;
    private String avatarUrl;
    private Boolean isArchived;
    private List<AssignmentResponse> assignments;
    private List<LeaveResponse> leaves;
    private List<TagResponse> tags;
    private Instant createdAt;
    private Instant updatedAt;
}
