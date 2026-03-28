package com.resourceplanner.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.UUID;

@Data
public class ReassignmentRequest {
    @NotNull
    private UUID assignmentId;

    private UUID targetProjectId;
    private UUID targetBidId;

    @Min(0) @Max(11)
    private Integer newStartMonth;

    @Min(0) @Max(11)
    private Integer newEndMonth;

    @Min(1) @Max(100)
    private Integer newAllocation;
}
