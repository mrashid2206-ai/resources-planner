package com.resourceplanner.dto.request;

import com.resourceplanner.enums.AssignmentType;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.UUID;

@Data
public class AssignmentRequest {
    @NotNull
    private UUID resourceId;

    private UUID projectId;
    private UUID bidId;

    @NotBlank
    private String name;

    @NotNull
    private AssignmentType type;

    @NotNull @Min(0) @Max(11)
    private Integer startMonth;

    @NotNull @Min(0) @Max(11)
    private Integer endMonth;

    @NotNull @Min(1) @Max(100)
    private Integer allocation;
}
