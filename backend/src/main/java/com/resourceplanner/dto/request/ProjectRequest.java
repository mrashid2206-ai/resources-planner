package com.resourceplanner.dto.request;

import com.resourceplanner.enums.ProjectStatus;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProjectRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 255)
    private String name;

    private ProjectStatus status = ProjectStatus.active;

    @NotNull @Min(0) @Max(11)
    private Integer startMonth;

    @NotNull @Min(0) @Max(11)
    private Integer endMonth;

    private Integer startYear = 2026;
    private Integer endYear = 2026;
    private BigDecimal budget;
    private String client;
    private String description;
}
