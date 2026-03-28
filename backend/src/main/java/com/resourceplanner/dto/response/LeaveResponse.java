package com.resourceplanner.dto.response;

import lombok.Data;
import java.util.UUID;

@Data
public class LeaveResponse {
    private UUID id;
    private UUID resourceId;
    private Integer month;
    private Integer year;
    private Integer days;
    private String reason;
}
