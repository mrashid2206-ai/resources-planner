package com.resourceplanner.dto.response;

import lombok.Data;
import java.util.UUID;

@Data
public class TagResponse {
    private UUID id;
    private String name;
}
