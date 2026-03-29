package com.resourceplanner.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.UUID;

@Data
public class LeaveRequest {
    @NotNull
    private UUID resourceId;

    @NotNull @Min(0) @Max(11)
    private Integer month;

    private Integer year = 2026;

    @NotNull @Min(1) @Max(22)
    private Integer days;

    private String reason;
}
