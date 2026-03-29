package com.resourceplanner.dto.request;

import com.resourceplanner.enums.ResourceAvailability;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class ResourceRequest {
    @NotBlank(message = "Name is required")
    @Size(max = 150)
    private String name;

    @NotBlank(message = "Role is required")
    @Size(max = 150)
    private String role;

    private String email;
    private String phone;
    private ResourceAvailability availability = ResourceAvailability.full_time;
    private Integer monthlyCapacity = 22;
    private BigDecimal hourlyRate;
    private String avatarUrl;
    private String companyName;
    private String joinDate;
    private List<UUID> tagIds;
}
